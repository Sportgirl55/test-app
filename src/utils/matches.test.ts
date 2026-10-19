import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { Match } from '../types';
import { formatStart, matchesFilter, sortByStart, statusLabel } from './matches';

const team = (id: string) => ({ id, name: id, city: id });

function makeMatch(id: string, status: string, extra: Partial<Match> = {}): Match {
  return {
    id,
    startsAt: '2026-10-11T13:00:00Z',
    status,
    home: team('home'),
    away: team('away'),
    score: null,
    ...extra,
  };
}

describe('matchesFilter', () => {
  const finished = makeMatch('m1', 'finished');
  const scheduled = makeMatch('m2', 'scheduled');
  const live = makeMatch('m3', 'live', { minute: 67 });
  const postponed = makeMatch('m4', 'postponed', { startsAt: null });
  const unknown = makeMatch('m5', 'abandoned');
  const all = [finished, scheduled, live, postponed, unknown];

  const ids = (filter: Parameters<typeof matchesFilter>[1]) =>
    all.filter((m) => matchesFilter(m, filter)).map((m) => m.id);

  it('«Все» оставляет каждый матч', () => {
    assert.deepEqual(ids('all'), ['m1', 'm2', 'm3', 'm4', 'm5']);
  });

  it('«Завершённые» — только finished', () => {
    assert.deepEqual(ids('finished'), ['m1']);
  });

  it('«Предстоящие» — всё, что не закончилось: scheduled, live, postponed и неизвестные статусы', () => {
    assert.deepEqual(ids('upcoming'), ['m2', 'm3', 'm4', 'm5']);
  });

  it('«Предстоящие» и «Завершённые» вместе дают все матчи без пересечений', () => {
    const both = [...ids('upcoming'), ...ids('finished')].sort();
    assert.deepEqual(both, ids('all'));
  });
});

describe('statusLabel', () => {
  it('переводит известные статусы', () => {
    assert.equal(statusLabel(makeMatch('a', 'finished')), 'Завершён');
    assert.equal(statusLabel(makeMatch('a', 'postponed')), 'Перенесён');
  });

  it('для live добавляет минуту', () => {
    assert.equal(statusLabel(makeMatch('a', 'live', { minute: 67 })), 'Идёт, 67′');
  });

  it('неизвестный статус показывает как есть', () => {
    assert.equal(statusLabel(makeMatch('a', 'abandoned')), 'abandoned');
  });
});

describe('formatStart', () => {
  it('null и некорректная дата → «Дата уточняется»', () => {
    assert.equal(formatStart(null), 'Дата уточняется');
    assert.equal(formatStart('не дата'), 'Дата уточняется');
  });
});

describe('sortByStart', () => {
  it('сортирует по дате, матчи без даты — в конце, исходный массив не меняется', () => {
    const late = makeMatch('late', 'scheduled', { startsAt: '2026-10-19T16:30:00Z' });
    const none = makeMatch('none', 'postponed', { startsAt: null });
    const early = makeMatch('early', 'finished', { startsAt: '2026-10-11T13:00:00Z' });
    const input = [none, late, early];

    assert.deepEqual(
      sortByStart(input).map((m) => m.id),
      ['early', 'late', 'none'],
    );
    assert.deepEqual(
      input.map((m) => m.id),
      ['none', 'late', 'early'],
    );
  });
});
