#!/usr/bin/env node
/**
 * Screenshot + horizontal-overflow audit for the L3 redesign.
 *   node scripts/fv-audit.cjs [baseUrl] [outDir]
 * Needs the site running, Google Chrome installed, and playwright-core from the npx cache
 * (override with PLAYWRIGHT_CORE=/path/to/playwright-core, CHROME_PATH=/path/to/chrome).
 * Routes: AUDIT_ROUTES="/,/services" to override. AUDIT_404_ROUTE names the route that must 404
 * (default /this-page-does-not-exist); every other route must answer 2xx. A failed load or a wrong
 * status is a FAIL for that route and makes the exit code non-zero.
 *
 * Each route is loaded ONCE (the backend rate-limits to 300 requests / 15 min / IP), then the
 * viewport is resized through the 6 widths. Routes load sequentially with a pause between them.
 *
 * html/body clip horizontal overflow, so page scrollWidth can't detect it. Instead every visible
 * element is measured: its box (clipped by any overflow-hidden/clip ancestor below <body>) must not
 * end more than 1px past the viewport. Descendants of horizontal scroll containers
 * (overflow-x: auto|scroll) and of visually-hidden (sr-only) elements are skipped.
 */
const fs = require('fs');
const os = require('os');
const path = require('path');

const PW = process.env.PLAYWRIGHT_CORE || path.join(os.homedir(), '.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');
const { chromium } = require(PW);

const BASE = process.argv[2] || 'http://localhost:3000';
const OUT = process.argv[3] || path.join(process.cwd(), '.audit');
const WIDTHS = [1440, 1280, 1100, 820, 500, 390];
const HEIGHT = 900;
const ROUTE_PAUSE_MS = 2000;
const RESIZE_WAIT_MS = 400;
const ROUTES = (
  process.env.AUDIT_ROUTES ||
  [
    '/',
    '/services',
    '/services?q=GST',
    '/services/gst',
    '/services/ipo',
    '/services/ipo/pre-ipo-restructuring',
    '/services/gst/registration',
    '/services/registration/digital-signature-certificate-dsc-registration',
    '/services/ipo/pre-ipo-restructuring/capital-restructuring-share-reclassification',
    '/calculators',
    '/calculators/income-tax',
    '/calculators/gst',
    '/calculators/emi',
    '/calculators/hra',
    '/calculators/tds',
    '/blog',
    '/blog/new-tax-slabs-in-union-budget-202728-complete-guide-for-taxpayers',
    '/team',
    '/team/legal-team-akash-kumar',
    '/contact',
    '/compliance',
    '/login',
    '/signup',
    '/privacy',
    '/terms',
    '/cookies',
    '/this-page-does-not-exist',
  ].join(',')
).split(',');

// The one route that must answer 404 (not-found page check); every other route must answer 2xx.
const NOT_FOUND_ROUTE = process.env.AUDIT_404_ROUTE || '/this-page-does-not-exist';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const fileFor = (route, width) =>
  `${route === '/' ? 'home' : route.replace(/^\//, '').replace(/[^a-z0-9-]+/gi, '_')}-${width}.png`;

/** Runs in the page. Returns offenders whose parent is not itself an offender. */
function measure() {
  const vw = document.documentElement.clientWidth;
  const isVisuallyHidden = (el, cs) =>
    el.classList.contains('sr-only') ||
    (cs.position === 'absolute' && parseFloat(cs.width) <= 1 && parseFloat(cs.height) <= 1 && cs.overflow === 'hidden') ||
    /rect\(0(px)?,? 0(px)?,? 0(px)?,? 0(px)?\)/.test(cs.clip) ||
    cs.clipPath === 'inset(50%)';
  const label = (el) => {
    const cls = [...el.classList].slice(0, 4).join('.');
    return `${el.tagName.toLowerCase()}${el.id ? '#' + el.id : ''}${cls ? '.' + cls : ''}`;
  };
  const offenders = new Set();
  const clippedOnly = [];
  for (const el of document.querySelectorAll('body *')) {
    const box = el.getBoundingClientRect();
    if (!box.width || !box.height || box.right <= vw + 1) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'contents' || isVisuallyHidden(el, cs)) continue;
    let skip = false;
    let right = box.right;
    let opacity = parseFloat(cs.opacity);
    for (let p = el.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
      const pcs = getComputedStyle(p);
      if (/(auto|scroll)/.test(pcs.overflowX) || isVisuallyHidden(p, pcs)) {
        skip = true;
        break;
      }
      opacity = Math.min(opacity, parseFloat(pcs.opacity));
      if (/(hidden|clip)/.test(pcs.overflowX)) right = Math.min(right, p.getBoundingClientRect().right);
    }
    if (skip || opacity === 0) continue;
    if (right <= vw + 1) {
      clippedOnly.push(label(el));
      continue;
    }
    offenders.add(el);
  }
  const top = [...offenders].filter((el) => !offenders.has(el.parentElement));
  const describe = (el) => {
    const chain = [];
    for (let p = el.parentElement, i = 0; p && p !== document.body && i < 2; p = p.parentElement, i++) chain.unshift(label(p));
    const text = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 50);
    return `${chain.join(' > ')} > ${label(el)} →${Math.round(el.getBoundingClientRect().right)}px${text ? ` "${text}"` : ''}`;
  };
  return {
    vw,
    scrollW: document.documentElement.scrollWidth,
    total: offenders.size,
    offenders: top.slice(0, 6).map(describe),
    clippedOnly: clippedOnly.length,
    h1: (document.querySelector('h1') || {}).textContent?.replace(/\s+/g, ' ').trim().slice(0, 60) || null,
  };
}

async function scrollThrough(page) {
  // Trigger whileInView reveals / lazy images so they are measured in their final state.
  await page.evaluate(async () => {
    const step = Math.max(300, innerHeight - 100);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 60));
    }
    window.scrollTo(0, 0);
  });
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });
  let failures = 0;
  let loadFailures = 0;
  let pageLoads = 0;
  let apiRequests = 0;
  const table = [];
  for (const [i, route] of ROUTES.entries()) {
    if (i > 0) await sleep(ROUTE_PAUSE_MS);
    const context = await browser.newContext({ viewport: { width: WIDTHS[0], height: HEIGHT } });
    const page = await context.newPage();
    const errors = [];
    let routeApi = 0;
    page.on('request', (req) => {
      if (/:4000\//.test(req.url()) || /api\.finvidhi\.com/.test(req.url())) routeApi += 1;
    });
    page.on('pageerror', (e) => errors.push(e.message.slice(0, 140)));
    pageLoads += 1;
    // A failed load or an unexpected status is a FAIL for the route (its widths are skipped).
    // goto waits for `load` so the document response is always captured (redirects are followed:
    // status is the final response's); network-idle is a separate soft wait, because some pages
    // never go idle (e.g. hanging prefetches of /auth/* links on /login and /signup).
    let status = null;
    let loadError = null;
    try {
      const res = await page.goto(BASE + route, { waitUntil: 'load', timeout: 60000 });
      if (res) status = res.status();
      else loadError = 'no response';
    } catch (e) {
      loadError = e.message.split('\n')[0];
    }
    const expect404 = route === NOT_FOUND_ROUTE;
    const statusOk = status !== null && (expect404 ? status === 404 : status >= 200 && status < 300);
    if (loadError || !statusOk) {
      const why = loadError ? `load failed: ${loadError}` : `HTTP ${status}, expected ${expect404 ? '404' : '2xx'}`;
      failures += 1;
      loadFailures += 1;
      console.log(`FAIL load ${route}  ${why}`);
      table.push({ route, status, widths: {}, loadFailed: why });
      apiRequests += routeApi;
      await context.close();
      continue;
    }
    await page
      .waitForLoadState('networkidle', { timeout: 60000 })
      .catch(() => console.log(`  warn ${route}: network not idle after 60s (measuring anyway)`));
    await page.waitForTimeout(800);
    const row = { route, status, widths: {} };
    for (const width of WIDTHS) {
      if (width !== WIDTHS[0]) {
        await page.setViewportSize({ width, height: HEIGHT });
        await page.waitForTimeout(RESIZE_WAIT_MS);
      }
      await scrollThrough(page);
      await page.waitForTimeout(RESIZE_WAIT_MS);
      const r = await page.evaluate(measure);
      const ok = r.total === 0;
      if (!ok) failures += 1;
      row.widths[width] = ok ? 'ok' : 'FAIL';
      await page.screenshot({ path: path.join(OUT, fileFor(route, width)), fullPage: true });
      console.log(
        `${ok ? 'ok  ' : 'FAIL'} ${String(width).padStart(4)}px ${route}  [${status}] vw=${r.vw} scrollW=${r.scrollW} clipped=${r.clippedOnly}` +
          (width === WIDTHS[0] ? ` h1="${r.h1}"` : '') +
          (ok ? '' : `\n       ${r.total} overflowing element(s); outermost:\n       - ${r.offenders.join('\n       - ')}`),
      );
    }
    apiRequests += routeApi;
    if (errors.length) console.log(`  pageerrors ${route}: ${errors.slice(0, 3).join(' | ')}`);
    console.log(`  (${route}: ${routeApi} backend request(s) from the browser)`);
    table.push(row);
    await context.close();
  }
  await browser.close();

  console.log('\n| Route | ' + WIDTHS.join(' | ') + ' |');
  console.log('|---|' + WIDTHS.map(() => '---').join('|') + '|');
  for (const row of table) {
    const cells = row.loadFailed ? WIDTHS.map(() => 'LOAD FAIL') : WIDTHS.map((w) => row.widths[w] || '-');
    console.log(`| \`${row.route}\` | ${cells.join(' | ')} |${row.loadFailed ? ` ${row.loadFailed}` : ''}`);
  }
  console.log(`\nPage loads: ${pageLoads} (routes: ${ROUTES.length}); browser-side backend requests: ${apiRequests}`);
  const overflowFailures = failures - loadFailures;
  console.log(
    failures
      ? `${failures} failure(s): ${loadFailures} route load/status failure(s), ${overflowFailures} overflow failure(s)`
      : 'All routes loaded with the expected status; no horizontal overflow on any route/width.',
  );
  process.exit(failures ? 1 : 0);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
