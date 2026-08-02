# Test Report

Build: Scopus CiteScore Quartile 2.2.0

Validation date: 2 August 2026

Local platform: Windows, Node.js 24.4.0, Google Chrome 150.0.7871.187

## Automated results

- Vite extension and universal-userscript production builds: **passed**.
- Node calculator/parser/manifest/settings/client-page tests: **23 passed, 0 failed**.
- Extension/userscript/client-page headless-Chrome scenarios: **10 passed, 0 failed**.
- Manifest V3 unpacked-extension load smoke: **passed**.
- Referenced-file and no-remote-script checks: **passed**.
- Userscript metadata, grant, match, self-contained, and no-`@require` checks: **passed**.

Coverage includes:

1. Percentile boundaries 100, 99, 75, 74, 50, 49, 25, 24, and 0.
2. The specified rank midpoint formula.
3. Exact proximity to the next better quartile at the top and bottom of Q2, Q3, and Q4, plus Q1's highest-quartile state.
4. Two Q3 categories showing different distances: percentile 49 is 1 point from Q2, while percentile 25 is 25 points from Q2.
5. Invalid negative, out-of-range, zero-total, missing, and non-numeric inputs.
6. Multiple categories producing Q1, Q2, Q3, and Q4 together.
7. Content appearing after a delay and changing dynamically.
8. Duplicate prevention under repeated DOM mutations in extension and userscript modes.
9. Every requested percentile and rank format.
10. Displayed percentile taking precedence over a conflicting rank estimate.
11. Hidden unrelated numbers being excluded.
12. Slight wording/layout and accessible-name variations.
13. `chrome.storage`, GM storage, and local fallback selection.
14. Proximity text in panel, best-summary, inline, tooltip, and floating-control paths.
15. Universal floating action button with its installed-version label, full-height drawer, and inline badges at desktop and narrow-mobile widths.
16. English/Arabic client-page parity, RTL layout, local platform detection, four platform selectors, migration warning, and one shared installation target.

## Visual fixture inspection

Twelve screenshots are generated in `tests/screenshots/`:

- `one-category.png`
- `multiple-categories.png`
- `delayed-content.png`
- `rank-only.png`
- `layout-variation.png`
- `same-quartile-proximity.png`
- `userscript-desktop-floating.png`
- `mobile-floating-button.png`
- `mobile-multiple-categories.png`
- `mobile-delayed-content.png`
- `client-install-en.png`
- `client-install-ar.png`

Inspection covers the category table, same-quartile proximity differences, distinct Q colours, estimation labels, best summary, information note, duplicate prevention, desktop/narrow userscript drawer, floating version control, safe scrolling, delayed data, English/Arabic installation paths, four platform choices, and RTL layout.

## Deployment checks

The fallback build in `dist/desktop` is loaded by headless Chrome as an unpacked MV3 extension. The universal `.user.js` is executed against the same fixtures through a GM API harness.

The GitHub workflow, published Pages client, `.user.js`, `.meta.js`, version, and hosted update URLs are checked after the release is pushed.

## Live-site and device disclosure

No authenticated Scopus session was available. Version 2.2.0 was **not** verified on a logged-in live Scopus Source Details page. Validation uses realistic local fixtures.

No claim is made that this build was physically installed in iPhone Safari, Android Firefox/Edge, or every userscript manager. Those device/manager combinations remain client-environment checks.
