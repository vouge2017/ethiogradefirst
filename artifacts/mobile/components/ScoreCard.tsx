import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import type { PaperResult } from '@/lib/types';

interface ScoreCardProps {
  paper: PaperResult;
  compact?: boolean;
}

export function ScoreCard({ paper, compact = false }: ScoreCardProps) {
  const colors = useColors();

  const getScoreColor = (pct: number) => {
    if (pct >= 70) return colors.success;
    if (pct >= 50) return colors.warning;
    return colors.destructive;
  };

  const scoreColor = getScoreColor(paper.percentage);

  if (compact) {
    return (
      <View style={[styles.compact, { backgroundColor: scoreColor + '15', borderColor: scoreColor + '40' }]}>
        <Text style={[styles.compactScore, { color: scoreColor }]}>
          {paper.score}/{paper.maxScore}
        </Text>
        <Text style={[styles.compactPct, { color: scoreColor }]}>{paper.percentage}%</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.row}>
        <View style={styles.main}>
          <Text style={[styles.label, { color: colors.mutedForeground }]}>{paper.label}</Text>
          <View style={styles.scoreRow}>
            <Text style={[styles.score, { color: scoreColor }]}>{paper.score}</Text>
            <Text style={[styles.max, { color: colors.mutedForeground }]}>/{paper.maxScore}</Text>
          </View>
        </View>
        <View style={[styles.badge, { backgroundColor: scoreColor + '18' }]}>
          <Text style={[styles.pct, { color: scoreColor }]}>{paper.percentage}%</Text>
        </View>
      </View>
      <View style={[styles.bar, { backgroundColor: colors.muted }]}>
        <View
          style={[
            styles.barFill,
            { backgroundColor: scoreColor, width: `${paper.percentage}%` as any },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  main: {},
  label: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginBottom: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  score: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
  },
  max: {
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    marginLeft: 2,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pct: {
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
  },
  bar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  compact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  compactScore: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  compactPct: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
});
