import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const testsDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(testsDirectory, "..");
const packageJson = JSON.parse(fs.readFileSync(path.join(projectRoot, "package.json"), "utf8"));
const html = fs.readFileSync(path.join(projectRoot, "dist", "mobile", "index.html"), "utf8");

test("client installation page provides equivalent English and Arabic routes", () => {
  assert.match(html, /data-language-panel="en"/);
  assert.match(html, /data-language-panel="ar" lang="ar" dir="rtl"/);
  assert.match(html, /Install mobile userscript/);
  assert.match(html, /تثبيت سكربت الجوال/);
  assert.match(html, /Automatic updates:/);
  assert.match(html, /التحديث التلقائي:/);
  assert.match(html, /document\.documentElement\.dir = selected === "ar" \? "rtl" : "ltr"/);
  assert.equal(
    (html.match(/href="\.\/scopus-citescore-quartile\.user\.js"/g) || []).length,
    2,
    "both languages must install the same userscript"
  );
});

test("client installation page is current, shareable, and self-contained", () => {
  assert.match(html, new RegExp(`v${packageJson.version.replaceAll(".", "\\.")}`));
  assert.match(html, new RegExp(packageJson.homepage.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(html, /iPhone[\s\S]*Safari[\s\S]*Tampermonkey/);
  assert.match(html, /Android[\s\S]*(?:Firefox|Edge)[\s\S]*Tampermonkey/);
  assert.doesNotMatch(html, /<script[^>]+src=["']https?:\/\//i);
  assert.doesNotMatch(html, /analytics|tracking pixel|googletagmanager/i);
});
