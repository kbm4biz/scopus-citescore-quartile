# Reusable Hybrid Web-Platform Project Rules

## Purpose and scope

Use these rules for browser-based client projects that should ship from one maintained codebase to desktop browsers and mobile userscript managers. Copy this file into a new project root and replace project-specific names, match URLs, terminology, permissions, and GitHub links.

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
- Build a Chrome Manifest V3 desktop extension and a standards-based `.user.js` mobile target from that source tree.
- Keep the project web-platform based: semantic HTML, modern CSS, and vanilla JavaScript unless a dependency is genuinely necessary.
- Do not create separate Android and iPhone codebases. Both mobile platforms install the same userscript.
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
src/entry/mobile.js          Mobile userscript entry
src/popup/                   Desktop-only popup
src/ui/                      Shared logical-property CSS
scripts/                     Build finishing and client-page generation
dist/desktop/                Installable unpacked MV3 extension
dist/mobile/                 Installable and hostable userscript site
tests/                       Unit, browser, fixture, and visual tests
.github/workflows/           Build, test, artifact, and Pages deployment
```

- Keep calculation/business rules separate from DOM extraction.
- Use a conditional storage adapter: `chrome.storage` for the extension, GM storage for userscripts, and a safe local fallback only when required.
- For dynamic sites, use a debounced `MutationObserver`, semantic labels, accessible names, and visible text. Do not depend only on generated CSS class names.
- Mark and remove owned UI so repeated mutations cannot create duplicate panels or badges.
- Sanitize page-derived text and insert it with `textContent`, never as trusted HTML.

## Desktop and mobile interface rules

- Desktop may use a toolbar popup and an in-page panel.
- Mobile must avoid dependence on a browser toolbar popup. Use a reachable floating action button and a full-height responsive drawer.
- Show the installed version unobtrusively in the mobile floating control so support staff can identify a client's release.
- Use accessible contrast, visible focus states, keyboard controls where available, ARIA names, reduced-motion support, safe-area insets, and responsive sizing.
- Use CSS logical properties (`inline`, `block`, `margin-inline`, `border-inline-start`) so the same styles work in left-to-right and right-to-left layouts.
- Never hide or rewrite the website's original metrics or content.

## Bilingual client installation page

Every distributed project must publish a simple GitHub Pages installation page in both English and Arabic.

- English and Arabic must contain the same essential meaning and actions.
- Provide an obvious language switch. Detect Arabic browser preference, but always let the client override it.
- Set the document `lang` and `dir` dynamically; Arabic must use `dir="rtl"`.
- Keep both languages in one generated page and one source file.
- Include only:
  - project name and current version;
  - one primary userscript installation button;
  - short iPhone/Safari and Android/Firefox-or-Edge instructions;
  - a one-sentence automatic-update explanation;
  - the shareable GitHub Pages URL;
  - a concise privacy/terminology note; and
  - a source-repository link when public.
- Do not expose developer jargon, build commands, or long troubleshooting instructions on the client page.
- Use no remote fonts, tracking, analytics, or remotely executed page scripts.

## GitHub publishing and automatic updates

- Store the real repository and Pages URLs in `package.json`.
- On every push to `main`, GitHub Actions must install locked dependencies, build both targets, run tests, upload the desktop artifact, and deploy `dist/mobile` to GitHub Pages.
- Derive the hosted userscript base URL from the GitHub repository in CI.
- The hosted userscript must contain correct `@version`, `@updateURL`, and `@downloadURL` values.
- A local build must not contain a guessed or fake hosted update URL.
- Increase the package/userscript version whenever executable userscript behavior changes. A client-page-only wording or layout change can retain the same userscript version.
- Never rename or delete the published repository after clients install from its update URL without providing a migration plan.
- Never print, commit, or request personal access tokens, cookies, private keys, or browser credentials.

## Testing requirements

Before claiming completion:

- Test all domain-rule boundaries and invalid values.
- Test parsing/extraction variants, delayed content, dynamic changes, and duplicate prevention.
- Test desktop manifest permissions and every referenced file.
- Test the storage adapter on Chrome, GM, and fallback paths.
- Test the mobile userscript metadata and confirm displayed data takes precedence over estimates or fallbacks.
- Test the client page in English and Arabic, including `lang`, RTL direction, identical install targets, current version, and absence of remote scripts.
- Render and inspect representative desktop, narrow mobile, English client-page, and Arabic client-page screenshots.
- Load the desktop output in Chromium as an unpacked-extension smoke test.
- After deployment, verify the live page, `.user.js`, `.meta.js`, version, update URL, and download URL.
- State honestly whether authenticated live-site and physical iPhone/Android testing occurred.

## Required handoff

Deliver and retain:

- the source project;
- `dist/desktop/`;
- the hosted/mobile output;
- a desktop ZIP with `manifest.json` at its root;
- a standalone `.user.js`;
- a source ZIP without `.git`, `node_modules`, credentials, or private data;
- beginner-friendly README and privacy documentation;
- a test report;
- the repository, workflow-run, and live installation-page links; and
- exact automatic-update instructions.

Lead the final response with the working installation link and test outcome. Keep client instructions short and separate confirmed live validation from local-only validation.
