#!/usr/bin/env node
// Fails when a workspace lacks the scripts `verify` relies on, so `--if-present` can never
// silently skip a project's tests or coverage gate.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const REQUIRED = ['typecheck', 'test', 'test:coverage'];

export function missingScripts(workspaces) {
  const out = [];
  for (const [dir, pkg] of Object.entries(workspaces)) {
    for (const name of REQUIRED) if (!pkg.scripts?.[name]) out.push(`${dir}: falta ${name}`);
  }
  return out;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..');
  const { workspaces } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
  const pkgs = Object.fromEntries(workspaces.map((d) => [d, JSON.parse(readFileSync(join(root, d, 'package.json'), 'utf8'))]));
  const problems = missingScripts(pkgs);
  for (const p of problems) console.error(`FAIL: ${p}`);
  if (problems.length === 0) console.log(`OK: ${workspaces.length} workspaces com scripts obrigatórios`);
  process.exit(problems.length === 0 ? 0 : 1);
}
