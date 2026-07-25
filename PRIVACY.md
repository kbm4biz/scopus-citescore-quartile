# Privacy Policy — Scopus CiteScore Quartile

Last updated: 25 July 2026

Scopus CiteScore Quartile works locally in the user's browser. Version 2 is available as a Chrome Manifest V3 extension and as a compatible mobile userscript.

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

Only three Boolean display preferences are stored:

- enabled;
- show the page panel; and
- show inline badges.

The desktop build uses `chrome.storage.sync`. Chrome may synchronize these Boolean values through the user's own Chrome account, depending on their browser configuration.

The userscript build uses the manager's `GM_getValue` and `GM_setValue`. A limited `localStorage` fallback is available when the GM storage API is missing. No journal title, category, percentile, rank, CiteScore, or copied result is stored in these settings.

## Automatic userscript update checks

A userscript built and published by the included GitHub Actions workflow contains `@updateURL` and `@downloadURL` links to the owner's GitHub Pages site. The user's userscript manager may contact those URLs to compare versions or download an update. That request is controlled by the manager and GitHub Pages; the script itself does not transmit Scopus page data with it.

The locally built userscript has no update URL until a real Pages base URL is supplied at build time.

## Permissions

Desktop:

- `storage`, for the three preferences above.
- `https://www.scopus.com/sourceid/*`, for the content script.

Mobile userscript:

- the same Scopus Source Details `@match`;
- GM style injection for bundled local CSS;
- GM value storage/change listeners for preferences; and
- GM clipboard access for the user-triggered **Copy results** action.

Neither build requests browsing history, cookies, identity, web-request interception, broad all-sites access, or background page access.

## Removing local data

Remove the desktop extension from `chrome://extensions` to remove its extension data. For a userscript, remove it and its saved values through the userscript manager. Browser-specific synchronization or backups remain controlled by the browser or manager.

## Changes and affiliation

If a future version changes these practices or permissions, this document and the relevant build metadata should be updated before distribution.

This independent project is not affiliated with or endorsed by Elsevier or Scopus.
