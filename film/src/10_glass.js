/* ================= liquid glass =================
   Every glass element owns a clone of the scene behind it, filtered through three
   feDisplacementMaps (one per colour channel, slightly different scales) driven by a
   distance-field map (rounded rect or per-glyph canvas), plus a rim light. */
const MAPS = new Map(); const MARGIN = 48; let gid = 0;
const IMGS = new Map(), PEND = [];
function need(url) { let im = IMGS.get(url); if (!im) { im = new Image(); im.src = url; IMGS.set(url, im); if (IMGS.size > 400) IMGS.delete(IMGS.keys().next().value); } PEND.push(im.decode().catch(() => { })); }
const CH = ['1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0', '0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0', '0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0'];
function glassMap(w, h, r, bezel) {
  const key = [w, h, r, bezel].map(v => Math.round(v)).join('_');
  if (MAPS.has(key)) return MAPS.get(key);
  const cw = Math.ceil(w + 2 * MARGIN), ch = Math.ceil(h + 2 * MARGIN);
  const c = document.createElement('canvas'); c.width = cw; c.height = ch;
  const g = c.getContext('2d'); const img = g.createImageData(cw, ch); const d = img.data;
  const cx = cw / 2, cy = ch / 2, hw = w / 2 - r, hh = h / 2 - r;
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    const qx = Math.abs(x + .5 - cx) - hw, qy = Math.abs(y + .5 - cy) - hh;
    const ox = Math.max(qx, 0), oy = Math.max(qy, 0);
    const dist = -(Math.hypot(ox, oy) + Math.min(Math.max(qx, qy), 0) - r);
    let m = 0, nx = 0, ny = 0;
    if (dist > 0 && dist < bezel) {
      const u = 1 - dist / bezel; m = u * u * (3 - 2 * u) * u;
      if (ox > 0 || oy > 0) { const L = Math.hypot(ox, oy) || 1; nx = ox / L * Math.sign(x + .5 - cx); ny = oy / L * Math.sign(y + .5 - cy); }
      else if (qx > qy) { nx = Math.sign(x + .5 - cx); } else { ny = Math.sign(y + .5 - cy); }
    }
    const i = (y * cw + x) * 4;
    d[i] = 128 - 127 * nx * m; d[i + 1] = 128 - 127 * ny * m; d[i + 2] = 128; d[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  const out = { url: c.toDataURL('image/png'), cw, ch }; MAPS.set(key, out); if (MAPS.size > 90) MAPS.delete(MAPS.keys().next().value); return out;
}
/* per-glyph distance field: height map -> displacement map, alpha mask, rim highlights */
const GLY = new Map();
function glyph(ch, px, weight = 700) {
  const key = ch + px + weight; if (GLY.has(key)) return GLY.get(key);
  const t = document.createElement('canvas').getContext('2d'); t.font = `${weight} ${px}px Geist`;
  const m = t.measureText(ch); const adv = m.width;
  const asc = Math.ceil(m.actualBoundingBoxAscent) + 2, desc = Math.ceil(m.actualBoundingBoxDescent) + 2, left = Math.ceil(m.actualBoundingBoxLeft) + 2, right = Math.ceil(m.actualBoundingBoxRight) + 2;
  const w = left + right, h = asc + desc, P = MARGIN, cw = w + 2 * P, chh = h + 2 * P;
  const a = document.createElement('canvas'); a.width = cw; a.height = chh; const ag = a.getContext('2d');
  ag.font = t.font; ag.fillStyle = '#fff'; ag.textBaseline = 'alphabetic'; ag.fillText(ch, P + left, P + asc);
  const b = document.createElement('canvas'); b.width = cw; b.height = chh; const bg = b.getContext('2d');
  bg.filter = `blur(${Math.max(5, px * .035)}px)`; bg.drawImage(a, 0, 0);
  const H = bg.getImageData(0, 0, cw, chh).data; const A = ag.getImageData(0, 0, cw, chh).data;
  const mapC = document.createElement('canvas'); mapC.width = cw; mapC.height = chh; const mg = mapC.getContext('2d'); const mi = mg.createImageData(cw, chh);
  const hiC = document.createElement('canvas'); hiC.width = w; hiC.height = h; const hg = hiC.getContext('2d'); const hi = hg.createImageData(w, h);
  const maskC = document.createElement('canvas'); maskC.width = w; maskC.height = h; const kg = maskC.getContext('2d'); const mk = kg.createImageData(w, h);
  const gx = new Float32Array(cw * chh), gy = new Float32Array(cw * chh); let gmax = 1e-6;
  for (let y = 1; y < chh - 1; y++) for (let x = 1; x < cw - 1; x++) {
    const i = y * cw + x; gx[i] = (H[(i + 1) * 4 + 3] - H[(i - 1) * 4 + 3]) / 510; gy[i] = (H[(i + cw) * 4 + 3] - H[(i - cw) * 4 + 3]) / 510;
    gmax = Math.max(gmax, Math.hypot(gx[i], gy[i]));
  }
  const Lx = -.55, Ly = -.83;
  for (let y = 0; y < chh; y++) for (let x = 0; x < cw; x++) {
    const i = y * cw + x; const mag = Math.hypot(gx[i], gy[i]) / gmax;
    const inside = A[i * 4 + 3] > 8;
    const mm = inside ? clamp(mag * 1.5) : 0;
    mi.data[i * 4] = 128 + 127 * clamp(gx[i] / gmax * 1.5, -1, 1) * (inside ? 1 : 0);
    mi.data[i * 4 + 1] = 128 + 127 * clamp(gy[i] / gmax * 1.5, -1, 1) * (inside ? 1 : 0);
    mi.data[i * 4 + 2] = 128; mi.data[i * 4 + 3] = 255;
    const hx = x - P, hy = y - P;
    if (hx >= 0 && hy >= 0 && hx < w && hy < h) {
      const j = hy * w + hx; const nl = mag > 1e-4 ? (-gx[i] * Lx - gy[i] * Ly) / (mag * gmax) : 0;   // outward normal . light
      const lit = Math.max(0, nl), unlit = Math.max(0, -nl);
      const edge = Math.pow(clamp(mag * 1.2), .9) * (inside ? 1 : 0);
      const al = clamp(edge * (.28 + .9 * lit) + edge * .22 * unlit) * (A[i * 4 + 3] / 255);
      hi.data[j * 4] = 255; hi.data[j * 4 + 1] = 255; hi.data[j * 4 + 2] = 255; hi.data[j * 4 + 3] = al * 255;
      mk.data[j * 4] = 255; mk.data[j * 4 + 1] = 255; mk.data[j * 4 + 2] = 255; mk.data[j * 4 + 3] = A[i * 4 + 3];
    }
  }
  mg.putImageData(mi, 0, 0); hg.putImageData(hi, 0, 0); kg.putImageData(mk, 0, 0);
  const out = { adv, w, h, left, asc, map: { url: mapC.toDataURL(), cw, ch: chh }, mask: maskC.toDataURL(), hi: hiC.toDataURL() };
  GLY.set(key, out); return out;
}
function glass(layer, src, o) {
  const { x, y, w, h } = o; const r = o.r ?? Math.min(w, h) / 2;
  const k = o.k ?? 1, bezel = o.bezel ?? Math.min(w, h) * .5, tint = o.tint ?? .10, sat = o.sat ?? 1.35, bright = o.bright ?? 1.06;
  const host = el('div', `position:absolute;left:${x}px;top:${y}px;width:${w}px;height:${h}px;${o.transform ? `transform:${o.transform};transform-origin:50% 50%;` : ''}`, layer);
  if (o.opacity != null) host.style.opacity = o.opacity;
  const sh = o.shape;
  if (!sh && o.shadow !== false) el('div', `position:absolute;inset:0;border-radius:${r}px;box-shadow:0 ${Math.min(h * .22, 28)}px ${Math.min(h * .7, 60)}px rgba(5,8,22,${o.shadowA ?? .38}),0 2px 6px rgba(5,8,22,.22)`, host);
  if (sh) host.style.filter = 'drop-shadow(0 6px 12px rgba(4,8,24,.35))';
  const clip = el('div', `position:absolute;left:0;top:0;width:${w}px;height:${h}px;overflow:hidden;` + (sh ? `-webkit-mask:url(${sh.mask}) 0 0/100% 100% no-repeat;mask:url(${sh.mask}) 0 0/100% 100% no-repeat` : `border-radius:${r}px`), host);
  const m = sh ? sh.map : glassMap(w, h, r, bezel);
  need(m.url); if (sh) { need(sh.mask); need(sh.hi); }
  const f = document.createElementNS('http://www.w3.org/2000/svg', 'filter'); const id = (o.pfx || 'gf') + (gid++);
  f.setAttribute('id', id); f.setAttribute('x', '0'); f.setAttribute('y', '0'); f.setAttribute('width', '100%'); f.setAttribute('height', '100%'); f.setAttribute('color-interpolation-filters', 'sRGB');
  const S = [38 * k, 46 * k, 54 * k];
  f.innerHTML = `<feImage href="${m.url}" x="0" y="0" width="${m.cw}" height="${m.ch}" preserveAspectRatio="none" result="map"/>` +
    S.map((s, i) => `<feDisplacementMap in="SourceGraphic" in2="map" scale="${s}" xChannelSelector="R" yChannelSelector="G" result="d${i}"/><feColorMatrix in="d${i}" type="matrix" values="${CH[i]}" result="c${i}"/>`).join('') +
    `<feBlend in="c0" in2="c1" mode="screen" result="rg"/><feBlend in="rg" in2="c2" mode="screen"/>`;
  (o.defs || $('gfs')).appendChild(f);
  const pad = el('div', `position:absolute;left:${-MARGIN}px;top:${-MARGIN}px;width:${m.cw}px;height:${m.ch}px;overflow:hidden;filter:url(#${id}) saturate(${sat}) brightness(${bright})`, clip);
  const c = src.cloneNode(true); c.removeAttribute('id'); c.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
  c.style.cssText += `;display:block;position:absolute;left:${-(x - MARGIN)}px;top:${-(y - MARGIN)}px;width:1440px;height:1440px`;
  pad.appendChild(c);
  el('div', `position:absolute;inset:0;background:rgba(255,255,255,${tint})`, clip);
  const inner = el('div', `position:absolute;left:0;top:0;width:${w}px;height:${h}px;${sh ? '' : `border-radius:${r}px;overflow:hidden`}`, host);
  const rim = el('div', sh ? `position:absolute;left:0;top:0;width:${w}px;height:${h}px;background:url(${sh.hi}) 0 0/100% 100%` :
    `position:absolute;left:0;top:0;width:${w}px;height:${h}px;border-radius:${r}px;pointer-events:none;box-shadow:inset 0 0 0 1.2px rgba(255,255,255,.38),inset 0 2px 2px rgba(255,255,255,.75),inset 0 -2px 3px rgba(255,255,255,.28),inset 0 0 ${Math.min(h * .35, 30)}px rgba(255,255,255,.14);background:linear-gradient(155deg,rgba(255,255,255,.34) 0%,rgba(255,255,255,0) 34%,rgba(255,255,255,0) 66%,rgba(255,255,255,.18) 100%)`, host);
  return { host, clip, inner, rim };
}
/* glass letters: each glyph pops on its own spring, laid out along a baseline */
function glassText(layer, src, text, cx, cy, px, pops, o = {}) {
  const gl = [...text].map(ch => glyph(ch, px, o.weight || 700));
  const total = gl.reduce((a, g) => a + g.adv, 0) + (text.length - 1) * (o.track || 0);
  let x = cx - total / 2; const out = [];
  gl.forEach((g, i) => {
    const s = pops[i] ?? 1;
    if (s > .06) {
      const gx = x - g.left, gy = cy - g.asc * .62 - (o.dy || 0);
      const hh = glass(layer, src, { x: gx, y: gy, w: g.w, h: g.h, shape: g, k: o.k ?? 1.25, tint: o.tint ?? .1, sat: o.sat ?? 1.3, bright: o.bright ?? 1.1, transform: `translate(${(o.dx?.[i] ?? 0)}px,${(o.dyy?.[i] ?? 0)}px) scale(${s})`, defs: o.defs, pfx: o.pfx });
      out.push(hh);
    }
    x += g.adv + (o.track || 0);
  });
  return { total };
}
