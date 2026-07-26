"use strict";

import {
  GM_addValueChangeListener,
  GM_getValue,
  GM_removeValueChangeListener,
  GM_setClipboard,
  GM_setValue
} from "$";
import packageJson from "../../package.json";
import "../ui/page.css";
import { initialiseScopusApp } from "../app/scopus-app.js";
import { createSettingsStore } from "../platform/settings-store.js";

const gmApi = {
  getValue: typeof GM_getValue === "function" ? GM_getValue : null,
  setValue: typeof GM_setValue === "function" ? GM_setValue : null,
  addValueChangeListener: typeof GM_addValueChangeListener === "function"
    ? GM_addValueChangeListener
    : null,
  removeValueChangeListener: typeof GM_removeValueChangeListener === "function"
    ? GM_removeValueChangeListener
    : null
};

const clipboardWriter = typeof GM_setClipboard === "function"
  ? async (text) => {
      await Promise.resolve(GM_setClipboard(text, "text"));
    }
  : null;

initialiseScopusApp({
  mode: "userscript",
  settingsStore: createSettingsStore({ chromeApi: null, gmApi }),
  clipboardWriter,
  version: packageJson.version
});
