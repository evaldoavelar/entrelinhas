import { formatArticleDate, formatArticleDuration, formatConversion, formatListenState } from './format';

describe('formatConversion', () => {
  const now = new Date('2026-10-27T15:00:00-03:00');

  test('returns fallback when conversion is null', () => {
    expect(formatConversion(null, now)).toBe('Nenhuma conversão ainda');
  });

  test('formats today conversion as hoje, às HH:mm', () => {
    expect(formatConversion('2026-10-27T13:42:00-03:00', now)).toBe('hoje, às 13:42');
  });

  test('formats yesterday conversion as ontem, às HH:mm', () => {
    expect(formatConversion('2026-10-26T18:12:00-03:00', now)).toBe('ontem, às 18:12');
  });

  test('formats older conversion in same year with day and month', () => {
    expect(formatConversion('2026-10-22T10:20:00-03:00', now)).toBe('22 out., às 10:20');
  });

  test('formats older conversion in different year', () => {
    expect(formatConversion('2025-10-22T10:20:00-03:00', now)).toBe('22 out. 2025, às 10:20');
  });
});

describe('formatArticleDate', () => {
  test('returns empty string when published_at is null', () => {
    expect(formatArticleDate(null)).toBe('');
  });

  test('formats ISO date to day and abbreviated month with dot', () => {
    expect(formatArticleDate('2026-10-24T10:00:00-03:00')).toBe('24 out.');
  });
});

describe('formatArticleDuration', () => {
  test('returns dash when duration is null', () => {
    expect(formatArticleDuration(null)).toBe('-');
  });

  test('formats seconds into minutes and zero-padded seconds', () => {
    expect(formatArticleDuration(768)).toBe('12 min 48 s');
    expect(formatArticleDuration(500)).toBe('8 min 20 s');
    expect(formatArticleDuration(605)).toBe('10 min 05 s');
  });
});

describe('formatListenState', () => {
  test('maps listen_state enum to pt-BR labels', () => {
    expect(formatListenState('in_progress')).toBe('Em reprodução');
    expect(formatListenState('unheard')).toBe('Não ouvido');
    expect(formatListenState('heard')).toBe('Ouvido');
  });
});
