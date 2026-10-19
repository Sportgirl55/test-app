import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'favorites:v1';

// Из хранилища может прийти что угодно (старая версия, ручная правка) — принимаем только массив строк.
function parseFavorites(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

// Избранные матчи (по id). Сохраняются между запусками приложения.
export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  // Пока сохранённое значение не прочитано, ничего не записываем:
  // иначе стартовый [] затёр бы избранное, лежащее в хранилище.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled) return;
        const saved = parseFavorites(raw);
        // Объединяем с тем, что пользователь успел нажать, пока шла загрузка.
        setFavorites((prev) => [...saved, ...prev.filter((id) => !saved.includes(id))]);
      })
      .catch(() => {
        // Хранилище недоступно — работаем только в памяти.
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favorites)).catch(() => {});
  }, [favorites, hydrated]);

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites]);

  // Всегда создаём новый массив: React сравнивает состояние по ссылке,
  // поэтому мутация старого массива не вызывает перерисовку.
  const toggle = useCallback((id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  return { favorites, isFavorite, toggle };
}
