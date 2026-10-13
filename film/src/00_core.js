/* ================= core: math, springs, dom ================= */
const W = 1440, B = 0.5, TOTAL = 54;                 // 120 BPM, 54 beats
const NAVY = '#192249', INK = '#080b1c', PAPER = '#f4efe6', BLUE = '#1f4fd1';
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const eIO = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eOut = x => 1 - Math.pow(1 - x, 3);
const eIn = x => x * x * x;
const eBack = x => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
/* closed-form damped spring step response, 0 -> 1 starting at t0 (all in beats here) */
function spring(b, b0, f = 2.4, z = .58) {
  const x = (b - b0) * B; if (x <= 0) return 0;     // seconds
  const w = TAU * f;
  if (z < 1) { const wd = w * Math.sqrt(1 - z * z); return 1 - Math.exp(-z * w * x) * (Math.cos(wd * x) + (z * w / wd) * Math.sin(wd * x)); }
  return 1 - Math.exp(-w * x) * (1 + w * x);
}
/* a value with many targets = sum of one spring per change */
function springSeq(b, v0, steps) { let v = v0, prev = v0; for (const [b0, tg, f, z] of steps) { v += (tg - prev) * spring(b, b0, f, z); prev = tg; } return v; }
const lerpA = (a, c, t) => a.map((v, i) => lerp(v, c[i], t));
const $ = id => document.getElementById(id);
function el(tag, css, parent, html) { const e = document.createElement(tag); if (css) e.style.cssText = css; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; }
function R(e, x, y, w, h, r) { const s = e.style; s.left = x + 'px'; s.top = y + 'px'; s.width = Math.max(w, 0) + 'px'; s.height = Math.max(h, 0) + 'px'; if (r != null) s.borderRadius = r + 'px'; }
function vis(e, on) { e.style.display = on ? 'block' : 'none'; }
function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function lerpColor(a, c, t) { return `rgb(${lerp(a[0], c[0], t) | 0},${lerp(a[1], c[1], t) | 0},${lerp(a[2], c[2], t) | 0})`; }
const C_INK = [8, 11, 28], C_PAPER = [244, 239, 230], C_BLUE = [31, 79, 209], C_NAVY = [25, 34, 73];
/* a mask line: text rises out of an overflow:hidden box */
function maskText(parent, css, text, boxCss) { const m = el('div', 'position:absolute;overflow:hidden;' + boxCss, parent); const t = el('div', 'position:absolute;left:0;width:100%;white-space:nowrap;text-align:center;' + css, m, text); return { m, t }; }
