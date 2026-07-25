"use strict";

import "../ui/page.css";
import { initialiseScopusApp } from "../app/scopus-app.js";
import { createSettingsStore } from "../platform/settings-store.js";

initialiseScopusApp({
  mode: "desktop",
  settingsStore: createSettingsStore({ chromeApi: globalThis.chrome })
});
