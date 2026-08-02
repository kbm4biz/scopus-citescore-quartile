# Privacy Policy — Scopus CiteScore Quartile

Last updated: 2 August 2026

Scopus CiteScore Quartile works locally in the user's browser. Version 2.2 uses one universal userscript as the primary product and a Chrome Manifest V3 extension as a secondary desktop fallback.

## Page data processed

On `https://www.scopus.com/sourceid/*`, the project reads visible text needed for category-specific results: source title, CiteScore year/value, subject category, displayed percentile, and visible rank/total.

It does not attempt to read account credentials, cookies, CAPTCHA content, hidden subscription information, or pages outside that Source Details URL pattern. It does not bypass authentication, institutional subscriptions, paywalls, or other access controls.

## Collection and transfer

The project:

- does not collect personal data;
- does not send Scopus page data to the developer or any third party;
- does not use analytics, advertising, telemetry, tracking pixels, or remote logging;
- does not call Scopus or other data APIs; and
- does not load remote JavaScript or CDN libraries.

The **Copy results** action writes result text to the clipboard only after the user activates the button.

## Settings storage

Only three Boolean display preferences are stored by the page tool:

- enabled;
- show the page panel; and
- show inline badges.

The userscript uses the manager's `GM_getValue` and `GM_setValue`. A limited `localStorage` fallback is available when the GM storage API is missing. The fallback extension uses `chrome.storage.sync`; Chrome may synchronize those Boolean values through the user's own account, depending on browser configuration.

No journal title, category, percentile, rank, CiteScore, or copied result is stored in these settings.

The distance to the next better quartile is calculated locally from the same displayed or estimated percentile. It is not stored or transmitted.

The GitHub Pages installation page may store two local preferences: language (`en` or `ar`) and the selected platform instructions. They remain in that browser and contain no Scopus or personal data. Platform detection uses the browser's local user-agent information and is not transmitted.

## Automatic userscript update checks

The published userscript contains `@updateURL` and `@downloadURL` links to this project's GitHub Pages site. The user's userscript manager may contact those URLs to compare versions or download an update. That request is controlled by the manager and GitHub Pages; the script itself does not transmit Scopus page data with it.

The locally built userscript has no update URL unless a verified public Pages base URL is supplied at build time.

## Permissions

Universal userscript:

- the Scopus Source Details `@match`;
- GM style injection for bundled local CSS;
- GM value storage and change listeners for preferences; and
- GM clipboard access for the user-triggered **Copy results** action.

Fallback extension:

- `storage`, for the three preferences above; and
- `https://www.scopus.com/sourceid/*`, for the content script.

Neither output requests browsing history, cookies, identity, web-request interception, broad all-sites access, or background page access.

## Removing local data

Remove the userscript and its saved values through the userscript manager. Remove the fallback extension from `chrome://extensions` to remove its extension data. Browser-specific synchronization or backups remain controlled by the browser or manager.

## Changes and affiliation

If a future version changes these practices or permissions, this document and the relevant build metadata should be updated before distribution.

This independent project is not affiliated with or endorsed by Elsevier or Scopus.
