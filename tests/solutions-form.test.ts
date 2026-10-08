import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mapServerErrors, normalizeSolutionSlug, slugify, toFormValues, toPayload } from '../app/lib/solutions/form';

test('slugify', () => {
  assert.equal(slugify('Start a Business'), 'start-a-business');
  assert.equal(slugify('Tax & Compliance'), 'tax-and-compliance');
  assert.equal(slugify('  Go Public (IPO)!! '), 'go-public-ipo');
  assert.equal(slugify(''), '');
  assert.equal(slugify('x'.repeat(100)).length, 80);
});

test('normalizeSolutionSlug: lowercase hyphenated words up to 80 chars, else null (no fetch)', () => {
  assert.equal(normalizeSolutionSlug('start-a-business'), 'start-a-business');
  assert.equal(normalizeSolutionSlug('Start-A-Business'), 'start-a-business');
  assert.equal(normalizeSolutionSlug('gst2'), 'gst2');
  assert.equal(normalizeSolutionSlug('a'.repeat(80)), 'a'.repeat(80));
  assert.equal(normalizeSolutionSlug('a'.repeat(81)), null);
  for (const bad of ['', '-', 'a-', '-a', 'a--b', 'a_b', 'a b', 'wp-login.php', '..', '.', '%2e%2e', 'a/b', 'é', 'start-a-business\n']) {
    assert.equal(normalizeSolutionSlug(bad), null, JSON.stringify(bad));
  }
  assert.equal(normalizeSolutionSlug(undefined as unknown as string), null);
  assert.equal(normalizeSolutionSlug(42 as unknown as string), null);
});

test('mapServerErrors strips the body. prefix and keeps the first message per field', () => {
  assert.deepEqual(
    mapServerErrors([
      { field: 'body.sections.0.title', message: 'Section title must be at least 2 characters' },
      { field: 'slug', message: 'slug is already taken' },
      { field: 'slug', message: 'second message ignored' },
      { field: '', message: 'no field' },
    ]),
    { 'sections.0.title': 'Section title must be at least 2 characters', slug: 'slug is already taken' },
  );
  assert.deepEqual(mapServerErrors(undefined), {});
});

test('toPayload trims, sets status and drops server-managed fields', () => {
  const values = {
    ...toFormValues(),
    title: '  Start a Business ',
    slug: ' start-a-business ',
    subtitle: ' Company & more ',
    sections: [{ title: ' Structure ', items: [{ service: 'a'.repeat(24), popular: true }] }],
    _id: 'should-not-be-sent',
    itemsMeta: {},
  } as unknown as Parameters<typeof toPayload>[0];
  const payload = toPayload(values, 'published');
  assert.deepEqual(Object.keys(payload).sort(), [
    'color', 'iconName', 'pageDescription', 'pageHeading', 'sections', 'showOnHome', 'slug', 'status', 'subtitle', 'title',
  ]);
  assert.equal(payload.title, 'Start a Business');
  assert.equal(payload.slug, 'start-a-business');
  assert.equal(payload.status, 'published');
  assert.deepEqual(payload.sections, [{ title: 'Structure', items: [{ service: 'a'.repeat(24), popular: true }] }]);
});

test('toFormValues: defaults for a new solution, picks known fields from a detail', () => {
  assert.deepEqual(toFormValues(), {
    title: '', slug: '', iconName: 'Rocket', color: 'blue', subtitle: '', pageHeading: '', pageDescription: '', showOnHome: true, sections: [],
  });
  // A variable (not an inline literal) so the extra server fields don't trip TS excess-property checks.
  const detail = {
    _id: 'x', slug: 's', title: 'T', subtitle: 'Sub', iconName: 'Scale', color: 'teal' as const, pageHeading: 'H', pageDescription: 'D',
    sections: [{ title: 'One', items: [{ service: 'b'.repeat(24), popular: false }] }], showOnHome: false, order: 3,
    status: 'published', itemsMeta: {}, createdAt: '', updatedAt: '',
  };
  const values = toFormValues(detail);
  assert.equal(values.color, 'teal');
  assert.equal(values.showOnHome, false);
  assert.equal('itemsMeta' in values, false);
  assert.equal(values.sections[0].items[0].popular, false);
});
