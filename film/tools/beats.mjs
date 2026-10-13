import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
const root=path.resolve('.'), out=path.resolve(process.argv[2]); fs.mkdirSync(out,{recursive:true});
const mime={'.html':'text/html','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2','.js':'text/javascript','.mp4':'video/mp4'};
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();}else{r.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream'});r.end(d);}});}).listen(0);
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});
const pg=await b.newPage({viewport:{width:1440,height:1440}});
pg.on('console',m=>{if(!/404/.test(m.text()))console.log('[page]',m.text())}); pg.on('pageerror',e=>console.log('[err]',e.message));
await pg.goto(`http://localhost:${srv.address().port}/film.html`); await pg.waitForFunction('window.READY===true',null,{timeout:30000});
for(const beat of JSON.parse(process.argv[3])){ const t0=Date.now(); await pg.evaluate(t=>seek(t),beat*0.5); await pg.screenshot({path:path.join(out,'b'+String(beat).padStart(5,'0')+'.png')}); console.log('beat',beat,Date.now()-t0,'ms'); }
await b.close(); srv.close();
