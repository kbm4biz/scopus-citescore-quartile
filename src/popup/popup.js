"use strict";

import { createSettingsStore, DEFAULT_SETTINGS } from "../platform/settings-store.js";

(function initialisePopup() {
  const settingsStore = createSettingsStore({ chromeApi: globalThis.chrome });
  const controls = Object.keys(DEFAULT_SETTINGS).map((id) => document.getElementById(id));
  const status = document.getElementById("save-status");
  let statusTimer = null;

  function updateDependentState() {
    const enabled = document.getElementById("enabled").checked;
    document.getElementById("showPanel").disabled = !enabled;
    document.getElementById("showInlineBadges").disabled = !enabled;
  }

  function showStatus(message) {
    window.clearTimeout(statusTimer);
    status.textContent = message;
    statusTimer = window.setTimeout(() => {
      status.textContent = "";
    }, 1800);
  }

  function saveSetting(event) {
    const control = event.currentTarget;
    settingsStore.set({ [control.id]: control.checked }).then(() => {
      updateDependentState();
      showStatus("Saved.");
    }).catch(() => showStatus("Setting could not be saved."));
  }

  settingsStore.get(DEFAULT_SETTINGS).then((stored) => {
    controls.forEach((control) => {
      control.checked = Boolean(stored[control.id]);
      control.addEventListener("change", saveSetting);
    });
    updateDependentState();
  });
})();
