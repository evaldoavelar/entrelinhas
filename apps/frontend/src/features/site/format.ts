import type { Post } from '@entrelinhas/contracts';

const TIME_ZONE = 'America/Sao_Paulo';

const dayKey = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(d);
const time = new Intl.DateTimeFormat('pt-BR', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit' });
const dayMonth = new Intl.DateTimeFormat('pt-BR', { timeZone: TIME_ZONE, day: 'numeric', month: 'short' });
const yearOf = new Intl.DateTimeFormat('pt-BR', { timeZone: TIME_ZONE, year: 'numeric' });

export function formatConversion(iso: string | null, now: Date): string {
  if (iso === null) return 'Nenhuma conversão ainda';
  const date = new Date(iso);
  const hhmm = time.format(date);
  if (dayKey(date) === dayKey(now)) return `hoje, às ${hhmm}`;
  if (dayKey(date) === dayKey(new Date(now.getTime() - 86_400_000))) return `ontem, às ${hhmm}`;

  const parts = dayMonth.formatToParts(date);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const month = part('month').replace(/\.$/, '');
  const sameYear = yearOf.format(date) === yearOf.format(now);
  return `${part('day')} ${month}.${sameYear ? '' : ` ${yearOf.format(date)}`}, às ${hhmm}`;
}

export function formatArticleDate(iso: string | null): string {
  if (iso === null) return '';
  const date = new Date(iso);
  const parts = dayMonth.formatToParts(date);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const month = part('month').replace(/\.$/, '');
  return `${part('day')} ${month}.`;
}

export function formatArticleDuration(seconds: number | null): string {
  if (seconds === null) return '-';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes} min ${String(remainingSeconds).padStart(2, '0')} s`;
}

export function formatListenState(state: Post['listen_state']): string {
  switch (state) {
    case 'in_progress':
      return 'Em reprodução';
    case 'unheard':
      return 'Não ouvido';
    case 'heard':
      return 'Ouvido';
  }
}
