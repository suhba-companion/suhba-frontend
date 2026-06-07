import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 390, height: 844 });
await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(1500);

const nav = page.locator('nav').last();
const navBtns = nav.locator('button');

// Measure SPOTS
await navBtns.nth(1).click(); await page.waitForTimeout(1200);
const spotsHeader = await page.locator('.shrink-0').first().boundingBox();
const spotsFirstCard = await page.locator('li.rounded-card, li[class*="rounded-card"]').first().boundingBox();
console.log('=== SPOTS ===');
console.log('Header bottom:', spotsHeader ? Math.round(spotsHeader.y + spotsHeader.height) : '?');
console.log('First card top:', spotsFirstCard ? Math.round(spotsFirstCard.y) : '?');
console.log('Gap header→card:', spotsFirstCard && spotsHeader ? Math.round(spotsFirstCard.y - (spotsHeader.y + spotsHeader.height)) : '?');
console.log('Card left margin:', spotsFirstCard ? Math.round(spotsFirstCard.x) : '?');
console.log('Card right margin:', spotsFirstCard ? Math.round(390 - (spotsFirstCard.x + spotsFirstCard.width)) : '?');
const spotsCards = await page.locator('li.rounded-card, li[class*="rounded-card"]').all();
if (spotsCards.length >= 2) {
  const c1 = await spotsCards[0].boundingBox();
  const c2 = await spotsCards[1].boundingBox();
  if (c1 && c2) console.log('Gap card1→card2:', Math.round(c2.y - (c1.y + c1.height)));
}

// Measure EVENTS
await navBtns.nth(3).click(); await page.waitForTimeout(1200);
const evHeader = await page.locator('.shrink-0').first().boundingBox();
const evFirstCard = await page.locator('li.rounded-card, li[class*="rounded-card"]').first().boundingBox();
console.log('\n=== EVENTS ===');
console.log('Header bottom:', evHeader ? Math.round(evHeader.y + evHeader.height) : '?');
console.log('First card top:', evFirstCard ? Math.round(evFirstCard.y) : '?');
console.log('Gap header→card:', evFirstCard && evHeader ? Math.round(evFirstCard.y - (evHeader.y + evHeader.height)) : '?');
console.log('Card left margin:', evFirstCard ? Math.round(evFirstCard.x) : '?');
console.log('Card right margin:', evFirstCard ? Math.round(390 - (evFirstCard.x + evFirstCard.width)) : '?');
const evCards = await page.locator('li.rounded-card, li[class*="rounded-card"]').all();
if (evCards.length >= 2) {
  const c1 = await evCards[0].boundingBox();
  const c2 = await evCards[1].boundingBox();
  if (c1 && c2) console.log('Gap card1→card2:', Math.round(c2.y - (c1.y + c1.height)));
}

// Measure HALAL
await navBtns.nth(2).click(); await page.waitForTimeout(1200);
const halalHeader = await page.locator('.shrink-0').first().boundingBox();
// First regular card (li with rounded-card)
const halalCards = await page.locator('li.rounded-card, li[class*="rounded-card"]').all();
const hFirstCard = halalCards.length > 0 ? await halalCards[0].boundingBox() : null;
console.log('\n=== HALAL ===');
console.log('Header bottom:', halalHeader ? Math.round(halalHeader.y + halalHeader.height) : '?');
console.log('First regular card top:', hFirstCard ? Math.round(hFirstCard.y) : '?');
console.log('Gap header→first regular card:', hFirstCard && halalHeader ? Math.round(hFirstCard.y - (halalHeader.y + halalHeader.height)) : '?');
console.log('Card left margin:', hFirstCard ? Math.round(hFirstCard.x) : '?');
console.log('Card right margin:', hFirstCard ? Math.round(390 - (hFirstCard.x + hFirstCard.width)) : '?');
if (halalCards.length >= 2) {
  const c1 = await halalCards[0].boundingBox();
  const c2 = await halalCards[1].boundingBox();
  if (c1 && c2) console.log('Gap card1→card2:', Math.round(c2.y - (c1.y + c1.height)));
}

await browser.close();
