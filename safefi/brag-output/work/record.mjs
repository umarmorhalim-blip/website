// Renders film.html frame by frame. Usage: node record.mjs <outDir> <fromFrame> <toFrame> [t1,t2,... stills]
import { chromium } from '/tmp/claude-0/-home-user-website/321488ff-5f40-5e89-9f31-f7d0521e9c07/scratchpad/node_modules/playwright-core/index.mjs';
import { mkdirSync } from 'node:fs';
const [, , outDir, from, to, stills] = process.argv;
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.error('pageerror', e.message));
await page.goto('file:///home/user/website/safefi/brag-output/work/film.html?capture');
await page.waitForFunction(() => window.__advance && window.__journey && window.__film && document.querySelector('.journey-canvas[data-ready]'), null, { timeout: 120000 });
await page.evaluate(() => document.fonts.ready);
// Warm-up: compile shaders before the first real frame.
await page.evaluate(() => { window.__film.frame(0); window.__film.frame(0.01); });
await page.waitForTimeout(500);
const times = stills ? stills.split(',').map(Number) : Array.from({ length: +to - +from }, (_, i) => (+from + i) / 30);
const t0 = Date.now();
for (let i = 0; i < times.length; i++) {
  const t = times[i];
  await page.evaluate((t) => window.__film.frame(t), t);
  const name = stills ? `still-${t.toFixed(2)}.jpg` : `f${String(+from + i).padStart(4, '0')}.jpg`;
  await page.screenshot({ path: `${outDir}/${name}`, type: 'jpeg', quality: 94 });
  if (i % 30 === 0) console.log(`${name} ${((Date.now() - t0) / (i + 1) / 1000).toFixed(2)}s/frame`);
}
await browser.close();
