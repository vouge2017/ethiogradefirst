import React, { useCallback, useMemo, useState } from 'react';
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

function IssueChip({ code, colors }: { code: string; colors: any }) {
  const labels: Record<string, string> = {
    LOW_CONFIDENCE: 'Low confidence',
    BLANK: 'Blank detected',
    MULTIPLE_MARKS: 'Multiple marks',
    REQUIRES_MANUAL_SCORING: 'Manual scoring needed',
  };
  return (
    <View style={[styles.chip, { backgroundColor: colors.warning + '18', borderColor: colors.warning + '40' }]}>
      <Feather name="alert-triangle" size={11} color={colors.warning} />
      <Text style={[styles.chipText, { color: colors.warning }]}>{labels[code] ?? code}</Text>
    </View>
  );
}

function QuestionReviewRow({
  question,
  response,
  onUpdate,
  colors,
}: {
  question: Question;
  response: QuestionResponse;
  onUpdate: (questionId: string, patch: Partial<QuestionResponse>) => void;
  colors: any;
}) {
  const needsAttention = response.needsReview || response.issueCodes.length > 0;

  return (
    <View style={[styles.qRow, { borderBottomColor: colors.border, backgroundColor: needsAttention ? colors.warning + '08' : 'transparent' }]}>
      <View style={styles.qRowTop}>
        <Text style={[styles.qNum, { color: colors.mutedForeground }]}>Q{question.number}</Text>
        <View style={styles.qInfo}>
          <Text style={[styles.qTypeLabel, { color: colors.mutedForeground }]}>
            {question.type === 'mcq' ? 'MCQ' : question.type === 'true_false' ? 'True/False' : question.type === 'short_answer' ? 'Short Answer' : 'Matching'} · {question.weight} pt{question.weight !== 1 ? 's' : ''}
          </Text>
          {response.confidence !== undefined && (
            <Text style={[styles.confText, { color: response.confidence >= 0.75 ? colors.success : colors.warning }]}>
              {Math.round(response.confidence * 100)}% confidence
            </Text>
          )}
        </View>
        {response.issueCodes.map(c => <IssueChip key={c} code={c} colors={colors} />)}
      </View>

      {question.type === 'mcq' && (
        <View style={styles.qRowAnswer}>
          <Text style={[styles.ansLabel, { color: colors.mutedForeground }]}>Answer:</Text>
          <AnswerSelector
            selected={response.selectedAnswer ?? null}
            onSelect={a => {
              Haptics.selectionAsync();
              onUpdate(question.id, { selectedAnswer: a ?? undefined, isCorrect: a !== null && a === question.correctAnswer });
            }}
            correctAnswer={question.correctAnswer}
            showResult={false}
            size="sm"
          />
          <Text style={[styles.keyHint, { color: colors.primary }]}>Key: {question.correctAnswer ?? '—'}</Text>
        </View>
      )}

      {question.type === 'true_false' && (
        <View style={styles.qRowAnswer}>
          <Text style={[styles.ansLabel, { color: colors.mutedForeground }]}>Answer:</Text>
          <View style={styles.tfRow}>
            {[true, false].map(val => {
              const sel = response.booleanAnswer === val;
              return (
                <TouchableOpacity
                  key={String(val)}
                  onPress={() => {
                    Haptics.selectionAsync();
                    onUpdate(question.id, { booleanAnswer: val, isCorrect: val === question.correctBoolean });
                  }}
                  style={[styles.tfBtn, { backgroundColor: sel ? colors.primary : colors.secondary, borderColor: sel ? colors.primary : colors.border }]}
                >
                  <Text style={[styles.tfBtnText, { color: sel ? colors.primaryForeground : colors.mutedForeground }]}>
                    {val ? 'True' : 'False'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={[styles.keyHint, { color: colors.primary }]}>
            Key: {question.correctBoolean === true ? 'True' : question.correctBoolean === false ? 'False' : '—'}
          </Text>
        </View>
      )}

      {(question.type === 'short_answer' || question.type === 'matching') && (
        <View style={styles.qRowAnswer}>
          <Text style={[styles.ansLabel, { color: colors.mutedForeground }]}>Score:</Text>
          <TextInput
            style={[styles.scoreField, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            value={response.manualScore !== undefined ? String(response.manualScore) : ''}
            onChangeText={v => {
              const n = parseInt(v.replace(/[^0-9]/g, ''), 10);
              const safe = isNaN(n) ? 0 : Math.min(question.weight, Math.max(0, n));
              onUpdate(question.id, { manualScore: isNaN(n) ? undefined : safe, isCorrect: undefined });
            }}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.mutedForeground}
            maxLength={3}
          />
          <Text style={[styles.scoreMax, { color: colors.mutedForeground }]}>/ {question.weight} pts</Text>
        </View>
      )}
    </View>
  );
}

export default function ReviewScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { resultId } = useLocalSearchParams<{ resultId: string }>();
  const { currentAssessment, updateResult } = useAssessment();

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
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateResponse = useCallback((questionId: string, patch: Partial<QuestionResponse>) => {
    setLocalResponses(prev => prev.map(r => r.questionId === questionId ? { ...r, ...patch } : r));
  }, []);

  const previewEarned = useMemo(
    () => currentAssessment ? calcEarnedPoints(localResponses, currentAssessment.questions) : 0,
    [localResponses, currentAssessment]
  );

  const needsManualCount = localResponses.filter(
    r => (r.type === 'short_answer' || r.type === 'matching') && r.manualScore === undefined
  ).length;

  const handleConfirm = useCallback(async () => {
    if (!draftResult || !currentAssessment) return;

    if (needsManualCount > 0) {
      setError(`${needsManualCount} question(s) need a manual score (0 to max). Enter 0 if blank.`);
      return;
    }
    setError(null);
    setConfirming(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const name = studentName.trim() || draftResult.studentName;
    const sid = studentId.trim() || undefined;

    const finalResponses = localResponses.map(r => {
      const q = currentAssessment.questions.find(q => q.id === r.questionId)!;
      if (r.type === 'mcq') {
        return { ...r, isCorrect: r.selectedAnswer !== undefined && r.selectedAnswer === q.correctAnswer };
      }
      if (r.type === 'true_false') {
        return { ...r, isCorrect: r.booleanAnswer !== undefined && r.booleanAnswer === q.correctBoolean };
      }
      return r;
    });

    const earnedPoints = calcEarnedPoints(finalResponses, currentAssessment.questions);
    const totalPoints = currentAssessment.totalPoints;

    const confirmed: StudentResult = {
      ...draftResult,
      studentName: name,
      studentId: sid,
      responses: finalResponses,
      earnedPoints,
      totalPoints,
      percentage: totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0,
      confirmedAt: Date.now(),
    };

    await updateResult(draftResult.id, confirmed);
    setConfirming(false);
    router.replace('/scan');
  }, [draftResult, currentAssessment, localResponses, studentName, studentId, needsManualCount, updateResult]);

  if (!draftResult || !currentAssessment) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.destructive }]}>Result not found.</Text>
      </View>
    );
  }

  const totalPoints = currentAssessment.totalPoints;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>
          Review — {draftResult.studentName}
        </Text>
        <View style={[styles.scorePill, { backgroundColor: colors.primary + '18' }]}>
          <Text style={[styles.scorePillText, { color: colors.primary }]}>
            {previewEarned}/{totalPoints}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Student info */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, margin: 16, marginBottom: 12 }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Student Info</Text>
          <View style={styles.fieldGroup}>
            <View style={styles.fieldRow}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Name</Text>
              <TextInput
                style={[styles.fieldInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]}
                placeholder="Student name"
                placeholderTextColor={colors.mutedForeground}
                value={studentName}
                onChangeText={setStudentName}
                returnKeyType="next"
                maxLength={80}
                autoCorrect={false}
              />
            </View>
            <View style={styles.fieldRow}>
              <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>
                ID <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12 }}>(optional)</Text>
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
        </View>

        {/* Issues summary */}
        {draftResult.issues.length > 0 && (
          <View style={[styles.issuesBox, { backgroundColor: colors.warning + '0E', borderColor: colors.warning + '30', marginHorizontal: 16, marginBottom: 8 }]}>
            <Text style={[styles.issuesTitle, { color: colors.foreground }]}>Detection Issues</Text>
            <View style={styles.chipRow}>
              {draftResult.issues.map(c => <IssueChip key={c} code={c} colors={colors} />)}
            </View>
          </View>
        )}

        {needsManualCount > 0 && (
          <View style={[styles.manualBanner, { backgroundColor: colors.accent + '18', borderColor: colors.accent + '40', marginHorizontal: 16, marginBottom: 8 }]}>
            <Feather name="edit-2" size={14} color={colors.accent} />
            <Text style={[styles.manualBannerText, { color: colors.accent }]}>
              {needsManualCount} question{needsManualCount !== 1 ? 's' : ''} need a manual score
            </Text>
          </View>
        )}

        {error && (
          <View style={[styles.errorBanner, { backgroundColor: colors.destructive + '18', borderColor: colors.destructive + '40', marginHorizontal: 16, marginBottom: 8 }]}>
            <Feather name="x-circle" size={14} color={colors.destructive} />
            <Text style={[styles.errorBannerText, { color: colors.destructive }]}>{error}</Text>
          </View>
        )}

        <Text style={[styles.hint, { color: colors.mutedForeground, marginHorizontal: 20, marginBottom: 8 }]}>
          Tap any answer to correct it. Enter scores for open-ended questions.
        </Text>

        <View style={styles.questionsSection}>
          {currentAssessment.questions.map(q => {
            const resp = localResponses.find(r => r.questionId === q.id)!;
            return (
              <QuestionReviewRow
                key={q.id}
                question={q}
                response={resp}
                onUpdate={updateResponse}
                colors={colors}
              />
            );
          })}
        </View>

        <View style={{ height: bottomPad + 100 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomPad + 12, borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.8}
          style={[styles.retakeBtn, { borderColor: colors.border }]}
        >
          <Feather name="refresh-cw" size={16} color={colors.foreground} />
          <Text style={[styles.retakeBtnText, { color: colors.foreground }]}>Retake</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleConfirm}
          activeOpacity={0.8}
          disabled={confirming}
          style={[styles.confirmBtn, { backgroundColor: colors.primary, opacity: confirming ? 0.7 : 1 }]}
        >
          <Feather name="check" size={18} color="#fff" />
          <Text style={styles.confirmBtnText}>{confirming ? 'Saving...' : 'Confirm Result'}</Text>
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
  headerTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', flex: 1, marginHorizontal: 10 },
  scorePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  scorePillText: { fontSize: 14, fontFamily: 'Inter_700Bold' },
  scroll: { flex: 1 },
  card: { padding: 14, borderRadius: 12, borderWidth: 1, gap: 10 },
  cardTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  fieldGroup: { gap: 8 },
  fieldRow: { gap: 4 },
  fieldLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  fieldInput: {
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 9,
    fontSize: 15, fontFamily: 'Inter_400Regular',
  },
  issuesBox: { padding: 12, borderRadius: 12, borderWidth: 1, gap: 8 },
  issuesTitle: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, borderWidth: 1, alignSelf: 'flex-start',
  },
  chipText: { fontSize: 11, fontFamily: 'Inter_500Medium' },
  manualBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 10, borderRadius: 10, borderWidth: 1,
  },
  manualBannerText: { fontSize: 13, fontFamily: 'Inter_500Medium' },
  errorBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    padding: 10, borderRadius: 10, borderWidth: 1,
  },
  errorBannerText: { flex: 1, fontSize: 13, fontFamily: 'Inter_500Medium' },
  hint: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  questionsSection: { paddingHorizontal: 16 },
  qRow: {
    paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, gap: 8, paddingHorizontal: 4, borderRadius: 4,
  },
  qRowTop: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  qNum: { width: 28, fontSize: 13, fontFamily: 'Inter_600SemiBold', textAlign: 'right' },
  qInfo: { flex: 1 },
  qTypeLabel: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  confText: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  qRowAnswer: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', paddingLeft: 36 },
  ansLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', width: 52 },
  keyHint: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  tfRow: { flexDirection: 'row', gap: 6 },
  tfBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  tfBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  scoreField: {
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6,
    fontSize: 15, fontFamily: 'Inter_700Bold', width: 64, textAlign: 'center',
  },
  scoreMax: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  footer: { flexDirection: 'row', gap: 10, padding: 16, borderTopWidth: 1 },
  retakeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 18, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5,
  },
  retakeBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  confirmBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 14,
  },
  confirmBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  errorText: { textAlign: 'center', marginTop: 60, fontSize: 16, fontFamily: 'Inter_400Regular' },
});
