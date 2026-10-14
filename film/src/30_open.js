/* ================= scene containers (z-order) ================= */
const world = $('world');
const Z = (id, z) => { const d = el('div', `position:absolute;left:0;top:0;width:1440px;height:1440px;z-index:${z}`, world); d.id = id; return d; };
const sGrid = Z('sGrid', 2), sPhoto = Z('sPhoto', 2), sWall = Z('sWall', 3), sLock = Z('sLock', 4), sStage = Z('sStage', 5),
  sOpen = Z('sOpen', 10), sShape = Z('sShape', 40), sIris = Z('sIris', 60), sFlood = Z('sFlood', 70);

/* ================= wordmark: squeeze, pill, label ================= */
const WORD = 'Brain', LABEL = 'Dubai', FS = 250; const M = {};
function measureLetters() {
  const m = $('measure'); m.style.fontSize = FS + 'px';
  const wd = a => { m.style.fontStretch = a + '%'; return [...WORD].map(ch => { m.textContent = ch; return m.getBoundingClientRect().width; }); };
  M.w125 = wd(125); M.w62 = wd(62);
  M.Tw = M.w125.reduce((a, b) => a + b, 0); M.D = FS * .205; M.gap = FS * .075;
  M.left0 = 720 - (M.Tw + M.gap + M.D) / 2; M.dotX0 = M.left0 + M.Tw + M.gap + M.D / 2;
  M.base = 720 + FS * .36; M.dotY0 = M.base - M.D / 2 - FS * .012;
  M.x = []; let a = 0; for (const w of M.w125) { M.x.push(a); a += w; }
}
const OPEN = { letters: [] };
function buildOpen() {
  [...WORD].forEach(ch => { const e = el('div', `font-size:${FS}px`, sOpen, ch); e.className = 'letter'; OPEN.letters.push(e); });
  OPEN.dot = el('div', 'position:absolute;background:#f4efe6;border-radius:999px', sOpen);
  OPEN.mask = el('div', 'position:absolute;overflow:hidden', sOpen);
  OPEN.label = el('div', 'position:absolute;left:0;width:100%;text-align:center;font:600 64px/1 Geist;color:#f4efe6;letter-spacing:-.01em;white-space:nowrap', OPEN.mask, LABEL);
}
const PILL = { w: 460, h: 150 };
/* squeeze progress sq: 0 = word at rest, 1 = every letter swallowed by the dot (start and end of the film) */
function openState(b) {
  let sq = 1, g = 0, rise = 0, ci = 0, press = 0;
  if (b < 8) {
    sq = eIO(prog(b, 1, 3)); g = spring(b, 3, 2.2, .5); rise = spring(b, 4, 2.0, .62); ci = prog(b, 2.9, 3.25);
    press = b >= 5 ? 1 - spring(b, 5.0, 3.2, .7) : 0;                         // the click squishes the pill
  } else if (b >= 52.7) {
    const kEnd = eBack(prog(b, 53.4, 54)); sq = b >= 53.4 ? 1 - Math.min(kEnd, 1) : 1;
    g = 1 - eIO(prog(b, 53.2, 53.6)); rise = spring(b, 52.9, 2.4, .62) * (1 - eIn(prog(b, 53.15, 53.4))); ci = 1 - prog(b, 53.4, 53.7);
    if (b >= 54) { sq = 0; g = 0; ci = 0; }
  }
  return { sq, g, rise, ci, press };
}
function renderOpen(b) {
  const { sq, g, rise, ci, press } = openState(b); const k = 1 - sq;
  const dotX = lerp(M.dotX0, 720, sq), dotY = lerp(M.dotY0, 720, eIO(prog(sq, .55, 1)));
  OPEN.letters.forEach((e, i) => {
    const wT = M.w125[i] * k, w62 = M.w62[i], w125 = M.w125[i];
    let a = 125, sx = 1;
    if (wT >= w62) a = 62 + 63 * ((wT - w62) / (w125 - w62 || 1)); else { a = 62; sx = Math.max(wT / w62, 0); }
    const distL = ((M.dotX0 - M.D / 2) - (M.left0 + M.x[i])) * k;
    e.style.display = wT > .8 ? 'block' : 'none';
    e.style.left = ((dotX - M.D / 2) - distL) + 'px'; e.style.top = (M.base - FS * .78) + 'px';
    e.style.fontStretch = a.toFixed(2) + '%'; e.style.transform = `scaleX(${sx.toFixed(4)})`;
  });
  const pw = lerp(M.D, PILL.w, g), ph = lerp(M.D, PILL.h, g), ps = 1 - .05 * press;
  const dt = OPEN.dot.style; R(OPEN.dot, dotX - pw / 2, dotY - ph / 2, pw, ph, Math.min(pw, ph) / 2);
  dt.background = lerpColor(C_PAPER, C_INK, ci); dt.transform = `scale(${ps})`;
  R(OPEN.mask, dotX - pw / 2 + 30, dotY - 42, Math.max(pw - 60, 0), 84);
  OPEN.label.style.top = (10 + (1 - rise) * 96) + 'px'; OPEN.label.style.display = g > .6 ? 'block' : 'none';
}

/* ================= iris: 6 blades around a hexagonal aperture =================
   Each blade is the half-plane beyond one aperture edge, clipped to a big disc:
   two vertices on the rim, the two edge extensions, and the SHORT arc between them. */
const IRIS = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); IRIS.setAttribute('width', '1440'); IRIS.setAttribute('height', '1440'); IRIS.setAttribute('viewBox', '0 0 1440 1440'); IRIS.style.cssText = 'position:absolute;left:0;top:0'; sIris.appendChild(IRIS);
function irisDraw(a, rot, cx = 720, cy = 720) {
  if (a >= 1000) { sIris.style.display = 'none'; return; }
  sIris.style.display = 'block';
  const Rb = 2600; const polys = [];
  for (let k = 0; k < 6; k++) {
    const th = rot + k * Math.PI / 3, nx = Math.cos(th), ny = Math.sin(th), phi = Math.acos(clamp(Math.max(a, 0) / Rb, -1, 1));
    const pts = [];
    for (let i = 0; i <= 14; i++) { const an = th - phi + (2 * phi) * i / 14; pts.push(`${(cx + Rb * Math.cos(an)).toFixed(1)},${(cy + Rb * Math.sin(an)).toFixed(1)}`); }
    polys.push(`<polygon points="${pts.join(' ')}" fill="url(#bl${k})" stroke="rgba(120,130,170,.35)" stroke-width="1.6"/>`);
  }
  let defs = ''; for (let k = 0; k < 6; k++) { const th = rot + k * Math.PI / 3; defs += `<linearGradient id="bl${k}" gradientUnits="userSpaceOnUse" x1="${cx + Math.cos(th) * a}" y1="${cy + Math.sin(th) * a}" x2="${cx + Math.cos(th) * (a + 700)}" y2="${cy + Math.sin(th) * (a + 700)}"><stop offset="0" stop-color="#1b2140"/><stop offset=".35" stop-color="#0c1022"/><stop offset="1" stop-color="#060813"/></linearGradient>`; }
  IRIS.innerHTML = `<defs>${defs}</defs>${polys.join('')}`;
}
function irisState(b) {                                           // returns [aperture apothem, rotation]
  if (b >= 5.0 && b < 6.6) {
    const close = eIO(prog(b, 5.0, 5.95)), open = spring(b, 6.0, 3.4, .72);
    const a = b < 6.0 ? lerp(900, 0, close) : Math.max(0, 1500 * open); return [a, -close * .5 + open * .5];
  }
  if (b >= 50.55 && b < 52.4) {
    const close1 = eIO(prog(b, 50.55, 50.95)), open = spring(b, 51.0, 3.4, .72), close2 = eIO(prog(b, 51.3, 51.7));
    let a; if (b < 51.0) a = lerp(900, 0, close1); else if (b < 51.3) a = 1500 * open; else a = lerp(900, 0, close2);
    return [b >= 51.7 ? 0 : a, (b < 51.0 ? -close1 : b < 51.3 ? open : -close2) * .5];
  }
  return [1500, 0];
}
