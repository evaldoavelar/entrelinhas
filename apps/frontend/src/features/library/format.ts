// Dates shown in the household's time zone so labels do not depend on the device clock zone.
const TIME_ZONE = 'America/Sao_Paulo';

const dayKey = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE }).format(d);
const time = new Intl.DateTimeFormat('pt-BR', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit' });
const dayMonth = new Intl.DateTimeFormat('pt-BR', { timeZone: TIME_ZONE, day: 'numeric', month: 'short' });
const yearOf = new Intl.DateTimeFormat('pt-BR', { timeZone: TIME_ZONE, year: 'numeric' });

export function formatConversion(iso: string | null, now: Date): string {
  if (iso === null) return 'Nenhuma conversão ainda';
  const date = new Date(iso);
  const hhmm = time.format(date);
  if (dayKey(date) === dayKey(now)) return `Hoje, ${hhmm}`;
  if (dayKey(date) === dayKey(new Date(now.getTime() - 86_400_000))) return `Ontem, ${hhmm}`;
  // Frame 01 writes "22 out., 10:20" (no "de"), so the label is built from parts.
  const parts = dayMonth.formatToParts(date);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const sameYear = yearOf.format(date) === yearOf.format(now);
  return `${part('day')} ${part('month')}${sameYear ? '' : ` ${yearOf.format(date)}`}, ${hhmm}`;
}

export function formatRemaining(durationSeconds: number, positionSeconds: number): string {
  const minutes = Math.floor((durationSeconds - positionSeconds) / 60);
  if (minutes < 1) return 'menos de 1 minuto restante';
  return minutes === 1 ? '1 minuto restante' : `${minutes} minutos restantes`;
}
