/* ================= one black shape: Order -> Ordered -> Printing -> On its way -> Delivered -> flood ================= */
const SH = {};
const NAVB = [1296, 533, 92, 34], CTAB = [1050, 918, 300, 56];
const FR = [410, 310, 620, 620], FR_MOLD = 34, FR_MAT = 46;
function buildShape() {
  SH.el = el('div', 'position:absolute;background:#080b1c;overflow:hidden;color:#fff;font-family:Geist', sShape);
  SH.l1 = el('div', 'position:absolute;left:0;width:100%;text-align:center;font:500 15px/34px Geist;white-space:nowrap', SH.el, 'Order');
  SH.l2 = el('div', 'position:absolute;left:0;width:100%;text-align:center;font:500 19px/56px Geist;white-space:nowrap', SH.el, 'Order print');
  const mk = () => el('div', 'position:absolute;left:0;width:100%;height:100%', SH.el);
  SH.c1 = mk(); SH.c2 = mk(); SH.c3 = mk(); SH.c4 = mk(); SH.c5 = mk();
  SH.c1.innerHTML = `<div style="position:absolute;left:0;top:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;gap:18px"><svg id="ck1" width="46" height="46" viewBox="0 0 46 46"><circle cx="23" cy="23" r="21" fill="none" stroke="#fff" stroke-width="3"/><path id="ck1p" d="M13 24l7 7 13-15" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1"/></svg><span style="font:600 40px/1 Geist;letter-spacing:-.01em">Ordered</span></div>`;
  SH.c2.innerHTML = `<div style="position:absolute;left:46px;top:20px;font:600 36px/1 Geist">Printing</div><div id="pct" style="position:absolute;right:46px;top:20px;font:500 36px/1 Geist;font-variant-numeric:tabular-nums">0%</div><div style="position:absolute;left:46px;right:46px;bottom:20px;height:10px;border-radius:5px;background:rgba(255,255,255,.2)"><div id="pbar" style="height:100%;border-radius:5px;background:#fff;width:0"></div></div>`;
  SH.c3.innerHTML = `<div style="position:absolute;left:0;width:100%;top:26px;text-align:center;font:600 38px/1 Geist">On its way</div><svg width="780" height="230" viewBox="0 0 780 230" style="position:absolute;left:0;top:0"><path id="route" d="M80 168 C 220 168 230 112 360 128 S 560 190 700 118" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="4" stroke-dasharray="3 12" stroke-linecap="round"/><circle cx="80" cy="168" r="9" fill="#fff"/><path d="M700 96a16 16 0 0 1 16 16c0 12-16 28-16 28s-16-16-16-28a16 16 0 0 1 16-16z" fill="#fff"/><circle cx="700" cy="112" r="5.5" fill="#080b1c"/><g id="van"><rect x="-22" y="-26" width="30" height="20" rx="3" fill="#fff"/><path d="M8 -22h10l8 8v8H8z" fill="#fff"/><circle cx="-10" cy="-4" r="5" fill="#fff" stroke="#080b1c" stroke-width="2.4"/><circle cx="16" cy="-4" r="5" fill="#fff" stroke="#080b1c" stroke-width="2.4"/></g></svg>`;
  SH.c4.innerHTML = `<div style="position:absolute;left:0;top:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;gap:16px"><span style="font:600 42px/1 Geist">Delivered</span><svg width="46" height="46" viewBox="0 0 46 46"><path id="ck4p" d="M10 24l9 9 17-20" fill="none" stroke="#fff" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1"/></svg></div>`;
  SH.c5.innerHTML = `<div style="position:absolute;left:0;top:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center"><svg width="62" height="62" viewBox="0 0 46 46"><path d="M10 24l9 9 17-20" fill="none" stroke="#fff" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;
  SH.pct = SH.el.querySelector('#pct'); SH.pbar = SH.el.querySelector('#pbar'); SH.ck1 = SH.el.querySelector('#ck1p'); SH.ck4 = SH.el.querySelector('#ck4p'); SH.route = SH.el.querySelector('#route'); SH.van = SH.el.querySelector('#van');
  // wall print (mat + photo) rides above the shape, which is the frame molding
  SH.mat = el('div', `position:absolute;background:${PAPER};box-shadow:inset 0 0 0 1px rgba(0,0,0,.08)`, sShape);
  SH.photo = el('img', 'position:absolute;object-fit:cover', sShape); SH.photo.src = 'assets/bubbles.jpg';
}
const STATES = { cta: [1200, 946, 300, 56, 28], s1: [720, 720, 400, 104, 52], s2: [720, 720, 580, 104, 52], s3: [720, 720, 780, 230, 78], s4: [720, 720, 470, 112, 56], s5: [720, 720, 120, 120, 60] };
function shapeRect(b) {
  // nav button -> CTA slot -> the black shape
  const fly = spring(b, 42.6, 2.0, .62);
  let r = lerpA([NAVB[0] + NAVB[2] / 2, NAVB[1] + NAVB[3] / 2, NAVB[2], NAVB[3], 17], STATES.cta, fly);
  const st = (i, key, bb, f = 2.1, z = .6) => { const a = STATES[key]; return a[i]; };
  if (b >= 44.0) {
    const seq = [['s1', 44.05], ['s2', 44.95], ['s3', 45.85], ['s4', 46.9], ['s5', 47.6]];
    r = r.map((v, i) => springSeq(b, v, seq.map(([k, t]) => [t, STATES[k][i], 2.0, .6])));
  }
  return r;
}
function renderShape(b) {
  const show = b >= 35.2 && b < 51.55; vis(SH.el, show); if (!show) { vis(SH.mat, false); vis(SH.photo, false); return; }
  let [cx, cy, w, h, rr] = shapeRect(b);
  const pop = b < 36 ? spring(b, 35.2, 3.0, .55) : 1;
  let color = INK;
  if (b >= 48.0) {                                                      // flood, black hold, contract into the frame
    const fl = eIO(prog(b, 48.0, 48.6)), ct = eIO(prog(b, 49.2, 50.0));
    const big = [720, 720, 3400, 3400, 1700];
    if (b < 49.2) { const r0 = [720, 720, 120, 120, 60]; [cx, cy, w, h, rr] = lerpA(r0, big, fl); }
    else { [cx, cy, w, h, rr] = lerpA(big, [FR[0] + FR[2] / 2, FR[1] + FR[3] / 2, FR[2], FR[3], 10], ct); }
    color = lerpColor(C_INK, C_BLUE, prog(b, 49.7, 50.3));
  }
  const s = SH.el.style; R(SH.el, cx - w / 2, cy - h / 2, w, h, rr); s.background = color; s.transform = `scale(${pop})`;
  s.boxShadow = b >= 50 ? '0 50px 80px rgba(0,5,25,.5),0 6px 14px rgba(0,5,25,.45)' : 'none';
  // contents, each in the shape's own mask: the active one slides up, the next rises from below
  const idx = b < 44 ? 0 : springSeq(b, 0, [[44.05, 1, 2.0, .8], [44.95, 2, 2.0, .8], [45.85, 3, 2.0, .8], [46.9, 4, 2.0, .8], [47.6, 5, 2.0, .8]]);
  const H = Math.max(h, 40);
  const rows = [[SH.c1, 1], [SH.c2, 2], [SH.c3, 3], [SH.c4, 4], [SH.c5, 5]];
  rows.forEach(([c, i]) => { c.style.top = ((i - idx) * 260) + 'px'; });
  const flo = b >= 47.9; [SH.c1, SH.c2, SH.c3, SH.c4].forEach(c => vis(c, !flo)); vis(SH.c5, b >= 47.4 && b < 48.55);
  const l = b < 44 ? 0 : idx; const swap = b < 44 ? eIO(prog(b, 42.85, 43.35)) : 1;
  SH.l1.style.top = (-swap * 60) + 'px'; SH.l1.style.lineHeight = '34px'; SH.l2.style.top = ((1 - swap) * 60 + (b < 44 ? 0 : -idx * 260)) + 'px';
  SH.l1.style.display = swap < 1 && b < 44 ? 'block' : 'none';
  SH.l2.style.display = b < 44 || idx < 1 ? 'block' : 'none';
  SH.ck1.style.strokeDashoffset = 1 - eOut(prog(b, 44.2, 44.75));
  const n = Math.floor(100 * eIO(prog(b, 45.0, 45.85))); SH.pct.textContent = n + '%'; SH.pbar.style.width = n + '%';
  const u = eIO(prog(b, 46.0, 46.85)); const L = SH.route.getTotalLength(), pt = SH.route.getPointAtLength(L * u);
  SH.van.setAttribute('transform', `translate(${pt.x},${pt.y - Math.abs(Math.sin(u * 38)) * 3})`);
  SH.ck4.style.strokeDashoffset = 1 - eOut(prog(b, 47.0, 47.5));
  // framed print on the wall: mat and photo grow out of the molding
  if (b >= 50.0) {
    const g = spring(b, 50.05, 2.1, .72), inner = [FR[0] + FR_MOLD, FR[1] + FR_MOLD, FR[2] - 2 * FR_MOLD, FR[3] - 2 * FR_MOLD];
    vis(SH.mat, true); vis(SH.photo, true);
    const c = [FR[0] + FR[2] / 2, FR[1] + FR[3] / 2];
    R(SH.mat, c[0] + (inner[0] - c[0]) * g, c[1] + (inner[1] - c[1]) * g, inner[2] * g, inner[3] * g, 2);
    const pi = [inner[0] + FR_MAT, inner[1] + FR_MAT, inner[2] - 2 * FR_MAT, inner[3] - 2 * FR_MAT];
    R(SH.photo, c[0] + (pi[0] - c[0]) * g, c[1] + (pi[1] - c[1]) * g, pi[2] * g, pi[3] * g, 1);
  } else { vis(SH.mat, false); vis(SH.photo, false); }
}
