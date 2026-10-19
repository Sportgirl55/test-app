export type Team = {
  id: string;
  name: string;
  city: string;
};

export type Score = {
  home: number;
  away: number;
};

// Известные статусы. Сервер может прислать и другой, поэтому в Match.status — string.
export type KnownStatus = 'scheduled' | 'live' | 'finished' | 'postponed';

export type Match = {
  id: string;
  // null — дата ещё не назначена (например, у перенесённого матча).
  startsAt: string | null;
  status: string;
  // Только у матчей в статусе live.
  minute?: number;
  home: Team;
  away: Team;
  // null — счёта нет (матч не начался или перенесён).
  score: Score | null;
};

export type MatchesResponse = {
  round: number;
  matches: Match[];
};

export type Filter = 'all' | 'upcoming' | 'finished';
