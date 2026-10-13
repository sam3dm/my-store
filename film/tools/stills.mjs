import { chromium } from 'playwright';
import http from 'http'; import fs from 'fs'; import path from 'path';
const root=path.resolve(process.argv[2]), out=path.resolve(process.argv[3]);
const mime={'.html':'text/html','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2','.js':'text/javascript'};
const srv=http.createServer((q,r)=>{const f=path.join(root,decodeURIComponent(q.url.split('?')[0]));fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();}else{r.writeHead(200,{'content-type':mime[path.extname(f)]||'application/octet-stream'});r.end(d);}});}).listen(0);
const port=srv.address().port;
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});
const pg=await b.newPage({viewport:{width:1440,height:1440}});
pg.on('console',m=>console.log('[page]',m.text())); pg.on('pageerror',e=>console.log('[err]',e.message));
await pg.goto(`http://localhost:${port}/film.html`); await pg.waitForFunction('window.READY===true');
const shots=JSON.parse(process.argv[4]);
for(const [name,beat,scene] of shots){ await pg.evaluate(([t,s])=>seek(t,s),[beat*0.5,scene]); await pg.screenshot({path:path.join(out,name+'.png')}); console.log('shot',name,beat); }
await b.close(); srv.close();
