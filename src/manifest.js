"use strict";

function createManifest(version) {
  return {
    manifest_version: 3,
    name: "Scopus CiteScore Quartile",
    version,
    description: "Shows category-specific CiteScore quartiles from percentile data visible on Scopus Source Details pages.",
    permissions: ["storage"],
    host_permissions: ["https://www.scopus.com/sourceid/*"],
    action: {
      default_title: "Scopus CiteScore Quartile",
      default_popup: "popup.html",
      default_icon: {
        16: "icons/icon16.png",
        32: "icons/icon32.png",
        48: "icons/icon48.png",
        128: "icons/icon128.png"
      }
    },
    icons: {
      16: "icons/icon16.png",
      32: "icons/icon32.png",
      48: "icons/icon48.png",
      128: "icons/icon128.png"
    },
    content_scripts: [
      {
        matches: ["https://www.scopus.com/sourceid/*"],
        js: ["content.js"],
        css: ["styles.css"],
        run_at: "document_idle"
      }
    ]
  };
}

export { createManifest };
