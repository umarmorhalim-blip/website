// Builds film.html: the real single-file SafeFi+ page + hook/outro overlays + a
// frame(t) function the recorder calls for every frame.
import { readFile, writeFile, readdir } from "node:fs/promises";
import path from "node:path";
const root = "/home/user/website/safefi";
const W = path.join(root, "brag-output/work");
let page = await readFile(path.join(root, "standalone-dist/safefi-journey.html"), "utf8");

// Inline the self-hosted Plus Jakarta Sans faces (no network while recording).
const cssDir = path.join(root, "out/_next/static/chunks");
const cssFile = (await readdir(cssDir)).find((f) => f.endsWith(".css"));
const css = await readFile(path.join(cssDir, cssFile), "utf8");
let faces = "";
for (const rule of css.match(/@font-face\{[^}]*\}/g) ?? []) {
  if (!/Plus Jakarta Sans/.test(rule) || /Fallback/.test(rule)) continue;
  const file = rule.match(/url\(\.\.\/media\/([^)]+)\)/)[1];
  const b64 = (await readFile(path.join(root, "out/_next/static/media", file))).toString("base64");
  faces += rule.replace(/url\([^)]+\)/, `url(data:font/woff2;base64,${b64})`);
}
page = page.replace(/<link rel="stylesheet" href="https:\/\/fonts.googleapis.com[^>]*>/, "").replace(/<link rel="preconnect"[^>]*>/g, "");

const timeline = await readFile(path.join(W, "timeline.js"), "utf8");
const overlay = `
<style>${faces}
.journey-dots{display:none!important}
#film-dip{position:fixed;inset:0;z-index:90;background:#07050F;pointer-events:none}
#film-hook,#film-end{position:fixed;inset:0;z-index:95;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:"Plus Jakarta Sans",sans-serif;color:#F5F3FF;pointer-events:none}
#film-hook .line{display:flex;gap:.28em;font-size:132px;font-weight:800;letter-spacing:-.035em}
#film-hook .w{display:inline-block}
#film-hook .w.c{color:#C084FC;text-shadow:0 0 60px rgba(168,85,247,.55)}
#film-end{background:radial-gradient(55% 60% at 50% 45%,rgba(124,58,237,.38),transparent 70%),#07050F;gap:34px}
#film-end .brand{display:flex;align-items:center;gap:28px;font-size:128px;font-weight:800;letter-spacing:-.04em}
#film-end .brand span{color:#D4A853}
#film-end .tag{font-size:54px;font-weight:600;color:#C4BCD9;letter-spacing:-.01em}
#film-end .cta{display:flex;gap:22px;margin-top:18px}
#film-end .pill{display:flex;align-items:center;gap:14px;padding:22px 34px;border-radius:22px;font-size:34px;font-weight:700}
#film-end .pill.p{background:#7C3AED;border:2px solid rgba(168,85,247,.6)}
#film-end .pill.s{background:rgba(255,255,255,.05);border:2px solid rgba(255,255,255,.18)}
#film-end .pill small{display:block;font-size:20px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;opacity:.8}
</style>
<div id="film-dip"></div>
<div id="film-hook"><div class="line">${'<span class="w">You</span><span class="w">tap</span><span class="w c">Confirm.</span>'}</div></div>
<div id="film-end">
  <div class="brand"><svg viewBox="0 0 32 32" width="132" height="132"><defs><linearGradient id="fg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#C084FC"/><stop offset="1" stop-color="#7C3AED"/></linearGradient></defs><rect x="2" y="2" width="28" height="28" rx="9" fill="url(#fg)"/><path d="M16 9v14M9 16h14" stroke="#D4A853" stroke-width="3.2" stroke-linecap="round"/></svg><div>SafeFi<span>+</span></div></div>
  <div class="tag">Shariah-compliant USDT <svg viewBox="0 0 48 24" width="64" height="32" style="vertical-align:-3px;margin:0 6px" fill="none" stroke="#C4BCD9" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h38l-7-6M44 16H6l7 6"/></svg> MYR</div>
  <div class="cta">
    <div class="pill p"><svg viewBox="0 0 24 24" width="38" height="38"><path d="M5 3.5v17l14-8.5L5 3.5Z" fill="#fff"/></svg><div><small>Get it on</small>Google Play</div></div>
    <div class="pill s"><svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="#F5F3FF" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z"/></svg><div><small>Open in browser</small>app.safefiplus.com</div></div>
  </div>
</div>
<script>
${timeline}
(function(){
  var dip = document.getElementById('film-dip'), hook = document.getElementById('film-hook'), end = document.getElementById('film-end');
  var words = hook.querySelectorAll('.w'), endParts = [end.querySelector('.brand'), end.querySelector('.tag'), end.querySelector('.cta')];
  function rise(el, k, dy) { el.style.opacity = k; el.style.transform = 'translateY(' + ((1 - k) * dy).toFixed(1) + 'px)'; }
  window.__film = {
    duration: DURATION, fps: FPS,
    frame: function (t) {
      window.__journey.set(pAt(t));
      window.__advance(t);
      var hookOut = 1 - smooth(HOOK.out[0], HOOK.out[1], t);
      hook.style.opacity = hookOut;
      hook.style.transform = 'scale(' + (1 + smooth(0, HOOK.out[1], t) * 0.04) + ')';
      words.forEach(function (w, i) { rise(w, smooth(HOOK.wordAt[i], HOOK.wordAt[i] + 0.3, t), 40); });
      var site = smooth(SITE_IN[0], SITE_IN[1], t) * (1 - smooth(SITE_OUT[0], SITE_OUT[1], t));
      dip.style.opacity = 1 - site;
      var e = smooth(END.in[0], END.in[1], t);
      end.style.opacity = e;
      rise(endParts[0], smooth(END.in[0], END.in[1] + 0.1, t), 30);
      rise(endParts[1], smooth(END.line[0], END.line[1], t), 30);
      rise(endParts[2], smooth(END.cta[0], END.cta[1], t), 30);
    }
  };
})();
</script>
`;
page = page.replace("</body>", overlay + "</body>");
await writeFile(path.join(W, "film.html"), page);
console.log("film.html", (page.length / 1024 / 1024).toFixed(2), "MB");
