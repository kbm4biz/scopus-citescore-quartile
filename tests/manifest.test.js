import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const testsDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testsDirectory, "..");
const extensionRoot = path.join(projectRoot, "dist", "desktop");
const manifest = JSON.parse(fs.readFileSync(path.join(extensionRoot, "manifest.json"), "utf8"));

test("manifest is MV3 with only the intended permission and Scopus source-page access", () => {
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(manifest.permissions, ["storage"]);
  assert.deepEqual(manifest.host_permissions, ["https://www.scopus.com/sourceid/*"]);
  assert.deepEqual(manifest.content_scripts[0].matches, ["https://www.scopus.com/sourceid/*"]);
});

test("every manifest-referenced local file exists", () => {
  const referenced = [
    manifest.action.default_popup,
    ...Object.values(manifest.action.default_icon),
    ...Object.values(manifest.icons),
    ...manifest.content_scripts.flatMap((entry) => [...entry.js, ...entry.css])
  ];
  referenced.forEach((relativePath) => {
    assert.equal(fs.existsSync(path.join(extensionRoot, relativePath)), true, relativePath);
  });
});

test("desktop bundle contains no remotely hosted script imports", () => {
  const javascriptFiles = fs.readdirSync(extensionRoot, { recursive: true })
    .filter((filename) => filename.endsWith(".js"));
  javascriptFiles.forEach((filename) => {
    const source = fs.readFileSync(path.join(extensionRoot, filename), "utf8");
    assert.doesNotMatch(source, /(?:importScripts|src\s*=|import\s+[^;]*from)\s*['"]https?:\/\//i, filename);
  });
});

test("mobile userscript is self-contained and has the required metadata", () => {
  const userscript = fs.readFileSync(
    path.join(projectRoot, "dist", "mobile", "scopus-citescore-quartile.user.js"),
    "utf8"
  );
  assert.match(userscript, /@version\s+2\.0\.0/);
  assert.match(userscript, /@match\s+https:\/\/www\.scopus\.com\/sourceid\/\*/);
  assert.match(userscript, /@run-at\s+document-idle/);
  assert.match(userscript, /@grant\s+GM_getValue/);
  assert.match(userscript, /@grant\s+GM_setValue/);
  assert.doesNotMatch(userscript, /@require\s+/);
});
