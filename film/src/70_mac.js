/* ================= Mac window: blind, Safari, page push, hero, product card ================= */
const MAC = {};
const VP = { x: 0, y: 92, w: 800, h: 468 };                         // viewport inside the window (local)
const HERO_R = [40, 76, 720, 300];                                  // hero slot (page coords)
const PRINT_C = [240, 690], PRINT_P = 208, CARD = [40, 470, 720, 440];
const SWATCH = ['#c89b62', '#14161f', '#f3f1ec', BLUE];
function buildMac() {
  MAC.win = el('div', `position:absolute;left:${MACW.x}px;top:${MACW.y}px;width:${MACW.w}px;height:${MACW.h}px;border-radius:26px;overflow:hidden;background:#f4efe6;box-shadow:0 50px 120px rgba(0,0,0,.55),0 0 0 1px rgba(255,255,255,.14);transform-origin:${MACTOP[0] - MACW.x}px ${MACTOP[1] - MACW.y}px`, sStage);
  const bar = el('div', 'position:absolute;left:0;top:0;width:800px;height:52px;background:#ebe5da', MAC.win);
  [['#ff5f57', 26], ['#febc2e', 54], ['#28c840', 82]].forEach(([c, x]) => el('div', `position:absolute;top:19px;left:${x - 7}px;width:14px;height:14px;border-radius:50%;background:${c}`, bar));
  el('div', 'position:absolute;left:230px;top:9px;width:340px;height:34px;border-radius:17px;background:rgba(0,0,0,.07);font:500 17px/34px Geist;color:#3a3a46;text-align:center', bar, 'braindubai.com');
  const tabs = el('div', 'position:absolute;left:0;top:52px;width:800px;height:40px;background:#ddd6c9;border-bottom:1px solid rgba(0,0,0,.08)', MAC.win);
  MAC.tabA = el('div', 'position:absolute;left:14px;top:6px;width:180px;height:34px;border-radius:10px 10px 0 0;font:500 15px/34px Geist;color:#222;text-align:center', tabs, 'Home');
  MAC.tabB = el('div', 'position:absolute;left:200px;top:6px;width:180px;height:34px;border-radius:10px 10px 0 0;font:500 15px/34px Geist;color:#222;text-align:center', tabs, 'Prints');
  el('div', 'position:absolute;left:392px;top:6px;width:34px;height:34px;font:400 24px/32px Geist;color:#555;text-align:center', tabs, '+');
  MAC.vp = el('div', `position:absolute;left:0;top:${VP.y}px;width:${VP.w}px;height:${VP.h}px;overflow:hidden;background:#f9f6f0`, MAC.win);
  // page A: home
  MAC.pageA = el('div', 'position:absolute;left:0;top:0;width:800px;height:468px', MAC.vp);
  nav(MAC.pageA, false);
  el('div', 'position:absolute;left:60px;top:120px;width:600px;font:600 58px/1.04 Geist;letter-spacing:-.03em;color:#10131f', MAC.pageA, 'Prints that<br>breathe.');
  el('div', 'position:absolute;left:60px;top:262px;width:430px;font:400 19px/1.45 Geist;color:#5b5f6e', MAC.pageA, 'Museum-grade giclée prints of living water, oxygen and light, framed in Dubai.');
  el('div', 'position:absolute;left:60px;top:352px;width:150px;height:44px;border-radius:22px;background:#10131f;color:#fff;font:500 16px/44px Geist;text-align:center', MAC.pageA, 'Shop prints');
  el('div', 'position:absolute;left:520px;top:110px;width:240px;height:290px;border-radius:24px;background:linear-gradient(160deg,#d9e3f7,#b7c8ef)', MAC.pageA);
  // page B: prints landing + product card
  MAC.pageB = el('div', 'position:absolute;left:0;top:0;width:800px;height:468px;overflow:hidden', MAC.vp);
  MAC.bIn = el('div', 'position:absolute;left:0;top:0;width:800px;height:1000px', MAC.pageB);
  nav(MAC.pageB, true);
  MAC.slot = el('div', `position:absolute;left:${HERO_R[0]}px;top:${HERO_R[1]}px;width:${HERO_R[2]}px;height:${HERO_R[3]}px;border-radius:22px;border:2px dashed rgba(16,19,31,.28);font:500 20px/296px Geist;color:rgba(16,19,31,.4);text-align:center`, MAC.bIn, 'Drop an image');
  el('div', 'position:absolute;left:40px;top:394px;font:600 38px/1.1 Geist;letter-spacing:-.025em;color:#10131f;width:700px', MAC.bIn, 'Oxygen, framed.');
  const card = el('div', `position:absolute;left:${CARD[0]}px;top:${CARD[1]}px;width:${CARD[2]}px;height:${CARD[3]}px;border-radius:30px;background:#fff;box-shadow:0 20px 60px rgba(16,19,31,.10),0 0 0 1px rgba(16,19,31,.06)`, MAC.bIn);
  MAC.card = card;
  const T = (x, y, css, txt) => el('div', `position:absolute;left:${x}px;top:${y}px;white-space:nowrap;${css}`, MAC.bIn, txt);
  T(430, 508, 'font:600 36px/1.1 Geist;letter-spacing:-.02em;color:#10131f', 'Oxygen');
  T(430, 556, 'font:400 18px/1.2 Geist;color:#6a6e7c', 'Giclée print · museum paper');
  T(430, 590, 'font:600 26px/1.2 Geist;color:#10131f', 'AED 420');
  T(430, 640, 'font:500 13px/1 Geist;color:#8a8e9c;letter-spacing:.12em', 'FRAME');
  T(430, 722, 'font:500 13px/1 Geist;color:#8a8e9c;letter-spacing:.12em', 'SIZE');
  MAC.sw = SWATCH.map((c, i) => el('div', `position:absolute;left:${430 + i * 48}px;top:664px;width:34px;height:34px;border-radius:50%;background:${c};box-shadow:inset 0 0 0 1px rgba(0,0,0,.14)`, MAC.bIn));
  MAC.swRing = el('div', 'position:absolute;top:659px;width:44px;height:44px;border-radius:50%;border:2.5px solid #10131f', MAC.bIn);
  MAC.chipSel = el('div', 'position:absolute;top:748px;width:58px;height:40px;border-radius:20px;background:#10131f', MAC.bIn);
  MAC.chips = ['S', 'M', 'L'].map((s, i) => el('div', `position:absolute;left:${430 + i * 68}px;top:748px;width:58px;height:40px;border-radius:20px;font:500 16px/40px Geist;text-align:center;color:#10131f`, MAC.bIn, s));
  MAC.slotCta = el('div', 'position:absolute;left:430px;top:826px;width:300px;height:56px;border-radius:28px;border:2px dashed rgba(16,19,31,.2)', MAC.bIn);
  // print: molding (old colour), molding (new colour sweep), mat, photo
  MAC.mold = el('div', 'position:absolute;background:#c89b62;box-shadow:0 14px 34px rgba(16,19,31,.28)', MAC.bIn);
  MAC.moldB = el('div', `position:absolute;background:${BLUE}`, MAC.bIn);
  MAC.mat = el('div', 'position:absolute;background:#f4efe6;box-shadow:inset 0 0 0 1px rgba(0,0,0,.07)', MAC.bIn);
  MAC.photo = el('img', 'position:absolute;object-fit:cover', MAC.bIn); MAC.photo.src = 'assets/bubbles.jpg';
  MAC.blind = el('div', 'position:absolute;left:0;top:0;width:800px;overflow:hidden;background:repeating-linear-gradient(90deg,#efe9dd 0 6px,#ebe4d6 6px 7px)', MAC.win);
  MAC.roller = el('div', 'position:absolute;left:0;bottom:0;width:800px;height:34px;background:linear-gradient(180deg,#fbf8f0,#cfc7b6 55%,#8d8573);box-shadow:0 8px 22px rgba(0,0,0,.35)', MAC.blind);
  MAC.drag = el('div', 'position:absolute;overflow:hidden;box-shadow:0 30px 70px rgba(0,0,0,.5);z-index:30', sStage); el('img', 'position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover', MAC.drag).src = 'assets/bubbles.jpg';
}
function nav(parent, withBtn) {
  el('div', 'position:absolute;left:0;top:0;width:800px;height:56px;background:rgba(249,246,240,.9);border-bottom:1px solid rgba(16,19,31,.06);z-index:4', parent);
  el('div', 'position:absolute;left:40px;top:14px;font:800 26px/1 Archivo;font-stretch:125%;color:#10131f;z-index:5', parent, 'Brain.');
  ['Prints', 'Frames', 'About'].forEach((s, i) => el('div', `position:absolute;left:${470 + i * 72}px;top:19px;font:500 15px/1 Geist;color:#555;z-index:5`, parent, s));
}
const scrollY = b => 430 * eIO(prog(b, 38.85, 40.2));
const printP = b => PRINT_P * (1 + .12 * spring(b, 41.95, 2.4, .6));
const winPt = (lx, ly) => [MACW.x + lx, MACW.y + ly];                // window-local -> world
const vpPt = (px, py) => [MACW.x + VP.x + px, MACW.y + VP.y + py];    // viewport-local -> world
function renderMac(b) {
  const grow = spring(b, 33.15, 2.0, .62);
  vis(MAC.win, b >= 32.9);
  MAC.win.style.transform = `scale(${clamp(grow, 0, 1.05)})`;
  // tabs + page push
  const push = eIO(prog(b, 36.4, 37.1));
  const hov = prog(b, 36.25, 36.45) * (1 - push);
  Object.assign(MAC.tabA.style, { background: push < .5 ? '#f9f6f0' : 'transparent' });
  Object.assign(MAC.tabB.style, { background: push >= .5 ? '#f9f6f0' : (hov > 0 ? 'rgba(255,255,255,.55)' : 'transparent'), transform: `translateY(${-2 * hov}px)` });
  MAC.pageA.style.transform = `translateX(${-800 * push}px)`; MAC.pageB.style.transform = `translateX(${800 * (1 - push)}px)`;
  // blind
  const roll = eIO(prog(b, 34.25, 35.2)), Hb = 560 * (1 - roll);
  vis(MAC.blind, Hb > 1); MAC.blind.style.height = Hb + 'px';
  // scroll + hero/print
  const sc = scrollY(b); MAC.bIn.style.transform = `translateY(${-sc}px)`;
  const m = eIO(prog(b, 39.2, 40.2)), P = printP(b);
  const hero = b >= 38.75;
  const pr = [PRINT_C[0] - P / 2, PRINT_C[1] - P / 2, P, P];
  const ph = lerpA(HERO_R, pr, m);
  vis(MAC.photo, hero); R(MAC.photo, ph[0], ph[1], ph[2], ph[3], lerp(22, 3, m));
  vis(MAC.slot, b < 37.9);
  const gm = spring(b, 39.8, 2.4, .72), gf = spring(b, 40.1, 2.4, .72), mt = 26 * gm * (P / PRINT_P), fm = 18 * gf * (P / PRINT_P);
  const mr = [ph[0] - mt, ph[1] - mt, ph[2] + 2 * mt, ph[3] + 2 * mt], fr = [mr[0] - fm, mr[1] - fm, mr[2] + 2 * fm, mr[3] + 2 * fm];
  vis(MAC.mat, mt > .5); R(MAC.mat, mr[0], mr[1], mr[2], mr[3], 2); vis(MAC.mold, fm > .5); R(MAC.mold, fr[0], fr[1], fr[2], fr[3], 4);
  const sweep = eIO(prog(b, 41.05, 41.7)); vis(MAC.moldB, sweep > .001 && fm > .5); R(MAC.moldB, fr[0], fr[1], fr[2], fr[3], 4); MAC.moldB.style.clipPath = `inset(0 ${(1 - sweep) * 100}% 0 0)`;
  // swatch ring + size selection travel with a spring
  const ringI = springSeq(b, 0, [[40.95, 3, 2.6, .7]]); MAC.swRing.style.left = (430 + ringI * 48 - 5) + 'px';
  const chipI = springSeq(b, 0, [[42.0, 2, 2.6, .7]]); MAC.chipSel.style.left = (430 + chipI * 68) + 'px';
  MAC.chips.forEach((c, i) => c.style.color = Math.abs(i - chipI) < .5 ? '#fff' : '#10131f');
  // the dragged wallpaper
  const d = dragRect(b); vis(MAC.drag, d.on); if (d.on) R(MAC.drag, d.r[0], d.r[1], d.r[2], d.r[3], d.r[4]);
}
