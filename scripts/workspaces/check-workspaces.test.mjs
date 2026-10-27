// Run: node --test scripts/workspaces/check-workspaces.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { missingScripts } from './check-workspaces.mjs';

test('every workspace must define typecheck, test and test:coverage (review TASK-001 #3)', () => {
  const ws = {
    'packages/a': { scripts: { typecheck: 'x', test: 'x', 'test:coverage': 'x' } },
    'packages/b': { scripts: { test: 'x' } },
    'packages/c': {},
  };
  assert.deepEqual(missingScripts(ws), [
    'packages/b: falta typecheck',
    'packages/b: falta test:coverage',
    'packages/c: falta typecheck',
    'packages/c: falta test',
    'packages/c: falta test:coverage',
  ]);
});

test('complete workspaces produce no findings', () => {
  assert.deepEqual(missingScripts({ 'apps/x': { scripts: { typecheck: 'x', test: 'x', 'test:coverage': 'x' } } }), []);
});
