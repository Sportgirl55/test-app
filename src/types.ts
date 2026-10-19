export type Team = {
  id: string;
  name: string;
  city: string;
};

export type Score = {
  home: number;
  away: number;
};

export type KnownStatus = 'scheduled' | 'live' | 'finished' | 'postponed';

export type Match = {
  id: string;
  startsAt: string | null;
  status: string;
  minute?: number;
  home: Team;
  away: Team;
  score: Score | null;
};

export type MatchesResponse = {
  round: number;
  matches: Match[];
};

export type Filter = 'all' | 'upcoming' | 'finished';
