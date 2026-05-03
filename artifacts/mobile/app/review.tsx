import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useAssessment } from '@/context/AssessmentContext';
import { AnswerSelector } from '@/components/AnswerBubble';
import type { Question, QuestionResponse, StudentResult } from '@/lib/types';
import { calcEarnedPoints } from '@/lib/types';

type QStatus = 'done' | 'attention' | 'manual_needed' | 'pending';

function getStatus(q: Question, r: QuestionResponse): QStatus {
  if (q.type === 'mcq') {
    return r.selectedAnswer !== undefined ? (r.issueCodes.length > 0 ? 'attention' : 'done') : 'pending';
  }
  if (q.type === 'true_false') {
    return r.booleanAnswer !== undefined ? (r.issueCodes.length > 0 ? 'attention' : 'done') : 'pending';
  }
  return r.manualScore !== undefined ? 'done' : 'manual_needed';
}

function statusColor(status: QStatus, colors: ReturnType<typeof useColors>): string {
  if (status === 'done') return colors.success;
  if (status === 'attention') return colors.warning;
  if (status === 'manual_needed') return colors.accent;
  return colors.border;
}

export default function ReviewScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { resultId } = useLocalSearchParams<{ resultId: string }>();
  const { currentAssessment, updateResult } = useAssessment();
  const dotScrollRef = useRef<ScrollView>(null);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const draftResult = useMemo(
    () => currentAssessment?.results.find(r => r.id === resultId),
    [currentAssessment, resultId]
  );

  const [localResponses, setLocalResponses] = useState<QuestionResponse[]>(
    draftResult?.responses ?? []
  );
  const [studentName, setStudentName] = useState(draftResult?.studentName ?? '');
  const [studentId, setStudentId] = useState(draftResult?.studentId ?? '');
  const [page, setPage] = useState(0); // 0 = student info, 1..N = questions
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateResponse = useCallback((questionId: string, patch: Partial<QuestionResponse>) => {
    setLocalResponses(prev => prev.map(r => r.questionId === questionId ? { ...r, ...patch } : r));
    setError(null);
  }, []);

  const previewEarned = useMemo(
    () => currentAssessment ? calcEarnedPoints(localResponses, currentAssessment.questions) : 0,
    [localResponses, currentAssessment]
  );

  const questions = currentAssessment?.questions ?? [];
  const totalPages = questions.length + 1; // 0 = info, 1..N = questions

  const statuses: QStatus[] = useMemo(() =>
    questions.map(q => {
      const r = localResponses.find(r => r.questionId === q.id);
      return r ? getStatus(q, r) : 'pending';
    }),
    [questions, localResponses]
  );

  const needsManualCount = statuses.filter(s => s === 'manual_needed').length;
  const allDone = statuses.every(s => s === 'done' || s === 'attention');

  const goTo = useCallback((p: number) => {
    Haptics.selectionAsync();
    setPage(p);
    if (p > 0) {
      const dotOffset = Math.max(0, (p - 1) * 36 - 120);
      dotScrollRef.current?.scrollTo({ x: dotOffset, animated: true });
    }
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!draftResult || !currentAssessment) return;
    if (needsManualCount > 0) {
      setError(`${needsManualCount} question${needsManualCount !== 1 ? 's' : ''} still need a manual score. Enter 0 if blank.`);
      goTo(questions.findIndex((q, i) => statuses[i] === 'manual_needed') + 1);
      return;
    }
    setError(null);
    setConfirming(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const finalResponses = localResponses.map(r => {
      const q = currentAssessment.questions.find(q => q.id === r.questionId)!;
      if (r.type === 'mcq') return { ...r, isCorrect: r.selectedAnswer === q.correctAnswer };
      if (r.type === 'true_false') return { ...r, isCorrect: r.booleanAnswer === q.correctBoolean };
      return r;
    });

    const earnedPoints = calcEarnedPoints(finalResponses, currentAssessment.questions);
    const totalPoints = currentAssessment.totalPoints;
    const confirmed: StudentResult = {
      ...draftResult,
      studentName: studentName.trim() || draftResult.studentName,
      studentId: studentId.trim() || undefined,
      responses: finalResponses,
      earnedPoints,
      totalPoints,
      percentage: totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 10000) / 100 : 0,
      confirmedAt: Date.now(),
    };

    await updateResult(draftResult.id, confirmed);
    setConfirming(false);
    router.replace('/scan');
  }, [draftResult, currentAssessment, localResponses, studentName, studentId, needsManualCount, statuses, questions, updateResult, goTo]);

  if (!draftResult || !currentAssessment) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.destructive }]}>Result not found.</Text>
      </View>
    );
  }

  const totalPoints = currentAssessment.totalPoints;
  const isInfoPage = page === 0;
  const qIdx = page - 1; // 0-based index into questions array
  const question = !isInfoPage ? questions[qIdx] : null;
  const response = question ? localResponses.find(r => r.questionId === question.id)! : null;
  const currentStatus = question ? statuses[qIdx] : null;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
            {studentName.trim() || draftResult.studentName}
          </Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            {isInfoPage ? 'Student Info' : `Q${page} of ${questions.length}`}
          </Text>
        </View>
        <View style={[styles.scorePill, { backgroundColor: colors.primary + '18' }]}>
          <Text style={[styles.scorePillText, { color: colors.primary }]}>
            {previewEarned}/{totalPoints}
          </Text>
        </View>
      </View>

      {/* Progress dot strip */}
      <View style={[styles.progressBar, { borderBottomColor: colors.border, backgroundColor: colors.card }]}>
        <TouchableOpacity
          onPress={() => goTo(0)}
          style={[
            styles.infoDot,
            {
              backgroundColor: page === 0 ? colors.primary : colors.muted,
              borderColor: page === 0 ? colors.primary : colors.border,
            },
          ]}
        >
          <Feather name="user" size={10} color={page === 0 ? '#fff' : colors.mutedForeground} />
        </TouchableOpacity>
        <View style={[styles.progressDivider, { backgroundColor: colors.border }]} />
        <ScrollView ref={dotScrollRef} horizontal showsHorizontalScrollIndicator={false} style={styles.dotScroll} contentContainerStyle={styles.dotRow}>
          {questions.map((q, i) => {
            const st = statuses[i];
            const isCurrent = page === i + 1;
            const dotColor = statusColor(st, colors);
            return (
              <TouchableOpacity key={q.id} onPress={() => goTo(i + 1)} style={styles.dotWrap}>
                <View style={[
                  styles.dot,
                  {
                    backgroundColor: isCurrent ? dotColor : dotColor + '55',
                    borderColor: isCurrent ? dotColor : 'transparent',
                    borderWidth: isCurrent ? 2 : 0,
                    transform: [{ scale: isCurrent ? 1.3 : 1 }],
                  },
                ]} />
                <Text style={[styles.dotNum, { color: isCurrent ? colors.foreground : colors.mutedForeground }]}>
                  {q.number}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main card area */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.cardArea, { paddingBottom: bottomPad + 110 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Error banner */}
        {error && (
          <View style={[styles.errorBanner, { backgroundColor: colors.destructive + '12', borderColor: colors.destructive + '40' }]}>
            <Feather name="alert-circle" size={14} color={colors.destructive} />
            <Text style={[styles.errorBannerText, { color: colors.destructive }]}>{error}</Text>
            <TouchableOpacity onPress={() => setError(null)}>
              <Feather name="x" size={14} color={colors.destructive} />
            </TouchableOpacity>
          </View>
        )}

        {/* Info page */}
        {isInfoPage && (
          <View style={styles.infoPage}>
            <View style={[styles.bigCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.bigCardTitle, { color: colors.foreground }]}>Student Info</Text>
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Name *</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="Student name"
                  placeholderTextColor={colors.mutedForeground}
                  value={studentName}
                  onChangeText={setStudentName}
                  returnKeyType="next"
                  maxLength={80}
                  autoCorrect={false}
                  autoFocus
                />
              </View>
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                  Student ID <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12 }}>(optional)</Text>
                </Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                  placeholder="e.g. STU-001"
                  placeholderTextColor={colors.mutedForeground}
                  value={studentId}
                  onChangeText={setStudentId}
                  returnKeyType="done"
                  maxLength={30}
                  autoCorrect={false}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {draftResult.issues.length > 0 && (
              <View style={[styles.bigCard, { backgroundColor: colors.warning + '0E', borderColor: colors.warning + '30' }]}>
                <View style={styles.issueHeader}>
                  <Feather name="alert-triangle" size={14} color={colors.warning} />
                  <Text style={[styles.bigCardTitle, { color: colors.warning }]}>
                    {draftResult.issues.length} detection issue{draftResult.issues.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                {draftResult.issues.map(c => (
                  <Text key={c} style={[styles.issueItem, { color: colors.warning }]}>
                    · {c.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                ))}
              </View>
            )}

            {needsManualCount > 0 && (
              <View style={[styles.bigCard, { backgroundColor: colors.accent + '12', borderColor: colors.accent + '30' }]}>
                <View style={styles.issueHeader}>
                  <Feather name="edit-2" size={14} color={colors.accent} />
                  <Text style={[styles.bigCardTitle, { color: colors.accent }]}>
                    {needsManualCount} question{needsManualCount !== 1 ? 's' : ''} need manual scores
                  </Text>
                </View>
                <Text style={[styles.issueItem, { color: colors.mutedForeground }]}>
                  These are highlighted in orange dots above. Tap a dot to jump to that question.
                </Text>
              </View>
            )}

            <View style={[styles.hintCard, { backgroundColor: colors.muted }]}>
              <Text style={[styles.hintText, { color: colors.mutedForeground }]}>
                Tap any dot above to jump to a question. Orange = issue, amber = needs score, green = done.
              </Text>
            </View>
          </View>
        )}

        {/* Question card */}
        {!isInfoPage && question && response && (
          <View style={[styles.bigCard, { backgroundColor: colors.card, borderColor: currentStatus === 'attention' || currentStatus === 'manual_needed' ? colors.warning + '60' : colors.border }]}>
            {/* Question header */}
            <View style={styles.qCardHeader}>
              <View style={[styles.qNumBadge, { backgroundColor: colors.primary + '18' }]}>
                <Text style={[styles.qNumBadgeText, { color: colors.primary }]}>Q{question.number}</Text>
              </View>
              <Text style={[styles.qTypeMeta, { color: colors.mutedForeground }]}>
                {question.type === 'mcq' ? 'Multiple Choice'
                  : question.type === 'true_false' ? 'True / False'
                  : question.type === 'short_answer' ? 'Short Answer'
                  : 'Matching'} · {question.weight} pt{question.weight !== 1 ? 's' : ''}
              </Text>
              {response.confidence !== undefined && (
                <Text style={[styles.confBadge, { color: response.confidence >= 0.75 ? colors.success : colors.warning }]}>
                  {Math.round(response.confidence * 100)}% conf.
                </Text>
              )}
            </View>

            {/* Issue chips */}
            {response.issueCodes.length > 0 && (
              <View style={styles.chipRow}>
                {response.issueCodes.map(c => (
                  <View key={c} style={[styles.chip, { backgroundColor: colors.warning + '18', borderColor: colors.warning + '40' }]}>
                    <Feather name="alert-triangle" size={11} color={colors.warning} />
                    <Text style={[styles.chipText, { color: colors.warning }]}>
                      {c.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Answer area */}
            <View style={styles.answerArea}>
              {question.type === 'mcq' && (
                <>
                  <Text style={[styles.answerLabel, { color: colors.mutedForeground }]}>Student's Answer</Text>
                  <AnswerSelector
                    selected={response.selectedAnswer ?? null}
                    onSelect={a => {
                      Haptics.selectionAsync();
                      updateResponse(question.id, { selectedAnswer: a ?? undefined, isCorrect: a !== null && a === question.correctAnswer });
                    }}
                    correctAnswer={question.correctAnswer}
                    showResult={false}
                    size="md"
                  />
                  <View style={[styles.keyRow, { backgroundColor: colors.muted, borderRadius: 8, padding: 10 }]}>
                    <Text style={[styles.keyLabel, { color: colors.mutedForeground }]}>Correct answer: </Text>
                    <Text style={[styles.keyValue, { color: colors.primary }]}>{question.correctAnswer ?? '—'}</Text>
                  </View>
                </>
              )}

              {question.type === 'true_false' && (
                <>
                  <Text style={[styles.answerLabel, { color: colors.mutedForeground }]}>Student's Answer</Text>
                  <View style={styles.tfLargeRow}>
                    {[true, false].map(val => {
                      const sel = response.booleanAnswer === val;
                      return (
                        <TouchableOpacity
                          key={String(val)}
                          onPress={() => {
                            Haptics.selectionAsync();
                            updateResponse(question.id, { booleanAnswer: val, isCorrect: val === question.correctBoolean });
                          }}
                          activeOpacity={0.7}
                          style={[
                            styles.tfLargeBtn,
                            { backgroundColor: sel ? colors.primary : colors.secondary, borderColor: sel ? colors.primary : colors.border },
                          ]}
                        >
                          <Text style={[styles.tfLargeBtnText, { color: sel ? colors.primaryForeground : colors.mutedForeground }]}>
                            {val ? 'True' : 'False'}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <View style={[styles.keyRow, { backgroundColor: colors.muted, borderRadius: 8, padding: 10 }]}>
                    <Text style={[styles.keyLabel, { color: colors.mutedForeground }]}>Correct answer: </Text>
                    <Text style={[styles.keyValue, { color: colors.primary }]}>
                      {question.correctBoolean === true ? 'True' : question.correctBoolean === false ? 'False' : '—'}
                    </Text>
                  </View>
                </>
              )}

              {(question.type === 'short_answer' || question.type === 'matching') && (
                <>
                  {question.expectedAnswer ? (
                    <View style={[styles.keyRow, { backgroundColor: colors.muted, borderRadius: 8, padding: 10 }]}>
                      <Text style={[styles.keyLabel, { color: colors.mutedForeground }]}>Expected: </Text>
                      <Text style={[styles.keyValue, { color: colors.foreground, fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1 }]}>
                        {question.expectedAnswer}
                      </Text>
                    </View>
                  ) : null}
                  {question.matchingPairs ? (
                    <View style={[styles.keyRow, { backgroundColor: colors.muted, borderRadius: 8, padding: 10 }]}>
                      <Text style={[styles.keyLabel, { color: colors.mutedForeground }]}>Pairs: </Text>
                      <Text style={[styles.keyValue, { color: colors.foreground, fontSize: 13, fontFamily: 'Inter_400Regular', flex: 1 }]}>
                        {question.matchingPairs}
                      </Text>
                    </View>
                  ) : null}
                  <Text style={[styles.answerLabel, { color: colors.mutedForeground }]}>
                    Score (0 – {question.weight} pts)
                  </Text>
                  <View style={styles.scoreRow}>
                    <TextInput
                      style={[styles.scoreLargeField, { backgroundColor: colors.background, borderColor: currentStatus === 'manual_needed' ? colors.accent : colors.border, color: colors.foreground }]}
                      value={response.manualScore !== undefined ? String(response.manualScore) : ''}
                      onChangeText={v => {
                        const n = parseInt(v.replace(/[^0-9]/g, ''), 10);
                        const safe = isNaN(n) ? 0 : Math.min(question.weight, Math.max(0, n));
                        updateResponse(question.id, { manualScore: isNaN(n) ? undefined : safe });
                      }}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor={colors.mutedForeground}
                      maxLength={3}
                      autoFocus={currentStatus === 'manual_needed'}
                    />
                    <Text style={[styles.scoreSlash, { color: colors.mutedForeground }]}>/ {question.weight} pts</Text>
                  </View>
                </>
              )}
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer nav */}
      <View style={[styles.footer, { paddingBottom: bottomPad + 12, borderTopColor: colors.border, backgroundColor: colors.background }]}>
        {page > 0 && (
          <TouchableOpacity
            onPress={() => goTo(page - 1)}
            activeOpacity={0.8}
            style={[styles.navBtn, { borderColor: colors.border }]}
          >
            <Feather name="arrow-left" size={18} color={colors.foreground} />
            <Text style={[styles.navBtnText, { color: colors.foreground }]}>Prev</Text>
          </TouchableOpacity>
        )}

        {page < totalPages - 1 ? (
          <TouchableOpacity
            onPress={() => goTo(page + 1)}
            activeOpacity={0.8}
            style={[styles.nextBtn, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.nextBtnText}>Next</Text>
            <Feather name="arrow-right" size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleConfirm}
            activeOpacity={0.8}
            disabled={confirming}
            style={[styles.confirmBtn, { backgroundColor: allDone ? colors.success : colors.primary, opacity: confirming ? 0.7 : 1 }]}
          >
            <Feather name="check" size={18} color="#fff" />
            <Text style={styles.nextBtnText}>{confirming ? 'Saving...' : 'Confirm Result'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1, gap: 10,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  headerSub: { fontSize: 11, fontFamily: 'Inter_400Regular', marginTop: 1 },
  scorePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  scorePillText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  progressBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, gap: 0,
  },
  infoDot: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1.5,
  },
  progressDivider: { width: 1, height: 20, marginHorizontal: 8 },
  dotScroll: { flex: 1 },
  dotRow: { flexDirection: 'row', gap: 4, alignItems: 'center', paddingVertical: 4 },
  dotWrap: { alignItems: 'center', width: 30 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotNum: { fontSize: 9, fontFamily: 'Inter_400Regular', marginTop: 2 },
  scroll: { flex: 1 },
  cardArea: { padding: 16, gap: 12 },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 12, borderRadius: 10, borderWidth: 1,
  },
  errorBannerText: { flex: 1, fontSize: 13, fontFamily: 'Inter_500Medium' },
  infoPage: { gap: 12 },
  bigCard: { padding: 18, borderRadius: 16, borderWidth: 1, gap: 14 },
  bigCardTitle: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  issueHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  issueItem: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 20 },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  fieldInput: {
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 16, fontFamily: 'Inter_400Regular',
  },
  hintCard: { padding: 12, borderRadius: 12 },
  hintText: { fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 18, textAlign: 'center' },
  qCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  qNumBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  qNumBadgeText: { fontSize: 15, fontFamily: 'Inter_700Bold' },
  qTypeMeta: { flex: 1, fontSize: 13, fontFamily: 'Inter_400Regular' },
  confBadge: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1,
  },
  chipText: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  answerArea: { gap: 14 },
  answerLabel: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  tfLargeRow: { flexDirection: 'row', gap: 12 },
  tfLargeBtn: {
    flex: 1, paddingVertical: 18, borderRadius: 14, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
  },
  tfLargeBtnText: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  keyRow: { flexDirection: 'row', alignItems: 'center' },
  keyLabel: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  keyValue: { fontSize: 16, fontFamily: 'Inter_700Bold' },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  scoreLargeField: {
    borderWidth: 2, borderRadius: 14,
    paddingHorizontal: 20, paddingVertical: 18,
    fontSize: 32, fontFamily: 'Inter_700Bold',
    width: 110, textAlign: 'center',
  },
  scoreSlash: { fontSize: 18, fontFamily: 'Inter_400Regular' },
  footer: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  navBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5,
  },
  navBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  nextBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 14,
  },
  nextBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  confirmBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 14,
  },
  errorText: { textAlign: 'center', marginTop: 60, fontSize: 16, fontFamily: 'Inter_400Regular' },
});
