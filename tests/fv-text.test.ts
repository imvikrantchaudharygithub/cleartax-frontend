import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  splitHeading,
  splitStat,
  plural,
  formatINR,
  formatFromPrice,
  formatStatValue,
  sanitizeStatPrefix,
  heroSubline,
} from '../app/lib/fv/text';

test('splitHeading splits after the first sentence', () => {
  assert.deepEqual(splitHeading('Smart Finance. Strong Compliance.'), ['Smart Finance.', 'Strong Compliance.']);
  assert.deepEqual(splitHeading('Wait! Really now'), ['Wait!', 'Really now']);
});

test('splitHeading halves long single sentences; line 2 never starts with a joiner', () => {
  assert.deepEqual(splitHeading('Your Complete Tax & Compliance Solution'), ['Your Complete Tax &', 'Compliance Solution']);
  assert.deepEqual(splitHeading('Start Your Business The Right Way'), ['Start Your Business', 'The Right Way']);
});

test('splitHeading keeps short or empty headings on one line', () => {
  assert.deepEqual(splitHeading('Hello world'), ['Hello world', '']);
  assert.deepEqual(splitHeading('   '), ['', '']);
  assert.deepEqual(splitHeading(undefined as unknown as string), ['', '']);
});

test('splitStat separates a leading number token', () => {
  assert.deepEqual(splitStat('1M+ Invoices Processed'), { value: '1M+', label: 'Invoices Processed' });
  assert.deepEqual(splitStat('  50,000+   Registrations '), { value: '50,000+', label: 'Registrations' });
  assert.deepEqual(splitStat('5K+'), { value: '5K+', label: '' });
  assert.deepEqual(splitStat('Expert CA Team'), { value: '', label: 'Expert CA Team' });
});

test('plural', () => {
  assert.equal(plural(1, 'service'), '1 service');
  assert.equal(plural(0, 'service'), '0 services');
  assert.equal(plural(22, 'service'), '22 services');
});

test('formatINR uses Indian grouping', () => {
  assert.equal(formatINR(6999), '₹6,999');
  assert.equal(formatINR(150000), '₹1,50,000');
  assert.equal(formatINR(299.6), '₹300');
});

test('formatFromPrice returns null for missing or non-positive prices', () => {
  assert.equal(formatFromPrice({ min: 4999 }), '₹4,999');
  assert.equal(formatFromPrice({ min: 0 }), null);
  assert.equal(formatFromPrice({}), null);
  assert.equal(formatFromPrice(null), null);
});

test('stat prefix: ₹ is stripped from count-like labels only', () => {
  assert.equal(sanitizeStatPrefix({ value: 1000, prefix: '₹', label: 'Companies Incorporated' }), '');
  assert.equal(sanitizeStatPrefix({ value: 27, prefix: '₹', label: 'Trade Value' }), '₹');
});

test('formatStatValue keeps decimals and Indian grouping', () => {
  assert.equal(formatStatValue({ value: 99.99, suffix: '%' }), '99.99%');
  assert.equal(formatStatValue({ value: 1000, prefix: '₹', suffix: '+', label: 'Companies Incorporated' }), '1,000+');
  assert.equal(formatStatValue({ value: 50000, suffix: '+' }), '50,000+');
  assert.equal(formatStatValue({ value: 24, suffix: '*7' }), '24*7');
  assert.equal(formatStatValue({ value: 27, prefix: '₹', suffix: 'Cr+', label: 'Trade Value' }), '₹27Cr+');
});

test('heroSubline returns the 2nd paragraph, else the 1st', () => {
  assert.equal(heroSubline('A.\r\n\r\nB.'), 'B.');
  assert.equal(heroSubline('A.\n\nB.\n\nC.'), 'B.');
  assert.equal(heroSubline('Only one.'), 'Only one.');
  assert.equal(heroSubline('  \n\n  B  '), 'B');
});

test('heroSubline returns an empty string for missing text', () => {
  assert.equal(heroSubline(''), '');
  assert.equal(heroSubline(undefined), '');
  assert.equal(heroSubline(null), '');
});

test('splitHeading splits after the comma nearest the middle (live solution headings)', () => {
  assert.deepEqual(splitHeading('Stay GST Compliant, Month After Month'), ['Stay GST Compliant,', 'Month After Month']);
  assert.deepEqual(splitHeading('File Right, Pay Only What You Owe'), ['File Right,', 'Pay Only What You Owe']);
  assert.deepEqual(splitHeading('Own Your Name, Your Ideas, Your Work'), ['Own Your Name,', 'Your Ideas, Your Work']);
  assert.deepEqual(splitHeading('Pay Your Team Right, Stay Compliant'), ['Pay Your Team Right,', 'Stay Compliant']);
});

test('splitHeading without a comma keeps the halving rule (home output unchanged)', () => {
  assert.deepEqual(splitHeading('Start Your Business The Right Way'), ['Start Your Business', 'The Right Way']);
  assert.deepEqual(splitHeading('Keep Your Company in Good Standing'), ['Keep Your Company', 'in Good Standing']);
  assert.deepEqual(splitHeading('Your Complete Tax & Compliance Solution'), ['Your Complete Tax &', 'Compliance Solution']);
  assert.deepEqual(splitHeading('Professional Services'), ['Professional Services', '']);
});

test('splitHeading comma edge cases fall back to the halving rule', () => {
  // trailing comma: nothing after it
  assert.deepEqual(splitHeading('Alpha Beta Gamma Delta,'), ['Alpha Beta', 'Gamma Delta,']);
  // comma leaving a 1-word line
  assert.deepEqual(splitHeading('Hello, brave new world today'), ['Hello, brave new', 'world today']);
  assert.deepEqual(splitHeading('Alpha beta gamma delta, epsilon'), ['Alpha beta gamma', 'delta, epsilon']);
  // sentence rule still wins over commas
  assert.deepEqual(splitHeading('Smart, Fast. Strong Compliance'), ['Smart, Fast.', 'Strong Compliance']);
});
