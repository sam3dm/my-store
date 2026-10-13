/* ================= wall: oxygen bubbles out of focus, frame flood, iris, return to the wordmark ================= */
const WALLC = document.createElement('canvas'); WALLC.width = WALLC.height = 1440; WALLC.style.cssText = 'position:absolute;left:0;top:0;width:1440px;height:1440px'; sWall.appendChild(WALLC);
function renderWall(b) { drawWall(WALLC.getContext('2d'), b * B); }
const flood = el('div', `position:absolute;background:${BLUE}`, sFlood);
function renderFlood(b) {
  const on = b >= 51.6 && b < 52.9; vis(flood, on); if (!on) return;
  const e1 = eIO(prog(b, 51.6, 52.2)), e2 = eIO(prog(b, 52.3, 52.9));
  let r;
  if (b < 52.3) r = lerpA([FR[0] + FR[2] / 2, FR[1] + FR[3] / 2, FR[2], FR[3], 10], [720, 720, 5200, 5200, 2600], e1);
  else r = lerpA([720, 720, 5200, 5200, 2600], [720, 720, PILL.w, PILL.h, PILL.h / 2], e2);
  R(flood, r[0] - r[2] / 2, r[1] - r[3] / 2, r[2], r[3], r[4]); flood.style.background = lerpColor(C_BLUE, C_INK, prog(b, 52.4, 52.9));
}
