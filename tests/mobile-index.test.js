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
  assert.match(html, /Install Scopus CiteScore Quartile/);
  assert.match(html, /تثبيت أداة أرباع/);
  assert.match(html, /Updates:/);
  assert.match(html, /التحديثات:/);
  assert.match(html, /distance to the next better quartile/);
  assert.match(html, /المسافة إلى الربع الأفضل التالي/);
  assert.match(html, /mini 0–100 percentile scale/);
  assert.match(html, /مقياس مئيني مصغّر من 0 إلى 100/);
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
  for (const platform of ["chromium", "firefox", "ios", "android"]) {
    assert.match(html, new RegExp(`data-platform-button="${platform}"`));
    assert.match(html, new RegExp(`data-platform-panel="${platform}"`));
  }
  assert.match(html, /tampermonkey\.net\/\?browser=chrome/);
  assert.match(html, /tampermonkey\.net\/\?browser=firefox/);
  assert.match(html, /tampermonkey\.net\/\?browser=safari/);
  assert.match(html, /Allow User Scripts/);
  assert.match(html, /Disable or remove it before installing the userscript/);
  assert.match(html, /Alternative desktop extension/);
  assert.match(html, /github\.com\/kbm4biz\/scopus-citescore-quartile\/releases\/latest/);
  assert.match(html, /function detectPlatform\(\)/);
  assert.doesNotMatch(html, /<script[^>]+src=["']https?:\/\//i);
  assert.doesNotMatch(html, /analytics|tracking pixel|googletagmanager/i);
});
