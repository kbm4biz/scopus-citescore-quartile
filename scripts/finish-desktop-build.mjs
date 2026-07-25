import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { build } from "vite";
import { createManifest } from "../src/manifest.js";

const projectRoot = resolve(import.meta.dirname, "..");
const outputDirectory = resolve(projectRoot, "dist", "desktop");
const packageJson = JSON.parse(await readFile(resolve(projectRoot, "package.json"), "utf8"));

await build({
  configFile: false,
  root: resolve(projectRoot, "src", "popup"),
  base: "./",
  build: {
    outDir: outputDirectory,
    emptyOutDir: false,
    target: "chrome111",
    minify: false,
    sourcemap: false,
    rolldownOptions: {
      input: resolve(projectRoot, "src", "popup", "popup.html")
    }
  }
});

await mkdir(resolve(outputDirectory, "icons"), { recursive: true });
await cp(resolve(projectRoot, "icons"), resolve(outputDirectory, "icons"), {
  recursive: true,
  filter: (source) => !source.endsWith("icon-source-1024.png")
});
await writeFile(
  resolve(outputDirectory, "manifest.json"),
  `${JSON.stringify(createManifest(packageJson.version), null, 2)}\n`,
  "utf8"
);
