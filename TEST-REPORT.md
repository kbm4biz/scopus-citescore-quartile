# Test Report

Build: Scopus CiteScore Quartile 2.1.0

Validation date: 26 July 2026

Local platform: Windows, Node.js 24.14.0, Google Chrome 150.0.7871.181

## Automated results

- Vite extension and universal-userscript production builds: **passed**.
- Node calculator/parser/manifest/settings/client-page tests: **21 passed, 0 failed**.
- Extension/userscript/client-page headless-Chrome scenarios: **9 passed, 0 failed**.
- Manifest V3 unpacked-extension load smoke: **passed**.
- Referenced-file and no-remote-script checks: **passed**.
- Userscript metadata, grant, match, self-contained, and no-`@require` checks: **passed**.

Coverage includes:

1. Percentile boundaries 100, 99, 75, 74, 50, 49, 25, 24, and 0.
2. The specified rank midpoint formula.
3. Invalid negative, out-of-range, zero-total, missing, and non-numeric inputs.
4. Multiple categories producing Q1, Q2, Q3, and Q4 together.
5. Content appearing after a delay and changing dynamically.
6. Duplicate prevention under repeated DOM mutations in extension and userscript modes.
7. Every requested percentile and rank format.
8. Displayed percentile taking precedence over a conflicting rank estimate.
9. Hidden unrelated numbers being excluded.
10. Slight wording/layout and accessible-name variations.
11. `chrome.storage`, GM storage, and local fallback selection.
12. Universal floating action button with its installed-version label, full-height drawer, and inline badges at desktop and narrow-mobile widths.
13. English/Arabic client-page parity, RTL layout, local platform detection, four platform selectors, migration warning, and one shared installation target.

## Visual fixture inspection

Eleven screenshots are generated in `tests/screenshots/`:

- `one-category.png`
- `multiple-categories.png`
- `delayed-content.png`
- `rank-only.png`
- `layout-variation.png`
- `userscript-desktop-floating.png`
- `mobile-floating-button.png`
- `mobile-multiple-categories.png`
- `mobile-delayed-content.png`
- `client-install-en.png`
- `client-install-ar.png`

Inspection covers the category table, distinct Q colours, estimation labels, best summary, information note, duplicate prevention, desktop/narrow userscript drawer, floating version control, safe scrolling, delayed data, English/Arabic installation paths, four platform choices, and RTL layout.

## Deployment checks

The fallback build in `dist/desktop` is loaded by headless Chrome as an unpacked MV3 extension. The universal `.user.js` is executed against the same fixtures through a GM API harness.

The GitHub workflow, published Pages client, `.user.js`, `.meta.js`, version, and hosted update URLs are checked after the release is pushed.

## Live-site and device disclosure

No authenticated Scopus session was available. Version 2.1.0 was **not** verified on a logged-in live Scopus Source Details page. Validation uses realistic local fixtures.

No claim is made that this build was physically installed in iPhone Safari, Android Firefox/Edge, or every userscript manager. Those device/manager combinations remain client-environment checks.
