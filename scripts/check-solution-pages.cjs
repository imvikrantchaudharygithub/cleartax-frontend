#!/usr/bin/env node
/** Spec B4 (rendered half): open the first N service links of a solution and assert the service title is in an <h1>. */
const os = require('os');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_CORE || path.join(os.homedir(), '.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core'));

const SITE = process.argv[2] || 'http://localhost:3000';
const API = process.argv[3] || 'http://localhost:4000/api';
const SLUG = process.argv[4] || 'start-a-business';
const COUNT = Number(process.env.COUNT || 3);

(async () => {
  const detail = await (await fetch(`${API}/solutions/${SLUG}`)).json();
  const items = (detail?.data?.sections || []).flatMap((s) => s.items).slice(0, COUNT);
  if (!items.length) throw new Error(`No items for ${SLUG}`);
  const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  let failures = 0;
  for (const item of items) {
    const page = await browser.newPage();
    await page.goto(SITE + item.href, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForSelector('h1', { timeout: 15000 }).catch(() => {});
    const h1 = ((await page.textContent('h1').catch(() => '')) || '').trim();
    const ok = h1.toLowerCase().includes(item.title.toLowerCase());
    if (!ok) failures += 1;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${item.href}  h1="${h1}"`);
    await page.close();
  }
  await browser.close();
  process.exit(failures ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
