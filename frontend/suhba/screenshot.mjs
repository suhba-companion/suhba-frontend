import { chromium } from 'playwright';
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 390, height: 844 });
await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 15000 });
await page.waitForTimeout(1500);

// Use the bottom NavBar (lg:hidden) - target by nav aria-label
const nav = page.locator('nav').last();
const navBtns = nav.locator('button');
const count = await navBtns.count();
console.log('bottom nav buttons:', count);

// Orte (spots) - index 1
await navBtns.nth(1).click(); await page.waitForTimeout(1500);
await page.screenshot({ path: '/tmp/tab_spots.png' });
console.log('spots done');

// Halal - index 2
await navBtns.nth(2).click(); await page.waitForTimeout(1500);
await page.screenshot({ path: '/tmp/tab_halal.png' });
console.log('halal done');

// Events - index 3
await navBtns.nth(3).click(); await page.waitForTimeout(1500);
await page.screenshot({ path: '/tmp/tab_events.png' });
console.log('events done');

await browser.close();
