const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  try {
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 5000 });
    await new Promise(r => setTimeout(r, 2000));
  } catch (e) {
    console.log("Nav error", e);
  }
  await browser.close();
})();
