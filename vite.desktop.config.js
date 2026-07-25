import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist/desktop",
    emptyOutDir: true,
    target: "chrome111",
    minify: false,
    sourcemap: false,
    lib: {
      entry: resolve("src/entry/desktop.js"),
      name: "ScopusCiteScoreQuartile",
      formats: ["iife"],
      fileName: () => "content.js",
      cssFileName: "styles"
    }
  }
});
