#!/usr/bin/env node
// Fails if a production build contains MSW, its worker or mock fixtures (ADR-12).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.argv[2] ?? 'dist';
const markers = ['mockServiceWorker', 'msw/browser', 'setupWorker', 'casa-exemplo', 'scenarioOverride'];
const offenders = [];
function walk(d) {
  for (const name of readdirSync(d)) {
    const p = join(d, name);
    if (statSync(p).isDirectory()) walk(p);
    else {
      if (name.startsWith('mockServiceWorker')) offenders.push(`${p}: arquivo do worker`);
      const text = readFileSync(p, 'latin1');
      for (const m of markers) if (text.includes(m)) offenders.push(`${p}: contém "${m}"`);
    }
  }
}
walk(dir);
for (const o of offenders) console.error(`FAIL: ${o}`);
if (offenders.length === 0) console.log(`OK: ${dir} sem MSW/fixtures`);
process.exit(offenders.length ? 1 : 0);
