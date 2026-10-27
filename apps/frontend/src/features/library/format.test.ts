import { formatConversion, formatRemaining } from './format';

const now = new Date('2026-10-27T15:00:00-03:00');

test.each([
  ['2026-10-27T13:42:00-03:00', 'Hoje, 13:42'],
  ['2026-10-26T18:12:00-03:00', 'Ontem, 18:12'],
  ['2026-10-22T10:20:00-03:00', '22 out., 10:20'],
  ['2025-12-31T23:00:00-03:00', '31 dez. 2025, 23:00'],
])('last conversion %s -> %s (São Paulo time)', (iso, label) => {
  expect(formatConversion(iso, now)).toBe(label);
});

test('never converted', () => {
  expect(formatConversion(null, now)).toBe('Nenhuma conversão ainda');
});

test('remaining minutes for the continue banner', () => {
  expect(formatRemaining(768, 252)).toBe('8 minutos restantes');
  expect(formatRemaining(768, 740)).toBe('menos de 1 minuto restante');
  expect(formatRemaining(200, 140)).toBe('1 minuto restante');
});
