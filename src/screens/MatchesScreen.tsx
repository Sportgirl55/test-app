import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { MatchCard } from '../components/MatchCard';
import { UpdatedAgo } from '../components/UpdatedAgo';
import { MATCHES_URL } from '../config';
import { useFavorites } from '../hooks/useFavorites';
import type { Filter, Match, MatchesResponse } from '../types';
import { matchesFilter, sortByStart } from '../utils/matches';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'upcoming', label: 'Предстоящие' },
  { key: 'finished', label: 'Завершённые' },
];

async function fetchMatches(): Promise<MatchesResponse> {
  const res = await fetch(MATCHES_URL);
  if (!res.ok) throw new Error(`Сервер ответил ${res.status}`);
  const json = (await res.json()) as MatchesResponse;
  if (!json || !Array.isArray(json.matches)) throw new Error('Неожиданный формат ответа');
  return json;
}

// Экран «Матчи тура» — задание в README.md, часть 1.
export function MatchesScreen() {
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [round, setRound] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const { isFavorite, toggle, favorites } = useFavorites();

  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMatches();
      if (id !== requestId.current) return;
      setMatches(sortByStart(data.matches));
      setRound(data.round);
      setUpdatedAt(new Date());
    } catch (e) {
      if (id !== requestId.current) return;
      setError(e instanceof Error ? e.message : 'Неизвестная ошибка');
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => (matches ?? []).filter((m) => matchesFilter(m, filter)), [matches, filter]);

  if (matches === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Матчи тура</Text>
        <View style={styles.center}>
          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <>
              <Text style={styles.message}>Не удалось загрузить матчи{error ? `: ${error}` : ''}</Text>
              <Pressable style={styles.button} onPress={load} accessibilityRole="button">
                <Text style={styles.buttonText}>Повторить</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Матчи тура{round !== null ? ` ${round}` : ''}</Text>

      <View style={styles.filters}>
        {FILTERS.map(({ key, label }) => (
          <Pressable
            key={key}
            onPress={() => setFilter(key)}
            style={[styles.chip, filter === key && styles.chipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: filter === key }}
          >
            <Text style={[styles.chipText, filter === key && styles.chipTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.updateRow}>
        {updatedAt && <UpdatedAgo since={updatedAt} />}
        <Pressable onPress={load} disabled={loading} accessibilityRole="button">
          <Text style={[styles.link, loading && styles.linkDisabled]}>Обновить</Text>
        </Pressable>
      </View>

      {/* Ошибка при обновлении: старые данные остаются на экране. */}
      {error && <Text style={styles.errorBanner}>Не удалось обновить: {error}</Text>}

      <FlatList
        data={visible}
        keyExtractor={(m) => m.id}
        extraData={favorites}
        renderItem={({ item }) => (
          <MatchCard match={item} favorite={isFavorite(item.id)} onToggleFavorite={() => toggle(item.id)} />
        )}
        refreshing={loading}
        onRefresh={load}
        contentContainerStyle={visible.length === 0 ? styles.emptyContent : undefined}
        ListEmptyComponent={
          <Text style={styles.message}>
            {matches.length === 0 ? 'В этом туре пока нет матчей' : 'В этой категории матчей нет'}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  message: { fontSize: 15, color: '#374151', textAlign: 'center' },
  emptyContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f3f4f6' },
  chipActive: { backgroundColor: '#111827' },
  chipText: { fontSize: 14, color: '#374151' },
  chipTextActive: { color: '#fff' },
  updateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  link: { fontSize: 14, color: '#2563eb', fontWeight: '600' },
  linkDisabled: { color: '#9ca3af' },
  errorBanner: { fontSize: 13, color: '#b91c1c', marginBottom: 8 },
  button: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, backgroundColor: '#111827' },
  buttonText: { color: '#fff', fontWeight: '600' },
});
