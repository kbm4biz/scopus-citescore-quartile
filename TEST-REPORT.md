# Test Report

Build: Scopus CiteScore Quartile 2.0.0  
Validation date: 25 July 2026  
Local platform: Windows, Node.js 24.14.0, Google Chrome 150.0.7871.181

## Automated results

- Vite desktop and userscript production builds: **passed**.
- Node calculator/parser/manifest/settings tests: **19 passed, 0 failed**.
- Desktop/mobile headless-Chrome fixture scenarios: **7 passed, 0 failed**.
- Manifest V3 unpacked-extension load smoke: **passed**.
- Referenced-file and no-remote-script checks: **passed**.
- Userscript metadata, grant, match, self-contained, and no-`@require` checks: **passed**.

Coverage includes:

1. Percentile boundaries 100, 99, 75, 74, 50, 49, 25, 24, and 0.
2. The specified rank midpoint formula.
3. Invalid negative, out-of-range, zero-total, missing, and non-numeric inputs.
4. Multiple categories producing Q1, Q2, Q3, and Q4 together.
5. Content appearing after a delay and changing dynamically.
6. Duplicate prevention under repeated DOM mutations in desktop and mobile modes.
7. Every requested percentile and rank format.
8. Displayed percentile taking precedence over a conflicting rank estimate.
9. Hidden unrelated numbers being excluded.
10. Slight wording/layout and accessible-name variations.
11. `chrome.storage`, GM storage, and local fallback selection.
12. Mobile floating action button, open full-height drawer, and inline badges.

## Visual fixture inspection

Seven screenshots were generated in `tests/screenshots/`:

- `one-category.png`
- `multiple-categories.png`
- `delayed-content.png`
- `rank-only.png`
- `layout-variation.png`
- `mobile-multiple-categories.png`
- `mobile-delayed-content.png`

Desktop inspection confirmed a readable category table, distinct Q colours, visible estimation labels, the best summary, information note, and no duplicate UI. Mobile inspection covered the full-height drawer, category cards at narrow width, floating control, safe scrolling, and delayed data.

## Deployment checks

The desktop build in `dist/desktop` was loaded by headless Chrome as an unpacked MV3 extension without a manifest load error. The mobile `.user.js` was executed against the same fixtures through a GM API harness.

The GitHub Actions file was checked as part of the source delivery but was not executed remotely because the local project has no configured GitHub repository. Hosted update URLs are added only in GitHub builds with a real Pages base URL.

## Live-site and device disclosure

No authenticated Scopus session was available. Version 2.0.0 was **not** verified on a logged-in live Scopus Source Details page. It was validated only against the realistic local fixtures described above.

No claim is made that this build was installed in every mobile userscript manager. Manager/device compatibility must be confirmed on the user's chosen Android or iOS setup.
