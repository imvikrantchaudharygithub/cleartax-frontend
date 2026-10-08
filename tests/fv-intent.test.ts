import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isIntentOnlyHref } from '../app/lib/fv/intent';

test('isIntentOnlyHref matches /services and its subpaths, queries and hashes', () => {
  for (const href of ['/services', '/services/gst', '/services?x', '/services#a']) {
    assert.equal(isIntentOnlyHref(href), true, href);
  }
});

test('isIntentOnlyHref rejects look-alikes and other routes', () => {
  for (const href of ['/services-new', '/servicesx', '/solutions/x', 'https://x/services', '/', '']) {
    assert.equal(isIntentOnlyHref(href), false, href);
  }
});
