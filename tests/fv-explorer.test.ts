import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildExplorerAreas } from '../app/lib/fv/explorer';

const GST = {
  title: 'GST Services',
  description: 'Complete GST registration, filing, and compliance solutions for your business.',
  features: ['GST Registration', ' ', 'Return Filing'],
  href: '/services/gst',
  icon: 'Receipt',
};

test('cards become link areas whose rows point at the card href', () => {
  const [area] = buildExplorerAreas([GST], []);
  assert.equal(area.key, 'card-0');
  assert.equal(area.heading, 'GST Services');
  assert.equal(area.meta, '2 services');
  assert.deepEqual(area.cta, { label: 'Explore GST Services', href: '/services/gst' });
  assert.deepEqual(area.rows, [
    { kind: 'link', title: 'GST Registration', href: '/services/gst' },
    { kind: 'link', title: 'Return Filing', href: '/services/gst' },
  ]);
});

test('complex areas follow the cards, drop zero-count subcategories, and link to the listing', () => {
  const areas = buildExplorerAreas([GST], [
    {
      key: 'ipo',
      subcategories: [
        { slug: 'ipo-advisory', title: 'IPO Advisory & Strategy', shortDescription: 'Advisory', iconName: 'TrendingUp', itemsCount: 73 },
        { slug: 'pre-ipo-funding', title: 'Pre-IPO Funding', itemsCount: 0 },
      ],
    },
  ]);
  assert.deepEqual(areas.map((a) => a.key), ['card-0', 'ipo']);
  const ipo = areas[1];
  assert.equal(ipo.heading, 'Take Your Company Public with Confidence');
  assert.equal(ipo.meta, '73 services');
  assert.deepEqual(ipo.cta, { label: 'View All IPO Services', href: '/services/ipo' });
  assert.deepEqual(ipo.rows, [
    {
      kind: 'accordion',
      title: 'IPO Advisory & Strategy',
      href: '/services/ipo/ipo-advisory',
      description: 'Advisory',
      count: 73,
      icon: 'TrendingUp',
    },
  ]);
});

test('areas with no non-empty subcategories are omitted', () => {
  const areas = buildExplorerAreas([], [
    { key: 'legal', subcategories: [] },
    { key: 'banking-finance', subcategories: [{ slug: 'x', title: 'X', itemsCount: 0 }] },
  ]);
  assert.deepEqual(areas, []);
});

test('invalid cards are skipped and missing inputs are tolerated', () => {
  const bad = { ...GST, href: '' };
  assert.deepEqual(buildExplorerAreas([bad], []), []);
  assert.deepEqual(buildExplorerAreas(undefined as never, undefined as never), []);
});
