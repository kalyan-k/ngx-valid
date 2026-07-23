import assert from 'node:assert/strict';
import test from 'node:test';
import { applicationDefinitions } from './applications.js';
import { ApplicationProcessManager } from './process-manager.js';

test('initializes every registered application in a stopped state', () => {
  const manager = new ApplicationProcessManager(applicationDefinitions, process.cwd(), '');
  const statuses = manager.getStatuses();
  assert.equal(statuses.length, 4);
  assert.deepEqual(statuses.map(({ id }) => id), [
    'docs',
    'angular-demo',
    'angular-ngrx-demo',
    'react-demo'
  ]);
  assert.ok(statuses.every(({ state }) => state === 'stopped'));
  const react = statuses.find(({ id }) => id === 'react-demo');
  assert.deepEqual(react?.demoLinks?.map(({ label }) => label), [
    'Local State', 'Redux Toolkit', 'Zustand', 'Jotai', 'Recoil', 'MobX', 'Context API'
  ]);
  assert.ok(react?.demoLinks?.every(({ url, documentationUrl }) => url.includes('/state/') && documentationUrl.includes('/docs/react-state-')));
});

test('reports a useful failure when the portal is not launched through npm', () => {
  const manager = new ApplicationProcessManager(applicationDefinitions, process.cwd(), '');
  manager.startAll();
  assert.ok(manager.getStatuses().every(({ state }) => state === 'failed'));
});
