import puppeteer from 'puppeteer';
const URL = 'http://localhost:8900/index.html';
const browser = await puppeteer.launch({ headless: 'new', executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });

const desk = await browser.newPage();
await desk.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await desk.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 1500));
await desk.screenshot({ path: 'F:\\apex-cloudworks\\proyectos\\skindoctors\\melasblock\\ss_concept_hero.jpg', type: 'jpeg', quality: 90 });
await desk.screenshot({ path: 'F:\\apex-cloudworks\\proyectos\\skindoctors\\melasblock\\ss_concept_full.jpg', type: 'jpeg', quality: 85, fullPage: true });

const mob = await browser.newPage();
await mob.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await mob.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 1500));
await mob.screenshot({ path: 'F:\\apex-cloudworks\\proyectos\\skindoctors\\melasblock\\ss_concept_mobile.jpg', type: 'jpeg', quality: 90 });

await browser.close();
console.log('OK');
