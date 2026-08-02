# Scopus CiteScore Quartile

Version 2.2.0 uses one vanilla JavaScript codebase to create:

- one universal Tampermonkey userscript for supported desktop and mobile browsers; and
- one Chrome Manifest V3 extension as a secondary desktop fallback.

Both outputs read only CiteScore information already visible on a Scopus Source Details page. They show a separate **Scopus CiteScore Quartile** for every displayed subject category.

> Every Q1–Q4 result produced here is a **Scopus CiteScore Quartile**. It is not a JCR, Web of Science, SCImago, or SJR quartile.

## Install the universal userscript

The simplest installation method for most clients is the bilingual live page:

**[Open the English/Arabic installation page](https://kbm4biz.github.io/scopus-citescore-quartile/)**

It detects the likely platform locally and provides selectable instructions for:

- desktop Chrome or Edge;
- desktop Firefox;
- iPhone or iPad Safari; and
- Android Firefox or Edge.

All platforms install the same `scopus-citescore-quartile.user.js` file. The userscript uses a floating **Q / CiteScore** button instead of a browser-toolbar popup. Its installed version appears directly below the Q marker.

For desktop Chrome or Edge:

1. Install Tampermonkey from its [official installation page](https://www.tampermonkey.net/?browser=chrome).
2. If Tampermonkey asks for it, enable **Allow User Scripts** on the browser's extension-management page.
3. Open the [live installation page](https://kbm4biz.github.io/scopus-citescore-quartile/) and select **Install userscript**.
4. Review the script and confirm installation in Tampermonkey.
5. Open a legitimate Scopus Source Details page such as `https://www.scopus.com/sourceid/21100893575`.

If an older Scopus CiteScore Quartile Chrome extension is already active, disable or remove it before installing the userscript. Running both can create duplicate page controls.

The live page gives the equivalent short steps for Firefox, iPhone/iPad, and Android. Compatibility ultimately depends on the selected browser and userscript manager. This release was tested in Chrome with a realistic Tampermonkey/GM API harness; physical iPhone and Android installation was not claimed.

### Automatic userscript updates

Users do **not** reinstall the userscript from GitHub for every update:

1. Tampermonkey periodically reads the hosted `.meta.js` file.
2. It compares the installed `@version` with the published version.
3. When a newer version exists, it downloads the same hosted `.user.js`.
4. Tampermonkey installs it automatically when automatic installation is enabled; otherwise it asks the user to approve the update.

The repository and GitHub Pages URL must remain available because installed copies use those exact update addresses.

## Alternative desktop extension

Use the Manifest V3 extension only when a client cannot install a userscript manager.

1. Download the desktop ZIP from the [latest GitHub release](https://github.com/kbm4biz/scopus-citescore-quartile/releases/latest).
2. Right-click the ZIP and select **Extract All**. Chrome cannot load a ZIP directly.
3. Open `chrome://extensions`.
4. Turn on **Developer mode**.
5. Select **Load unpacked**.
6. Select the extracted folder that directly contains `manifest.json`.

The extension's toolbar popup controls whether the extension, desktop panel, and inline badges are shown. Because this fallback is not installed from the Chrome Web Store, it does not receive the userscript's automatic update. Replace the unpacked folder with a newer release when you want to update it.

Do not enable the extension and userscript together.

## Use and interpret the results

1. Open a legitimate Scopus Source Details page.
2. Sign in normally if Scopus requires it. This project does not bypass authentication, subscriptions, CAPTCHA, or access restrictions.
3. Wait for **CiteScore rank** or **Rank & trend** to render.
4. Activate the floating Q button, then review every subject-category row.
5. Use **Copy results** to copy the source title, year/value, and all category-specific results.

**Best CiteScore Quartile** means the best result among the subject categories currently displayed on the page. It is clearly labelled “Best” and is never presented as the journal's only quartile.

## Calculation method

The displayed Scopus CiteScore Percentile is always the primary input:

| Displayed percentile | Scopus CiteScore Quartile |
|---:|:---|
| 75–100 | Q1 |
| 50–74 | Q2 |
| 25–49 | Q3 |
| 0–24 | Q4 |

Scopus does not normally produce a 100th percentile, but the calculator handles 100 safely as Q1. Tested boundary values include 99, 75, 74, 50, 49, 25, 24, and 0.

### Distance to the next better quartile

Every visible Q badge also shows the current category's exact percentile-point gap to the next better quartile:

- percentile 49 shows **Q3 · 1 pt to Q2**;
- percentile 25 shows **Q3 · 25 pt to Q2**;
- percentile 74 shows **Q2 · 1 pt to Q1**; and
- Q1 shows **highest** because no better quartile exists.

This distance is calculated from the category-specific Scopus percentile, never from the absolute CiteScore. It describes the current threshold position; it does not predict that the source will move to another quartile. When only rank is available, the badge uses `≈` and the panel labels the distance as estimated.

### Estimated rank fallback

Only when the displayed percentile is unavailable, a visible rank such as `42/320`, `42 out of 320`, or `Rank 42 of 320` is converted using:

```text
estimatedPercentile = floor(((total - rank + 0.5) / total) * 100)
```

The same quartile thresholds are then applied. The UI labels this **Estimated CiteScore Quartile** and **Estimated from rank**.

The estimate cannot reproduce Scopus's exact treatment of ties because rank and total do not contain the required tie information. If both percentile and rank are present, the displayed Scopus percentile always wins.

## Why one source can have different quartiles

CiteScore Percentile and CiteScore Rank compare a source within a particular Scopus subject category. Citation patterns and comparison sets differ by discipline, so the same source can legitimately be Q1 in one category and Q2, Q3, or Q4 in another.

- **Scopus CiteScore Q** in this project comes from Scopus CiteScore Percentile within each displayed Scopus category.
- **SCImago/SJR Q** comes from the separate SCImago Journal Rank metric and its category system.
- **JCR Q** comes from Clarivate Journal Citation Reports and its categories.

These systems are not interchangeable. An absolute CiteScore is not used to compare unrelated disciplines.

## Build both outputs

Prerequisites:

- Node.js 20.19 or newer (Node 22 is used in GitHub Actions).
- pnpm 11.9.0, enabled through Corepack if necessary.

From the project folder:

```powershell
corepack enable
corepack prepare pnpm@11.9.0 --activate
pnpm install --frozen-lockfile
pnpm run build
```

Useful commands:

```powershell
pnpm run build:desktop
pnpm run build:mobile
pnpm run test:unit
pnpm run test:browser
pnpm test
```

Vite builds the userscript and extension targets separately. `vite-plugin-monkey` generates the userscript metadata, GM grants, bundled CSS, `.user.js`, and `.meta.js` files. No remote JavaScript or visualization library is loaded.

## GitHub publishing and userscript updates

The included `.github/workflows/build-and-publish.yml` workflow:

1. runs on every push to `main` or a manual dispatch;
2. installs the locked dependencies;
3. builds and tests both targets;
4. uploads the unpacked fallback extension as a workflow artifact;
5. creates a versioned GitHub Release containing the fallback extension ZIP and universal userscript when that version is new; and
6. publishes the universal userscript and bilingual client page through GitHub Pages.

The GitHub Actions build derives the real Pages URL and writes it into `@updateURL` and `@downloadURL`. A local build intentionally omits those hosted URLs; it must never guess them.

For a new repository:

1. Create a GitHub repository and push this project to its `main` branch.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose **GitHub Actions**.
4. Confirm the workflow succeeds in the repository's **Actions** tab.
5. Open `https://YOUR-USER.github.io/YOUR-REPOSITORY/`.
6. Install the userscript from that page.

For later updates:

1. change the code;
2. increase `version` in `package.json` when the userscript behavior changes;
3. run `pnpm test`;
4. commit and push to `main`; and
5. confirm the GitHub Actions workflow and live page show the new version.

Installed userscripts then receive the newer version through their manager's update checker. The workflow also publishes the new fallback extension ZIP automatically when the version number is new.

## Shared architecture

```text
src/core/                    Pure calculator and semantic Scopus parser
src/app/scopus-app.js        Shared observer, extraction flow, and result UI
src/platform/settings-store.js
                             chrome.storage / GM_* / localStorage adapter
src/entry/desktop.js         Fallback extension content-script entry
src/entry/userscript.js      Universal desktop/mobile userscript entry
src/popup/                   Fallback extension popup
src/ui/page.css              Panel, inline badges, responsive FAB, and drawer
vite.desktop.config.js       MV3 extension build
vite.mobile.config.js        Universal userscript build and metadata
scripts/                     Build finishing and Pages-output generation
.github/workflows/           Build, test, artifact, and Pages deployment
dist/desktop/                Installable unpacked fallback extension
dist/mobile/                 Hosted client page and universal userscript
tests/                       Unit tests, browser tests, fixtures, screenshots
```

The settings adapter selects `chrome.storage.sync` for the MV3 extension, `GM_getValue`/`GM_setValue` for a userscript manager, and a limited `localStorage` fallback when neither API exists.

## Dynamic page handling and safety

The app uses a debounced `MutationObserver`, rechecks after user interactions, and supports content that appears or changes after initial page load. The parser searches semantic HTML, table headers, accessible names, and nearby visible labels such as **CiteScore rank**, **Percentile**, **Rank**, **In category**, and **Rank & trend**. It excludes hidden content and its own injected UI.

Page-derived text is normalized and inserted with `textContent`; it is never treated as HTML. Owned panel/badge markers prevent duplicate injection. The app does not modify or hide Scopus's original metrics.

The extension manifest requests only `storage` and access to `https://www.scopus.com/sourceid/*`. The userscript has the same URL match and requests only the GM functions needed for styles, preferences, change listeners, and user-triggered clipboard copying.

See [PRIVACY.md](PRIVACY.md) and [TEST-REPORT.md](TEST-REPORT.md).

## Testing disclosure

**Version 2.2.0 was not verified on a logged-in live Scopus page.** No authenticated Scopus session was available in the development environment. It was tested in Chrome against realistic local fixtures, including different placements within the same quartile, delayed updates, variant layouts, rank-only fallback, multiple quartiles, duplicate prevention, the fallback MV3 load, desktop/narrow userscript UI, and the bilingual platform-specific client page.

The GitHub workflow and live Pages files were also verified after publishing. Physical iPhone/Android installation and every possible userscript manager were not tested.

## Official Scopus references

- [CiteScore Journal Metric – FAQs](https://service.elsevier.com/app/answers/detail/a_id/30562/supporthub/scopus/kw/citescore/)
- [What can I do on a Source details page?](https://service.elsevier.com/app/answers/detail/a_id/14194/supporthub/scopus/)

This independent project is not affiliated with or endorsed by Elsevier or Scopus.
