import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FV_COLOR_KEYS, FV_COLOR_HEX, colorAt, isFvColor, fvColorVars } from '../app/lib/fv/colors';

test('exactly the 8 approved keys, in order', () => {
  assert.deepEqual([...FV_COLOR_KEYS], ['blue', 'purple', 'green', 'orange', 'red', 'teal', 'yellow', 'pink']);
});

test('blue, green and teal use the logo palette', () => {
  assert.equal(FV_COLOR_HEX.blue.fg, '#2587C4');
  assert.equal(FV_COLOR_HEX.green.fg, '#58A651');
  assert.equal(FV_COLOR_HEX.teal.fg, '#3D8A6A');
});

test('every key has fg/bg/pale hex values', () => {
  for (const key of FV_COLOR_KEYS) {
    for (const shade of ['fg', 'bg', 'pale'] as const) {
      assert.match(FV_COLOR_HEX[key][shade], /^#[0-9A-F]{6}$/i, `${key}.${shade}`);
    }
  }
});

test('colorAt cycles and tolerates negatives', () => {
  assert.equal(colorAt(0), 'blue');
  assert.equal(colorAt(8), 'blue');
  assert.equal(colorAt(9), 'purple');
  assert.equal(colorAt(-1), 'pink');
});

test('isFvColor and fvColorVars', () => {
  assert.equal(isFvColor('teal'), true);
  assert.equal(isFvColor('amber'), false);
  assert.equal(isFvColor(undefined), false);
  assert.deepEqual(fvColorVars('red'), { '--c': '#EF4444', '--cb': '#FFE7E7', '--cp': '#FFF5F5' });
});
