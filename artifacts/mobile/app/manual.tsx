import React, { useCallback, useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useAssessment } from '@/context/AssessmentContext';
import { AnswerSelector } from '@/components/AnswerBubble';
import type { Question, QuestionResponse, StudentResult } from '@/lib/types';
import { makeId, calcEarnedPoints } from '@/lib/types';

function buildDefaultResponse(q: Question): QuestionResponse {
  return {
    questionId: q.id,
    type: q.type,
    maxScore: q.weight,
    issueCodes: [],
    isCorrect: false,
  };
}

function QuestionEntryRow({
  question,
  response,
  onUpdate,
  colors,
}: {
  question: Question;
  response: QuestionResponse;
  onUpdate: (questionId: string, patch: Partial<QuestionResponse>) => void;
  colors: ReturnType<typeof useColors>;
}) {
  if (question.type === 'mcq') {
    return (
      <View style={[styles.qRow, { borderBottomColor: colors.border }]}>
        <View style={styles.qMeta}>
          <Text style={[styles.qNum, { color: colors.mutedForeground }]}>Q{question.number}</Text>
          <Text style={[styles.qType, { color: colors.mutedForeground }]}>MCQ</Text>
          <Text style={[styles.keyText, { color: colors.primary }]}>Key: {question.correctAnswer ?? '—'}</Text>
        </View>
        <AnswerSelector
          selected={response.selectedAnswer ?? null}
          onSelect={a => {
            Haptics.selectionAsync();
            onUpdate(question.id, { selectedAnswer: a ?? undefined, isCorrect: a !== null && a === question.correctAnswer });
          }}
          size="sm"
        />
      </View>
    );
  }

  if (question.type === 'true_false') {
    return (
      <View style={[styles.qRow, { borderBottomColor: colors.border }]}>
        <View style={styles.qMeta}>
          <Text style={[styles.qNum, { color: colors.mutedForeground }]}>Q{question.number}</Text>
          <Text style={[styles.qType, { color: colors.mutedForeground }]}>T/F</Text>
          <Text style={[styles.keyText, { color: colors.primary }]}>
            Key: {question.correctBoolean === true ? 'True' : question.correctBoolean === false ? 'False' : '—'}
          </Text>
        </View>
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
                style={[
                  styles.tfBtn,
                  {
                    backgroundColor: sel ? colors.primary : colors.secondary,
                    borderColor: sel ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.tfBtnText, { color: sel ? colors.primaryForeground : colors.mutedForeground }]}>
                  {val ? 'True' : 'False'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }

  // short_answer or matching
  const scoreVal = response.manualScore !== undefined ? String(response.manualScore) : '';
  return (
    <View style={[styles.qRow, { borderBottomColor: colors.border }]}>
      <View style={styles.qMeta}>
        <Text style={[styles.qNum, { color: colors.mutedForeground }]}>Q{question.number}</Text>
        <Text style={[styles.qType, { color: colors.mutedForeground }]}>
          {question.type === 'short_answer' ? 'Short' : 'Match'}
        </Text>
        <Text style={[styles.keyText, { color: colors.mutedForeground }]}>/ {question.weight} pts</Text>
      </View>
      <View style={styles.scoreInput}>
        <TextInput
          style={[styles.scoreField, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
          value={scoreVal}
          onChangeText={v => {
            const n = parseInt(v.replace(/[^0-9]/g, ''), 10);
            const safe = isNaN(n) ? 0 : Math.min(question.weight, Math.max(0, n));
            onUpdate(question.id, { manualScore: isNaN(n) ? undefined : safe });
          }}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor={colors.mutedForeground}
          maxLength={3}
        />
        <Text style={[styles.scoreMax, { color: colors.mutedForeground }]}>/ {question.weight}</Text>
      </View>
    </View>
  );
}

export default function ManualEntryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentAssessment, addResult } = useAssessment();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const paperIndex = currentAssessment?.results.length ?? 0;

  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [responses, setResponses] = useState<QuestionResponse[]>(
    (currentAssessment?.questions ?? []).map(buildDefaultResponse)
  );
  const [saving, setSaving] = useState(false);

  const updateResponse = useCallback((questionId: string, patch: Partial<QuestionResponse>) => {
    setResponses(prev => prev.map(r => r.questionId === questionId ? { ...r, ...patch } : r));
  }, []);

  const questionCount = currentAssessment?.questions.length ?? 0;
  const mcqTfFilled = responses.filter(r =>
    (r.type === 'mcq' && r.selectedAnswer !== undefined) ||
    (r.type === 'true_false' && r.booleanAnswer !== undefined) ||
    r.type === 'short_answer' || r.type === 'matching'
  ).length;

  const handleSave = useCallback(async () => {
    if (!currentAssessment) return;
    if (!studentName.trim()) {
      Alert.alert('Name required', "Please enter the student's name.");
      return;
    }
    const mcqTfBlank = responses.filter(r =>
      (r.type === 'mcq' && r.selectedAnswer === undefined) ||
      (r.type === 'true_false' && r.booleanAnswer === undefined)
    ).length;

    if (mcqTfBlank > 0) {
      Alert.alert(
        'Incomplete answers',
        `${mcqTfBlank} MCQ/T/F question(s) are blank. Save anyway?`,
        [
          { text: 'Keep editing', style: 'cancel' },
          { text: 'Save', onPress: doSave },
        ]
      );
      return;
    }
    await doSave();
  }, [currentAssessment, studentName, responses]);

  const doSave = useCallback(async () => {
    if (!currentAssessment) return;
    setSaving(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const earnedPoints = calcEarnedPoints(responses, currentAssessment.questions);
    const totalPoints = currentAssessment.totalPoints;

    const result: StudentResult = {
      id: makeId(),
      assessmentId: currentAssessment.id,
      studentName: studentName.trim() || `Student ${paperIndex + 1}`,
      studentId: studentId.trim() || undefined,
      responses,
      earnedPoints,
      totalPoints,
      percentage: totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0,
      issues: [],
      gradingSource: 'manual',
      confirmedAt: Date.now(),
    };

    await addResult(result);
    setSaving(false);
    router.replace('/scan');
  }, [currentAssessment, studentName, studentId, responses, paperIndex, addResult]);

  if (!currentAssessment) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.destructive }]}>No active assessment.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>Manual Entry</Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            Student {paperIndex + 1}{currentAssessment.expectedPaperCount ? ` of ${currentAssessment.expectedPaperCount}` : ''}
          </Text>
        </View>
        <View style={[styles.progressPill, { backgroundColor: colors.primary + '18' }]}>
          <Text style={[styles.progressText, { color: mcqTfFilled === questionCount ? colors.success : colors.primary }]}>
            {mcqTfFilled}/{questionCount}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Student info */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Student Info</Text>
          <View style={styles.fieldGroup}>
            <View style={styles.fieldRow}>
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

        <View style={[styles.noticeBanner, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="info" size={13} color={colors.mutedForeground} />
          <Text style={[styles.noticeText, { color: colors.mutedForeground }]}>
            Manual mode — bypasses camera. MCQ/T-F: tap answer. Short/Matching: enter score out of max points.
          </Text>
        </View>

        {/* Answers */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Student Answers</Text>
          {currentAssessment.questions.map(q => {
            const resp = responses.find(r => r.questionId === q.id)!;
            return (
              <QuestionEntryRow
                key={q.id}
                question={q}
                response={resp}
                onUpdate={updateResponse}
                colors={colors}
              />
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomPad + 12, borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={handleSave}
          activeOpacity={0.8}
          disabled={saving}
          style={[styles.saveBtn, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
        >
          <Feather name="check" size={18} color="#fff" />
          <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Result'}</Text>
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
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  headerTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  headerSub: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  progressPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  progressText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 14 },
  card: { padding: 14, borderRadius: 12, borderWidth: 1, gap: 10 },
  cardTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  fieldGroup: { gap: 8 },
  fieldRow: { gap: 4 },
  fieldLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  fieldInput: {
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 9,
    fontSize: 15, fontFamily: 'Inter_400Regular',
  },
  noticeBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    padding: 10, borderRadius: 10, borderWidth: 1,
  },
  noticeText: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 17 },
  qRow: {
    paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, gap: 8,
  },
  qMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qNum: { width: 30, fontSize: 13, fontFamily: 'Inter_600SemiBold', textAlign: 'right' },
  qType: { fontSize: 11, fontFamily: 'Inter_400Regular', width: 36 },
  keyText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  tfRow: { flexDirection: 'row', gap: 8 },
  tfBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  tfBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  scoreInput: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scoreField: {
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 7,
    fontSize: 15, fontFamily: 'Inter_700Bold',
    width: 70, textAlign: 'center',
  },
  scoreMax: { fontSize: 14, fontFamily: 'Inter_400Regular' },
  footer: { padding: 16, borderTopWidth: 1 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 15, borderRadius: 14,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  errorText: { textAlign: 'center', marginTop: 60, fontSize: 16, fontFamily: 'Inter_400Regular' },
});
