(function installChromeStorageFixture() {
  "use strict";
  const values = { enabled: true, showPanel: true, showInlineBadges: true };
  const listeners = [];
  const gmListeners = [];
  window.chrome = {
    runtime: { lastError: null },
    storage: {
      sync: {
        get(defaults, callback) {
          callback({ ...(defaults || {}), ...values });
        },
        set(next, callback) {
          const changes = {};
          Object.entries(next).forEach(([key, value]) => {
            changes[key] = { oldValue: values[key], newValue: value };
            values[key] = value;
          });
          listeners.forEach((listener) => listener(changes, "sync"));
          if (callback) callback();
        }
      },
      onChanged: {
        addListener(listener) {
          listeners.push(listener);
        }
      }
    }
  };
  window.GM_getValue = (key, fallback) =>
    Object.prototype.hasOwnProperty.call(values, key) ? values[key] : fallback;
  window.GM_setValue = (key, value) => {
    const oldValue = values[key];
    values[key] = value;
    gmListeners.forEach(({ watchedKey, listener }) => {
      if (watchedKey === key) listener(key, oldValue, value, false);
    });
  };
  window.GM_addValueChangeListener = (key, listener) => {
    gmListeners.push({ watchedKey: key, listener });
    return gmListeners.length - 1;
  };
  window.GM_removeValueChangeListener = (id) => {
    if (gmListeners[id]) gmListeners[id].listener = () => {};
  };
  window.GM_addStyle = (cssText) => {
    const style = document.createElement("style");
    style.dataset.fixtureUserscriptStyle = "true";
    style.textContent = cssText;
    (document.head || document.documentElement).appendChild(style);
    return style;
  };
  window.GM_setClipboard = (text) => {
    window.__FIXTURE_CLIPBOARD__ = text;
  };
})();
