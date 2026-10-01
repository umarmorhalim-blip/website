/**
 * Builds the whole page as ONE self-contained HTML file (no server, no _next/
 * folder) for sharing with stakeholders: pre-rendered HTML, compiled CSS and
 * the full JS bundle (incl. three.js) inlined. Not the production build: it
 * skips lazy loading, so it is heavier than `npm run build`.
 *
 *   npm run build:standalone   →  standalone-dist/safefi-journey.html
 *                                 standalone-dist/fragment.html (body only, for Artifacts)
 */
import { build } from "esbuild";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "standalone-dist");
await mkdir(out, { recursive: true });

const common = {
  bundle: true,
  absWorkingDir: root,
  jsx: "automatic",
  alias: { "next/dynamic": "./standalone/next-dynamic-shim.tsx" },
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env.NEXT_PUBLIC_SITE_URL": "undefined",
    "process.env.NEXT_PUBLIC_PLAY_PACKAGE_ID": "undefined",
    "process.env.NEXT_PUBLIC_COMPANY_REG_NO": "undefined",
  },
  logLevel: "error",
};

// 1. Pre-render the page HTML so text shows before the script runs.
const ssrFile = path.join(out, "ssr.mjs");
await build({ ...common, entryPoints: ["standalone/server.tsx"], platform: "node", format: "esm", outfile: ssrFile, packages: "external" });
const { render } = await import(pathToFileURL(ssrFile).href + `?t=${Date.now()}`);
const html = render();
await rm(ssrFile);

// 2. Client bundle that hydrates it.
const client = await build({ ...common, entryPoints: ["standalone/client.tsx"], platform: "browser", format: "iife", minify: true, write: false, target: "es2020" });
const js = client.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");

// 3. Tailwind CSS.
const cssSrc = await readFile(path.join(root, "app/globals.css"), "utf8");
const css = (await postcss([tailwind({ base: root, optimize: { minify: true } })]).process(cssSrc, { from: path.join(root, "app/globals.css") })).css;

// 4. Same pre-paint mode script as app/layout.tsx.
const layout = await readFile(path.join(root, "app/layout.tsx"), "utf8");
const modeScript = layout.match(/const MODE_SCRIPT = `([\s\S]*?)`;/)[1];

const fragment = `<title>SafeFi+ Journey of a Transfer</title>
<meta name="description" content="Follow one Shariah-compliant USDT ↔ MYR transfer from your phone to settlement.">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap">
<style>:root{color-scheme:dark;--font-jakarta:"Plus Jakarta Sans"}${css}</style>
<script>${modeScript}</script>
<div id="root" class="font-sans">${html}</div>
<script>${js}</script>
`;
const full = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#07050F"></head><body style="margin:0;background:#07050F">\n${fragment}</body></html>\n`;

await writeFile(path.join(out, "fragment.html"), fragment);
await writeFile(path.join(out, "safefi-journey.html"), full);
console.log(`standalone-dist/safefi-journey.html  ${(full.length / 1024).toFixed(0)} KB`);
