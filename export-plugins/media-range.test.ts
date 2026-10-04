import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createMediaAssetsMiddleware } from './media-assets-plugin';

let server: ReturnType<typeof createServer>;
let base = '';
const bytes = Buffer.from(Array.from({ length: 1000 }, (_, i) => i % 256));

beforeAll(async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'mdm-range-'));
  mkdirSync(path.join(root, 'public', 'assets', 'media'), { recursive: true });
  writeFileSync(path.join(root, 'public', 'assets', 'media', 'clip.mp4'), bytes);
  const mw = createMediaAssetsMiddleware(() => root);
  server = createServer((req, res) => mw(req, res, () => { res.statusCode = 404; res.end(); }));
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  base = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
});
afterAll(() => server.close());

describe('video byte ranges (iPhone Safari)', () => {
  it('answers a normal request with the length and range support', async () => {
    const r = await fetch(`${base}/airo-assets/uploads/clip.mp4`);
    expect(r.status).toBe(200);
    expect(r.headers.get('accept-ranges')).toBe('bytes');
    expect(r.headers.get('content-length')).toBe('1000');
  });
  it('answers range requests with 206 and the exact bytes', async () => {
    const r = await fetch(`${base}/airo-assets/uploads/clip.mp4`, { headers: { Range: 'bytes=0-1' } });
    expect(r.status).toBe(206);
    expect(r.headers.get('content-range')).toBe('bytes 0-1/1000');
    expect(Buffer.from(await r.arrayBuffer())).toEqual(bytes.subarray(0, 2));
    const t = await fetch(`${base}/airo-assets/uploads/clip.mp4`, { headers: { Range: 'bytes=990-' } });
    expect(t.status).toBe(206);
    expect(t.headers.get('content-range')).toBe('bytes 990-999/1000');
    const s = await fetch(`${base}/airo-assets/uploads/clip.mp4`, { headers: { Range: 'bytes=-10' } });
    expect(s.headers.get('content-range')).toBe('bytes 990-999/1000');
  });
  it('rejects an out-of-range request with 416', async () => {
    const r = await fetch(`${base}/airo-assets/uploads/clip.mp4`, { headers: { Range: 'bytes=5000-6000' } });
    expect(r.status).toBe(416);
  });
});
