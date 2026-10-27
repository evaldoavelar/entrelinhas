import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as enums from './enums';

// Drift guard: the canonical source is docs/specs/decisoes-e-estados.md (§1 identities, §2 table).
const spec = readFileSync(fileURLToPath(new URL('../../../docs/specs/decisoes-e-estados.md', import.meta.url)), 'utf8');

function tableValues(field: string): string[] {
  const row = spec.split('\n').find((line) => line.startsWith(`| ${field} |`));
  if (!row) throw new Error(`linha ${field} não encontrada na tabela §2`);
  const cell = row.split('|')[2] ?? '';
  return cell.split(',').map((v) => v.trim());
}

function inlineValues(label: string): string[] {
  const match = new RegExp(`\`${label}\`: ([a-z_, ]+)[.;]`).exec(spec);
  if (!match?.[1]) throw new Error(`${label} não encontrado em §1`);
  return match[1].split(',').map((v) => v.trim());
}

test.each([
  ['job.state', enums.JOB_STATES],
  ['attempt.state', enums.ATTEMPT_STATES],
  ['product.processing_state', enums.PROCESSING_STATES],
  ['import.state', enums.IMPORT_STATES],
  ['captured_document.state', enums.CAPTURED_DOCUMENT_STATES],
  ['delivery.state', enums.DELIVERY_STATES],
  ['pairing.state', enums.PAIRING_STATES],
  ['principal.status', enums.PRINCIPAL_STATUSES],
])('%s matches decisoes-e-estados.md §2 exactly (values and order)', (field, values) => {
  expect([...values]).toEqual(tableValues(field));
});

test.each([
  ['kind', enums.PRINCIPAL_KINDS],
  ['input_kind', enums.INPUT_KINDS],
  ['source_channel', enums.SOURCE_CHANNELS],
])('%s matches decisoes-e-estados.md §1', (label, values) => {
  expect([...values]).toEqual(inlineValues(label));
});

test('visibility values match §1 (parsed from the spec sentence, review 2 #B2)', () => {
  const match = /Visibilidade: ([a-z_, ]+(?: e [a-z_]+)?)\./.exec(spec);
  if (!match?.[1]) throw new Error('frase de visibilidade não encontrada em §1');
  expect([...enums.VISIBILITIES]).toEqual(match[1].split(/, | e /).map((v) => v.trim()));
});

test('zod schemas accept canonical values and reject unknown ones', () => {
  expect(enums.ImportState.parse('awaiting_category')).toBe('awaiting_category');
  expect(() => enums.ImportState.parse('category_required')).toThrow();
});
