# Scopus CiteScore Quartile

Version 2 is one vanilla JavaScript codebase with two installable outputs:

- `dist/desktop/` — a Chrome Manifest V3 extension with a toolbar popup.
- `dist/mobile/scopus-citescore-quartile.user.js` — a userscript with a floating Q button and full-height results drawer.

Both outputs read only CiteScore information already visible on a Scopus Source Details page. They show a separate **Scopus CiteScore Quartile** for every displayed subject category.

> Every Q1–Q4 result produced here is a **Scopus CiteScore Quartile**. It is not a JCR, Web of Science, SCImago, or SJR quartile.

## Install the desktop Chrome extension

If you received `Scopus-CiteScore-Quartile-v2.0.1-desktop.zip`:

1. Right-click the ZIP and select **Extract All**. Chrome cannot load a ZIP directly.
2. Open Chrome and enter `chrome://extensions` in the address bar.
3. Turn on **Developer mode** in the upper-right corner.
4. Select **Load unpacked**.
5. Select the extracted folder that directly contains `manifest.json`.
6. Confirm that **Scopus CiteScore Quartile** appears in the extension list.

If you are using the source project, select `dist/desktop` at step 5. The toolbar popup lets you enable/disable the extension and independently show/hide the desktop panel or inline badges.

## Install the mobile userscript

A normal mobile browser does not automatically load a desktop Chrome extension. Use a mobile browser or userscript app that supports `.user.js` files and the standard `GM_getValue`/`GM_setValue` APIs.

For this local delivery:

1. Open `dist/mobile/scopus-citescore-quartile.user.js` in your compatible userscript manager.
2. Review its metadata and install it.
3. Allow it to run only on `https://www.scopus.com/sourceid/*`.
4. Open a Scopus Source Details page. A floating **Q/CiteScore** button appears after visible CiteScore Rank content is detected. Its Q marker shows the installed version directly underneath.
5. Activate the button to open the full-height category results drawer.

The mobile target has no toolbar popup. Its drawer includes the results and an inline-badge setting. The enabled setting is stored through the same shared settings adapter, but a manager without its own script-management toggle may require disabling the userscript in that manager.

Compatibility depends on the mobile userscript manager. This build was browser-tested with a realistic GM API harness, not on every Android or iOS manager.

## Use and interpret the results

1. Open a legitimate Scopus Source Details page, such as `https://www.scopus.com/sourceid/21100893575`.
2. Sign in normally if Scopus requires it. This project does not bypass authentication, subscriptions, CAPTCHA, or access restrictions.
3. Wait for **CiteScore rank** or **Rank & trend** to render.
4. Review every subject-category row, not only the best summary.
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

Vite builds the desktop and mobile targets separately. `vite-plugin-monkey` generates the userscript metadata, GM grants, embedded CSS, `.user.js`, and `.meta.js` files. No remote visualization or JavaScript library is loaded: Chart.js was intentionally omitted because this project has no chart feature.

## GitHub automatic mobile updates

The included `.github/workflows/build-and-publish.yml` workflow:

1. runs on a push to `main` or a manual dispatch;
2. installs the locked dependencies;
3. builds and tests both targets;
4. uploads the unpacked desktop build as a workflow artifact; and
5. publishes `dist/mobile` with GitHub Pages.

The published client page provides the same short installation instructions in English and Arabic, switches the complete document between LTR and RTL, and links both languages to the same userscript.

To activate it:

1. Create an empty GitHub repository.
2. Commit this project and push it to the repository's `main` branch.
3. On GitHub, open **Settings → Pages**.
4. Under **Build and deployment**, choose **GitHub Actions** as the source.
5. Open the repository's **Actions** tab and confirm the workflow succeeds.
6. Visit `https://YOUR-USER.github.io/YOUR-REPOSITORY/` and install the linked userscript.

In GitHub Actions the build derives that Pages URL and writes it into `@updateURL` and `@downloadURL`. A compatible userscript manager can then check the small `.meta.js` file and install a newer `.user.js` when `package.json` has a higher `version`.

The local build intentionally omits update URLs because this workspace has no Git remote and therefore no verified public Pages address. Do not add a guessed URL. After changing code, increment the version in `package.json`, commit, and push.

## Shared architecture

```text
src/core/                    Pure calculator and semantic Scopus parser
src/app/scopus-app.js        Shared observer, extraction flow, and result UI
src/platform/settings-store.js
                             chrome.storage / GM_* / localStorage adapter
src/entry/desktop.js         Desktop content-script entry
src/entry/mobile.js          Mobile userscript entry
src/popup/                   Desktop popup
src/ui/page.css              Desktop panel, inline badges, FAB, mobile drawer
vite.desktop.config.js       MV3 content build
vite.mobile.config.js        Userscript build and metadata
scripts/                     Manifest, popup, icon, and Pages-output finishing
.github/workflows/           Build, test, artifact, and GitHub Pages publishing
dist/desktop/                Installable unpacked desktop output
dist/mobile/                 Installable/hostable mobile output
tests/                       Unit tests, browser tests, fixtures, screenshots
```

The settings adapter selects `chrome.storage.sync` for the MV3 extension, `GM_getValue`/`GM_setValue` for a userscript manager, and a limited `localStorage` fallback when neither API exists.

## Dynamic page handling and safety

The app uses a debounced `MutationObserver`, rechecks after user interactions, and supports content that appears or changes after initial page load. The parser searches semantic HTML, table headers, accessible names, and nearby visible labels such as **CiteScore rank**, **Percentile**, **Rank**, **In category**, and **Rank & trend**. It excludes hidden content and its own injected UI.

Page-derived text is normalized and inserted with `textContent`; it is never treated as HTML. Owned panel/badge markers prevent duplicate injection. The app does not modify or hide Scopus's original metrics.

The desktop manifest requests only `storage` and access to `https://www.scopus.com/sourceid/*`. The userscript has the same URL match and requests only the GM functions needed for styles, preferences, change listeners, and user-triggered clipboard copying.

See [PRIVACY.md](PRIVACY.md) and [TEST-REPORT.md](TEST-REPORT.md).

## Testing disclosure

**Version 2.0.1 was not verified on a logged-in live Scopus page.** No authenticated Scopus session was available in the development environment. It was tested in installed Chrome against realistic local fixtures, including delayed updates, variant layouts, rank-only fallback, multiple quartiles, duplicate prevention, the desktop MV3 load, and the mobile userscript UI.

The GitHub workflow is provided and locally inspected, but it has not been executed on GitHub because this folder is not connected to a GitHub repository. Mobile device-manager installation was not claimed as tested.

## Official Scopus references

- [CiteScore Journal Metric – FAQs](https://service.elsevier.com/app/answers/detail/a_id/30562/supporthub/scopus/kw/citescore/)
- [What can I do on a Source details page?](https://service.elsevier.com/app/answers/detail/a_id/14194/supporthub/scopus/)

This independent project is not affiliated with or endorsed by Elsevier or Scopus.
