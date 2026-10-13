/* ================= grid: circle -> square -> paper-map unfold -> bento -> zoom ================= */
const TILE_SRC = ['assets/day.jpg', 'assets/p02.jpg', 'assets/p03.jpg', 'assets/p04.jpg', 'assets/p05.jpg', 'assets/p06.jpg', 'assets/p07.jpg', 'assets/p08.jpg', 'assets/p09.jpg'];
/* index: 0 hero, 1-4 plus (up,right,down,left), 5-8 corners (tl,tr,br,bl) */
const GRID_CELL = [[1, 1], [1, 0], [2, 1], [1, 2], [0, 1], [0, 0], [2, 0], [2, 2], [0, 2]];
const GRID_RECT = GRID_CELL.map(([c, r]) => [160 + c * 380, 160 + r * 380, 360, 360]);
const BENTO = [[80, 80, 640, 640], [740, 80, 300, 300], [1060, 80, 300, 300], [740, 1060, 620, 300], [80, 740, 300, 620], [740, 400, 620, 320], [400, 740, 320, 300], [400, 1060, 320, 300], [740, 740, 620, 300]];
const ORIGIN = ['50% 50%', '50% 100%', '0% 50%', '50% 0%', '100% 50%', '100% 100%', '0% 100%', '0% 0%', '100% 0%'];
const TILES = [];
function buildGrid() {
  sGrid.style.background = NAVY;
  TILE_SRC.forEach((src, i) => {
    const t = el('div', 'position:absolute;overflow:hidden;background:#0b1030;transform-origin:' + ORIGIN[i], sGrid);
    el('img', 'position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover', t).src = src; TILES.push(t);
  });
}
function gridState(b) {
  const out = [];
  // hero: full-bleed circle -> 880 circle -> square -> tile
  const S = springSeq(b, 2200, [[6.4, 880, 1.7, .95], [8.0, 360, 2.0, .8]]);
  const rad = b < 7.6 ? S / 2 : lerp(S / 2, 70, eOut(prog(b, 7.6, 8.1))) * 1;
  const radHero = b < 8 ? rad : lerp(rad, 36, prog(b, 8, 9));
  const unfoldP = i => i >= 1 && i <= 4 ? spring(b, 9.0 + (i - 1) * .06, 2.6, .7) : i >= 5 ? spring(b, 9.65 + (i - 5) * .06, 2.6, .7) : 1;
  const bento = i => spring(b, 11.0 + (i === 0 ? 0 : (i * .07)), 2.2, .72);
  for (let i = 0; i < 9; i++) {
    let rect, rr = 36, sx = 1, sy = 1, on = true;
    if (i === 0) {
      rect = [720 - S / 2, 720 - S / 2, S, S]; rr = radHero;
      if (b >= 9) { rect = lerpA(GRID_RECT[0], BENTO[0], bento(0)); rr = lerp(36, 36, 0); }
    } else {
      if (b < 8.95) on = false;
      const u = unfoldP(i), bt = bento(i);
      rect = lerpA(GRID_RECT[i], BENTO[i], bt);
      if (i <= 4) { if (i === 1 || i === 3) sy = u; else sx = u; }
      else { sx = u; sy = u; }
      // bento end: the clicked hero keeps its radius until the zoom flattens it
    }
    out.push({ rect, rr, sx, sy, on });
  }
  // the hero's radius melts to 0 as the zoom lands
  if (b >= 14.8) out[0].rr = lerp(36, 0, prog(b, 14.8, 16));
  return out;
}
function renderGrid(b) {
  const st = gridState(b);
  st.forEach((s, i) => { const t = TILES[i]; vis(t, s.on); if (!s.on) return; R(t, s.rect[0], s.rect[1], s.rect[2], s.rect[3], s.rr); t.style.transform = `scale(${s.sx},${s.sy})`; });
  const press = i => 1; // click feedback on the hero tile
  const pr = 1 - .03 * (1 - spring(b, 13.6, 3.0, .7)) * (b > 13.6 ? 1 : 0);
  TILES[0].style.transform = `scale(${pr})`;
}
