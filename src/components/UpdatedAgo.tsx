import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

type Props = {
  // Момент последней успешной загрузки данных.
  since: Date;
};

const secondsSince = (since: Date) => Math.max(0, Math.floor((Date.now() - since.getTime()) / 1000));

// Подпись «Обновлено N сек назад».
export function UpdatedAgo({ since }: Props) {
  const [seconds, setSeconds] = useState(() => secondsSince(since));

  useEffect(() => {
    // Новое значение since — сразу сбрасываем счётчик.
    setSeconds(secondsSince(since));
    const id = setInterval(() => setSeconds(secondsSince(since)), 1000);
    // Без очистки интервалы накапливались бы при каждом обновлении и после размонтирования.
    return () => clearInterval(id);
  }, [since]);

  return <Text style={styles.text}>Обновлено {seconds} сек назад</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontSize: 13,
    color: '#6b7280',
  },
});
