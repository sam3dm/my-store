// usage: node tools/render.mjs <worker> <workers> <outDir> [fps] [sub] [t0] [t1]
import { chromium } from 'playwright'; import sharp from 'sharp';
import http from 'http'; import fs from 'fs'; import path from 'path';
const [w, nw, outDir] = [+process.argv[2], +process.argv[3], process.argv[4]];
const FPS = +(process.argv[5] || 60), SUB = +(process.argv[6] || 4), T0 = +(process.argv[7] || 0), T1 = +(process.argv[8] || 27);
const SHUTTER = 0.5, BLOCK = 24, N = Math.round((T1 - T0) * FPS);
fs.mkdirSync(outDir, { recursive: true });
const root = path.resolve('.'); const mime = { '.html': 'text/html', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2' };
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0])); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); } else { r.writeHead(200, { 'content-type': mime[path.extname(f)] || 'application/octet-stream' }); r.end(d); } }); }).listen(0);
const br = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const pg = await br.newPage({ viewport: { width: 1440, height: 1440 } });
pg.on('pageerror', e => console.log('[err]', e.message));
await pg.goto(`http://localhost:${srv.address().port}/film.html`); await pg.waitForFunction('window.READY===true', null, { timeout: 60000 });
const t00 = Date.now(); let done = 0;
for (let k = 0; k < N; k++) { const f = process.env.REV ? N - 1 - k : k;
  if (Math.floor(f / BLOCK) % nw !== w) continue;
  const out = path.join(outDir, 'f' + String(f).padStart(5, '0') + '.jpg'); if (fs.existsSync(out)) continue;
  const acc = new Uint16Array(1440 * 1440 * 3);
  for (let s = 0; s < SUB; s++) {
    const t = Math.min(T1, Math.max(T0, T0 + f / FPS + ((s + .5) / SUB - .5) * SHUTTER / FPS + SHUTTER / FPS / 2));
    await pg.evaluate(t => seek(t), t);
    const buf = await pg.screenshot({ type: 'png' });
    const raw = await sharp(buf).removeAlpha().raw().toBuffer();
    for (let i = 0; i < raw.length; i++) acc[i] += raw[i];
  }
  const o = Buffer.alloc(acc.length); for (let i = 0; i < acc.length; i++) o[i] = (acc[i] + SUB / 2) / SUB;
  await sharp(o, { raw: { width: 1440, height: 1440, channels: 3 } }).jpeg({ quality: 96, chromaSubsampling: '4:4:4' }).toFile(out);
  if (++done % 10 === 0) console.log(`w${w} ${done} frames, ${((Date.now() - t00) / 1000 / done).toFixed(2)} s/frame, at f=${f}`);
}
await br.close(); srv.close(); console.log('worker', w, 'finished');
