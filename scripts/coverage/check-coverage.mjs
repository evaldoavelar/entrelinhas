#!/usr/bin/env node
// ADR-10 coverage gate: strictly >80% per project and per changed executable lines,
// per-file floor for files with >= perFileMin statements, untested sources must appear in the report.
//
// Usage: node scripts/coverage/check-coverage.mjs --report <coverage-final.json> --src <dir>
//          [--per-file-min 20] [--base <git-ref>]   (or env COVERAGE_BASE for the diff gate)
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, relative } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const THRESHOLD = 80;
const METRICS = ['lines', 'statements', 'functions', 'branches'];
const SOURCE_RE = /\.(ts|tsx|js|jsx|mjs)$/;
const NON_SOURCE_RE = /(\.test\.|\.spec\.|\.d\.ts$|\/test\/|\/mocks\/fixtures\/)/;

const passes = ({ covered, total }) => covered * 100 > total * THRESHOLD;
const fmt = (name, m) => `${name} ${m.covered}/${m.total} (${((m.covered * 100) / m.total).toFixed(2)}%)`;

function statementLines(fc) {
  // Line coverage as istanbul computes it: a line's hit count is the max over statements starting on it.
  const lines = new Map();
  for (const [id, loc] of Object.entries(fc.statementMap)) {
    const line = loc.start.line;
    lines.set(line, Math.max(lines.get(line) ?? 0, fc.s[id]));
  }
  return lines;
}

export function summarizeFile(fc) {
  const count = (arr) => ({ total: arr.length, covered: arr.filter((n) => n > 0).length });
  const lines = statementLines(fc);
  return {
    lines: count([...lines.values()]),
    statements: count(Object.values(fc.s)),
    functions: count(Object.values(fc.f)),
    branches: count(Object.values(fc.b).flat()),
  };
}

function listSources(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listSources(p));
    else if (SOURCE_RE.test(p) && !NON_SOURCE_RE.test(p)) out.push(resolve(p));
  }
  return out;
}

export function evaluate(report, { perFileMin = 20, srcDir } = {}) {
  const failures = [];
  const notes = [];
  const files = Object.values(report);
  if (files.length === 0) {
    return { ok: false, failures: ['relatório de cobertura vazio'], notes };
  }

  const totals = Object.fromEntries(METRICS.map((m) => [m, { total: 0, covered: 0 }]));
  for (const fc of files) {
    const sum = summarizeFile(fc);
    for (const m of METRICS) {
      totals[m].total += sum[m].total;
      totals[m].covered += sum[m].covered;
    }
    if (sum.statements.total >= perFileMin) {
      for (const m of METRICS) {
        if (sum[m].total > 0 && !passes(sum[m])) failures.push(`${fc.path}: ${fmt(m, sum[m])} ≤ ${THRESHOLD}%`);
      }
    }
  }
  for (const m of METRICS) {
    if (totals[m].total === 0) notes.push(`projeto: ${m} N/A (denominador zero)`);
    else if (!passes(totals[m])) failures.push(`projeto: ${fmt(m, totals[m])} ≤ ${THRESHOLD}%`);
    else notes.push(`projeto: ${fmt(m, totals[m])}`);
  }

  if (srcDir) {
    const reported = new Set(Object.keys(report).map((p) => resolve(p)));
    for (const src of listSources(srcDir)) {
      if (!reported.has(src)) failures.push(`${src}: fonte ausente do relatório`);
    }
  }
  return { ok: failures.length === 0, failures, notes };
}

export function diffCoverage(report, changedLines) {
  let total = 0;
  let covered = 0;
  for (const [path, lines] of Object.entries(changedLines)) {
    const fc = report[path];
    if (!fc) continue;
    const executable = statementLines(fc);
    for (const line of lines) {
      if (!executable.has(line)) continue;
      total += 1;
      if (executable.get(line) > 0) covered += 1;
    }
  }
  if (total === 0) return { ok: true, note: 'diff: N/A (nenhuma linha executável alterada)' };
  const m = { total, covered };
  return { ok: passes(m), note: `diff: ${fmt('linhas', m)}` };
}

function changedLinesSince(base, root) {
  const out = execFileSync('git', ['diff', '-U0', '--no-color', base, '--'], { cwd: root, encoding: 'utf8' });
  const result = {};
  let current = null;
  for (const line of out.split('\n')) {
    if (line.startsWith('+++ ')) {
      current = line === '+++ /dev/null' ? null : resolve(root, line.slice(6));
      if (current) result[current] = [];
    } else if (current && line.startsWith('@@')) {
      const m = /\+(\d+)(?:,(\d+))?/.exec(line);
      const start = Number(m[1]);
      const count = m[2] === undefined ? 1 : Number(m[2]);
      for (let i = 0; i < count; i++) result[current].push(start + i);
    }
  }
  return result;
}

function main(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) args[argv[i].replace(/^--/, '')] = argv[i + 1];
  args.base ??= process.env.COVERAGE_BASE;
  if (!args.report || !existsSync(args.report)) {
    console.error(`FAIL: relatório ausente: ${args.report ?? '(--report não informado)'}`);
    return 1;
  }
  const report = JSON.parse(readFileSync(args.report, 'utf8'));
  const result = evaluate(report, { perFileMin: Number(args['per-file-min'] ?? 20), srcDir: args.src });
  const lines = [...result.notes];
  let ok = result.ok;
  if (args.base) {
    const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
    const diff = diffCoverage(report, changedLinesSince(args.base, root));
    lines.push(diff.note);
    if (!diff.ok) {
      ok = false;
      result.failures.push(`${diff.note} ≤ ${THRESHOLD}%`);
    }
  }
  const label = args.src ? relative(process.cwd(), args.src) : args.report;
  for (const l of lines) console.log(`[coverage ${label}] ${l}`);
  for (const f of result.failures) console.error(`[coverage ${label}] FAIL: ${f}`);
  return ok ? 0 : 1;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exit(main(process.argv.slice(2)));
