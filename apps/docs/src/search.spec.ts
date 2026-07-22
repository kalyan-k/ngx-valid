import assert from 'node:assert/strict';
import test from 'node:test';
import type { DocumentationEntry } from './catalog.js';
import { buildSearchIndex, searchDocumentation } from './search.js';

const entry: DocumentationEntry = {
  slug: 'policies', title: 'Policies', section: 'Guides', summary: 'Reusable policy rules.', source: 'policies.md'
};
const index = buildSearchIndex([entry], () => '# Policies\n\n## Async validation\n\nUse `validateAll()` with an observable.');

test('indexes page titles, headings, prose, and code snippets', () => {
  assert.equal(index.length, 2);
  assert.equal(searchDocumentation(index, 'Policies')[0]?.slug, 'policies');
  assert.equal(searchDocumentation(index, 'Async validation')[0]?.anchor, 'async-validation');
  assert.equal(searchDocumentation(index, 'validateAll')[0]?.anchor, 'async-validation');
});

test('requires every query term and returns section deep links', () => {
  const results = searchDocumentation(index, 'observable validation');
  assert.equal(results.length, 1);
  assert.equal(results[0]?.id, 'policies:async-validation');
  assert.equal(searchDocumentation(index, 'missing concept').length, 0);
});
