import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 390, height: 844 });
await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(1500);

const nav = page.locator('nav').last();
const navBtns = nav.locator('button');

async function measurePage(name) {
  await page.waitForTimeout(1500);
  const cards = await page.locator('li').filter({ hasText: /./ }).all();
  const measured = [];
  for (const card of cards.slice(0, 5)) {
    const box = await card.boundingBox();
    if (box && box.width > 300) measured.push(box);
  }
  console.log(`\n=== ${name} ===`);
  for (let i = 0; i < measured.length; i++) {
    console.log(`Card ${i+1}: y=${Math.round(measured[i].y)}, height=${Math.round(measured[i].height)}, x=${Math.round(measured[i].x)}, width=${Math.round(measured[i].width)}`);
    if (i > 0) {
      const prev = measured[i-1];
      const gap = measured[i].y - (prev.y + prev.height);
      console.log(`  Gap from card ${i} to card ${i+1}: ${Math.round(gap)}px`);
    }
  }
}

await navBtns.nth(1).click(); await measurePage('SPOTS (Orte)');
await navBtns.nth(3).click(); await measurePage('EVENTS');
await navBtns.nth(2).click(); await measurePage('HALAL');

await browser.close();
