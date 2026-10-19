import { StyleSheet, Text, View } from 'react-native';
import type { Match } from '../types';
import { formatStart, statusLabel } from '../utils/matches';
import { FavoriteButton } from './FavoriteButton';

type Props = {
  match: Match;
  favorite: boolean;
  onToggleFavorite: () => void;
};

export function MatchCard({ match, favorite, onToggleFavorite }: Props) {
  const score = match.score !== null ? `${match.score.home} : ${match.score.away}` : '– : –';

  return (
    <View style={styles.card}>
      <View style={styles.teams}>
        <Text style={styles.team}>{match.home.name}</Text>
        <Text style={styles.team}>{match.away.name}</Text>
      </View>
      <View style={styles.center}>
        <Text style={styles.score}>{score}</Text>
        <Text style={[styles.status, match.status === 'live' && styles.live]}>{statusLabel(match)}</Text>
        <Text style={styles.date}>{formatStart(match.startsAt)}</Text>
      </View>
      <FavoriteButton active={favorite} onPress={onToggleFavorite} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  teams: { flex: 1, flexShrink: 1, gap: 4 },
  team: { fontSize: 16, fontWeight: '600' },
  center: { alignItems: 'center', minWidth: 110 },
  score: { fontSize: 18, fontWeight: '700' },
  status: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  live: { color: '#ef3124', fontWeight: '700' },
  date: { fontSize: 12, color: '#6b7280', textAlign: 'center' },
});
