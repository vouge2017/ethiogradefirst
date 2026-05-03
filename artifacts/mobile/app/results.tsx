import React, { useCallback, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useAssessment } from '@/context/AssessmentContext';
import { ScoreCard } from '@/components/ScoreCard';
import { exportCSV } from '@/lib/csv';

export default function ResultsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentAssessment } = useAssessment();
  const [exporting, setExporting] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  if (!currentAssessment) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.destructive }]}>No active assessment.</Text>
      </View>
    );
  }

  const confirmed = currentAssessment.results.filter(r => r.confirmedAt > 0);
  const pending = currentAssessment.results.filter(r => r.confirmedAt === 0);
  const avgScore =
    confirmed.length > 0
      ? Math.round(confirmed.reduce((s, r) => s + r.percentage, 0) / confirmed.length)
      : null;
  const passRate =
    confirmed.length > 0
      ? Math.round((confirmed.filter(r => r.percentage >= 50).length / confirmed.length) * 100)
      : null;

  const handleExport = useCallback(async () => {
    if (confirmed.length === 0) {
      Alert.alert('No confirmed results', 'Confirm at least one student result before exporting.');
      return;
    }
    setExporting(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await exportCSV(currentAssessment);
    } catch {
      Alert.alert('Export failed', 'Could not export results. Please try again.');
    } finally {
      setExporting(false);
    }
  }, [currentAssessment, confirmed.length]);

  const handleReview = useCallback((resultId: string) => {
    router.push({ pathname: '/review', params: { resultId } });
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
          {currentAssessment.title}
        </Text>
        <TouchableOpacity
          onPress={handleExport}
          disabled={exporting || confirmed.length === 0}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Feather name="download" size={20} color={confirmed.length > 0 ? colors.primary : colors.mutedForeground} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 80 }]}
      >
        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{confirmed.length}</Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Confirmed</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: avgScore !== null ? colors.accent : colors.mutedForeground }]}>
              {avgScore !== null ? `${avgScore}%` : '—'}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Class Avg</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: passRate !== null ? colors.success : colors.mutedForeground }]}>
              {passRate !== null ? `${passRate}%` : '—'}
            </Text>
            <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Pass Rate</Text>
          </View>
        </View>

        {/* Question summary */}
        <View style={styles.keySection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Question Summary</Text>
          <View style={[styles.keyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.keyGrid}>
              {currentAssessment.questions.map(q => (
                <View key={q.id} style={styles.keyItem}>
                  <Text style={[styles.keyQ, { color: colors.mutedForeground }]}>{q.number}</Text>
                  <Text style={[styles.keyType, { color: colors.primary }]}>
                    {q.type === 'mcq' ? q.correctAnswer ?? '—'
                      : q.type === 'true_false' ? (q.correctBoolean === true ? 'T' : q.correctBoolean === false ? 'F' : '—')
                      : `${q.weight}p`}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Pending */}
        {pending.length > 0 && (
          <View style={styles.pendingSection}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Pending Review ({pending.length})
            </Text>
            {pending.map(r => (
              <TouchableOpacity
                key={r.id}
                onPress={() => handleReview(r.id)}
                activeOpacity={0.75}
                style={[styles.pendingCard, { backgroundColor: colors.card, borderColor: colors.warning + '50' }]}
              >
                <View style={styles.pendingLeft}>
                  <View style={[styles.pendingDot, { backgroundColor: colors.warning }]} />
                  <Text style={[styles.pendingLabel, { color: colors.foreground }]}>{r.studentName}</Text>
                </View>
                <View style={styles.pendingRight}>
                  <Text style={[styles.pendingIssues, { color: colors.warning }]}>
                    {r.issues.length > 0 ? `${r.issues.length} issue${r.issues.length !== 1 ? 's' : ''}` : 'Tap to review'}
                  </Text>
                  <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Confirmed results */}
        {confirmed.length > 0 && (
          <View style={styles.completedSection}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Results ({confirmed.length})
            </Text>
            {confirmed.map(r => (
              <ScoreCard key={r.id} result={r} />
            ))}
          </View>
        )}

        {currentAssessment.results.length === 0 && (
          <View style={styles.empty}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
              <Feather name="file-text" size={28} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No students yet</Text>
            <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
              Scan papers to start grading
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomPad + 12, borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={handleExport}
          activeOpacity={0.8}
          disabled={exporting || confirmed.length === 0}
          style={[styles.exportBtn, { borderColor: colors.primary, backgroundColor: colors.card, opacity: confirmed.length === 0 ? 0.5 : 1 }]}
        >
          <Feather name="share" size={16} color={colors.primary} />
          <Text style={[styles.exportBtnText, { color: colors.primary }]}>
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/scan')}
          activeOpacity={0.8}
          style={[styles.scanBtn, { backgroundColor: colors.primary }]}
        >
          <Feather name="camera" size={18} color="#fff" />
          <Text style={styles.scanBtnText}>Scan More</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1,
  },
  headerTitle: { flex: 1, fontSize: 16, fontFamily: 'Inter_600SemiBold', marginHorizontal: 10 },
  content: { padding: 16, gap: 20 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 14, borderRadius: 12, borderWidth: 1, gap: 4 },
  statValue: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  statLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  keySection: { gap: 10 },
  sectionTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  keyBox: { padding: 14, borderRadius: 12, borderWidth: 1 },
  keyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  keyItem: { width: 36, alignItems: 'center' },
  keyQ: { fontSize: 10, fontFamily: 'Inter_400Regular' },
  keyType: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  pendingSection: { gap: 8 },
  pendingCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderRadius: 12, borderWidth: 1,
  },
  pendingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pendingDot: { width: 8, height: 8, borderRadius: 4 },
  pendingLabel: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  pendingRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pendingIssues: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  completedSection: { gap: 8 },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyIcon: { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  emptyText: { fontSize: 13, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  footer: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1 },
  exportBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 18, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5,
  },
  exportBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  scanBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 14,
  },
  scanBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  errorText: { textAlign: 'center', marginTop: 60, fontSize: 16, fontFamily: 'Inter_400Regular' },
});
