import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const testsDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.dirname(testsDirectory);
const desktopExtensionRoot = path.join(projectRoot, "dist", "desktop");
const packageJson = JSON.parse(await readFile(path.join(projectRoot, "package.json"), "utf8"));
const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser"
].filter(Boolean);

async function existingChrome() {
  const { access } = await import("node:fs/promises");
  for (const candidate of chromeCandidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next installed Chromium browser.
    }
  }
  throw new Error("Chrome or Edge was not found. Set CHROME_PATH to run browser fixture tests.");
}

function mimeType(filename) {
  if (filename.endsWith(".html")) return "text/html; charset=utf-8";
  if (filename.endsWith(".js") || filename.endsWith(".mjs")) return "text/javascript; charset=utf-8";
  if (filename.endsWith(".css")) return "text/css; charset=utf-8";
  if (filename.endsWith(".png")) return "image/png";
  return "application/octet-stream";
}

function startServer() {
  const server = createServer(async (request, response) => {
    try {
      const requestPath = decodeURIComponent(new URL(request.url, "http://127.0.0.1").pathname);
      const relative = requestPath.replace(/^\/+/, "") || "tests/fixtures/one-category.html";
      const resolved = path.resolve(projectRoot, relative);
      if (!resolved.startsWith(`${projectRoot}${path.sep}`)) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      const body = await readFile(resolved);
      response.writeHead(200, { "content-type": mimeType(resolved), "cache-control": "no-store" });
      response.end(body);
    } catch {
      response.writeHead(404).end("Not found");
    }
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

function runChrome(chromePath, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(chromePath, args, { windowsHide: true });
    const stdout = [];
    const stderr = [];
    child.stdout.on("data", (chunk) => stdout.push(chunk));
    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      const output = Buffer.concat(stdout).toString("utf8");
      const errors = Buffer.concat(stderr).toString("utf8");
      if (code !== 0) {
        reject(new Error(`Headless Chrome exited with ${code}: ${errors}`));
      } else {
        resolve({ output, errors });
      }
    });
  });
}

function count(haystack, needle) {
  return haystack.split(needle).length - 1;
}

async function renderFixture(chromePath, baseUrl, fixture, virtualTime = 1800) {
  const profile = await mkdtemp(path.join(tmpdir(), "scsq-chrome-"));
  try {
    const url = `${baseUrl}/tests/fixtures/${fixture}`;
    const { output } = await runChrome(chromePath, [
      "--headless=new",
      "--disable-gpu",
      "--disable-background-networking",
      "--disable-default-apps",
      "--disable-sync",
      "--metrics-recording-only",
      "--no-first-run",
      "--no-default-browser-check",
      `--user-data-dir=${profile}`,
      `--virtual-time-budget=${virtualTime}`,
      "--dump-dom",
      url
    ]);
    return output;
  } finally {
    await rm(profile, { recursive: true, force: true });
  }
}

async function captureFixture(chromePath, baseUrl, fixture, virtualTime = 1800, outputName = null, windowSize = "1280,1600") {
  const profile = await mkdtemp(path.join(tmpdir(), "scsq-capture-"));
  const screenshot = path.join(
    testsDirectory,
    "screenshots",
    outputName || fixture.replace(/[?#].*$/, "").replace(/\.html$/i, ".png")
  );
  try {
    const url = `${baseUrl}/tests/fixtures/${fixture}`;
    await runChrome(chromePath, [
      "--headless=new",
      "--disable-gpu",
      "--disable-background-networking",
      "--no-first-run",
      "--no-default-browser-check",
      `--user-data-dir=${profile}`,
      `--window-size=${windowSize}`,
      `--virtual-time-budget=${virtualTime}`,
      `--screenshot=${screenshot}`,
      url
    ]);
    return screenshot;
  } finally {
    await rm(profile, { recursive: true, force: true });
  }
}

async function extensionLoadSmoke(chromePath) {
  const profile = await mkdtemp(path.join(tmpdir(), "scsq-extension-"));
  try {
    const { output, errors } = await runChrome(chromePath, [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      `--user-data-dir=${profile}`,
      `--disable-extensions-except=${desktopExtensionRoot}`,
      `--load-extension=${desktopExtensionRoot}`,
      "--virtual-time-budget=600",
      "--dump-dom",
      "data:text/html,<title>Extension load smoke</title><main>ok</main>"
    ]);
    assert.match(output, /Extension load smoke/);
    assert.doesNotMatch(errors, /failed to load extension|could not load manifest|manifest file is missing/i);
  } finally {
    await rm(profile, { recursive: true, force: true });
  }
}

const chromePath = await existingChrome();
const server = await startServer();
const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}`;

try {
  await extensionLoadSmoke(chromePath);

  const one = await renderFixture(chromePath, baseUrl, "one-category.html");
  assert.equal(count(one, 'data-scsq-panel="true"'), 1, "one-category fixture should have exactly one panel");
  assert.equal(count(one, 'data-scsq-inline="true"'), 1, "one-category fixture should have exactly one inline badge");
  assert.match(one, /Best CiteScore Quartile:/);
  assert.match(one, /Business and International Management/);
  assert.match(one, /scsq-badge--q1/);

  const multiple = await renderFixture(chromePath, baseUrl, "multiple-categories.html");
  assert.equal(count(multiple, 'data-scsq-panel="true"'), 1, "multiple fixture should not duplicate its panel");
  assert.equal(count(multiple, 'data-scsq-inline="true"'), 4, "multiple fixture should add one inline badge per category");
  for (const quartile of ["q1", "q2", "q3", "q4"]) {
    assert.match(multiple, new RegExp(`scsq-badge--${quartile}`), `multiple fixture should include ${quartile.toUpperCase()}`);
  }
  assert.match(multiple, /Economics and Econometrics[\s\S]*?74%[\s\S]*?Q2[\s\S]*?Scopus percentile/);

  const delayed = await renderFixture(chromePath, baseUrl, "delayed-content.html", 2400);
  assert.equal(count(delayed, 'data-scsq-panel="true"'), 1, "delayed fixture should receive one panel after rendering");
  assert.equal(count(delayed, 'data-scsq-inline="true"'), 1, "delayed fixture should receive one inline badge");
  assert.match(delayed, /Computer Science Applications/);
  assert.match(delayed, /scsq-badge--q1/);

  const rankOnly = await renderFixture(chromePath, baseUrl, "rank-only.html");
  assert.match(rankOnly, /Estimated CiteScore Quartile/);
  assert.match(rankOnly, /Estimated from rank/);
  assert.match(rankOnly, /Estimated percentile: 87/);
  assert.match(rankOnly, /42\/320/);
  assert.match(rankOnly, /scsq-badge--q1/);

  const variation = await renderFixture(chromePath, baseUrl, "layout-variation.html");
  assert.equal(count(variation, 'data-scsq-inline="true"'), 2, "hidden unrelated category must not be scraped");
  assert.match(variation, /Decision Sciences[\s\S]*?Q2/);
  assert.match(variation, /Information Systems[\s\S]*?Q3/);
  assert.doesNotMatch(variation, /scsq-table__category[^>]*>Hidden Numbers/);

  const mobile = await renderFixture(
    chromePath,
    baseUrl,
    "multiple-categories.html?mode=mobile&open=1",
    2200
  );
  assert.equal(count(mobile, 'id="scsq-mobile-layer"'), 1, "mobile fixture should have exactly one UI layer");
  assert.equal(count(mobile, 'class="scsq-mobile-fab"'), 1, "mobile fixture should have exactly one floating action button");
  assert.equal(count(mobile, 'id="scsq-mobile-drawer"'), 1, "mobile fixture should have exactly one drawer");
  assert.match(mobile, /scsq-mobile-drawer is-open/);
  assert.match(
    mobile,
    new RegExp(`scsq-mobile-fab__version[^>]*>v${packageJson.version.replaceAll(".", "\\.")}<`),
    "mobile floating button should show the installed version below its Q value"
  );
  assert.equal(count(mobile, 'data-scsq-inline="true"'), 4, "mobile fixture should add one inline badge per category");
  for (const quartile of ["q1", "q2", "q3", "q4"]) {
    assert.match(mobile, new RegExp(`scsq-badge--${quartile}`), `mobile fixture should include ${quartile.toUpperCase()}`);
  }

  const mobileDelayed = await renderFixture(
    chromePath,
    baseUrl,
    "delayed-content.html?mode=mobile&open=1",
    2800
  );
  assert.equal(count(mobileDelayed, 'id="scsq-mobile-layer"'), 1, "delayed mobile fixture should not duplicate its layer");
  assert.equal(count(mobileDelayed, 'class="scsq-mobile-fab"'), 1, "delayed mobile fixture should not duplicate its FAB");
  assert.equal(count(mobileDelayed, 'data-scsq-inline="true"'), 1, "delayed mobile fixture should receive one inline badge");
  assert.match(mobileDelayed, /Computer Science Applications/);
  assert.match(mobileDelayed, /scsq-badge--q1/);

  const fixtureNames = [
    "one-category.html",
    "multiple-categories.html",
    "delayed-content.html",
    "rank-only.html",
    "layout-variation.html"
  ];
  for (const fixture of fixtureNames) {
    await captureFixture(chromePath, baseUrl, fixture, fixture === "delayed-content.html" ? 2400 : 1800);
  }
  await captureFixture(
    chromePath,
    baseUrl,
    "multiple-categories.html?mode=mobile",
    2200,
    "mobile-floating-button.png",
    "600,900"
  );
  await captureFixture(
    chromePath,
    baseUrl,
    "multiple-categories.html?mode=mobile&open=1",
    2200,
    "mobile-multiple-categories.png",
    "500,900"
  );
  await captureFixture(
    chromePath,
    baseUrl,
    "delayed-content.html?mode=mobile&open=1",
    2800,
    "mobile-delayed-content.png",
    "500,900"
  );

  console.log("Browser fixture tests: 7/7 passed in headless Chromium.");
  console.log("Manifest V3 unpacked-extension load smoke: passed.");
  console.log("Fixture screenshots: 8 written to tests/screenshots for visual QA.");
  console.log(`Browser used: ${chromePath}`);
} finally {
  await new Promise((resolve) => server.close(resolve));
}
