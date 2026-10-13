window.renderPlate = function () { const c = document.createElement('canvas'); c.width = c.height = 1440; drawPlate(c.getContext('2d'), 0); return c.toDataURL('image/jpeg', .93); };
/* ---- camera ---- */
const CAM = [[0, 1.25, 720, 720], [3, 1.5, 720, 720], [5, 1.45, 720, 720], [6.2, 1, 720, 720], [13.6, 1, 720, 720], [16, 2.25, 400, 400], [16, 1, 720, 720], [17.3, 1, 720, 720], [19, 1.55, 720, 1060], [23.3, 1.55, 720, 1060], [24.6, 1, 720, 720],
  [31.2, 1, 720, 720], [31.9, 2.4, 370, 300], [32.2, 2.4, 370, 300], [33.2, 1.9, 980, 520], [34.0, 1.75, 1020, 710], [34.3, 1.75, 1020, 710], [34.95, 1.2, 720, 740], [36.3, 1.2, 760, 740], [36.9, 1.75, 1020, 710], [43.6, 1.75, 1020, 710], [45.0, 1.3, 720, 720], [48, 1.3, 720, 720],
  [49.0, 1, 720, 720], [50.5, 1, 720, 640], [51.0, 2.2, 720, 620], [51.8, 2.2, 720, 620], [52.3, 1.5, 720, 720], [53.4, 1.5, 720, 720], [54, 1.25, 720, 720]];
function camAt(b) {
  for (let i = 0; i < CAM.length - 1; i++) { const a = CAM[i], c = CAM[i + 1]; if (b >= a[0] && b < c[0]) { const u = eIO((b - a[0]) / (c[0] - a[0])); return { s: lerp(a[1], c[1], u), cx: lerp(a[2], c[2], u), cy: lerp(a[3], c[3], u) }; } }
  const l = CAM[CAM.length - 1]; return { s: l[1], cx: l[2], cy: l[3] };
}
function applyCamera(c) {
  const hv = 720 / c.s; const cx = clamp(c.cx, hv, 1440 - hv), cy = clamp(c.cy, hv, 1440 - hv);
  $('cam').style.transform = `translate(${720 - cx * c.s}px,${720 - cy * c.s}px) scale(${c.s.toFixed(5)})`;
}
async function seek(t) {
  const b = t / B;
  $('app').style.background = NAVY;
  vis(sOpen, b < 6.0 || b >= 52.7); vis(sGrid, b >= 5.9 && b < 16); vis(sPhoto, b >= 16 && b < 27.55); vis(GU, b >= 16 && b < 27.55);
  vis(sLock, b >= 27.55 && b < 48.6); vis(sStage, b >= 32.9 && b < 48.6); vis(sWall, b >= 48.4 && b < 52.4);
  if (b < 6.0 || b >= 52.7) renderOpen(b);
  if (b >= 5.9 && b < 16) renderGrid(b);
  if (b >= 16 && b < 27.6) renderGlassScene(b);
  if (b >= 27.55 && b < 48.6) { renderLock(b); renderIsland(b); }
  if (b >= 32.9 && b < 48.6) renderMac(b);
  if (b >= 48.4 && b < 52.4) renderWall(b);
  renderShape(b); renderFlood(b);
  const [a, rot] = irisState(b); irisDraw(a, rot);
  applyCamera(camAt(b)); renderCursor(b);
  await document.fonts.ready;
  await Promise.all([...document.images].map(i => i.decode().catch(() => { })).concat(PEND.splice(0)));
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  if (gid > 0 || lockGlass.children.length) { await new Promise(r => setTimeout(r, 30)); await new Promise(r => requestAnimationFrame(r)); }
}
window.seek = seek;
(async () => {
  await document.fonts.load('800 250px Archivo'); await document.fonts.load('600 64px Geist'); await document.fonts.load('700 100px Geist');
  measureLetters(); buildOpen(); buildGrid(); buildMac(); buildShape();
  window.READY = true;
})();
