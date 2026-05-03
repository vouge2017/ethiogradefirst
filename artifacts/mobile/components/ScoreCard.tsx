import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import type { StudentResult } from '@/lib/types';

interface ScoreCardProps {
  result: StudentResult;
  compact?: boolean;
}

export function ScoreCard({ result, compact = false }: ScoreCardProps) {
  const colors = useColors();

  const getScoreColor = (pct: number) => {
    if (pct >= 70) return colors.success;
    if (pct >= 50) return colors.warning;
    return colors.destructive;
  };

  const scoreColor = getScoreColor(result.percentage);
  const displayName = result.studentName;

  if (compact) {
    return (
      <View style={[styles.compact, { backgroundColor: scoreColor + '15', borderColor: scoreColor + '40' }]}>
        <Text style={[styles.compactScore, { color: scoreColor }]}>
          {result.earnedPoints}/{result.totalPoints}
        </Text>
        <Text style={[styles.compactPct, { color: scoreColor }]}>{result.percentage}%</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.row}>
        <View style={styles.main}>
          <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
            {displayName}
          </Text>
          {result.studentId ? (
            <Text style={[styles.sid, { color: colors.mutedForeground }]}>{result.studentId}</Text>
          ) : null}
          <View style={styles.scoreRow}>
            <Text style={[styles.score, { color: scoreColor }]}>{result.earnedPoints}</Text>
            <Text style={[styles.max, { color: colors.mutedForeground }]}>/{result.totalPoints}</Text>
          </View>
        </View>
        <View style={[styles.badge, { backgroundColor: scoreColor + '18' }]}>
          <Text style={[styles.pct, { color: scoreColor }]}>{result.percentage}%</Text>
        </View>
      </View>
      <View style={[styles.bar, { backgroundColor: colors.muted }]}>
        <View
          style={[
            styles.barFill,
            { backgroundColor: scoreColor, width: `${result.percentage}%` as any },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  main: {},
  name: { fontSize: 14, fontFamily: 'Inter_600SemiBold', marginBottom: 1 },
  sid: { fontSize: 11, fontFamily: 'Inter_400Regular', marginBottom: 2 },
  scoreRow: { flexDirection: 'row', alignItems: 'baseline' },
  score: { fontSize: 28, fontFamily: 'Inter_700Bold' },
  max: { fontSize: 16, fontFamily: 'Inter_400Regular', marginLeft: 2 },
  badge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  pct: { fontSize: 20, fontFamily: 'Inter_700Bold' },
  bar: { height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  compact: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  compactScore: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  compactPct: { fontSize: 12, fontFamily: 'Inter_400Regular' },
});
