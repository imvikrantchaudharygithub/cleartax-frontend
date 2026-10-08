import { test } from 'node:test';
import assert from 'node:assert/strict';
import { POPULAR_LIMIT, popularServiceItems } from '../app/lib/solutions/popular';
import type { SolutionDetail, SolutionServiceItem } from '../app/lib/api/types';

type Sol = Pick<SolutionDetail, 'color' | 'sections'>;

const svc = (id: string, popular = true, extra: Partial<SolutionServiceItem> = {}): SolutionServiceItem => ({
  id,
  title: `Service ${id}`,
  shortDescription: `About ${id}`,
  iconName: 'Building2',
  price: { min: 1000, max: 2000, currency: 'INR' },
  duration: '5-7 working days',
  href: `/services/registration/${id}`,
  popular,
  ...extra,
});

const sol = (color: string, ...sections: SolutionServiceItem[][]): Sol => ({
  color: color as Sol['color'],
  sections: sections.map((items, i) => ({ title: `Section ${i + 1}`, items })),
});

test('maps popular items to PopularServiceItem with the solution colour', () => {
  const items = popularServiceItems([sol('purple', [svc('a'), svc('b', false)])]);
  assert.deepEqual(items, [
    {
      id: 'a',
      title: 'Service a',
      description: 'About a',
      href: '/services/registration/a',
      iconName: 'Building2',
      color: 'purple',
      price: { min: 1000 },
      duration: '5-7 working days',
    },
  ]);
});

test('keeps solution order, then section order, then item order', () => {
  const items = popularServiceItems([
    sol('blue', [svc('a1'), svc('a2')], [svc('a3')]),
    sol('green', [svc('b1'), svc('b2', false), svc('b3')]),
  ]);
  assert.deepEqual(
    items.map((i) => [i.id, i.color]),
    [
      ['a1', 'blue'],
      ['a2', 'blue'],
      ['a3', 'blue'],
      ['b1', 'green'],
      ['b3', 'green'],
    ],
  );
});

test('de-duplicates by service id; the first occurrence (and its colour) wins', () => {
  const items = popularServiceItems([
    sol('orange', [svc('x'), svc('y')], [svc('x')]),
    sol('teal', [svc('y'), svc('z')]),
  ]);
  assert.deepEqual(
    items.map((i) => [i.id, i.color]),
    [
      ['x', 'orange'],
      ['y', 'orange'],
      ['z', 'teal'],
    ],
  );
});

test('an unknown solution colour falls back to blue', () => {
  assert.equal(popularServiceItems([sol('magenta', [svc('a')])])[0].color, 'blue');
  assert.equal(popularServiceItems([sol('', [svc('a')])])[0].color, 'blue');
});

test('caps the list at 8 by default and honours a custom limit', () => {
  assert.equal(POPULAR_LIMIT, 8);
  const many = Array.from({ length: 12 }, (_, i) => svc(`s${i}`));
  assert.deepEqual(
    popularServiceItems([sol('blue', many)]).map((i) => i.id),
    ['s0', 's1', 's2', 's3', 's4', 's5', 's6', 's7'],
  );
  assert.deepEqual(popularServiceItems([sol('blue', many)], 3).map((i) => i.id), ['s0', 's1', 's2']);
  assert.deepEqual(popularServiceItems([sol('blue', many)], 0), []);
  assert.deepEqual(popularServiceItems([sol('blue', many)], -2), []);
});

test('duplicates do not count towards the cap', () => {
  const items = popularServiceItems([sol('blue', [svc('a'), svc('a'), svc('b'), svc('a'), svc('c')])], 3);
  assert.deepEqual(items.map((i) => i.id), ['a', 'b', 'c']);
});

test('blank optional fields become undefined and a missing price becomes null', () => {
  const bare = svc('a', true, { shortDescription: '', iconName: '', duration: '' });
  delete (bare as Partial<SolutionServiceItem>).price;
  const [item] = popularServiceItems([sol('red', [bare])]);
  assert.equal(item.description, undefined);
  assert.equal(item.iconName, undefined);
  assert.equal(item.duration, undefined);
  assert.equal(item.price, null);
  assert.deepEqual(popularServiceItems([sol('red', [svc('b', true, { price: { min: 0, max: 0, currency: 'INR' } })])])[0].price, {
    min: 0,
  });
});

test('skips items without an id, a title or an internal href', () => {
  const items = popularServiceItems([
    sol('blue', [
      svc('', true),
      svc('no-title', true, { title: '' }),
      svc('no-href', true, { href: '' }),
      svc('external', true, { href: 'https://example.com/x' }),
      svc('ok'),
    ]),
  ]);
  assert.deepEqual(items.map((i) => i.id), ['ok']);
});

test('accepts only same-origin paths: protocol-relative //host hrefs are skipped', () => {
  const items = popularServiceItems([
    sol('blue', [
      svc('proto-relative', true, { href: '//evil.example/services/x' }),
      svc('triple-slash', true, { href: '///evil.example' }),
      svc('backslash', true, { href: '/\\evil.example' }),
      svc('root', true, { href: '/' }),
      svc('ok'),
    ]),
  ]);
  assert.deepEqual(items.map((i) => i.id), ['root', 'ok']);
});

test('tolerates empty input and malformed solutions, sections and items', () => {
  assert.deepEqual(popularServiceItems([]), []);
  const broken = [
    null,
    { color: 'blue' },
    { color: 'blue', sections: null },
    { color: 'blue', sections: [null, { title: 'S' }, { title: 'S', items: [null, svc('ok')] }] },
  ] as unknown as Sol[];
  assert.deepEqual(popularServiceItems(broken).map((i) => i.id), ['ok']);
});
