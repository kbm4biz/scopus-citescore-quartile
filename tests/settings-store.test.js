import test from "node:test";
import assert from "node:assert/strict";
import {
  createSettingsStore,
  DEFAULT_SETTINGS
} from "../src/platform/settings-store.js";

test("settings adapter prefers chrome.storage when it is available", async () => {
  const stored = { ...DEFAULT_SETTINGS, showPanel: false };
  const listeners = [];
  const chromeApi = {
    runtime: { lastError: null },
    storage: {
      sync: {
        get(defaults, callback) {
          callback({ ...defaults, ...stored });
        },
        set(patch, callback) {
          Object.assign(stored, patch);
          callback();
        }
      },
      onChanged: {
        addListener(listener) {
          listeners.push(listener);
        },
        removeListener() {}
      }
    }
  };
  const store = createSettingsStore({ chromeApi });
  assert.equal(store.kind, "chrome.storage");
  assert.equal((await store.get()).showPanel, false);
  await store.set({ showPanel: true });
  assert.equal(stored.showPanel, true);

  let observed = null;
  store.subscribe((patch) => {
    observed = patch;
  });
  listeners[0]({ showInlineBadges: { newValue: false } }, "sync");
  assert.deepEqual(observed, { showInlineBadges: false });
});

test("settings adapter uses GM_getValue and GM_setValue for userscripts", async () => {
  const values = new Map();
  const gmApi = {
    getValue(key, fallback) {
      return values.has(key) ? values.get(key) : fallback;
    },
    setValue(key, value) {
      values.set(key, value);
    }
  };
  const store = createSettingsStore({ chromeApi: null, gmApi });
  assert.equal(store.kind, "GM_setValue");
  await store.set({ showInlineBadges: false });
  assert.equal((await store.get()).showInlineBadges, false);
});

test("settings adapter has a localStorage fallback for limited mobile managers", async () => {
  const values = new Map();
  const localStorageApi = {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, value);
    }
  };
  const store = createSettingsStore({ chromeApi: null, gmApi: null, localStorageApi });
  assert.equal(store.kind, "localStorage fallback");
  await store.set({ enabled: false });
  assert.equal((await store.get()).enabled, false);
});
