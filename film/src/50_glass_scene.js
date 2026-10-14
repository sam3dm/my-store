/* ================= glass scene: word -> droplet -> toolbar -> slider -> lens -> orb ================= */
const GU = Z('sGlassUI', 3);                       // glass hosts + their glyph overlays are rebuilt every frame
const imgDay = el('img', 'position:absolute;left:0;top:0;width:1440px;height:1440px', sPhoto); imgDay.src = 'assets/day.jpg';
const imgGold = el('img', 'position:absolute;left:0;top:0;width:1440px;height:1440px', sPhoto); imgGold.src = 'assets/golden.jpg';
el('div', 'position:absolute;left:0;top:0;width:1440px;height:1440px;background:linear-gradient(180deg,rgba(8,11,28,0) 55%,rgba(8,11,28,.5) 100%)', sPhoto);
const TB = { cy: 1256, bw: 700, bh: 132, ix: [485, 642, 798, 955] };       // toolbar geometry
const SVGI = {
  crop: '<path d="M12 6v26h26M6 12h26v26"/>',
  adj: '<path d="M8 14h28M8 22h28M8 30h28"/><circle cx="16" cy="14" r="3.6" fill="#fff"/><circle cx="29" cy="22" r="3.6" fill="#fff"/><circle cx="19" cy="30" r="3.6" fill="#fff"/>',
  filt: '<circle cx="17" cy="18" r="9"/><circle cx="27" cy="18" r="9"/><circle cx="22" cy="27" r="9"/>',
  share: '<path d="M22 29V8M14 16l8-8 8 8"/><path d="M12 22v14h20V22"/>',
  sun: '<circle cx="22" cy="22" r="7"/>' + [0, 45, 90, 135, 180, 225, 270, 315].map(a => `<line x1="${22 + 12 * Math.cos(a * Math.PI / 180)}" y1="${22 + 12 * Math.sin(a * Math.PI / 180)}" x2="${22 + 17 * Math.cos(a * Math.PI / 180)}" y2="${22 + 17 * Math.sin(a * Math.PI / 180)}"/>`).join(''),
  sunset: '<path d="M10 28a12 12 0 0 1 24 0" fill="rgba(255,205,120,.9)"/><path d="M5 28h34M12 35h20"/>' + [200, 235, 270, 305, 340].map(a => `<line x1="${22 + 16 * Math.cos(a * Math.PI / 180)}" y1="${28 + 16 * Math.sin(a * Math.PI / 180)}" x2="${22 + 21 * Math.cos(a * Math.PI / 180)}" y2="${28 + 21 * Math.sin(a * Math.PI / 180)}"/>`).join(''),
};
const icon = (parent, name, cx, cy, size, sc, extra = '') => el('div', `position:absolute;left:${cx - size / 2}px;top:${cy - size / 2}px;width:${size}px;height:${size}px;transform:scale(${Math.max(sc, 0)});${extra}`, parent,
  `<svg viewBox="0 0 44 44" width="${size}" height="${size}" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">${SVGI[name]}</svg>`);
const orbImg = (b, ocx, ocy, dr, dl, dt) => {                              // the next photo inside the orb: whole print at first, world-aligned when it fills the screen
  const t2 = eIO(prog(b, 25.9, 27.5)), cx = lerp(ocx, 720, t2), cy = lerp(ocy, 720, t2), S = lerp(2.8 * dr, 1440, t2);
  return `<img src="assets/bubbles.jpg" style="position:absolute;left:${cx - S / 2 - dl}px;top:${cy - S / 2 - dt}px;width:${S}px;height:${S}px">`;
};
const WORD_G = 'Light';
function glassWordPops(b) { return [...WORD_G].map((_, i) => spring(b, 16.0 + i * .22, 3.0, .5)); }
function sliderP(b) { return eIO(prog(b, 20.7, 23.3)); }
const GS = { adj: [642, TB.cy], knob: [480, TB.cy], held: 0 };      // cursor targets, updated every frame
function glassState(b) {
  const tb = spring(b, 18.35, 2.0, .5);
  const toOrb = spring(b, 23.7, 1.9, .6);
  return { tb, toOrb };
}
function renderGlassScene(b) {
  GU.replaceChildren(); $('gfs').replaceChildren(); gid = 0;
  const p = sliderP(b); imgGold.style.opacity = b >= 16 ? p : 0;
  if (b >= 27.55) { vis(sPhoto, false); return; }
  // --- 1. the glass word pops in letter by letter
  const pops = glassWordPops(b), mt = eIn(prog(b, 17.3, 18.0));
  if (b < 18.15) {
    const px = 320, cy = 640; const gl = [...WORD_G].map(ch => glyph(ch, px));
    const total = gl.reduce((a, g) => a + g.adv, 0); let x = 720 - total / 2; const dx = [], dyy = [], sc = [];
    gl.forEach((g, i) => { const cxL = x + g.adv / 2; dx.push((720 - cxL) * mt); dyy.push((TB.cy - cy) * mt); sc.push(pops[i] * (1 - eIn(prog(b, 17.4, 17.95)))); x += g.adv; });
    glassText(GU, sPhoto, WORD_G, 720, cy, px, sc, { dx, dyy });
  }
  // --- 2. droplet stretches into a toolbar, which becomes a slider, then lifts into an orb
  const { tb, toOrb } = glassState(b);
  let bw = lerp(124, TB.bw, tb), bh = lerp(124, TB.bh, tb) - Math.max(0, Math.sin(Math.min(tb, 1) * Math.PI)) * 14 * (tb < 1 ? 1 : 0);
  let cx = 720, cy = TB.cy;
  if (b >= 17.75 && b < 27.55) {
    let ow = bw, oh = bh, ocx = cx, ocy = cy;
    if (b >= 23.6) { ow = lerp(TB.bw, 300, toOrb); oh = lerp(TB.bh, 300, toOrb); ocy = lerp(TB.cy, 700, toOrb); }
    let dia = 0, expand = prog(b, 25.9, 27.5);
    if (b >= 25.9) { dia = lerp(300, 2400, eIO(expand)); ow = oh = dia; ocy = lerp(700, 720, eIO(expand)); }
    const dropIn = spring(b, 17.75, 2.6, .55);
    if (b < 18.35) { ow = oh = 124 * dropIn; }
    if (ow > 4 && (ow < 780 || b < 25.9)) {
      const h = glass(GU, sPhoto, { x: ocx - ow / 2, y: ocy - oh / 2, w: ow, h: oh, r: Math.min(ow, oh) / 2, k: 1, tint: .12 });
      if (b >= 24.9) {                                                        // the next photo opens inside the orb as a circle
        const dr = (Math.min(ow, oh) / 2 - 7) * spring(b, 24.9, 2.2, .72);
        el('div', `position:absolute;left:${ow / 2 - dr}px;top:${oh / 2 - dr}px;width:${dr * 2}px;height:${dr * 2}px;border-radius:50%;overflow:hidden`, h.inner,
          orbImg(b, ocx, ocy, dr, ocx - dr, ocy - dr));
      }
    } else if (ow >= 780 && b >= 25.9) {                                                     // past ~780px the orb is just the photo disc
      el('div', `position:absolute;left:${ocx - ow / 2}px;top:${ocy - oh / 2}px;width:${ow}px;height:${oh}px;border-radius:50%;overflow:hidden;box-shadow:inset 0 0 0 2px rgba(255,255,255,.45)`, GU,
        orbImg(b, ocx, ocy, ow / 2, ocx - ow / 2, ocy - oh / 2));
    }
    if (b >= 18.35 && b < 23.7) {                                              // toolbar contents
      const wf = bw / TB.bw, X = i => 720 + (TB.ix[i] - 720) * wf, Y = TB.cy;
      const click = spring(b, 19.65, 3.0, .8);
      const names = ['crop', 'adj', 'filt', 'share'];
      names.forEach((n, i) => {
        const gone = 1 - spring(b, 19.65 + (i === 1 ? .35 : (i === 0 ? .05 : .12 + i * .05)), 3.2, .85);
        const pop = spring(b, 18.55 + i * .12, 3.2, .5);
        const sc = Math.min(pop, 1.1) * clamp(gone, 0, 1.2) * clamp(wf * 1.1);
        if (i === 1 && b >= 19.55) el('div', `position:absolute;left:${X(i) - 46}px;top:${Y - 46}px;width:92px;height:92px;border-radius:46px;background:rgba(255,255,255,${.2 * clamp(gone)});transform:scale(${clamp(gone)})`, GU);
        if (sc > .01) icon(GU, n, X(i), Y, 48, sc);
      });
      if (b >= 19.8) {
        const tx0 = bx0(), tx1 = bx1(), draw = eOut(prog(b, 19.95, 20.55));
        el('div', `position:absolute;left:${tx0}px;top:${Y - 5}px;width:${tx1 - tx0}px;height:10px;border-radius:5px;background:rgba(255,255,255,.34);transform:scaleX(${draw});transform-origin:0 50%`, GU);
        el('div', `position:absolute;left:${tx0}px;top:${Y - 5}px;width:${(tx1 - tx0) * p}px;height:10px;border-radius:5px;background:rgba(255,255,255,.96)`, GU);
        icon(GU, 'sun', tx0 - 58, Y, 46, spring(b, 20.2, 3.2, .5));
        icon(GU, 'sunset', tx1 + 58, Y, 46, spring(b, 20.3, 3.2, .5));
        // knob -> glass lens while held
        const held = prog(b, 20.55, 20.9) * (1 - prog(b, 23.35, 23.8)); GS.held = held;
        const kx = lerp(tx0, tx1, p), kp = spring(b, 20.35, 3.0, .55);
        GS.knob = [kx, Y];
        const kw = lerp(40, 124, held) * kp, kh = lerp(40, 98, held) * kp;
        if (kw > 2) glass(GU, sPhoto, { x: kx - kw / 2, y: Y - kh / 2, w: kw, h: kh, r: kh / 2, k: lerp(.7, 1.5, held), tint: lerp(.5, .04, held), sat: 1.25, bright: 1.12, shadow: held > .1 });
        // caption: three labels scroll through their own mask
        const idx = p * 2, lm = el('div', `position:absolute;left:470px;top:${TB.cy - 118}px;width:500px;height:46px;overflow:hidden;transform:scale(${spring(b, 20.3, 3, .6)})`, GU);
        ['Day', 'Afternoon', 'Golden hour'].forEach((s, i) => el('div', `position:absolute;left:0;width:100%;text-align:center;top:${(i - idx) * 46}px;font:600 34px/46px Geist;color:#fff;text-shadow:0 2px 14px rgba(0,0,0,.45)`, lm, s));
      }
    }
  }
}
const bx0 = () => 720 - TB.bw / 2 + 110, bx1 = () => 720 + TB.bw / 2 - 110;
