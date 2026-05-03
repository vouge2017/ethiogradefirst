/**
 * Grading Session Hub — EthioGrade v0.1
 *
 * This screen is the entry point for grading students in an active assessment.
 * It shows grading progress and routes teachers to Manual Entry.
 *
 * NOTE: Camera/OMR scanning is NOT available in v0.1.
 * The fake Math.random() scan has been removed from this production flow.
 * See lib/omr.mock.dev.ts for the isolated mock (dev reference only).
 * See docs/SCANNING_ROADMAP.md for the plan to add real scanning in v0.2+.
 */
import React from 'react';
import {
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
import { useColors } from '@/hooks/useColors';
import { useAssessment } from '@/context/AssessmentContext';

export default function GradingHubScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentAssessment } = useAssessment();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  if (!currentAssessment) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Feather name="arrow-left" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Grade Students</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centered}>
          <Text style={[styles.errorText, { color: colors.destructive }]}>
            No active assessment. Go back and open one.
          </Text>
        </View>
      </View>
    );
  }

  const confirmed = currentAssessment.results.filter(r => r.confirmedAt > 0);
  const pending = currentAssessment.results.filter(r => r.confirmedAt === 0);
  const nextStudentNum = currentAssessment.results.length + 1;
  const expected = currentAssessment.expectedPaperCount;

  const progressPct = expected
    ? Math.min(100, Math.round((confirmed.length / expected) * 100))
    : null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
          Grade Students
        </Text>
        <TouchableOpacity
          onPress={() => router.push('/results')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          disabled={confirmed.length === 0}
        >
          <Text style={[styles.resultsLink, { color: confirmed.length > 0 ? colors.primary : colors.mutedForeground }]}>
            Results
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 32 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Assessment info card */}
        <View style={[styles.assessmentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.assessmentCardTop}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primary + '18' }]}>
              <Feather name="clipboard" size={22} color={colors.primary} />
            </View>
            <View style={styles.assessmentMeta}>
              <Text style={[styles.assessmentTitle, { color: colors.foreground }]} numberOfLines={2}>
                {currentAssessment.title}
              </Text>
              <Text style={[styles.assessmentSub, { color: colors.mutedForeground }]}>
                {currentAssessment.questions.length} questions · {currentAssessment.totalPoints} pts total
              </Text>
            </View>
          </View>

          {/* Progress bar */}
          {progressPct !== null && (
            <View style={styles.progressSection}>
              <View style={styles.progressLabelRow}>
                <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
                  {confirmed.length} of {expected} students graded
                </Text>
                <Text style={[styles.progressPct, { color: colors.primary }]}>{progressPct}%</Text>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
                <View style={[styles.progressFill, { backgroundColor: colors.primary, width: `${progressPct}%` as any }]} />
              </View>
            </View>
          )}
        </View>

        {/* Status row */}
        <View style={styles.statusRow}>
          <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statusDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.statusNum, { color: colors.foreground }]}>{confirmed.length}</Text>
            <Text style={[styles.statusLabel, { color: colors.mutedForeground }]}>Confirmed</Text>
          </View>
          <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.statusDot, { backgroundColor: colors.warning }]} />
            <Text style={[styles.statusNum, { color: colors.foreground }]}>{pending.length}</Text>
            <Text style={[styles.statusLabel, { color: colors.mutedForeground }]}>Pending</Text>
          </View>
          {expected && (
            <View style={[styles.statusCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.statusDot, { backgroundColor: colors.border }]} />
              <Text style={[styles.statusNum, { color: colors.foreground }]}>{expected}</Text>
              <Text style={[styles.statusLabel, { color: colors.mutedForeground }]}>Expected</Text>
            </View>
          )}
        </View>

        {/* Pending review list */}
        {pending.length > 0 && (
          <View style={styles.pendingSection}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Pending Review ({pending.length})
            </Text>
            {pending.map(r => (
              <TouchableOpacity
                key={r.id}
                onPress={() => router.push({ pathname: '/review', params: { resultId: r.id } })}
                activeOpacity={0.75}
                style={[styles.pendingCard, { backgroundColor: colors.card, borderColor: colors.warning + '50' }]}
              >
                <View style={styles.pendingLeft}>
                  <View style={[styles.pendingDot, { backgroundColor: colors.warning }]} />
                  <Text style={[styles.pendingName, { color: colors.foreground }]}>{r.studentName}</Text>
                </View>
                <View style={styles.pendingRight}>
                  <Text style={[styles.pendingHint, { color: colors.warning }]}>Tap to confirm</Text>
                  <Feather name="chevron-right" size={15} color={colors.mutedForeground} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Primary CTA */}
        <View style={styles.ctaSection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Grade a Student</Text>

          <TouchableOpacity
            onPress={() => router.push('/manual')}
            activeOpacity={0.85}
            style={[styles.gradeBtn, { backgroundColor: colors.primary }]}
          >
            <Feather name="edit-3" size={20} color="#fff" />
            <View style={styles.gradeBtnText}>
              <Text style={styles.gradeBtnTitle}>
                {nextStudentNum === 1 ? 'Grade First Student' : `Grade Student ${nextStudentNum}`}
              </Text>
              <Text style={styles.gradeBtnSub}>Enter answers and score manually</Text>
            </View>
            <Feather name="arrow-right" size={18} color="#fff" />
          </TouchableOpacity>

          {/* Master Scan — coming soon */}
          <View style={[styles.comingSoonBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="camera" size={18} color={colors.mutedForeground} />
            <View style={styles.comingSoonText}>
              <Text style={[styles.comingSoonTitle, { color: colors.mutedForeground }]}>Master Scan — Set Key by Photo</Text>
              <Text style={[styles.comingSoonSub, { color: colors.mutedForeground }]}>Scan your answer key sheet · Coming in v0.2</Text>
            </View>
            <View style={[styles.soonBadge, { backgroundColor: colors.border }]}>
              <Text style={[styles.soonBadgeText, { color: colors.mutedForeground }]}>v0.2</Text>
            </View>
          </View>

          {/* Student Scan — coming soon */}
          <View style={[styles.comingSoonBtn, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="file-text" size={18} color={colors.mutedForeground} />
            <View style={styles.comingSoonText}>
              <Text style={[styles.comingSoonTitle, { color: colors.mutedForeground }]}>Student Scan — Scan Paper Sheets</Text>
              <Text style={[styles.comingSoonSub, { color: colors.mutedForeground }]}>Scan student answer sheets · Coming in v0.3</Text>
            </View>
            <View style={[styles.soonBadge, { backgroundColor: colors.border }]}>
              <Text style={[styles.soonBadgeText, { color: colors.mutedForeground }]}>v0.3</Text>
            </View>
          </View>

          <View style={[styles.infoBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="info" size={13} color={colors.mutedForeground} />
            <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
              EthioGrade v0.1 is an offline manual grading assistant.
              Camera-based scanning is planned for a future release.
            </Text>
          </View>
        </View>

        {/* View results CTA */}
        {confirmed.length > 0 && (
          <TouchableOpacity
            onPress={() => router.push('/results')}
            activeOpacity={0.8}
            style={[styles.viewResultsBtn, { borderColor: colors.primary, backgroundColor: colors.card }]}
          >
            <Feather name="bar-chart-2" size={16} color={colors.primary} />
            <Text style={[styles.viewResultsText, { color: colors.primary }]}>
              View Results — {confirmed.length} student{confirmed.length !== 1 ? 's' : ''} graded
            </Text>
            <Feather name="chevron-right" size={15} color={colors.primary} />
          </TouchableOpacity>
        )}
      </ScrollView>
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
  resultsLink: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 16 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  errorText: { fontSize: 15, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  assessmentCard: { padding: 16, borderRadius: 14, borderWidth: 1, gap: 14 },
  assessmentCardTop: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  iconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  assessmentMeta: { flex: 1, gap: 3 },
  assessmentTitle: { fontSize: 16, fontFamily: 'Inter_700Bold', lineHeight: 22 },
  assessmentSub: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  progressSection: { gap: 6 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  progressPct: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  statusRow: { flexDirection: 'row', gap: 10 },
  statusCard: {
    flex: 1, padding: 12, borderRadius: 12, borderWidth: 1,
    alignItems: 'center', gap: 4,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 2 },
  statusNum: { fontSize: 22, fontFamily: 'Inter_700Bold' },
  statusLabel: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  pendingSection: { gap: 8 },
  sectionTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  pendingCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14, borderRadius: 12, borderWidth: 1,
  },
  pendingLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pendingDot: { width: 8, height: 8, borderRadius: 4 },
  pendingName: { fontSize: 14, fontFamily: 'Inter_500Medium' },
  pendingRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pendingHint: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  ctaSection: { gap: 10 },
  gradeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderRadius: 14,
  },
  gradeBtnText: { flex: 1, gap: 2 },
  gradeBtnTitle: { color: '#fff', fontSize: 16, fontFamily: 'Inter_700Bold' },
  gradeBtnSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontFamily: 'Inter_400Regular' },
  comingSoonBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderRadius: 14, borderWidth: 1,
  },
  comingSoonText: { flex: 1, gap: 2 },
  comingSoonTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  comingSoonSub: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  soonBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  soonBadgeText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    padding: 12, borderRadius: 10, borderWidth: 1,
  },
  infoText: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 17 },
  viewResultsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 14, borderRadius: 14, borderWidth: 1.5,
  },
  viewResultsText: { flex: 1, fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
