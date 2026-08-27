// One-off ops script: populate ~450 services from finvidhi services.xlsx as unpublished drafts.
//
// Credentials come from the environment — never hardcode them here, this file is
// in version control.
//
//   ADMIN_EMAIL='admin@example.com' ADMIN_PASSWORD='…' \
//     node "scripts-populate-finvidhi-services.js"
//
// Optional overrides: API_BASE (default http://localhost:4000/api),
// EXCEL_PATH (default ~/Downloads/finvidhi services.xlsx).
const XLSX = require('xlsx');
const fs = require('fs');
const os = require('os');
const path = require('path');

const API_BASE = process.env.API_BASE || 'http://localhost:4000/api';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const EXCEL_PATH =
  process.env.EXCEL_PATH || path.join(os.homedir(), 'Downloads', 'finvidhi services.xlsx');
const BACKUP_PATH = EXCEL_PATH.replace(/\.xlsx$/, `.backup-${Date.now()}.xlsx`);

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    'Missing credentials. Set ADMIN_EMAIL and ADMIN_PASSWORD in the environment:\n' +
      "  ADMIN_EMAIL='admin@example.com' ADMIN_PASSWORD='…' node \"scripts-populate-finvidhi-services.js\""
  );
  process.exit(1);
}

let TOKEN = null;

async function login() {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const json = await res.json();
  if (!json.success) throw new Error('Login failed: ' + JSON.stringify(json));
  TOKEN = json.data.accessToken;
}

async function api(pathname, opts = {}) {
  const res = await fetch(`${API_BASE}${pathname}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
      ...(opts.headers || {}),
    },
  });
  if (res.status === 401) {
    await login();
    return api(pathname, opts);
  }
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.success === false) {
    const msg = json.message || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return json;
}

const slugify = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// New categories to create if missing (id -> definition)
const NEW_CATEGORIES = {
  mca: {
    id: 'mca',
    title: 'MCA & Company Law Compliance',
    description: 'Company incorporation, ROC filings, director and share compliance, and corporate restructuring under the Companies Act.',
    iconName: 'Building2',
    heroTitle: 'MCA & Company Law Compliance',
    heroDescription: 'End-to-end assistance with incorporation, annual filings, director changes, share capital, and MCA/ROC compliance.',
    categoryType: 'simple',
  },
  fssai: {
    id: 'fssai',
    title: 'FSSAI Registration & Compliance',
    description: 'FSSAI registration, licensing, renewals, and food-safety compliance for food businesses of every scale.',
    iconName: 'ShieldCheck',
    heroTitle: 'FSSAI Registration & Compliance',
    heroDescription: 'Complete support for FSSAI basic registration, state and central licenses, renewals, and regulatory compliance.',
    categoryType: 'simple',
  },
  ngo: {
    id: 'ngo',
    title: 'NGO & Trust Services',
    description: 'NGO, trust, and society registration along with 12A, 80G, FCRA, and ongoing compliance support.',
    iconName: 'Users',
    heroTitle: 'NGO & Trust Services',
    heroDescription: 'Registration, tax-exemption approvals, FCRA compliance, and annual filings for NGOs, trusts, and societies.',
    categoryType: 'simple',
  },
  'accounting-hr': {
    id: 'accounting-hr',
    title: 'Accounting & HR Services',
    description: 'Bookkeeping, financial reporting, payroll, and HR compliance services for growing businesses.',
    iconName: 'ClipboardList',
    heroTitle: 'Accounting & HR Services',
    heroDescription: 'Outsourced accounting, payroll, and HR compliance so you can focus on running the business.',
    categoryType: 'simple',
  },
  'corporate-tax-advisory': {
    id: 'corporate-tax-advisory',
    title: 'Corporate Tax Advisory',
    description: 'Legal advisory on corporate taxation, planning, transfer pricing, and M&A tax structuring.',
    iconName: 'Scale',
    heroTitle: 'Corporate Tax Advisory',
    heroDescription: 'Expert legal guidance on corporate tax planning, structuring, and cross-border tax matters.',
    categoryType: 'legal',
  },
  'post-ipo-rta-services': {
    id: 'post-ipo-rta-services',
    title: 'Post-IPO & RTA Services',
    description: 'Post-listing shareholder services: share transfers, dematerialization, dividends, and RTA compliance support.',
    iconName: 'FileSpreadsheet',
    heroTitle: 'Post-IPO & RTA Services',
    heroDescription: 'Registrar & transfer agent support for listed companies — shareholder records, corporate actions, and investor servicing.',
    categoryType: 'ipo',
  },
};

// Legal sheet (25 items) -> subcategory id under categoryType 'legal'
const LEGAL_BUCKETS = {
  'Corporate Tax Advisory': 'corporate-tax-advisory',
  'Corporate Tax Litigation': 'tax-litigation',
  'Income Tax Assessment Representation': 'tax-litigation',
  'Tax Notice & Reply Services': 'tax-litigation',
  'Tax Appeals & Tribunal Matters': 'tax-litigation',
  'Corporate Tax Planning': 'corporate-tax-advisory',
  'International Tax Advisory': 'corporate-tax-advisory',
  'Transfer Pricing Legal Advisory': 'corporate-tax-advisory',
  'Withholding Tax Advisory': 'corporate-tax-advisory',
  'Corporate Tax Due Diligence': 'corporate-tax-advisory',
  'Tax Indemnity & Transaction Structuring': 'corporate-tax-advisory',
  'Merger & Acquisition Tax Advisory': 'corporate-tax-advisory',
  'Corporate Restructuring Tax Advisory': 'corporate-tax-advisory',
  'Capital Gains Tax Advisory': 'corporate-tax-advisory',
  'Tax Exemption & Incentive Advisory': 'corporate-tax-advisory',
  'Tax Settlement & Dispute Resolution': 'tax-litigation',
  'Corporate Finance Legal Advisory': 'corporate-commercial-law',
  'Loan & Financing Documentation': 'corporate-commercial-law',
  'Banking & Financial Transactions': 'corporate-commercial-law',
  'Corporate Debt Restructuring': 'corporate-commercial-law',
  'Securities & Investment Advisory': 'corporate-commercial-law',
  'Shareholders & Investment Agreements': 'corporate-commercial-law',
  'Financial Regulatory Compliance': 'corporate-commercial-law',
  'Corporate Guarantees & Securities': 'corporate-commercial-law',
  'Tax & Finance Legal Due Diligence': 'corporate-tax-advisory',
};

// IPO sheet (70 items) -> subcategory id under categoryType 'ipo'
const IPO_ADVISORY = new Set([
  'IPO Readiness Assessment', 'IPO Regulatory Compliance', 'Draft Red Herring Prospectus',
  'Red Herring Prospectus', 'IPO Prospectus Preparation', 'SEBI Compliance Advisory',
  'Stock Exchange Listing Compliance', 'Corporate Governance Advisory', 'IPO ESOP Compliance',
  'IPO Corporate Secretarial Support', 'IPO Board & Shareholder Approvals', 'IPO Legal Documentation',
  'IPO Regulatory Representation',
]);
const IPO_DUE_DILIGENCE = new Set([
  'IPO Legal Due Diligence', 'IPO Offer Document Review', 'IPO Due Diligence Certificate',
  'Promoter Compliance Review', 'IPO Related Party Review', 'IPO Litigation Review',
  'IPO Contract Review', 'IPO Intellectual Property Review', 'IPO Employment Law Review',
  'IPO Tax Due Diligence', 'IPO Financial Due Diligence',
]);
const IPO_RESTRUCTURING = new Set([
  'IPO Corporate Restructuring', 'IPO Shareholder Restructuring', 'Capital Structure Review',
  'IPO Tax Structuring', 'IPO Share Capital Compliance',
]);
// Everything else in the IPO sheet (post-listing / RTA work) -> post-ipo-rta-services

// Banking sheet (40 items) -> subcategory id under categoryType 'banking-finance'
const BANKING_PROJECT_FINANCE = new Set([
  'Bank Finance Proposal', 'CMA Data Preparation', 'Project Finance',
]);
// Everything else in the Banking sheet -> loan-credit-facilities

const SHEETS = [
  { name: 'Registration Service', kind: 'simple', categoryId: 'registration', categoryTitle: 'Registration' },
  { name: 'GST Services', kind: 'simple', categoryId: 'gst', categoryTitle: 'GST Services' },
  { name: 'Income Tax', kind: 'simple', categoryId: 'income-tax', categoryTitle: 'Income Tax Services' },
  { name: 'Trade Mark', kind: 'simple', categoryId: 'trademarks', categoryTitle: 'Trademark & IP Services' },
  { name: 'MCA', kind: 'simple', categoryId: 'mca', categoryTitle: 'MCA & Company Law Compliance' },
  { name: 'FSSAI', kind: 'simple', categoryId: 'fssai', categoryTitle: 'FSSAI Registration & Compliance' },
  { name: 'NGO', kind: 'simple', categoryId: 'ngo', categoryTitle: 'NGO & Trust Services' },
  { name: 'Accounting & HR Services', kind: 'simple', categoryId: 'accounting-hr', categoryTitle: 'Accounting & HR Services' },
  {
    name: 'Legal',
    kind: 'sub',
    categoryType: 'legal',
    categoryTitle: 'Legal Services',
    bucket: (title) => LEGAL_BUCKETS[title] || 'corporate-tax-advisory',
  },
  {
    name: 'IPO',
    kind: 'sub',
    categoryType: 'ipo',
    categoryTitle: 'IPO Services',
    bucket: (title) => {
      if (IPO_ADVISORY.has(title)) return 'advisory-strategy';
      if (IPO_DUE_DILIGENCE.has(title)) return 'due-diligence';
      if (IPO_RESTRUCTURING.has(title)) return 'restructuring';
      return 'post-ipo-rta-services';
    },
  },
  {
    name: 'Banking',
    kind: 'sub',
    categoryType: 'banking-finance',
    categoryTitle: 'Banking & Finance Services',
    bucket: (title) => (BANKING_PROJECT_FINANCE.has(title) ? 'project-finance-funding' : 'loan-credit-facilities'),
  },
];

const SUBCATEGORY_TITLES = {
  'tax-litigation': 'Tax Litigation',
  'corporate-commercial-law': 'Corporate & Commercial Law',
  'corporate-tax-advisory': 'Corporate Tax Advisory',
  'advisory-strategy': 'IPO Advisory & Strategy',
  'due-diligence': 'Financial Due Diligence',
  'restructuring': 'Pre-IPO Restructuring',
  'post-ipo-rta-services': 'Post-IPO & RTA Services',
  'project-finance-funding': 'Project Finance & Funding',
  'loan-credit-facilities': 'Loan & Credit Facilities',
};

async function ensureCategories() {
  const res = await api('/services/categories');
  const existingIds = new Set(res.data.map((c) => c.id));
  for (const [id, def] of Object.entries(NEW_CATEGORIES)) {
    if (existingIds.has(id)) {
      console.log(`[category] ${id} already exists, skipping`);
      continue;
    }
    await api('/services/categories', { method: 'POST', body: JSON.stringify(def) });
    console.log(`[category] created ${id}`);
  }
}

const CONTENT_DIR = path.join(__dirname, 'finvidhi-service-content');

function loadContentFor(sheetName) {
  const file = path.join(CONTENT_DIR, `${slugify(sheetName)}.json`);
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

async function createSimpleService(categoryId, title, details) {
  const body = { title, category: categoryId, status: 'draft', ...details };
  const res = await api('/services', { method: 'POST', body: JSON.stringify(body) });
  return res.data;
}

async function createSubService(categoryType, subcategoryId, title, details) {
  const slug = slugify(title);
  const res = await api(`/services/${categoryType}/${subcategoryId}/${slug}`, {
    method: 'POST',
    body: JSON.stringify({ title, status: 'draft', ...details }),
  });
  return res.data;
}

async function withRetry(fn, label) {
  try {
    return await fn();
  } catch (err) {
    console.warn(`  retrying after error (${label}): ${err.message}`);
    await new Promise((r) => setTimeout(r, 3000));
    return fn();
  }
}

function setCell(ws, col, rowIdx, value) {
  const addr = XLSX.utils.encode_cell({ c: col, r: rowIdx });
  ws[addr] = { t: 's', v: String(value) };
  const range = XLSX.utils.decode_range(ws['!ref']);
  if (col > range.e.c) range.e.c = col;
  if (rowIdx > range.e.r) range.e.r = rowIdx;
  ws['!ref'] = XLSX.utils.encode_range(range);
}

async function main() {
  fs.copyFileSync(EXCEL_PATH, BACKUP_PATH);
  console.log('Backed up original to', BACKUP_PATH);

  await login();
  console.log('Logged in as admin');
  await ensureCategories();

  const wb = XLSX.readFile(EXCEL_PATH);

  const onlySheets = process.argv.slice(2);
  const sheetsToRun = onlySheets.length
    ? SHEETS.filter((s) => onlySheets.includes(s.name))
    : SHEETS;

  let total = 0;
  let done = 0;
  let errors = 0;
  let skipped = 0;
  const startedAt = Date.now();

  for (const sheetCfg of sheetsToRun) {
    const ws = wb.Sheets[sheetCfg.name];
    if (!ws) {
      console.warn(`Sheet not found: ${sheetCfg.name}`);
      continue;
    }
    const initialRange = XLSX.utils.decode_range(ws['!ref']);
    const startRow = initialRange.s.r; // 0-indexed absolute row of the header
    // Reuse an existing "Status" column if this sheet was already processed before;
    // otherwise append one past the sheet's current last used column. Recomputing
    // range.e.c + 1 unconditionally on every run would drift the column rightward
    // each time, since the Status column itself becomes part of the range.
    let statusCol = initialRange.e.c + 1;
    for (let c = initialRange.s.c; c <= initialRange.e.c; c++) {
      const cell = ws[XLSX.utils.encode_cell({ c, r: startRow })];
      if (cell && cell.v === 'Status') {
        statusCol = c;
        break;
      }
    }
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    setCell(ws, statusCol, startRow, 'Status');
    const content = loadContentFor(sheetCfg.name);

    for (let r = 1; r < rows.length; r++) {
      const absRow = startRow + r;
      const [no, title] = rows[r];
      if (!title) continue;
      total++;

      const existingStatus = ws[XLSX.utils.encode_cell({ c: statusCol, r: absRow })]?.v || '';
      if (existingStatus.startsWith('Done')) continue; // resumability

      const details = content[title];
      if (!details) {
        skipped++;
        continue; // no authored content yet for this title
      }

      const t0 = Date.now();
      const attempt = () =>
        sheetCfg.kind === 'simple'
          ? createSimpleService(sheetCfg.categoryId, title, details)
          : createSubService(sheetCfg.categoryType, sheetCfg.bucket(title), title, details);

      try {
        let created;
        try {
          created = await attempt();
        } catch (err) {
          if (/already exists/i.test(err.message)) throw err; // don't retry duplicates
          created = await withRetry(attempt, `${sheetCfg.name} > ${title}`);
        }
        const secs = ((Date.now() - t0) / 1000).toFixed(1);
        setCell(ws, statusCol, absRow, `Done (${created._id || created.id || ''})`);
        done++;
        console.log(`[${total}] OK  ${sheetCfg.name} > ${title} (${secs}s)`);
      } catch (err) {
        if (/already exists/i.test(err.message)) {
          setCell(ws, statusCol, absRow, 'Done (already existed)');
          done++;
          console.log(`[${total}] SKIP ${sheetCfg.name} > ${title}: already exists`);
        } else {
          setCell(ws, statusCol, absRow, `Error: ${err.message}`.slice(0, 200));
          errors++;
          console.error(`[${total}] ERR ${sheetCfg.name} > ${title}: ${err.message}`);
        }
      }

      XLSX.writeFile(wb, EXCEL_PATH);
    }
  }

  const mins = ((Date.now() - startedAt) / 60000).toFixed(1);
  console.log(`\nFinished in ${mins} min. done=${done} errors=${errors} skipped(no content yet)=${skipped} total=${total}`);
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

module.exports = { login, ensureCategories, createSimpleService, createSubService };
