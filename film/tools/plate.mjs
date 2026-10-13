import { chromium } from 'playwright'; import fs from 'fs'; import path from 'path';
const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--no-sandbox']});
const pg=await b.newPage({viewport:{width:1440,height:1440}}); pg.on('pageerror',e=>console.log('[err]',e.message));
await pg.goto('file://'+path.resolve('film.html')); await pg.waitForFunction('window.READY===true');
const d=await pg.evaluate(()=>renderPlate()); fs.writeFileSync('assets/bubbles.jpg',Buffer.from(d.split(',')[1],'base64'));
const w=await pg.evaluate(()=>renderWall(3)); fs.writeFileSync(process.argv[2]+'/wall_test.jpg',Buffer.from(w.split(',')[1],'base64'));
await b.close();
