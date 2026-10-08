import { test } from 'node:test';
import assert from 'node:assert/strict';
import { railColumnsBelowLg, railLayout } from '../app/lib/solutions/rail';

test('railLayout picks a layout for any number of solutions', () => {
  assert.equal(railLayout(0), 'none');
  assert.equal(railLayout(-1), 'none');
  assert.equal(railLayout(1), 'row');
  assert.equal(railLayout(4), 'row');
  assert.equal(railLayout(5), 'grid');
  assert.equal(railLayout(8), 'grid');
  assert.equal(railLayout(9), 'scroll');
});

test('railColumnsBelowLg balances the rows below lg (5 → 3+2, 6 → 3+3, 7 → 4+3, 8 → 4+4)', () => {
  assert.equal(railColumnsBelowLg(0), 0);
  assert.equal(railColumnsBelowLg(-1), 0);
  assert.equal(railColumnsBelowLg(1), 1);
  assert.equal(railColumnsBelowLg(4), 4);
  assert.equal(railColumnsBelowLg(5), 3);
  assert.equal(railColumnsBelowLg(6), 3);
  assert.equal(railColumnsBelowLg(7), 4);
  assert.equal(railColumnsBelowLg(8), 4);
  assert.equal(railColumnsBelowLg(9), 4);
  assert.equal(railColumnsBelowLg(12), 4);
});
