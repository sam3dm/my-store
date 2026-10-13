/* ================= oxygen bubbles (procedural photo + wall "footage") =================
   Deep blue water, depth of field: four hero bubbles are razor sharp, everything else is
   bokeh whose blur follows its distance from the focal plane. Pure function of time. */
function drawBubble(g, x, y, r, blur, alpha) {
  g.save();
  if (blur > .4) g.filter = `blur(${blur}px)`;
  g.globalAlpha = alpha;
  let gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, 'rgba(130,190,255,0.03)'); gr.addColorStop(.62, 'rgba(120,185,255,0.05)');
  gr.addColorStop(.86, 'rgba(150,205,255,0.17)'); gr.addColorStop(.965, 'rgba(215,238,255,0.44)'); gr.addColorStop(1, 'rgba(215,238,255,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  g.lineWidth = Math.max(1, r * .022); g.strokeStyle = 'rgba(2,10,30,.55)'; g.beginPath(); g.arc(x, y, r * 1.004, 0, TAU); g.stroke();   // refraction shadow edge
  g.lineWidth = Math.max(1, r * .03); g.strokeStyle = 'rgba(205,232,255,.55)'; g.beginPath(); g.arc(x, y, r * .965, 0, TAU); g.stroke();     // fresnel rim
  g.save(); g.beginPath(); g.arc(x, y, r * .95, 0, TAU); g.clip();
  const cg = g.createRadialGradient(x + r * .42, y + r * .5, 0, x + r * .42, y + r * .5, r * .9);                                          // light refracted through the bubble
  cg.addColorStop(0, 'rgba(120,190,255,.42)'); cg.addColorStop(1, 'rgba(120,190,255,0)'); g.fillStyle = cg; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  g.restore();
  g.lineCap = 'round'; g.lineWidth = Math.max(1.5, r * .07); g.strokeStyle = 'rgba(255,255,255,.88)';
  g.beginPath(); g.arc(x, y, r * .78, Math.PI * 1.12, Math.PI * 1.42); g.stroke();                                                         // window highlight
  g.fillStyle = 'rgba(255,255,255,.6)'; g.beginPath(); g.ellipse(x - r * .38, y - r * .42, r * .13, r * .07, -.6, 0, TAU); g.fill();
  g.lineWidth = Math.max(1, r * .04); g.strokeStyle = 'rgba(180,225,255,.45)'; g.beginPath(); g.arc(x, y, r * .8, Math.PI * .18, Math.PI * .4); g.stroke();
  g.restore();
}
function waterBg(g, t) {
  const bgc = g.createLinearGradient(0, 0, 0, 1440); bgc.addColorStop(0, '#071a45'); bgc.addColorStop(.55, '#04122f'); bgc.addColorStop(1, '#020a1f');
  g.fillStyle = bgc; g.fillRect(0, 0, 1440, 1440);
  let r1 = g.createRadialGradient(560, 520, 0, 560, 520, 980); r1.addColorStop(0, 'rgba(36,110,225,.55)'); r1.addColorStop(.5, 'rgba(20,70,170,.22)'); r1.addColorStop(1, 'rgba(20,70,170,0)');
  g.fillStyle = r1; g.fillRect(0, 0, 1440, 1440);
  const sh = Math.sin(t * .6) * 18;                                                                                                      // faint light shafts from above
  g.save(); g.globalAlpha = .10; g.filter = 'blur(36px)'; g.fillStyle = '#8fc4ff';
  for (const [x0, wd] of [[300, 90], [620, 140], [1000, 70]]) { g.beginPath(); g.moveTo(x0 + sh, -60); g.lineTo(x0 + wd + sh, -60); g.lineTo(x0 + wd * 3 - 260, 1500); g.lineTo(x0 - 340, 1500); g.fill(); }
  g.restore();
}
/* the print: a still of the bubbles; focus on exactly four hero bubbles */
const HERO = [{ x: 430, y: 575, r: 132 }, { x: 905, y: 372, r: 80 }, { x: 1010, y: 905, r: 172 }, { x: 545, y: 1075, r: 60 }];
function drawPlate(g, t = 0) {
  waterBg(g, t);
  const rd = rng(7);
  for (let i = 0; i < 54; i++) {                                                                     // bokeh bubbles: blur grows with distance from the focal plane
    const d = rd(), r = 12 + d * d * 150 + rd() * 20, x = rd() * 1440, y = (rd() * 1700 - 130 - t * (14 + d * 22)) % 1700;
    const yy = y < -130 ? y + 1700 : y;
    drawBubble(g, x + Math.sin(t * .7 + i) * 6, yy, r, 5 + d * 30, .38 + d * .4);
  }
  for (const h of HERO) drawBubble(g, h.x + Math.sin(t * .8 + h.r) * 3, h.y - t * 6 % 1, h.r, 0, 1);
  const hz = g.createRadialGradient(720, 720, 200, 720, 720, 1100); hz.addColorStop(0, 'rgba(60,130,235,.10)'); hz.addColorStop(1, 'rgba(2,8,24,.55)');   // soft inner haze + vignette
  g.fillStyle = hz; g.fillRect(0, 0, 1440, 1440);
}
/* the wall: the same water, every bubble out of focus, drifting upward */
function drawWall(g, t) {
  waterBg(g, t);
  const rd = rng(21);
  for (let i = 0; i < 64; i++) {
    const d = rd(), r = 26 + d * d * 150 + rd() * 26, x = rd() * 1440, v = 16 + d * 34;
    const y = ((rd() * 1900 - t * v) % 1900 + 1900) % 1900 - 230;
    drawBubble(g, x + Math.sin(t * .5 + i * 1.7) * 14, y, r, 9 + d * 26, .32 + d * .32);
  }
  const vg = g.createRadialGradient(720, 720, 260, 720, 720, 1100); vg.addColorStop(0, 'rgba(2,8,24,0)'); vg.addColorStop(1, 'rgba(2,8,24,.6)'); g.fillStyle = vg; g.fillRect(0, 0, 1440, 1440);
}
