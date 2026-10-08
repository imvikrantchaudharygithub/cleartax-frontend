#!/usr/bin/env node
/* Independent black-box check of /services live chip counts. See
   .superpowers/sdd/2026-10-07-services-chip-counts/contract.md
   Usage: node scripts/check-service-chip-counts.cjs [site] [api] [--oracle-only]  */
const args = process.argv.slice(2);
const flags = args.filter(a => a.startsWith('--'));
const pos = args.filter(a => !a.startsWith('--'));
const SITE = (pos[0] || 'http://localhost:3000').replace(/\/$/, '');
const API = (pos[1] || 'http://localhost:4000/api').replace(/\/$/, '');
const ORACLE_ONLY = flags.includes('--oracle-only');
const { chromium } = require('/Users/vikrantchaudhary/.npm/_npx/e41f203b7505f1fb/node_modules/playwright-core');

const GROUPS = [
  ['gst', 'GST Services', c => c.categoryType === 'simple' && c.slug === 'gst-services'],
  ['income-tax', 'Income Tax', c => c.categoryType === 'simple' && c.slug === 'income-tax-services'],
  ['registration', 'Business Registration', c => c.categoryType === 'simple' && c.slug === 'registration'],
  ['trademarks', 'Trademarks & IP', c => c.categoryType === 'simple' && c.slug === 'trademark-ip-services'],
  ['legal', 'Legal Services', c => c.categoryType === 'legal'],
  ['ipo', 'IPO Services', c => c.categoryType === 'ipo'],
  ['banking-finance', 'Banking & Finance', c => c.categoryType === 'banking-finance'],
  ['mca', 'Company Law (MCA)', c => c.categoryType === 'simple' && c.slug === 'mca-company-law-compliance'],
  ['accounting-hr', 'Accounting & HR', c => c.categoryType === 'simple' && c.slug === 'accounting-hr-services'],
  ['fssai', 'FSSAI & Food', c => c.categoryType === 'simple' && c.slug === 'fssai-registration-compliance'],
  ['ngo', 'NGO & Trust', c => c.categoryType === 'simple' && c.slug === 'ngo-trust-services'],
];
const QUERIES = ['', 'gst', 'GST', ' gst ', 'gst ', 'tax', 'return', 'registration', 'trademark', 'itr', 'fssai', 'payroll', '&', 'a', 'zzz'];
const VIEWPORTS = [[1440, 900], [390, 844]];

let failures = 0;
const fail = m => { failures++; console.log('  FAIL ' + m); };
const plural = n => `${n} ${n === 1 ? 'service' : 'services'}`;

// ---------- oracle ----------
async function buildOracle() {
  let all = [], page = 1, totalPages = 1;
  do {
    const url = `${API}/services` + (page > 1 ? `?page=${page}` : '');
    const r = await fetch(url);
    if (!r.ok) throw new Error(`GET ${url} -> ${r.status}`);
    const j = await r.json();
    const arr = Array.isArray(j) ? j : (j.data || j.services || []);
    all = all.concat(arr);
    totalPages = (j.pagination && j.pagination.totalPages) || 1;
    page++;
  } while (page <= totalPages);
  const listable = all.filter(s => (s.id || s._id) && s.slug);
  const dropped = all.length - listable.length;
  const members = Object.fromEntries(GROUPS.map(g => [g[0], []]));
  const orphans = [], multi = [];
  for (const s of listable) {
    const c = s.categoryInfo || {};
    const hit = GROUPS.filter(g => g[2](c));
    if (hit.length === 0) orphans.push(s); else if (hit.length > 1) multi.push(s);
    if (hit.length) members[hit[0][0]].push(s);
  }
  const counts = q0 => {
    const q = String(q0).trim().toLowerCase();
    const out = {}; let sum = 0;
    for (const [id] of GROUPS) {
      out[id] = members[id].filter(s => q === '' || String(s.title || '').toLowerCase().includes(q) || String(s.shortDescription || '').toLowerCase().includes(q)).length;
      sum += out[id];
    }
    out.all = sum;
    return out;
  };
  return { raw: all.length, dropped, listable, members, orphans, multi, counts };
}
function expectedChips(o, q) {
  const c = o.counts(q), base = o.counts('');
  // a chip exists for every group that is non-empty in the full list; zero-count chips stay (contract: Counts)
  return [['all', 'All Services', c.all], ...GROUPS.filter(g => base[g[0]] > 0).map(g => [g[0], g[1], c[g[0]]])];
}

// ---------- browser helpers ----------
const raf2 = p => p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 50)))));
const raf1 = p => p.evaluate(() => new Promise(r => requestAnimationFrame(() => setTimeout(r, 50))));
const readChips = p => p.evaluate(() => {
  const root = document.querySelector('[role="group"][aria-label="Filter by category"]');
  if (!root) return null;
  return [...root.querySelectorAll('button[data-category-id]')].map(b => {
    const v = b.querySelector('[data-chip-count]');
    return { id: b.dataset.categoryId, dc: b.dataset.count, vis: v ? v.textContent.trim() : null,
      name: b.getAttribute('aria-label') || b.textContent.replace(/\s+/g, ' ').trim(), pressed: b.getAttribute('aria-pressed') };
  });
});
const cardCount = p => p.locator('section[aria-labelledby^="group-"] ul > li').count();
const readGroupSections = p => p.evaluate(() => [...document.querySelectorAll('section[aria-labelledby^="group-"]')].map(s => {
  const h = document.getElementById(s.getAttribute('aria-labelledby'));
  return { lid: s.getAttribute('aria-labelledby'), heading: h ? h.textContent.replace(/\s+/g, ' ').trim() : '', n: s.querySelectorAll('ul > li').length };
}));
async function setQuery(p, q) { await p.locator('#services-search').fill(q); await raf2(p); }

function checkChipSet(label, chips, exp) {
  if (!chips) return fail(`${label}: chip container missing`), false;
  const got = chips.map(c => c.id).join(','), want = exp.map(e => e[0]).join(',');
  if (got !== want) { fail(`${label}: chip set/order\n    want ${want}\n    got  ${got}`); return false; }
  return true;
}
function checkCounts(label, chips, exp, row) {
  const byId = Object.fromEntries(chips.map(c => [c.id, c]));
  for (const [id, lab, n] of exp) {
    const c = byId[id]; if (!c) continue;
    const wantName = `${lab}, ${plural(n)}`;
    const nameN = (c.name.match(/,\s*(\d+)\s+services?\s*$/) || [])[1];
    const ok = String(c.dc) === String(n) && c.vis === String(n) && c.name === wantName;
    row.push(`${id}:${n}/${c.dc}${ok ? '✓' : '✗'}`);
    if (String(c.dc) !== String(n)) fail(`${label} [${id}] data-count=${c.dc} want ${n}`);
    if (c.vis !== String(n)) fail(`${label} [${id}] visible=${JSON.stringify(c.vis)} want ${n}`);
    if (c.name !== wantName) fail(`${label} [${id}] name=${JSON.stringify(c.name)} want ${JSON.stringify(wantName)} (nameN=${nameN})`);
  }
}

async function browserRun(o) {
  const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  try {
    for (const [w, h] of VIEWPORTS) {
      console.log(`\n=== viewport ${w}x${h} ===`);
      const ctx = await browser.newContext({ viewport: { width: w, height: h } });
      const p = await ctx.newPage();
      await p.goto(`${SITE}/services`, { waitUntil: 'networkidle' });
      await p.waitForSelector('#services-search');
      for (const q of QUERIES) {
        const L = `${w} q=${JSON.stringify(q)}`;
        await setQuery(p, q);
        const exp = expectedChips(o, q);
        let chips = await readChips(p);
        const row = [];
        const setOk = checkChipSet(L, chips, exp);
        if (setOk) checkCounts(L, chips, exp, row);
        // selection independence + cards per chip (+ live region)
        for (const [id, lab, n] of exp) {
          await p.locator(`button[data-category-id="${id}"]`).click();
          await p.waitForTimeout(100);
          const cards = await cardCount(p);
          if (cards !== n) fail(`${L} chip ${id}: cards=${cards} want ${n}`);
          if (n === 0) {
            const txt = await p.evaluate(() => document.body.innerText);
            if (!/No services found/i.test(txt)) fail(`${L} chip ${id}: zero chip lacks "No services found"`);
          }
          const now = await readChips(p);
          if (id !== 'all' && now) {
            const sel = Object.fromEntries(now.map(c => [c.id, c.dc]));
            for (const [i2, , n2] of exp) if (String(sel[i2]) !== String(n2)) fail(`${L} sel=${id}: count of ${i2} changed to ${sel[i2]} want ${n2}`);
            const pr = now.find(c => c.id === id);
            if (!pr || pr.pressed !== 'true') fail(`${L} chip ${id} aria-pressed not true after click`);
          }
          await p.waitForTimeout(600);
          const ann = await p.locator('[data-results-announcement]').first().textContent().catch(() => null);
          const wantAnn = `${plural(n)} found`;
          if (!ann || ann.trim() !== wantAnn) fail(`${L} sel=${id}: announcement ${JSON.stringify(ann)} want ${JSON.stringify(wantAnn)}`);
        }
        await p.locator('button[data-category-id="all"]').click().catch(() => {});
        // layout
        const ov = await p.evaluate(() => {
          const cw = document.documentElement.clientWidth, bad = [];
          for (const e of document.querySelectorAll('body *')) {
            const r = e.getBoundingClientRect();
            if (r.width && r.right > cw + 1) bad.push(`${e.tagName.toLowerCase()}${e.className && typeof e.className === 'string' ? '.' + e.className.split(/\s+/)[0] : ''}@${Math.round(r.right)}`);
          }
          return { cw, sw: document.documentElement.scrollWidth, bad: bad.slice(0, 5), n: bad.length };
        });
        if (ov.n || ov.sw > ov.cw) fail(`${L} overflow: scrollWidth=${ov.sw} clientWidth=${ov.cw} offenders(${ov.n}): ${ov.bad.join(' ')}`);
        console.log(`${L}: ${row.join(' ') || '(no chip row)'}`);
      }
      // keystroke liveness at 1440
      if (w === 1440) {
        console.log('\n-- keystroke liveness --');
        await setQuery(p, '');
        const input = p.locator('#services-search');
        await input.focus();
        const check = async (lab, q) => {
          await raf1(p);
          const chips = await readChips(p), exp = expectedChips(o, q);
          const row = [];
          if (checkChipSet(`key ${lab}`, chips, exp)) checkCounts(`key ${lab}`, chips, exp, row);
          console.log(`key ${lab} q=${JSON.stringify(q)}: ${row.join(' ')}`);
        };
        let cur = '';
        for (const k of ['g', 's', 't']) { await p.keyboard.type(k); cur += k; await check(`type '${k}'`, cur); }
        for (let i = 0; i < 3; i++) { await p.keyboard.press('Backspace'); cur = cur.slice(0, -1); await check('backspace', cur); }
      }
      await ctx.close();
    }
  } finally { await browser.close(); }
}

// Phase A: compare oracle with today's per-group cards in the DOM
async function oracleVsDom(o) {
  const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  try {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const p = await ctx.newPage();
    await p.goto(`${SITE}/services`, { waitUntil: 'networkidle' });
    await p.waitForSelector('#services-search');
    for (const q of ['', 'gst']) {
      await p.locator('#services-search').fill(q); await p.waitForTimeout(700);
      const secs = await readGroupSections(p);
      const c = o.counts(q);
      console.log(`\nDOM sections for q=${JSON.stringify(q)}: ${secs.map(s => `${s.heading}=${s.n}`).join(' | ')}`);
      const norm = s => s.toLowerCase().replace(/[^a-z]/g, '');
      let domTotal = 0;
      for (const [id, lab] of GROUPS) {
        const s = secs.find(x => norm(x.heading).includes(norm(lab)) || x.lid === `group-${id}` || x.lid.endsWith(id));
        if (!s) { console.log(`  ${id}: oracle=${c[id]} dom=MISSING ${c[id] ? '(expected before S1 if mca/accounting-hr/fssai/ngo)' : '(oracle 0, fine)'}`); continue; }
        domTotal += s.n;
        console.log(`  ${id}: oracle=${c[id]} dom=${s.n} ${s.n === c[id] ? '✓' : '✗'}`);
      }
      console.log(`  oracle total=${c.all}  dom total (matched groups)=${domTotal}  all dom cards=${await cardCount(p)}`);
    }
  } finally { await browser.close(); }
}

(async () => {
  const o = await buildOracle();
  console.log(`API rows: ${o.raw}; dropped (no id/slug): ${o.dropped}; listable: ${o.listable.length}`);
  const e = o.counts('');
  console.log('Oracle empty-query group sizes: ' + GROUPS.map(g => `${g[0]}=${e[g[0]]}`).join(' ') + `  ALL=${e.all}`);
  const g = o.counts('gst');
  console.log("Oracle q='gst': " + GROUPS.map(x => `${x[0]}=${g[x[0]]}`).join(' ') + `  ALL=${g.all}`);
  for (const s of o.orphans) console.log(`FINDING orphan (no group): ${s.slug} ${JSON.stringify(s.categoryInfo)}`);
  for (const s of o.multi) console.log(`FINDING multi-group: ${s.slug} ${JSON.stringify(s.categoryInfo)}`);
  if (o.orphans.length || o.multi.length) failures++;
  if (e.all !== 493) console.log(`NOTE: total ${e.all} != contract's 493`);
  if (ORACLE_ONLY) { await oracleVsDom(o); process.exit(failures ? 1 : 0); }
  await browserRun(o);
  console.log(`\nSUMMARY: ${failures} failure(s)`);
  process.exit(failures ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
