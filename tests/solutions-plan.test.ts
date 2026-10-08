import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPlanMessage, initialSelection, planSections, planTotal, selectedItems } from '../app/lib/solutions/plan';

const item = (id: string, title: string, min: number) => ({ id, title, price: { min } });

test('planTotal sums positive starting prices only', () => {
  assert.equal(planTotal([item('a', 'A', 6999), item('b', 'B', 1500), item('c', 'C', 0), item('d', 'D', -5)]), 8499);
  assert.equal(planTotal([]), 0);
});

test('initialSelection pre-ticks popular services in order', () => {
  assert.deepEqual(
    initialSelection([
      { items: [{ id: 'a', popular: true }, { id: 'b', popular: false }] },
      { items: [{ id: 'c', popular: true }] },
    ]),
    ['a', 'c'],
  );
});

test('buildPlanMessage lists services with prices and the total', () => {
  assert.equal(
    buildPlanMessage('Start a Business', [item('a', 'Private Limited Company Registration', 6999), item('b', 'GST Registration', 1500)]),
    'Plan: Start a Business: Private Limited Company Registration (₹6,999), GST Registration (₹1,500). Starting total ₹8,499+',
  );
  assert.equal(buildPlanMessage('X', [item('a', 'Free thing', 0)]), 'Plan: X: Free thing (price on request). Starting total ₹0+');
});

test('buildPlanMessage never exceeds max and summarises the overflow', () => {
  const many = Array.from({ length: 22 }, (_, i) => item(String(i), `Very Long Service Name Number ${i} With Extra Words For Length`, 1000 + i));
  const message = buildPlanMessage('Start a Business', many, 1000);
  assert.ok(message.length <= 1000, `length ${message.length}`);
  assert.match(message, /…and \d+ more\. Starting total ₹22,231\+$/);
  const tiny = buildPlanMessage('Start a Business', many, 120);
  assert.ok(tiny.length <= 120, `length ${tiny.length}`);
});

test('buildPlanMessage with nothing selected', () => {
  assert.equal(buildPlanMessage('X', []), 'Plan: X (no services selected yet).');
});

test('buildPlanMessage with nothing selected still respects max', () => {
  assert.ok(buildPlanMessage('T'.repeat(2000), []).length <= 1000);
  assert.ok(buildPlanMessage('T'.repeat(2000), [], 50).length <= 50);
});

test('initialSelection de-duplicates ids across sections', () => {
  assert.deepEqual(
    initialSelection([
      { items: [{ id: 'a', popular: true }] },
      { items: [{ id: 'a', popular: true }, { id: 'b', popular: true }] },
    ]),
    ['a', 'b'],
  );
});

test('planTotal tolerates missing or NaN prices', () => {
  const bad = [
    { id: 'x', title: 'X' } as unknown as { id: string; title: string; price: { min: number } },
    { id: 'y', title: 'Y', price: { min: NaN } },
    item('z', 'Z', 100),
  ];
  assert.equal(planTotal(bad), 100);
});

test('buildPlanMessage with one oversized title stays within max', () => {
  const message = buildPlanMessage('Start', [item('a', 'W'.repeat(1500), 1000)]);
  assert.ok(message.length <= 1000, `length ${message.length}`);
});

// ── Task 10: the planner's pure rules ───────────────────────────────────────────────────────

test('planSections drops sections with no items (empty plan → "Talk to an expert")', () => {
  const sections = [
    { title: 'One', items: [{ id: 'a', popular: false }] },
    { title: 'Empty', items: [] },
    { title: 'Missing' } as unknown as { title: string; items: { id: string }[] },
  ];
  assert.deepEqual(
    planSections(sections).map((s) => s.title),
    ['One'],
  );
  assert.deepEqual(planSections([]), []);
  assert.deepEqual(planSections([{ title: 'Empty', items: [] }]), []);
  assert.deepEqual(planSections(undefined as unknown as []), []);
});

test('selectedItems keeps section order and lists a repeated service once', () => {
  const a = item('a', 'A', 100);
  const b = item('b', 'B', 200);
  const c = item('c', 'C', 300);
  const sections = [{ items: [a, b] }, { items: [c, a] }];
  assert.deepEqual(
    selectedItems(sections, new Set(['a', 'c'])).map((i) => i.id),
    ['a', 'c'],
  );
  assert.equal(planTotal(selectedItems(sections, new Set(['a', 'c']))), 400);
  assert.deepEqual(selectedItems(sections, new Set()), []);
  assert.deepEqual(selectedItems(sections, new Set(['zz'])), []);
});
