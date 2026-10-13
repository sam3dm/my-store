/* ================= lock screen -> phone -> dynamic island ================= */
const PH = { x: 106, y: 216, w: 528, h: 1088, r: 84 };            // phone screen rect (world)
const phoneBody = el('div', 'position:absolute;background:#05060d;box-shadow:0 0 0 3px #2b2f45,0 40px 90px rgba(0,0,0,.5)', sLock);
const lockClip = el('div', 'position:absolute;overflow:hidden;background:#000', sLock);
const lockGroup = el('div', 'position:absolute;width:1440px;height:1440px;transform-origin:0 0', lockClip);
const lockBg = el('div', 'position:absolute;left:0;top:0;width:1440px;height:1440px', lockGroup);
el('img', 'position:absolute;left:0;top:0;width:1440px;height:1440px', lockBg).src = 'assets/bubbles.jpg';
const lockGlass = el('div', 'position:absolute;left:0;top:0;width:1440px;height:1440px', lockGroup);
const lockUI = el('div', 'position:absolute;left:0;top:0;width:1440px;height:1440px', lockGroup);
const gfsL = document.createElementNS('http://www.w3.org/2000/svg', 'g'); $('defs').firstElementChild.appendChild(gfsL);
const islGoo = el('div', 'position:absolute;left:0;top:0;width:1440px;height:1440px;filter:url(#goo)', sLock);
const island = el('div', 'position:absolute;background:#000', islGoo), drop = el('div', 'position:absolute;background:#000', islGoo);
const ISL = [370, 262];
let lockKey = '';
function lockRect(b) {
  const u = eIO(prog(b, 30, 31.6));
  const rect = lerpA([0, 0, 1440, 1440, 0], [PH.x, PH.y, PH.w, PH.h, PH.r], u);
  return { rect, u, s: lerp(1, PH.h / 1440, u) };
}
function renderLock(b) {
  const { rect, u, s } = lockRect(b);
  R(lockClip, rect[0], rect[1], rect[2], rect[3], rect[4]);
  Object.assign(lockGroup.style, { left: (rect[2] / 2 - 720 * s) + 'px', top: (rect[3] / 2 - 720 * s) + 'px', transform: `scale(${s})` });
  const bz = 20 * spring(b, 30.35, 2.0, .7) * (b >= 30 ? 1 : 0);
  R(phoneBody, rect[0] - bz, rect[1] - bz, rect[2] + 2 * bz, rect[3] + 2 * bz, rect[4] + bz);
  phoneBody.style.boxShadow = `0 0 0 ${3 * clamp(u * 3)}px #2b2f45,0 ${40 * u}px ${90 * u}px rgba(0,0,0,${.5 * u})`;
  // ---- lock screen content (static after the player has formed)
  const key = b < 29.9 ? 'dyn' + b : 'static';
  if (key !== lockKey || key !== 'static') {
    lockKey = key; lockGlass.replaceChildren(); gfsL.replaceChildren(); lockUI.replaceChildren();
    const opt = { defs: gfsL, pfx: 'lk' };
    const pops = [...'9:41'].map((_, i) => spring(b, 27.7 + i * .16, 3.0, .5));
    glassText(lockGlass, lockBg, '9:41', 720, 520, 330, pops, { ...opt, weight: 600 });
    const dm = el('div', 'position:absolute;left:420px;top:262px;width:600px;height:56px;overflow:hidden', lockUI);
    el('div', `position:absolute;left:0;width:100%;text-align:center;top:${(1 - spring(b, 27.95, 2.2, .7)) * 70}px;font:500 44px/56px Geist;color:rgba(255,255,255,.92);text-shadow:0 2px 12px rgba(0,0,0,.35)`, dm, 'Tuesday, 13 October');
    // home bar stretches into a glass music player
    const st = spring(b, 28.85, 2.0, .5), bar0 = [570, 1362, 300, 16], pl = [400, 1090, 640, 210];
    const gr = lerpA(bar0, pl, st), appear = spring(b, 28.2, 3, .6);
    if (appear > .02) {
      const rr = lerp(8, 56, clamp(st));
      const pg = glass(lockGlass, lockBg, { x: gr[0], y: gr[1], w: gr[2], h: gr[3] * (b < 28.85 ? appear : 1), r: rr, k: 1, tint: .13, ...opt });
      const pk = spring(b, 29.35, 3.0, .55);
      if (b > 29.2) {
        const px = gr[0], py = gr[1];
        el('div', `position:absolute;left:${px + 28}px;top:${py + 28}px;width:112px;height:112px;border-radius:26px;overflow:hidden;transform:scale(${pk})`, lockUI, '<img src="assets/bubbles.jpg" style="width:100%;height:100%;object-fit:cover">');
        const tm = el('div', `position:absolute;left:${px + 160}px;top:${py + 26}px;width:440px;height:76px;overflow:hidden`, lockUI);
        el('div', `position:absolute;left:0;top:${(1 - pk) * 80}px;font:600 34px/38px Geist;color:#fff`, tm, 'Breathe');
        el('div', `position:absolute;left:0;top:${38 + (1 - pk) * 80}px;font:400 26px/36px Geist;color:rgba(255,255,255,.75)`, tm, 'Brain Dubai · Oxygen');
        el('div', `position:absolute;left:${px + 160}px;top:${py + 118}px;width:${440 * clamp(spring(b, 29.45, 2.4, .8))}px;height:7px;border-radius:4px;background:rgba(255,255,255,.35)`, lockUI);
        el('div', `position:absolute;left:${px + 160}px;top:${py + 118}px;width:${150 * clamp(spring(b, 29.45, 2.4, .8))}px;height:7px;border-radius:4px;background:#fff`, lockUI);
        [[px + 200, 'prev'], [px + 370, 'play'], [px + 540, 'next']].forEach(([x, n], i) => { const sc = spring(b, 29.5 + i * .1, 3.2, .5); el('div', `position:absolute;left:${x - 22}px;top:${py + 152}px;width:44px;height:44px;transform:scale(${sc})`, lockUI,
          n === 'play' ? '<svg viewBox="0 0 44 44"><path d="M13 8l24 14L13 36z" fill="#fff"/></svg>' : `<svg viewBox="0 0 44 44"><path d="${n === 'prev' ? 'M34 10L16 22l18 12zM12 10v24' : 'M10 10l18 12-18 12zM32 10v24'}" fill="#fff" stroke="#fff" stroke-width="3" stroke-linejoin="round"/></svg>`); });
      }
    }
  }
}
function islandState(b) {
  const pop = spring(b, 30.9, 3.0, .55);
  const stretch = eIO(prog(b, 31.5, 32.3)), fly = eIO(prog(b, 32.2, 33.2));
  return { pop, stretch, fly };
}
const MACW = { x: 620, y: 430, w: 800, h: 560 }, MACTOP = [1020, 470];
function renderIsland(b) {
  const { pop, stretch, fly } = islandState(b);
  const iw = (150 + 100 * stretch) * pop, ih = (44 + 8 * stretch) * pop;
  R(island, ISL[0] - iw / 2 + 26 * stretch, ISL[1] - ih / 2, iw, ih, 99);
  const pos = (() => { const u = 1 - fly; const p0 = [ISL[0] + 40, ISL[1]], p1 = [760, 170], p2 = [MACTOP[0], MACTOP[1] - 10]; return [u * u * p0[0] + 2 * u * fly * p1[0] + fly * fly * p2[0], u * u * p0[1] + 2 * u * fly * p1[1] + fly * fly * p2[1]]; })();
  const sp = Math.sin(fly * Math.PI), dw = 44 + 90 * sp, dh = 44 - 8 * sp, born = prog(b, 31.9, 32.3);
  R(drop, pos[0] - dw / 2, pos[1] - dh / 2, dw * born, dh * born, 99);
  const grown = spring(b, 33.15, 2.0, .62);
  vis(drop, b >= 31.9 && grown < .25); vis(island, b >= 30.9);
}
