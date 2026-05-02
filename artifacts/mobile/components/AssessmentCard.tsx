import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { Assessment } from '@/lib/types';

interface AssessmentCardProps {
  assessment: Assessment;
  onPress: () => void;
  onDelete: () => void;
}

export function AssessmentCard({ assessment, onPress, onDelete }: AssessmentCardProps) {
  const colors = useColors();
  const completed = assessment.papers.filter(p => p.reviewComplete).length;
  const total = assessment.papers.length;
  const avg =
    completed > 0
      ? Math.round(
          assessment.papers
            .filter(p => p.reviewComplete)
            .reduce((sum, p) => sum + p.percentage, 0) / completed
        )
      : null;

  const date = new Date(assessment.updatedAt).toLocaleDateString('en-ET', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.75}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <View style={[styles.iconBg, { backgroundColor: colors.primary + '18' }]}>
            <Feather name="clipboard" size={18} color={colors.primary} />
          </View>
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={1}>
            {assessment.title}
          </Text>
          <Text style={[styles.meta, { color: colors.mutedForeground }]}>
            {assessment.questionCount} questions · {date}
          </Text>
        </View>
        <TouchableOpacity onPress={onDelete} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Feather name="trash-2" size={16} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>{total}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Papers</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: colors.success }]}>{completed}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Reviewed</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: avg !== null ? colors.accent : colors.mutedForeground }]}>
            {avg !== null ? `${avg}%` : '—'}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Avg Score</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {},
  iconBg: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
});
