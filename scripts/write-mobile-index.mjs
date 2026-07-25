import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const outputDirectory = resolve(projectRoot, "dist", "mobile");
const packageJson = JSON.parse(await readFile(resolve(projectRoot, "package.json"), "utf8"));
const fileName = "scopus-citescore-quartile.user.js";

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Scopus CiteScore Quartile userscript</title>
  <style>
    :root { color-scheme: light; font-family: system-ui, sans-serif; }
    body { margin: 0; color: #17313a; background: #eef4f5; }
    main { width: min(42rem, calc(100% - 2rem)); margin: 3rem auto; padding: 1.5rem; background: white; border: 1px solid #bfd1d7; border-radius: 12px; box-shadow: 0 6px 24px #17313a1f; }
    h1 { margin-top: 0; color: #0f5663; }
    a { display: inline-block; padding: .75rem 1rem; color: white; background: #006b73; border-radius: 8px; font-weight: 700; }
    .note { margin-top: 1.2rem; padding: .8rem; background: #fff7d6; border-inline-start: 4px solid #8a6200; }
  </style>
</head>
<body>
  <main>
    <h1>Scopus CiteScore Quartile ${packageJson.version}</h1>
    <p>Install or update the mobile userscript with a compatible userscript manager.</p>
    <p><a href="./${fileName}">Install mobile userscript</a></p>
    <p class="note">This calculates category-specific CiteScore quartiles. It is not a JCR or SCImago/SJR quartile.</p>
  </main>
</body>
</html>
`;

await writeFile(resolve(outputDirectory, "index.html"), html, "utf8");
