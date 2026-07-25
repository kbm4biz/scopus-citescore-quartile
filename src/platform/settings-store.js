"use strict";

const DEFAULT_SETTINGS = Object.freeze({
  enabled: true,
  showPanel: true,
  showInlineBadges: true
});

const STORAGE_PREFIX = "scsq:";

function normaliseSettings(values, defaults = DEFAULT_SETTINGS) {
  const output = {};
  for (const [key, fallback] of Object.entries(defaults)) {
    output[key] = typeof values?.[key] === "boolean" ? values[key] : fallback;
  }
  return output;
}

function createChromeStore(chromeApi) {
  return {
    kind: "chrome.storage",
    get(defaults = DEFAULT_SETTINGS) {
      return new Promise((resolve) => {
        chromeApi.storage.sync.get(defaults, (stored) => {
          resolve(normaliseSettings(stored, defaults));
        });
      });
    },
    set(patch) {
      return new Promise((resolve, reject) => {
        chromeApi.storage.sync.set(patch, () => {
          const error = chromeApi.runtime?.lastError;
          if (error) {
            reject(new Error(error.message || "Chrome storage write failed."));
          } else {
            resolve();
          }
        });
      });
    },
    subscribe(listener) {
      if (!chromeApi.storage.onChanged?.addListener) {
        return () => {};
      }
      const handler = (changes, areaName) => {
        if (areaName !== "sync") {
          return;
        }
        const patch = {};
        for (const [key, change] of Object.entries(changes)) {
          if (Object.prototype.hasOwnProperty.call(DEFAULT_SETTINGS, key)) {
            patch[key] = change.newValue;
          }
        }
        if (Object.keys(patch).length) {
          listener(patch);
        }
      };
      chromeApi.storage.onChanged.addListener(handler);
      return () => chromeApi.storage.onChanged.removeListener?.(handler);
    }
  };
}

function createGmStore(gmApi) {
  return {
    kind: "GM_setValue",
    async get(defaults = DEFAULT_SETTINGS) {
      const entries = await Promise.all(
        Object.entries(defaults).map(async ([key, fallback]) => [
          key,
          await Promise.resolve(gmApi.getValue(`${STORAGE_PREFIX}${key}`, fallback))
        ])
      );
      return normaliseSettings(Object.fromEntries(entries), defaults);
    },
    async set(patch) {
      await Promise.all(
        Object.entries(patch).map(([key, value]) =>
          Promise.resolve(gmApi.setValue(`${STORAGE_PREFIX}${key}`, Boolean(value)))
        )
      );
    },
    subscribe(listener) {
      if (typeof gmApi.addValueChangeListener !== "function") {
        return () => {};
      }
      const listenerIds = Object.keys(DEFAULT_SETTINGS).map((key) =>
        gmApi.addValueChangeListener(`${STORAGE_PREFIX}${key}`, (_name, _oldValue, newValue) => {
          listener({ [key]: Boolean(newValue) });
        })
      );
      return () => {
        if (typeof gmApi.removeValueChangeListener === "function") {
          listenerIds.forEach((id) => gmApi.removeValueChangeListener(id));
        }
      };
    }
  };
}

function createLocalStore(storage = globalThis.localStorage) {
  const listeners = new Set();
  return {
    kind: "localStorage fallback",
    async get(defaults = DEFAULT_SETTINGS) {
      const values = {};
      for (const [key, fallback] of Object.entries(defaults)) {
        try {
          const stored = storage?.getItem(`${STORAGE_PREFIX}${key}`);
          values[key] = stored === null || stored === undefined ? fallback : stored === "true";
        } catch {
          values[key] = fallback;
        }
      }
      return normaliseSettings(values, defaults);
    },
    async set(patch) {
      for (const [key, value] of Object.entries(patch)) {
        try {
          storage?.setItem(`${STORAGE_PREFIX}${key}`, String(Boolean(value)));
        } catch {
          // Storage may be unavailable in private browsing; current UI state still updates.
        }
      }
      listeners.forEach((listener) => listener(patch));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    }
  };
}

function createSettingsStore({ chromeApi = globalThis.chrome, gmApi = null, localStorageApi } = {}) {
  if (chromeApi?.storage?.sync) {
    return createChromeStore(chromeApi);
  }
  if (typeof gmApi?.getValue === "function" && typeof gmApi?.setValue === "function") {
    return createGmStore(gmApi);
  }
  return createLocalStore(localStorageApi);
}

export {
  DEFAULT_SETTINGS,
  createSettingsStore,
  normaliseSettings
};
