import React, { useCallback, useState } from 'react';
import {
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
  return { questionId: q.id, type: q.type, maxScore: q.weight, issueCodes: [], isCorrect: false };
}

// ─── Compact grid cell ────────────────────────────────────────────────────────

function CompactCell({
  question,
  response,
  onUpdate,
  colors,
}: {
  question: Question;
  response: QuestionResponse;
  onUpdate: (qId: string, patch: Partial<QuestionResponse>) => void;
  colors: ReturnType<typeof useColors>;
}) {
  const answered =
    (question.type === 'mcq' && response.selectedAnswer !== undefined) ||
    (question.type === 'true_false' && response.booleanAnswer !== undefined) ||
    (question.type !== 'mcq' && question.type !== 'true_false' && response.manualScore !== undefined);

  return (
    <View style={[
      cellStyles.cell,
      { backgroundColor: colors.card, borderColor: answered ? colors.success + '50' : colors.border },
    ]}>
      <Text style={[cellStyles.qNum, { color: colors.mutedForeground }]}>Q{question.number}</Text>

      {question.type === 'mcq' && (
        <View style={cellStyles.mcqRow}>
          {['A', 'B', 'C', 'D', 'E'].map(letter => {
            const sel = response.selectedAnswer === letter;
            const isKey = question.correctAnswer === letter;
            return (
              <TouchableOpacity
                key={letter}
                onPress={() => {
                  Haptics.selectionAsync();
                  onUpdate(question.id, {
                    selectedAnswer: sel ? undefined : letter,
                    isCorrect: !sel && letter === question.correctAnswer,
                  });
                }}
                activeOpacity={0.7}
                style={[
                  cellStyles.bubble,
                  {
                    backgroundColor: sel ? colors.primary : colors.muted,
                    borderColor: isKey ? colors.success + '80' : 'transparent',
                    borderWidth: isKey ? 1.5 : 0,
                  },
                ]}
              >
                <Text style={[cellStyles.bubbleText, { color: sel ? '#fff' : colors.mutedForeground }]}>
                  {letter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {question.type === 'true_false' && (
        <View style={cellStyles.tfRow}>
          {[true, false].map(val => {
            const sel = response.booleanAnswer === val;
            return (
              <TouchableOpacity
                key={String(val)}
                onPress={() => {
                  Haptics.selectionAsync();
                  onUpdate(question.id, { booleanAnswer: val, isCorrect: val === question.correctBoolean });
                }}
                activeOpacity={0.7}
                style={[cellStyles.tfBtn, { backgroundColor: sel ? colors.primary : colors.muted, borderColor: sel ? colors.primary : colors.border }]}
              >
                <Text style={[cellStyles.tfText, { color: sel ? '#fff' : colors.mutedForeground }]}>
                  {val ? 'T' : 'F'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {(question.type === 'short_answer' || question.type === 'matching') && (
        <View style={cellStyles.scoreRow}>
          <TextInput
            style={[cellStyles.scoreInput, { backgroundColor: colors.muted, borderColor: colors.border, color: colors.foreground }]}
            value={response.manualScore !== undefined ? String(response.manualScore) : ''}
            onChangeText={v => {
              const n = parseInt(v.replace(/[^0-9]/g, ''), 10);
              const safe = isNaN(n) ? 0 : Math.min(question.weight, Math.max(0, n));
              onUpdate(question.id, { manualScore: isNaN(n) ? undefined : safe });
            }}
            keyboardType="number-pad"
            placeholder={`/${question.weight}`}
            placeholderTextColor={colors.mutedForeground}
            maxLength={3}
          />
        </View>
      )}
    </View>
  );
}

const cellStyles = StyleSheet.create({
  cell: {
    flex: 1, padding: 8, borderRadius: 10, borderWidth: 1, gap: 6,
    minWidth: 0,
  },
  qNum: { fontSize: 10, fontFamily: 'Inter_600SemiBold' },
  mcqRow: { flexDirection: 'row', gap: 2 },
  bubble: {
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  bubbleText: { fontSize: 9, fontFamily: 'Inter_700Bold' },
  tfRow: { flexDirection: 'row', gap: 4 },
  tfBtn: {
    flex: 1, height: 26, borderRadius: 6, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  tfText: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  scoreRow: { alignItems: 'flex-start' },
  scoreInput: {
    borderWidth: 1, borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 4,
    fontSize: 13, fontFamily: 'Inter_700Bold',
    width: 50, textAlign: 'center',
  },
});

// ─── Full row (list mode) ────────────────────────────────────────────────────

function FullRow({
  question,
  response,
  onUpdate,
  colors,
}: {
  question: Question;
  response: QuestionResponse;
  onUpdate: (qId: string, patch: Partial<QuestionResponse>) => void;
  colors: ReturnType<typeof useColors>;
}) {
  if (question.type === 'mcq') {
    return (
      <View style={[rowStyles.row, { borderBottomColor: colors.border }]}>
        <View style={rowStyles.meta}>
          <Text style={[rowStyles.qNum, { color: colors.mutedForeground }]}>Q{question.number}</Text>
          <Text style={[rowStyles.qType, { color: colors.mutedForeground }]}>MCQ</Text>
          <Text style={[rowStyles.keyText, { color: colors.primary }]}>Key: {question.correctAnswer ?? '—'}</Text>
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
      <View style={[rowStyles.row, { borderBottomColor: colors.border }]}>
        <View style={rowStyles.meta}>
          <Text style={[rowStyles.qNum, { color: colors.mutedForeground }]}>Q{question.number}</Text>
          <Text style={[rowStyles.qType, { color: colors.mutedForeground }]}>T/F</Text>
          <Text style={[rowStyles.keyText, { color: colors.primary }]}>
            Key: {question.correctBoolean === true ? 'True' : question.correctBoolean === false ? 'False' : '—'}
          </Text>
        </View>
        <View style={rowStyles.tfRow}>
          {[true, false].map(val => {
            const sel = response.booleanAnswer === val;
            return (
              <TouchableOpacity
                key={String(val)}
                onPress={() => { Haptics.selectionAsync(); onUpdate(question.id, { booleanAnswer: val, isCorrect: val === question.correctBoolean }); }}
                activeOpacity={0.7}
                style={[rowStyles.tfBtn, { backgroundColor: sel ? colors.primary : colors.secondary, borderColor: sel ? colors.primary : colors.border }]}
              >
                <Text style={[rowStyles.tfBtnText, { color: sel ? colors.primaryForeground : colors.mutedForeground }]}>
                  {val ? 'True' : 'False'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  }
  const scoreVal = response.manualScore !== undefined ? String(response.manualScore) : '';
  return (
    <View style={[rowStyles.row, { borderBottomColor: colors.border }]}>
      <View style={rowStyles.meta}>
        <Text style={[rowStyles.qNum, { color: colors.mutedForeground }]}>Q{question.number}</Text>
        <Text style={[rowStyles.qType, { color: colors.mutedForeground }]}>
          {question.type === 'short_answer' ? 'Short' : 'Match'}
        </Text>
        <Text style={[rowStyles.keyText, { color: colors.mutedForeground }]}>/ {question.weight} pts</Text>
      </View>
      <View style={rowStyles.scoreWrap}>
        <TextInput
          style={[rowStyles.scoreField, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
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
        <Text style={[rowStyles.scoreMax, { color: colors.mutedForeground }]}>/ {question.weight}</Text>
      </View>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, gap: 8 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qNum: { width: 30, fontSize: 13, fontFamily: 'Inter_600SemiBold', textAlign: 'right' },
  qType: { fontSize: 11, fontFamily: 'Inter_400Regular', width: 36 },
  keyText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  tfRow: { flexDirection: 'row', gap: 8 },
  tfBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 8, borderWidth: 1 },
  tfBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  scoreWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  scoreField: {
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 7,
    fontSize: 15, fontFamily: 'Inter_700Bold',
    width: 70, textAlign: 'center',
  },
  scoreMax: { fontSize: 14, fontFamily: 'Inter_400Regular' },
});

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function ManualEntryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentAssessment, addResult } = useAssessment();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const paperIndex = currentAssessment?.results.length ?? 0;

  const [compact, setCompact] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [nameError, setNameError] = useState(false);
  const [responses, setResponses] = useState<QuestionResponse[]>(
    (currentAssessment?.questions ?? []).map(buildDefaultResponse)
  );
  const [saving, setSaving] = useState(false);

  const updateResponse = useCallback((questionId: string, patch: Partial<QuestionResponse>) => {
    setResponses(prev => prev.map(r => r.questionId === questionId ? { ...r, ...patch } : r));
  }, []);

  const questions = currentAssessment?.questions ?? [];
  const answeredCount = responses.filter(r =>
    (r.type === 'mcq' && r.selectedAnswer !== undefined) ||
    (r.type === 'true_false' && r.booleanAnswer !== undefined) ||
    r.type === 'short_answer' || r.type === 'matching'
  ).length;

  const handleSave = useCallback(async () => {
    if (!currentAssessment) return;
    if (!studentName.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
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
        <View style={styles.headerRight}>
          <View style={[styles.progressPill, { backgroundColor: answeredCount === questions.length ? colors.success + '20' : colors.primary + '15' }]}>
            <Text style={[styles.progressText, { color: answeredCount === questions.length ? colors.success : colors.primary }]}>
              {answeredCount}/{questions.length}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => { setCompact(c => !c); Haptics.selectionAsync(); }}
            style={[styles.viewToggle, { backgroundColor: colors.muted, borderColor: colors.border }]}
          >
            <Feather name={compact ? 'list' : 'grid'} size={15} color={colors.mutedForeground} />
          </TouchableOpacity>
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
            <Text style={[styles.fieldLabel, { color: nameError ? colors.destructive : colors.mutedForeground }]}>
              Name {nameError ? '— required' : '*'}
            </Text>
            <TextInput
              style={[
                styles.fieldInput,
                {
                  backgroundColor: colors.background,
                  borderColor: nameError ? colors.destructive : colors.border,
                  color: colors.foreground,
                },
              ]}
              placeholder="Student name"
              placeholderTextColor={colors.mutedForeground}
              value={studentName}
              onChangeText={v => { setStudentName(v); setNameError(false); }}
              returnKeyType="next"
              maxLength={80}
              autoCorrect={false}
              autoFocus
            />
          </View>
          <View style={styles.fieldGroup}>
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

        {/* Answers section */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Student Answers</Text>
            <Text style={[styles.viewHint, { color: colors.mutedForeground }]}>
              {compact ? 'Compact grid' : 'Full list'} · tap icon to switch
            </Text>
          </View>

          {compact ? (
            // Compact 2-column grid
            <View style={styles.compactGrid}>
              {questions.map((q, i) => {
                const resp = responses.find(r => r.questionId === q.id)!;
                if (i % 2 === 1) return null; // handled by even index
                const nextQ = questions[i + 1];
                const nextResp = nextQ ? responses.find(r => r.questionId === nextQ.id)! : null;
                return (
                  <View key={q.id} style={styles.gridRow}>
                    <CompactCell question={q} response={resp} onUpdate={updateResponse} colors={colors} />
                    {nextQ && nextResp ? (
                      <CompactCell question={nextQ} response={nextResp} onUpdate={updateResponse} colors={colors} />
                    ) : (
                      <View style={{ flex: 1 }} />
                    )}
                  </View>
                );
              })}
            </View>
          ) : (
            // Full list
            <View>
              {questions.map(q => {
                const resp = responses.find(r => r.questionId === q.id)!;
                return (
                  <FullRow
                    key={q.id}
                    question={q}
                    response={resp}
                    onUpdate={updateResponse}
                    colors={colors}
                  />
                );
              })}
            </View>
          )}
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
          <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Result'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 14, borderBottomWidth: 1, gap: 10,
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  headerSub: { fontSize: 12, fontFamily: 'Inter_400Regular' },
  headerRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  progressPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  progressText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  viewToggle: { width: 32, height: 32, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 14 },
  card: { padding: 14, borderRadius: 12, borderWidth: 1, gap: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  cardTitle: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  viewHint: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  fieldGroup: { gap: 6 },
  fieldLabel: { fontSize: 12, fontFamily: 'Inter_500Medium' },
  fieldInput: {
    borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 9,
    fontSize: 15, fontFamily: 'Inter_400Regular',
  },
  compactGrid: { gap: 6 },
  gridRow: { flexDirection: 'row', gap: 6 },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 15, borderRadius: 14,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  errorText: { textAlign: 'center', marginTop: 60, fontSize: 16, fontFamily: 'Inter_400Regular' },
});
