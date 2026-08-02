# Reusable Hybrid Web-Platform Project Rules

## Purpose and scope

Use these rules for browser-based client projects that should ship from one maintained codebase across supported desktop and mobile browsers. Copy this file into a new project root and replace project-specific names, match URLs, terminology, permissions, and GitHub links.

Current reference implementation:

- Project: Scopus CiteScore Quartile
- Repository: `https://github.com/kbm4biz/scopus-citescore-quartile`
- Live client installation page: `https://kbm4biz.github.io/scopus-citescore-quartile/`

For another project, replace those values with:

- `<PROJECT_NAME>`
- `<GITHUB_OWNER>/<GITHUB_REPOSITORY>`
- `https://<GITHUB_OWNER>.github.io/<GITHUB_REPOSITORY>/`
- the exact permitted `<TARGET_URL_MATCHES>`

## Non-negotiable delivery model

- Maintain one source tree for domain logic, extraction, state, and shared UI.
- Make one standards-based Tampermonkey `.user.js` the primary client product on supported desktop and mobile browsers.
- Build a Chrome Manifest V3 desktop extension from the same source tree only as a secondary fallback for clients who cannot install a userscript manager.
- Keep the project web-platform based: semantic HTML, modern CSS, and vanilla JavaScript unless a dependency is genuinely necessary.
- Do not create separate desktop, Android, and iPhone userscripts. Every supported platform installs the same `.user.js` URL.
- Do not introduce a native app, proprietary wrapper, framework, remote library, analytics service, or broad permission unless the user explicitly requires it and the tradeoff is documented.
- Bundle runtime code locally. A userscript `@require` is allowed only when a real feature needs it, the URL/version is pinned, the privacy impact is disclosed, and a local alternative was considered.
- Preserve the project's exact domain terminology. Never substitute a superficially similar metric, ranking, category, or standard.

## Required project architecture

Prefer this structure:

```text
src/core/                    Pure calculation and validation
src/app/                     Shared page behavior and UI construction
src/platform/                Storage and platform adapters
src/entry/desktop.js         Desktop content-script entry
src/entry/userscript.js      Universal desktop/mobile userscript entry
src/popup/                   Desktop-only popup
src/ui/                      Shared logical-property CSS
scripts/                     Build finishing and client-page generation
dist/desktop/                Installable unpacked MV3 extension
dist/mobile/                 Backward-compatible hosted userscript site
tests/                       Unit, browser, fixture, and visual tests
.github/workflows/           Build, test, artifact, and Pages deployment
```

- Keep calculation/business rules separate from DOM extraction.
- Use a conditional storage adapter: `chrome.storage` for the extension, GM storage for userscripts, and a safe local fallback only when required.
- For dynamic sites, use a debounced `MutationObserver`, semantic labels, accessible names, and visible text. Do not depend only on generated CSS class names.
- Mark and remove owned UI so repeated mutations cannot create duplicate panels or badges.
- Sanitize page-derived text and insert it with `textContent`, never as trusted HTML.

## Universal userscript interface rules

- The primary userscript must use one responsive floating action button and full-height drawer on both desktop and mobile.
- Do not depend on a toolbar popup for the primary product.
- Show the installed version unobtrusively in the floating control so support staff can identify a client's release.
- Put essential user controls inside the drawer or the userscript manager. Do not maintain a separate settings UI for each platform.
- The fallback MV3 extension may retain a toolbar popup and desktop panel, but it must not become a second independent product.
- Use accessible contrast, visible focus states, keyboard controls where available, ARIA names, reduced-motion support, safe-area insets, and responsive sizing.
- Use CSS logical properties (`inline`, `block`, `margin-inline`, `border-inline-start`) so the same styles work in left-to-right and right-to-left layouts.
- Never hide or rewrite the website's original metrics or content.

## Threshold-position context

- When a broad result band hides meaningful placement within that band, show the exact distance to the next better threshold beside every live result badge.
- Calculate that distance from the same category-specific primary value used to assign the band. Never substitute an unrelated absolute score.
- Use an unambiguous compact label in badges and a full explanation in tooltips or detail panels.
- If the top band has no better threshold, label it as the highest band rather than inventing a distance.
- If the underlying value is estimated, visibly mark the threshold distance as estimated too.
- Describe threshold distance as the current position, not a prediction that the result will improve later.
- Cover boundary values, different positions within the same band, best-summary selection, inline results, floating controls, and responsive layouts in tests.

## Bilingual client installation page

Every distributed project must publish a simple GitHub Pages installation page in both English and Arabic.

- English and Arabic must contain the same essential meaning and actions.
- Provide an obvious language switch. Detect Arabic browser preference, but always let the client override it.
- Set the document `lang` and `dir` dynamically; Arabic must use `dir="rtl"`.
- Keep both languages in one generated page and one source file.
- Include only:
  - project name and current version;
  - one primary userscript installation button;
  - a short platform selector for desktop Chrome/Edge, desktop Firefox, iPhone/Safari, and Android/Firefox-or-Edge;
  - the official userscript-manager installation link and only the platform-specific steps that matter;
  - the Chrome/Edge `Allow User Scripts` requirement when applicable;
  - a warning to disable the older MV3 extension before enabling the userscript;
  - a one-sentence automatic-update explanation;
  - the shareable GitHub Pages URL;
  - a concise privacy/terminology note; and
  - a collapsed alternative-extension link for clients whose organization blocks userscript managers.
- Detect the likely platform locally and highlight it, but always provide a manual selector and never transmit detection data.
- Do not expose developer jargon, build commands, or long troubleshooting instructions on the client page.
- Use no remote fonts, tracking, analytics, or remotely executed page scripts.

## GitHub publishing and automatic updates

- Store the real repository and Pages URLs in `package.json`.
- On every push to `main`, GitHub Actions must install locked dependencies, build the primary userscript and fallback extension, run tests, upload the fallback artifact, and deploy `dist/mobile` to GitHub Pages.
- Publish the fallback extension as a versioned GitHub Release asset, or provide an equally stable download location, so the collapsed alternative link is useful to non-technical clients.
- Derive the hosted userscript base URL from the GitHub repository in CI.
- The hosted userscript must contain correct `@version`, `@updateURL`, and `@downloadURL` values.
- A local build must not contain a guessed or fake hosted update URL.
- Increase the package/userscript version whenever executable userscript behavior or the supported distribution model changes. A client-page-only wording or layout correction can retain the same userscript version.
- Tell Chrome/Edge users that current Tampermonkey releases may require `Allow User Scripts`, and tell users to enable automatic installation if their manager separates checking from installation.
- Existing extension users must disable or remove the fallback extension before running the userscript to prevent duplicate injected UI.
- Never rename or delete the published repository after clients install from its update URL without providing a migration plan.
- Never print, commit, or request personal access tokens, cookies, private keys, or browser credentials.

## Testing requirements

Before claiming completion:

- Test all domain-rule boundaries and invalid values.
- Test parsing/extraction variants, delayed content, dynamic changes, and duplicate prevention.
- Test desktop manifest permissions and every referenced file.
- Test the storage adapter on Chrome, GM, and fallback paths.
- Test the universal userscript metadata and confirm displayed data takes precedence over estimates or fallbacks.
- Test the userscript UI at desktop and narrow-mobile viewport sizes.
- Test the client page in English and Arabic, including `lang`, RTL direction, all supported platform selectors, identical install targets, current version, local platform detection, and absence of remote scripts.
- Render and inspect representative desktop-userscript, narrow-mobile, English client-page, and Arabic client-page screenshots.
- Load the desktop output in Chromium as an unpacked-extension smoke test.
- After deployment, verify the live page, `.user.js`, `.meta.js`, version, update URL, and download URL.
- State honestly whether authenticated live-site and physical iPhone/Android testing occurred.

## Required handoff

Deliver and retain:

- the source project;
- `dist/desktop/`;
- the hosted universal-userscript output;
- a desktop ZIP with `manifest.json` at its root;
- a standalone `.user.js`;
- a source ZIP without `.git`, `node_modules`, credentials, or private data;
- beginner-friendly README and privacy documentation;
- a test report;
- the repository, workflow-run, and live installation-page links; and
- exact automatic-update instructions.

Lead the final response with the working installation link and test outcome. Keep client instructions short and separate confirmed live validation from local-only validation.
