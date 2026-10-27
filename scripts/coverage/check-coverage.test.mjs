// Tests for the ADR-10 coverage gate. Run: node --test scripts/coverage
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { evaluate, summarizeFile, diffCoverage, parseUnifiedDiff } from './check-coverage.mjs';

// Builds an istanbul file coverage with `total` statements on lines 1..total, first `covered` hit.
function fileCov(path, total, covered, { fns = [], branches = [] } = {}) {
  const statementMap = {};
  const s = {};
  for (let i = 0; i < total; i++) {
    statementMap[i] = { start: { line: i + 1, column: 0 }, end: { line: i + 1, column: 5 } };
    s[i] = i < covered ? 1 : 0;
  }
  const fnMap = {};
  const f = {};
  fns.forEach((hit, i) => {
    fnMap[i] = { name: `f${i}`, loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 1 } } };
    f[i] = hit;
  });
  const branchMap = {};
  const b = {};
  branches.forEach((hits, i) => {
    branchMap[i] = { loc: { start: { line: 1, column: 0 } }, locations: hits.map(() => ({})) };
    b[i] = hits;
  });
  return { path, statementMap, s, fnMap, f, branchMap, b };
}

const report = (...files) => Object.fromEntries(files.map((x) => [x.path, x]));

test('exactly 80% fails (strictly greater than 80 required)', () => {
  const r = evaluate(report(fileCov('/p/src/a.ts', 10, 8)), { perFileMin: 20 });
  assert.equal(r.ok, false);
  assert.match(r.failures.join('\n'), /statements 8\/10/);
});

test('above 80% passes', () => {
  const r = evaluate(report(fileCov('/p/src/a.ts', 100, 81)), { perFileMin: 20 });
  assert.equal(r.ok, true, r.failures.join('\n'));
});

test('project total counts uncovered small files (not excluded)', () => {
  // big file 100% (30/30) + small file 0% (10 statements) => 30/40 = 75% -> fail
  const r = evaluate(report(fileCov('/p/src/big.ts', 30, 30), fileCov('/p/src/small.ts', 10, 0)), { perFileMin: 20 });
  assert.equal(r.ok, false);
});

test('significant file (>=20 statements) at or below 80% fails even if project passes', () => {
  const files = [fileCov('/p/src/sig.ts', 20, 16)];
  for (let i = 0; i < 10; i++) files.push(fileCov(`/p/src/ok${i}.ts`, 19, 19));
  const r = evaluate(report(...files), { perFileMin: 20 });
  assert.equal(r.ok, false);
  assert.match(r.failures.join('\n'), /sig\.ts/);
});

test('small file (<20 statements) below 80% does not fail by itself when project passes', () => {
  const files = [fileCov('/p/src/tiny.ts', 5, 3)];
  for (let i = 0; i < 5; i++) files.push(fileCov(`/p/src/ok${i}.ts`, 30, 30));
  const r = evaluate(report(...files), { perFileMin: 20 });
  assert.equal(r.ok, true, r.failures.join('\n'));
});

test('functions and branches are gated too', () => {
  const r = evaluate(report(fileCov('/p/src/a.ts', 50, 50, { fns: [1, 0], branches: [[1, 1]] })), { perFileMin: 20 });
  assert.equal(r.ok, false);
  assert.match(r.failures.join('\n'), /functions 1\/2/);
});

test('zero denominators are N/A, not 100%', () => {
  const sum = summarizeFile(fileCov('/p/src/a.ts', 0, 0));
  assert.equal(sum.statements.total, 0);
  const r = evaluate(report(fileCov('/p/src/a.ts', 0, 0)), { perFileMin: 20 });
  assert.equal(r.ok, true);
  assert.match(r.notes.join('\n'), /N\/A/);
});

test('source file missing from report fails', () => {
  const dir = mkdtempSync(join(tmpdir(), 'cov-'));
  mkdirSync(join(dir, 'src'));
  writeFileSync(join(dir, 'src', 'a.ts'), 'export const a = 1;\n');
  writeFileSync(join(dir, 'src', 'b.tsx'), 'export const b = 1;\n');
  writeFileSync(join(dir, 'src', 'b.test.tsx'), '');
  writeFileSync(join(dir, 'src', 'types.d.ts'), '');
  const r = evaluate(report(fileCov(join(dir, 'src', 'a.ts'), 10, 10)), { perFileMin: 20, srcDir: join(dir, 'src') });
  assert.equal(r.ok, false);
  assert.match(r.failures.join('\n'), /b\.tsx.*ausente/);
  assert.doesNotMatch(r.failures.join('\n'), /b\.test\.tsx|types\.d\.ts/);
});

test('empty report fails', () => {
  const r = evaluate({}, { perFileMin: 20 });
  assert.equal(r.ok, false);
});

test('diff coverage: changed statement lines strictly above 80%', () => {
  const rep = report(fileCov('/p/src/a.ts', 10, 5));
  // lines 1..5 covered, 6..10 not. Changed lines 1-4 + 6 => 4/5 = 80% -> fail
  const fail = diffCoverage(rep, { '/p/src/a.ts': [1, 2, 3, 4, 6] });
  assert.equal(fail.ok, false);
  assert.match(fail.note, /4\/5/);
});

test('diff coverage pass and N/A cases', () => {
  const rep = report(fileCov('/p/src/a.ts', 10, 5));
  assert.equal(diffCoverage(rep, { '/p/src/a.ts': [1, 2, 3, 4, 5, 9] }).ok, true); // 5/6
  const na = diffCoverage(rep, { '/p/src/other.md': [1] });
  assert.equal(na.ok, true);
  assert.match(na.note, /N\/A/);
});

test('diff coverage gates branches on changed lines, not only lines (review TASK-001 #1)', () => {
  // Line 1 covered, but a new branch on line 1 has an uncovered arm.
  const fc = fileCov('/p/src/a.ts', 1, 1, { branches: [[1, 0]] });
  fc.branchMap[0].loc = { start: { line: 1, column: 0 } };
  fc.branchMap[0].locations = [{ start: { line: 1, column: 0 } }, { start: { line: 1, column: 10 } }];
  const r = diffCoverage(report(fc), { '/p/src/a.ts': [1] });
  assert.equal(r.ok, false);
  assert.match(r.note, /branches 1\/2/);
});

test('diff parser ignores "+++" content lines inside hunks (review TASK-001 #2)', () => {
  const diff = [
    'diff --git a/src/a.ts b/src/a.ts',
    'index 1..2 100644',
    '--- a/src/a.ts',
    '+++ b/src/a.ts',
    '@@ -0,0 +1,2 @@',
    '+let count = 0;',
    '+++count;',
    '@@ -10,0 +12,1 @@',
    '+export const x = count;',
  ].join('\n');
  assert.deepEqual(parseUnifiedDiff(diff, '/root'), { '/root/src/a.ts': [1, 2, 12] });
});

test('diff parser decodes git-quoted paths with non-ASCII names', () => {
  const diff = [
    'diff --git "a/src/canç\\303\\243o.ts" "b/src/canç\\303\\243o.ts"',
    'new file mode 100644',
    '--- /dev/null',
    '+++ "b/src/can\\303\\247\\303\\243o.ts"',
    '@@ -0,0 +1 @@',
    '+export {};',
  ].join('\n');
  assert.deepEqual(parseUnifiedDiff(diff, '/root'), { '/root/src/canção.ts': [1] });
});

test('diff parser skips deleted files', () => {
  const diff = ['diff --git a/x.ts b/x.ts', 'deleted file mode 100644', '--- a/x.ts', '+++ /dev/null', '@@ -1 +0,0 @@', '-a'].join('\n');
  assert.deepEqual(parseUnifiedDiff(diff, '/root'), {});
});

test('diff counts every arm of a branch whose condition is on a changed line (review 2 #A)', () => {
  const fc = fileCov('/p/src/a.ts', 2, 2, { branches: [[1, 0]] });
  fc.branchMap[0].loc = { start: { line: 1, column: 0 } };
  fc.branchMap[0].locations = [{ start: { line: 1, column: 4 } }, { start: { line: 2, column: 0 } }];
  const r = diffCoverage(report(fc), { '/p/src/a.ts': [1] });
  assert.equal(r.ok, false);
  assert.match(r.note, /branches 1\/2/);
});
