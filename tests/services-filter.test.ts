import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeQuery, isListable, matchesQuery, filterGroups, chipCounts } from '../app/lib/services/filter';

interface Svc {
  id?: string;
  slug?: string;
  title?: string;
  shortDescription?: string;
}
interface Group {
  id: string;
  title: string;
  services: Svc[];
}

const svc = (id: string, title?: string, shortDescription?: string, extra: Partial<Svc> = {}): Svc => ({
  id,
  slug: `slug-${id}`,
  title,
  shortDescription,
  ...extra,
});

const cardCount = (groups: Array<{ services: unknown[] }>) => groups.reduce((n, g) => n + g.services.length, 0);

// 4 groups, 15 services (2 of them unlistable), with a mix of title-only, description-only and
// missing-field matches.
const FIXTURE: Group[] = [
  {
    id: 'gst',
    title: 'GST Services',
    services: [
      svc('g1', 'GST Registration', 'Register your business for GST'),
      svc('g2', 'Export GST', 'Refund on exports'),
      svc('g3', 'LUT Filing', 'Letter of undertaking under gst'),
      svc('g4', undefined, 'Annual GST return'),
      svc('g5', 'E-invoicing', undefined),
    ],
  },
  {
    id: 'income-tax',
    title: 'Income Tax',
    services: [
      svc('t1', 'ITR Filing', 'Income tax return for salaried'),
      svc('t2', 'TDS Return', 'Quarterly tax deducted at source'),
      svc('t3', 'Tax Notice', undefined),
      svc('t4', 'Unlisted tax service', 'no slug', { slug: '' }),
    ],
  },
  {
    id: 'trademarks',
    title: 'Trademarks & IP',
    services: [
      svc('m1', 'Trademark Registration', 'Protect brand & logo'),
      svc('m2', 'Copyright', 'Music & art'),
      svc('m3', 'Patent', 'Inventions'),
      svc('', 'Unlisted GST-like service', 'no id'),
    ],
  },
  {
    id: 'empty',
    title: 'Empty Group',
    services: [],
  },
  {
    id: 'legal',
    title: 'Legal Services',
    services: [svc('l1', 'Will drafting', undefined), svc('l2', undefined, undefined)],
  },
];

test('normalizeQuery trims and lowercases', () => {
  assert.equal(normalizeQuery('  GsT '), 'gst');
  assert.equal(normalizeQuery(''), '');
  assert.equal(normalizeQuery('   '), '');
  assert.equal(normalizeQuery('\tIncome Tax\n'), 'income tax');
});

test('matchesQuery is case-insensitive', () => {
  const s = svc('a', 'GST Registration', 'Register for GST');
  assert.equal(matchesQuery(s, 'gst'), true);
  assert.equal(matchesQuery(s, 'GST'), true);
  assert.equal(matchesQuery(s, 'gSt rEg'), true);
  assert.equal(matchesQuery(s, 'income'), false);
});

test('matchesQuery matches on the title alone and on the description alone', () => {
  const s = svc('a', 'Trademark Search', 'Check brand availability');
  assert.equal(matchesQuery(s, 'trademark'), true, 'title only');
  assert.equal(matchesQuery(s, 'availability'), true, 'description only');
  assert.equal(matchesQuery(s, 'search check'), false, 'not across the two fields');
});

test('matchesQuery treats a missing title or description as empty', () => {
  assert.equal(matchesQuery(svc('a', undefined, 'Annual GST return'), 'gst'), true);
  assert.equal(matchesQuery(svc('a', 'Export GST', undefined), 'gst'), true);
  assert.equal(matchesQuery(svc('a', undefined, undefined), 'gst'), false);
  assert.equal(matchesQuery(svc('a', undefined, undefined), 'undefined'), false);
  assert.equal(matchesQuery(svc('a', null as unknown as string, null as unknown as string), 'null'), false);
  assert.equal(matchesQuery(svc('a', undefined, undefined), ''), true);
});

test('matchesQuery trims the query, so "gst " matches "Export GST"', () => {
  const s = svc('a', 'Export GST', 'Refund on exports');
  assert.equal(matchesQuery(s, 'gst '), true);
  assert.equal(matchesQuery(s, ' gst'), true);
  assert.equal(matchesQuery(s, ' GST '), true);
});

test('an empty or blank query matches everything', () => {
  for (const q of ['', ' ', '   ']) {
    assert.equal(matchesQuery(svc('a', 'Anything', 'At all'), q), true);
    assert.equal(matchesQuery(svc('a'), q), true);
  }
});

test('isListable needs both an id and a slug', () => {
  assert.equal(isListable(svc('a', 'T')), true);
  assert.equal(isListable(svc('', 'T')), false);
  assert.equal(isListable(svc('a', 'T', '', { slug: '' })), false);
  assert.equal(isListable({ slug: 'x', title: 'T' }), false);
  assert.equal(isListable({ id: 'x', title: 'T' }), false);
  assert.equal(isListable(null as unknown as Svc), false);
  assert.equal(isListable(undefined as unknown as Svc), false);
});

test('unlistable services are excluded from both the list and the counts', () => {
  // t4 has no slug, the unnamed trademarks entry has no id; both match "unlisted" and "service".
  for (const q of ['unlisted', '']) {
    const shown = filterGroups(FIXTURE, q, 'all').flatMap((g) => g.services);
    assert.ok(shown.every((s) => s.id && s.slug), `query ${JSON.stringify(q)} shows only listable services`);
  }
  assert.deepEqual(filterGroups(FIXTURE, 'unlisted', 'all'), []);
  const counts = chipCounts(FIXTURE, 'unlisted');
  assert.equal(counts.all, 0);
  assert.equal(counts.byId['income-tax'], 0);
  assert.equal(counts.byId.trademarks, 0);
  assert.equal(chipCounts(FIXTURE, '').all, 13);
  assert.equal(chipCounts(FIXTURE, '').byId['income-tax'], 3);
  assert.equal(chipCounts(FIXTURE, '').byId.trademarks, 3);
});

test('filterGroups keeps the group shape and order, drops empty groups', () => {
  const groups = filterGroups(FIXTURE, 'gst', 'all');
  assert.deepEqual(
    groups.map((g) => g.id),
    ['gst'],
  );
  assert.equal(groups[0].title, 'GST Services');
  assert.deepEqual(
    groups[0].services.map((s) => s.id),
    ['g1', 'g2', 'g3', 'g4'],
  );
  assert.deepEqual(
    filterGroups(FIXTURE, '', 'all').map((g) => g.id),
    ['gst', 'income-tax', 'trademarks', 'legal'],
  );
  assert.deepEqual(
    filterGroups(FIXTURE, 'tax', 'all').map((g) => [g.id, g.services.map((s) => s.id)]),
    [['income-tax', ['t1', 't2', 't3']]],
  );
});

test('filterGroups with a selected group returns at most that group', () => {
  assert.deepEqual(
    filterGroups(FIXTURE, '', 'income-tax').map((g) => g.id),
    ['income-tax'],
  );
  assert.deepEqual(filterGroups(FIXTURE, 'gst', 'income-tax'), []);
  assert.deepEqual(filterGroups(FIXTURE, '', 'empty'), []);
  assert.deepEqual(filterGroups(FIXTURE, '', 'no-such-group'), []);
});

test('filterGroups tolerates a non-array input and groups without services', () => {
  assert.deepEqual(filterGroups(null as unknown as Group[], '', 'all'), []);
  const odd = [{ id: 'x', title: 'X', services: undefined as unknown as Svc[] }];
  assert.deepEqual(filterGroups(odd, '', 'all'), []);
  assert.deepEqual(chipCounts(odd, ''), { all: 0, byId: { x: 0 } });
  assert.deepEqual(chipCounts(null as unknown as Group[], ''), { all: 0, byId: {} });
});

test('filterGroups does not mutate its input', () => {
  const before = JSON.stringify(FIXTURE);
  filterGroups(FIXTURE, 'gst', 'gst');
  chipCounts(FIXTURE, 'gst');
  assert.equal(JSON.stringify(FIXTURE), before);
});

test('chipCounts lists every group, including empty ones, and All is their sum', () => {
  const c = chipCounts(FIXTURE, 'gst');
  assert.deepEqual(c.byId, { gst: 4, 'income-tax': 0, trademarks: 0, empty: 0, legal: 0 });
  assert.equal(c.all, 4);
  const z = chipCounts(FIXTURE, 'zzz');
  assert.deepEqual(z, { all: 0, byId: { gst: 0, 'income-tax': 0, trademarks: 0, empty: 0, legal: 0 } });
});

test('property: each chip count equals the cards shown when that chip is selected', () => {
  const queries = ['', 'gst', 'GST', ' gst ', 'tax', 'zzz', 'a', '&'];
  for (const q of queries) {
    const counts = chipCounts(FIXTURE, q);
    for (const g of FIXTURE) {
      assert.equal(counts.byId[g.id], cardCount(filterGroups(FIXTURE, q, g.id)), `query ${JSON.stringify(q)}, chip ${g.id}`);
    }
    assert.equal(counts.all, cardCount(filterGroups(FIXTURE, q, 'all')), `query ${JSON.stringify(q)}, chip all`);
    assert.equal(
      counts.all,
      Object.values(counts.byId).reduce((n, v) => n + v, 0),
      `query ${JSON.stringify(q)}: All = sum of groups`,
    );
  }
  // Spot-check that the property is not vacuous.
  assert.equal(chipCounts(FIXTURE, '&').all, 2);
  assert.equal(chipCounts(FIXTURE, 'a').all > 0, true);
  assert.deepEqual(chipCounts(FIXTURE, 'GST'), chipCounts(FIXTURE, ' gst '));
});

test('counts do not depend on the selected chip', () => {
  // chipCounts takes no selection: it is a function of (groups, query) only.
  assert.equal(chipCounts.length, 2);
  for (const q of ['', 'gst', 'tax']) {
    const reference = chipCounts(FIXTURE, q);
    for (const selected of ['all', ...FIXTURE.map((g) => g.id)]) {
      // What the page renders for this selection never feeds back into the counts.
      filterGroups(FIXTURE, q, selected);
      assert.deepEqual(chipCounts(FIXTURE, q), reference, `query ${JSON.stringify(q)}, selected ${selected}`);
    }
  }
});
