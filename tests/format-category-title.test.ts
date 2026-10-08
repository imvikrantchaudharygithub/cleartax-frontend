import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatCategoryTitle } from '../app/lib/utils/formatCategoryTitle';

// The /services/[category] metadata calls formatCategoryTitle(category.replace(/-/g, ' ')),
// so every slug is checked both raw and in that space-separated form.
const both = (slug: string, expected: string) => {
  assert.equal(formatCategoryTitle(slug), expected, slug);
  assert.equal(formatCategoryTitle(slug.replace(/-/g, ' ')), expected, slug.replace(/-/g, ' '));
};

test('new category slugs get their acronyms and phrase fix', () => {
  both('mca', 'MCA');
  both('accounting-hr', 'Accounting & HR');
  both('fssai', 'FSSAI');
  both('ngo', 'NGO');
});

test('existing category slugs are unchanged', () => {
  both('gst', 'GST');
  both('income-tax', 'Income Tax');
  both('banking-finance', 'Banking & Finance');
  both('registration', 'Registration');
  both('trademarks', 'Trademarks');
  both('ipo', 'IPO');
  both('legal', 'Legal');
});

test('API category titles for the new groups stay as written', () => {
  assert.equal(formatCategoryTitle('Accounting & HR Services'), 'Accounting & HR Services');
  assert.equal(formatCategoryTitle('MCA & Company Law Compliance'), 'MCA & Company Law Compliance');
  assert.equal(formatCategoryTitle('FSSAI Registration & Compliance'), 'FSSAI Registration & Compliance');
  assert.equal(formatCategoryTitle('NGO & Trust Services'), 'NGO & Trust Services');
});

test('empty input stays empty', () => {
  assert.equal(formatCategoryTitle(''), '');
  assert.equal(formatCategoryTitle(undefined), '');
  assert.equal(formatCategoryTitle(null), '');
});
