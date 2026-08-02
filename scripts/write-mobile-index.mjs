import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const outputDirectory = resolve(projectRoot, "dist", "mobile");
const packageJson = JSON.parse(await readFile(resolve(projectRoot, "package.json"), "utf8"));
const fileName = "scopus-citescore-quartile.user.js";
const homepageUrl = String(packageJson.homepage || "").replace(/\/+$/, "");
const repositoryUrl = typeof packageJson.repository === "string"
  ? packageJson.repository
  : packageJson.repository?.url;
const extensionFallbackUrl = `${repositoryUrl}/releases/latest`;
const managerUrls = {
  chromium: "https://www.tampermonkey.net/?browser=chrome",
  firefox: "https://www.tampermonkey.net/?browser=firefox",
  safari: "https://www.tampermonkey.net/?browser=safari",
  mobile: "https://www.tampermonkey.net/faq.php?locale=en&q=Q406",
  allowScripts: "https://www.tampermonkey.net/faq.php?locale=en&q=Q209"
};

const html = `<!doctype html>
<html lang="en" dir="ltr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Install Scopus CiteScore Quartile on supported desktop and mobile browsers.">
  <title>Scopus CiteScore Quartile ${packageJson.version}</title>
  <style>
    :root {
      color-scheme: light;
      --ink: #17313a;
      --muted: #4c626a;
      --brand: #006b73;
      --brand-dark: #004f56;
      --line: #bfd1d7;
      --surface: #ffffff;
      --page: #eef4f5;
      --soft: #f4f8f9;
      --success: #e9f7ef;
      --success-line: #167447;
      --warning: #fff7d6;
      --warning-line: #8a6200;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }

    * { box-sizing: border-box; }

    body {
      margin: 0;
      color: var(--ink);
      background: var(--page);
      font-size: 16px;
      line-height: 1.55;
    }

    main {
      width: min(52rem, calc(100% - 1.5rem));
      margin-block: 1.25rem;
      margin-inline: auto;
      padding: clamp(1rem, 4vw, 2rem);
      background: var(--surface);
      border: 1px solid var(--line);
      border-radius: 14px;
      box-shadow: 0 7px 26px rgba(23, 49, 58, 0.12);
    }

    .topbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      margin-block-end: 1.25rem;
    }

    .version {
      margin: 0;
      color: var(--brand-dark);
      font-size: 0.86rem;
      font-weight: 800;
      letter-spacing: 0.02em;
    }

    .language-switch {
      display: inline-flex;
      padding: 0.2rem;
      background: #e7f0f2;
      border: 1px solid var(--line);
      border-radius: 9px;
    }

    .language-switch button,
    .platform-switch button {
      min-block-size: 2.4rem;
      padding-block: 0.5rem;
      padding-inline: 0.75rem;
      color: var(--brand-dark);
      background: transparent;
      border: 0;
      border-radius: 7px;
      font: inherit;
      font-weight: 750;
      cursor: pointer;
    }

    .language-switch button[aria-pressed="true"] {
      color: #ffffff;
      background: var(--brand);
    }

    h1 {
      margin-block: 0 0.45rem;
      margin-inline: 0;
      color: #0f5663;
      font-size: clamp(1.65rem, 5vw, 2.3rem);
      line-height: 1.2;
    }

    .intro {
      margin-block: 0 1.2rem;
      margin-inline: 0;
      color: var(--muted);
      font-size: 1.04rem;
    }

    .step-title {
      margin-block: 1.2rem 0.55rem;
      margin-inline: 0;
      color: #184f5b;
      font-size: 1.08rem;
    }

    .platform-switch {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 0.45rem;
      padding: 0.35rem;
      background: #e8f0f2;
      border: 1px solid var(--line);
      border-radius: 10px;
    }

    .platform-switch button {
      min-block-size: 3rem;
      line-height: 1.2;
    }

    .platform-switch button[aria-selected="true"] {
      color: #ffffff;
      background: var(--brand);
      box-shadow: 0 2px 7px rgba(0, 79, 86, 0.2);
    }

    .platform-panel {
      margin-block-start: 0.7rem;
      padding: 1rem;
      background: var(--soft);
      border: 1px solid #cfdee2;
      border-radius: 10px;
    }

    .platform-panel h2 {
      margin-block: 0 0.45rem;
      margin-inline: 0;
      color: #184f5b;
      font-size: 1.08rem;
    }

    .platform-panel ol {
      margin-block: 0.6rem 0;
      padding-inline-start: 1.35rem;
    }

    .platform-panel li + li { margin-block-start: 0.38rem; }

    .manager-button,
    .install-button {
      display: inline-block;
      padding-block: 0.7rem;
      padding-inline: 1rem;
      border: 2px solid var(--brand);
      border-radius: 8px;
      font-weight: 800;
      text-align: center;
      text-decoration: none;
    }

    .manager-button {
      color: var(--brand-dark);
      background: #ffffff;
    }

    .install-box {
      margin-block-start: 0.9rem;
      padding: 1rem;
      background: #edf7f6;
      border: 1px solid #a7d7d2;
      border-radius: 10px;
    }

    .install-box h2 {
      margin-block: 0 0.3rem;
      margin-inline: 0;
      color: #184f5b;
      font-size: 1.08rem;
    }

    .install-box p {
      margin-block: 0 0.75rem;
      margin-inline: 0;
    }

    .install-button {
      width: 100%;
      color: #ffffff;
      background: var(--brand);
    }

    .manager-button:hover,
    .install-button:hover {
      color: #ffffff;
      background: var(--brand-dark);
      border-color: var(--brand-dark);
    }

    .migration-warning,
    .update-note,
    .share,
    .terminology {
      margin-block: 0.8rem 0;
      margin-inline: 0;
      padding: 0.8rem;
      border-radius: 8px;
    }

    .migration-warning,
    .terminology {
      color: #514500;
      background: var(--warning);
      border-inline-start: 4px solid var(--warning-line);
    }

    .update-note {
      color: #184c35;
      background: var(--success);
      border-inline-start: 4px solid var(--success-line);
    }

    .share {
      color: #314950;
      background: #edf3f4;
    }

    .share code {
      display: block;
      margin-block-start: 0.3rem;
      overflow-wrap: anywhere;
      unicode-bidi: plaintext;
      font-family: ui-monospace, "Cascadia Code", monospace;
      font-size: 0.82rem;
    }

    .alternative {
      margin-block-start: 0.9rem;
      padding: 0.75rem 0.85rem;
      background: #f7f9fa;
      border: 1px solid #d7e2e5;
      border-radius: 8px;
    }

    .alternative summary {
      color: var(--brand-dark);
      font-weight: 800;
      cursor: pointer;
    }

    .alternative p { margin-block: 0.55rem 0; }

    .text-link,
    .source-link {
      color: var(--brand-dark);
      font-weight: 750;
    }

    .source-link {
      display: inline-block;
      margin-block-start: 0.9rem;
    }

    a:focus-visible,
    button:focus-visible,
    summary:focus-visible {
      outline: 3px solid #111111;
      outline-offset: 3px;
    }

    [hidden] { display: none !important; }
    bdi { unicode-bidi: isolate; }

    @media (max-width: 720px) {
      .platform-switch { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 430px) {
      main { margin-block: 0.65rem; }
      .platform-switch { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <main>
    <div class="topbar">
      <p class="version">Scopus CiteScore Quartile · v${packageJson.version}</p>
      <div class="language-switch" role="group" aria-label="Language / اللغة">
        <button type="button" data-language-button="en" aria-pressed="true">English</button>
        <button type="button" data-language-button="ar" aria-pressed="false" lang="ar">العربية</button>
      </div>
    </div>

    <section data-language-panel="en">
      <h1>One userscript for desktop and mobile</h1>
      <p class="intro">See every category's CiteScore Q and its percentile-point distance to the next better quartile. Choose your browser, install Tampermonkey once, then install the tool.</p>

      <h2 class="step-title">Step 1 — Choose your platform</h2>
      <div class="platform-switch" role="tablist" aria-label="Choose your platform">
        <button type="button" role="tab" data-platform-button="chromium" aria-selected="true">Desktop<br>Chrome / Edge</button>
        <button type="button" role="tab" data-platform-button="firefox" aria-selected="false">Desktop<br>Firefox</button>
        <button type="button" role="tab" data-platform-button="ios" aria-selected="false">iPhone / iPad</button>
        <button type="button" role="tab" data-platform-button="android" aria-selected="false">Android</button>
      </div>

      <article class="platform-panel" data-platform-panel="chromium" role="tabpanel">
        <h2>Desktop Chrome or Edge</h2>
        <ol>
          <li>Install Tampermonkey from its official page.</li>
          <li>In Chrome/Edge 138+, open Tampermonkey's extension details and enable <a class="text-link" href="${managerUrls.allowScripts}" target="_blank" rel="noopener noreferrer">Allow User Scripts</a>.</li>
          <li>Return here and continue to Step 2.</li>
        </ol>
        <a class="manager-button" href="${managerUrls.chromium}" target="_blank" rel="noopener noreferrer">Get Tampermonkey</a>
        <p class="migration-warning"><strong>Already using the old Chrome extension?</strong> Disable or remove it before installing the userscript to avoid duplicate badges.</p>
      </article>

      <article class="platform-panel" data-platform-panel="firefox" role="tabpanel" hidden>
        <h2>Desktop Firefox</h2>
        <ol>
          <li>Install Tampermonkey for Firefox.</li>
          <li>Return to this page in Firefox.</li>
          <li>Continue to Step 2.</li>
        </ol>
        <a class="manager-button" href="${managerUrls.firefox}" target="_blank" rel="noopener noreferrer">Get Tampermonkey</a>
      </article>

      <article class="platform-panel" data-platform-panel="ios" role="tabpanel" hidden>
        <h2>iPhone or iPad</h2>
        <ol>
          <li>Install Tampermonkey for Safari and enable its Safari extension.</li>
          <li>Allow it on this GitHub Pages site and on Scopus.</li>
          <li>Return to this page in Safari and continue to Step 2.</li>
        </ol>
        <a class="manager-button" href="${managerUrls.safari}" target="_blank" rel="noopener noreferrer">Get Tampermonkey for Safari</a>
      </article>

      <article class="platform-panel" data-platform-panel="android" role="tabpanel" hidden>
        <h2>Android</h2>
        <ol>
          <li>Use Firefox Android or Microsoft Edge Android.</li>
          <li>Install Tampermonkey inside that browser.</li>
          <li>Return to this page in the same browser and continue to Step 2.</li>
        </ol>
        <a class="manager-button" href="${managerUrls.mobile}" target="_blank" rel="noopener noreferrer">View official Android options</a>
      </article>

      <div class="install-box">
        <h2>Step 2 — Install the quartile userscript</h2>
        <p>Tampermonkey will show the script permissions before installation.</p>
        <a class="install-button" href="./${fileName}">Install Scopus CiteScore Quartile</a>
      </div>

      <p class="update-note"><strong>Updates:</strong> install once. Tampermonkey checks the GitHub version automatically. Enable automatic installation in Tampermonkey if you want updates applied without confirmation.</p>
      <details class="alternative">
        <summary>Alternative desktop extension</summary>
        <p>If Tampermonkey is blocked by your organization, the manually loaded Manifest V3 extension remains available as a fallback.</p>
        <a class="text-link" href="${extensionFallbackUrl}">Desktop extension instructions</a>
      </details>
      <p class="share"><strong>Share this installation page:</strong><code>${homepageUrl}/</code></p>
      <p class="terminology">This is a category-specific Scopus CiteScore Quartile. It is not a JCR or SCImago/SJR quartile.</p>
      <a class="source-link" href="${repositoryUrl}">View source on GitHub</a>
    </section>

    <section data-language-panel="ar" lang="ar" dir="rtl" hidden>
      <h1>سكربت واحد للكمبيوتر والجوال</h1>
      <p class="intro">اعرض ربع <bdi dir="ltr">CiteScore</bdi> لكل تصنيف والمسافة بالنقاط المئينية إلى الربع الأفضل التالي. اختر متصفحك، وثبّت <bdi dir="ltr">Tampermonkey</bdi> مرة واحدة، ثم ثبّت الأداة.</p>

      <h2 class="step-title">الخطوة 1 — اختر المنصة</h2>
      <div class="platform-switch" role="tablist" aria-label="اختر المنصة">
        <button type="button" role="tab" data-platform-button="chromium" aria-selected="true">الكمبيوتر<br><bdi dir="ltr">Chrome / Edge</bdi></button>
        <button type="button" role="tab" data-platform-button="firefox" aria-selected="false">الكمبيوتر<br><bdi dir="ltr">Firefox</bdi></button>
        <button type="button" role="tab" data-platform-button="ios" aria-selected="false">آيفون / آيباد</button>
        <button type="button" role="tab" data-platform-button="android" aria-selected="false">أندرويد</button>
      </div>

      <article class="platform-panel" data-platform-panel="chromium" role="tabpanel">
        <h2><bdi dir="ltr">Chrome</bdi> أو <bdi dir="ltr">Edge</bdi> على الكمبيوتر</h2>
        <ol>
          <li>ثبّت <bdi dir="ltr">Tampermonkey</bdi> من صفحته الرسمية</li>
          <li>في الإصدارات 138 أو أحدث، افتح تفاصيل الإضافة وفعّل <a class="text-link" href="${managerUrls.allowScripts}" target="_blank" rel="noopener noreferrer"><bdi dir="ltr">Allow User Scripts</bdi></a></li>
          <li>عُد إلى هذه الصفحة وانتقل إلى الخطوة 2</li>
        </ol>
        <a class="manager-button" href="${managerUrls.chromium}" target="_blank" rel="noopener noreferrer">تثبيت <bdi dir="ltr">Tampermonkey</bdi></a>
        <p class="migration-warning"><strong>هل تستخدم إضافة كروم القديمة؟</strong> عطّلها أو احذفها قبل تثبيت السكربت لتجنّب ظهور الشارات مرتين.</p>
      </article>

      <article class="platform-panel" data-platform-panel="firefox" role="tabpanel" hidden>
        <h2><bdi dir="ltr">Firefox</bdi> على الكمبيوتر</h2>
        <ol>
          <li>ثبّت <bdi dir="ltr">Tampermonkey</bdi> لمتصفح <bdi dir="ltr">Firefox</bdi></li>
          <li>عُد إلى هذه الصفحة في المتصفح نفسه</li>
          <li>انتقل إلى الخطوة 2</li>
        </ol>
        <a class="manager-button" href="${managerUrls.firefox}" target="_blank" rel="noopener noreferrer">تثبيت <bdi dir="ltr">Tampermonkey</bdi></a>
      </article>

      <article class="platform-panel" data-platform-panel="ios" role="tabpanel" hidden>
        <h2>آيفون أو آيباد</h2>
        <ol>
          <li>ثبّت <bdi dir="ltr">Tampermonkey</bdi> لمتصفح <bdi dir="ltr">Safari</bdi> وفعّل إضافة المتصفح</li>
          <li>اسمح لها بالعمل في صفحة التثبيت هذه وفي <bdi dir="ltr">Scopus</bdi></li>
          <li>عُد إلى هذه الصفحة في <bdi dir="ltr">Safari</bdi> وانتقل إلى الخطوة 2</li>
        </ol>
        <a class="manager-button" href="${managerUrls.safari}" target="_blank" rel="noopener noreferrer">تثبيت <bdi dir="ltr">Tampermonkey</bdi> لـ <bdi dir="ltr">Safari</bdi></a>
      </article>

      <article class="platform-panel" data-platform-panel="android" role="tabpanel" hidden>
        <h2>أندرويد</h2>
        <ol>
          <li>استخدم <bdi dir="ltr">Firefox Android</bdi> أو <bdi dir="ltr">Microsoft Edge Android</bdi></li>
          <li>ثبّت <bdi dir="ltr">Tampermonkey</bdi> داخل المتصفح</li>
          <li>عُد إلى هذه الصفحة في المتصفح نفسه وانتقل إلى الخطوة 2</li>
        </ol>
        <a class="manager-button" href="${managerUrls.mobile}" target="_blank" rel="noopener noreferrer">عرض خيارات أندرويد الرسمية</a>
      </article>

      <div class="install-box">
        <h2>الخطوة 2 — ثبّت سكربت الأرباع</h2>
        <p>سيعرض <bdi dir="ltr">Tampermonkey</bdi> صلاحيات السكربت قبل التثبيت.</p>
        <a class="install-button" href="./${fileName}">تثبيت أداة أرباع <bdi dir="ltr">Scopus CiteScore</bdi></a>
      </div>

      <p class="update-note"><strong>التحديثات:</strong> ثبّت السكربت مرة واحدة، وسيتحقق <bdi dir="ltr">Tampermonkey</bdi> من إصدار <bdi dir="ltr">GitHub</bdi> تلقائياً. فعّل التثبيت التلقائي في إعداداته لتطبيق التحديثات دون تأكيد.</p>
      <details class="alternative">
        <summary>إضافة سطح المكتب البديلة</summary>
        <p>إذا كانت مؤسستك تمنع <bdi dir="ltr">Tampermonkey</bdi>، فستبقى إضافة <bdi dir="ltr">Manifest V3</bdi> اليدوية متاحة كخيار بديل.</p>
        <a class="text-link" href="${extensionFallbackUrl}">تعليمات إضافة سطح المكتب</a>
      </details>
      <p class="share"><strong>شارك صفحة التثبيت:</strong><code>${homepageUrl}/</code></p>
      <p class="terminology">هذا رُبع <bdi dir="ltr">CiteScore</bdi> خاص بكل تصنيف موضوعي في <bdi dir="ltr">Scopus</bdi>، وليس رُبع <bdi dir="ltr">JCR</bdi> أو <bdi dir="ltr">SCImago/SJR</bdi></p>
      <a class="source-link" href="${repositoryUrl}">عرض المصدر على <bdi dir="ltr">GitHub</bdi></a>
    </section>
  </main>

  <script>
    (function initialiseClientPage() {
      "use strict";
      var languageStorageKey = "scsq-client-language";
      var platformStorageKey = "scsq-client-platform";
      var supportedPlatforms = ["chromium", "firefox", "ios", "android"];
      var languageButtons = Array.from(document.querySelectorAll("[data-language-button]"));
      var languagePanels = Array.from(document.querySelectorAll("[data-language-panel]"));
      var platformButtons = Array.from(document.querySelectorAll("[data-platform-button]"));
      var platformPanels = Array.from(document.querySelectorAll("[data-platform-panel]"));

      function readStorage(key) {
        try {
          return localStorage.getItem(key);
        } catch (_error) {
          return null;
        }
      }

      function writeStorage(key, value) {
        try {
          localStorage.setItem(key, value);
        } catch (_error) {
          // Selection still works when storage is unavailable.
        }
      }

      function applyLanguage(language) {
        var selected = language === "ar" ? "ar" : "en";
        document.documentElement.lang = selected;
        document.documentElement.dir = selected === "ar" ? "rtl" : "ltr";
        languageButtons.forEach(function updateButton(button) {
          button.setAttribute("aria-pressed", String(button.dataset.languageButton === selected));
        });
        languagePanels.forEach(function updatePanel(panel) {
          panel.hidden = panel.dataset.languagePanel !== selected;
        });
        writeStorage(languageStorageKey, selected);
      }

      function detectPlatform() {
        var userAgent = String(navigator.userAgent || "").toLowerCase();
        var touchApple = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
        if (/iphone|ipad|ipod/.test(userAgent) || touchApple) return "ios";
        if (/android/.test(userAgent)) return "android";
        if (/firefox|fxios/.test(userAgent)) return "firefox";
        return "chromium";
      }

      function applyPlatform(platform) {
        var selected = supportedPlatforms.includes(platform) ? platform : detectPlatform();
        platformButtons.forEach(function updateButton(button) {
          button.setAttribute("aria-selected", String(button.dataset.platformButton === selected));
        });
        platformPanels.forEach(function updatePanel(panel) {
          panel.hidden = panel.dataset.platformPanel !== selected;
        });
        writeStorage(platformStorageKey, selected);
      }

      var parameters = new URLSearchParams(location.search);
      var queryLanguage = parameters.get("lang");
      var queryPlatform = parameters.get("platform");
      var browserLanguage = String(navigator.language || "").toLowerCase().startsWith("ar") ? "ar" : "en";
      applyLanguage(queryLanguage || readStorage(languageStorageKey) || browserLanguage);
      applyPlatform(queryPlatform || readStorage(platformStorageKey) || detectPlatform());

      languageButtons.forEach(function bindLanguage(button) {
        button.addEventListener("click", function changeLanguage() {
          applyLanguage(button.dataset.languageButton);
        });
      });
      platformButtons.forEach(function bindPlatform(button) {
        button.addEventListener("click", function changePlatform() {
          applyPlatform(button.dataset.platformButton);
        });
      });
    })();
  </script>
</body>
</html>
`;

await writeFile(resolve(outputDirectory, "index.html"), html, "utf8");
