import puppeteer from 'puppeteer';
const URL = 'https://d3suiaystvdco4.cloudfront.net/melasblock/';
const browser = await puppeteer.launch({ headless: 'new', executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' });

// Desktop
const desk = await browser.newPage();
await desk.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
await desk.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 2500));
await desk.screenshot({ path: 'F:\\apex-cloudworks\\proyectos\\skindoctors\\melasblock\\ss_desktop.jpg', type: 'jpeg', quality: 90 });

// Mobile iPhone
const mob = await browser.newPage();
await mob.setViewport({ width: 390, height: 844, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await mob.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1');
await mob.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });
await new Promise(r => setTimeout(r, 2500));
await mob.screenshot({ path: 'F:\\apex-cloudworks\\proyectos\\skindoctors\\melasblock\\ss_mobile.jpg', type: 'jpeg', quality: 90 });

await browser.close();
console.log('OK');
