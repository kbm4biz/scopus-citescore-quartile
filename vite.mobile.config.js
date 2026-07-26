import { defineConfig } from "vite";
import monkey from "vite-plugin-monkey";
import packageJson from "./package.json" with { type: "json" };

const fileName = "scopus-citescore-quartile.user.js";
const metaFileName = "scopus-citescore-quartile.meta.js";
const baseUrl = String(process.env.USERSCRIPT_BASE_URL || "").replace(/\/+$/, "");
const hostedMetadata = baseUrl
  ? {
      updateURL: `${baseUrl}/${metaFileName}`,
      downloadURL: `${baseUrl}/${fileName}`,
      homepageURL: baseUrl
    }
  : {};

export default defineConfig({
  build: {
    outDir: "dist/mobile",
    emptyOutDir: true,
    target: "es2020",
    minify: false,
    sourcemap: false
  },
  plugins: [
    monkey({
      entry: "src/entry/userscript.js",
      userscript: {
        name: "Scopus CiteScore Quartile",
        namespace: "scopus-citescore-quartile",
        version: packageJson.version,
        description: "Shows category-specific Scopus CiteScore Quartiles in a responsive desktop/mobile floating panel.",
        author: "Local build",
        match: ["https://www.scopus.com/sourceid/*"],
        "run-at": "document-idle",
        noframes: true,
        ...hostedMetadata
      },
      server: {
        open: false
      },
      build: {
        fileName,
        metaFileName,
        autoGrant: true
      }
    })
  ]
});
