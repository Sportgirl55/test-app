import type { Filter, Match } from '../types';

const STATUS_LABELS: Record<string, string> = {
  scheduled: 'Запланирован',
  live: 'Идёт',
  finished: 'Завершён',
  postponed: 'Перенесён',
};

// Неизвестный статус не ломает экран — показываем как есть.
export function statusLabel(match: Match): string {
  const label = STATUS_LABELS[match.status] ?? match.status;
  if (match.status === 'live' && typeof match.minute === 'number') {
    return `${label}, ${match.minute}′`;
  }
  return label;
}

// «Завершённые» — только finished. «Предстоящие» — всё, что ещё не закончилось:
// запланированные, идущие прямо сейчас и перенесённые (они ещё будут сыграны).
export function matchesFilter(match: Match, filter: Filter): boolean {
  switch (filter) {
    case 'finished':
      return match.status === 'finished';
    case 'upcoming':
      return match.status !== 'finished';
    default:
      return true;
  }
}

// Дата и время в часовом поясе устройства. null/некорректная дата → заглушка.
export function formatStart(startsAt: string | null): string {
  if (!startsAt) return 'Дата уточняется';
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return 'Дата уточняется';
  return date.toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Хронологический порядок; матчи без даты — в конце.
export function sortByStart(matches: Match[]): Match[] {
  const time = (m: Match) => (m.startsAt ? new Date(m.startsAt).getTime() : Infinity);
  return [...matches].sort((a, b) => time(a) - time(b));
}
