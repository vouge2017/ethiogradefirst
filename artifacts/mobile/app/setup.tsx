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
import type { Question, QuestionType } from '@/lib/types';
import { makeId, gradingModeForType } from '@/lib/types';

const QUESTION_COUNTS = [10, 15, 20, 25, 30, 40, 50];
const TYPE_LABELS: Record<QuestionType, string> = {
  mcq: 'MCQ', true_false: 'T/F', short_answer: 'Short', matching: 'Match',
};
const ALL_TYPES: QuestionType[] = ['mcq', 'true_false', 'short_answer', 'matching'];

function makeDefaultQuestion(number: number): Question {
  return {
    id: makeId(),
    number,
    type: 'mcq',
    weight: 1,
    gradingMode: 'auto',
  };
}

function QuestionCard({
  question,
  onUpdate,
  colors,
}: {
  question: Question;
  onUpdate: (id: string, patch: Partial<Question>) => void;
  colors: ReturnType<typeof useColors>;
}) {
  const updateType = (type: QuestionType) => {
    Haptics.selectionAsync();
    onUpdate(question.id, { type, gradingMode: gradingModeForType(type), correctAnswer: undefined, correctBoolean: undefined });
  };

  const adjustWeight = (delta: number) => {
    const next = Math.max(1, Math.min(99, question.weight + delta));
    onUpdate(question.id, { weight: next });
  };

  return (
    <View style={[styles.qCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Row 1: number + type pills + weight stepper */}
      <View style={styles.qRow1}>
        <Text style={[styles.qNum, { color: colors.mutedForeground }]}>Q{question.number}</Text>

        <View style={styles.typePills}>
          {ALL_TYPES.map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => updateType(t)}
              style={[
                styles.typePill,
                {
                  backgroundColor: question.type === t ? colors.primary : colors.secondary,
                  borderColor: question.type === t ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.typePillText, { color: question.type === t ? colors.primaryForeground : colors.mutedForeground }]}>
                {TYPE_LABELS[t]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.weightStepper}>
          <TouchableOpacity onPress={() => adjustWeight(-1)} style={[styles.stepBtn, { borderColor: colors.border }]}>
            <Text style={[styles.stepBtnText, { color: colors.foreground }]}>−</Text>
          </TouchableOpacity>
          <Text style={[styles.weightVal, { color: colors.foreground }]}>{question.weight}</Text>
          <TouchableOpacity onPress={() => adjustWeight(1)} style={[styles.stepBtn, { borderColor: colors.border }]}>
            <Text style={[styles.stepBtnText, { color: colors.foreground }]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Row 2: answer input */}
      {question.type === 'mcq' && (
        <View style={styles.qRow2}>
          <Text style={[styles.ansLabel, { color: colors.mutedForeground }]}>Correct:</Text>
          <AnswerSelector
            selected={question.correctAnswer ?? null}
            onSelect={a => { Haptics.selectionAsync(); onUpdate(question.id, { correctAnswer: a ?? undefined }); }}
            size="sm"
          />
        </View>
      )}
      {question.type === 'true_false' && (
        <View style={styles.qRow2}>
          <Text style={[styles.ansLabel, { color: colors.mutedForeground }]}>Correct:</Text>
          <View style={styles.tfRow}>
            {[true, false].map(val => (
              <TouchableOpacity
                key={String(val)}
                onPress={() => { Haptics.selectionAsync(); onUpdate(question.id, { correctBoolean: val }); }}
                style={[
                  styles.tfBtn,
                  {
                    backgroundColor: question.correctBoolean === val ? colors.primary : colors.secondary,
                    borderColor: question.correctBoolean === val ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.tfBtnText, { color: question.correctBoolean === val ? colors.primaryForeground : colors.mutedForeground }]}>
                  {val ? 'True' : 'False'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
      {(question.type === 'short_answer' || question.type === 'matching') && (
        <View style={styles.qRow2}>
          <Feather name="edit-2" size={12} color={colors.mutedForeground} />
          <Text style={[styles.manualNote, { color: colors.mutedForeground }]}>
            Scored manually during review ({question.weight} pt{question.weight !== 1 ? 's' : ''})
          </Text>
        </View>
      )}
    </View>
  );
}

export default function SetupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { beginAssessment, setCurrentAssessment } = useAssessment();

  const [title, setTitle] = useState('');
  const [questionCount, setQuestionCount] = useState(20);
  const [expectedCount, setExpectedCount] = useState('');
  const [questions, setQuestions] = useState<Question[]>(
    Array.from({ length: 20 }, (_, i) => makeDefaultQuestion(i + 1))
  );

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const updateQuestionCount = useCallback((count: number) => {
    setQuestionCount(count);
    setQuestions(prev => {
      if (count > prev.length) {
        const extras = Array.from({ length: count - prev.length }, (_, i) =>
          makeDefaultQuestion(prev.length + i + 1)
        );
        return [...prev, ...extras];
      }
      return prev.slice(0, count).map((q, i) => ({ ...q, number: i + 1 }));
    });
  }, []);

  const updateQuestion = useCallback((id: string, patch: Partial<Question>) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, ...patch } : q));
  }, []);

  const totalPoints = questions.reduce((s, q) => s + q.weight, 0);

  const validate = (): string | null => {
    if (!title.trim()) return 'Please enter an assessment title.';
    for (const q of questions) {
      if (q.type === 'mcq' && !q.correctAnswer) return `Q${q.number}: select the correct MCQ answer.`;
      if (q.type === 'true_false' && q.correctBoolean === undefined) return `Q${q.number}: select True or False.`;
    }
    return null;
  };

  const handleStart = useCallback(async () => {
    const err = validate();
    if (err) {
      Alert.alert('Incomplete setup', err);
      return;
    }
    const assessment = await beginAssessment({
      title: title.trim(),
      questions,
      totalPoints,
      expectedPaperCount: expectedCount ? parseInt(expectedCount, 10) : undefined,
    });
    setCurrentAssessment(assessment);
    router.replace('/scan');
  }, [title, questions, totalPoints, expectedCount, beginAssessment, setCurrentAssessment]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>New Assessment</Text>
        <View style={[styles.ptsBadge, { backgroundColor: colors.primary + '18' }]}>
          <Text style={[styles.ptsBadgeText, { color: colors.primary }]}>{totalPoints} pts</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.foreground }]}>Assessment Title</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            placeholder="e.g. Grade 8 Math Chapter 4"
            placeholderTextColor={colors.mutedForeground}
            value={title}
            onChangeText={setTitle}
            returnKeyType="done"
            maxLength={60}
          />
        </View>

        {/* Question count */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.foreground }]}>Number of Questions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.countRow}>
              {QUESTION_COUNTS.map(n => (
                <TouchableOpacity
                  key={n}
                  onPress={() => { Haptics.selectionAsync(); updateQuestionCount(n); }}
                  style={[
                    styles.countBtn,
                    { backgroundColor: questionCount === n ? colors.primary : colors.card, borderColor: questionCount === n ? colors.primary : colors.border },
                  ]}
                >
                  <Text style={[styles.countBtnText, { color: questionCount === n ? colors.primaryForeground : colors.foreground }]}>
                    {n}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Expected count */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.foreground }]}>
            Expected Students{' '}
            <Text style={{ color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 13 }}>(optional)</Text>
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            placeholder="e.g. 40"
            placeholderTextColor={colors.mutedForeground}
            value={expectedCount}
            onChangeText={v => setExpectedCount(v.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={3}
          />
        </View>

        {/* Question setup */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.label, { color: colors.foreground }]}>Questions &amp; Answer Key</Text>
            <Text style={[styles.hint, { color: colors.mutedForeground }]}>type · weight · answer</Text>
          </View>
          <View style={[styles.noticeBanner, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="info" size={12} color={colors.mutedForeground} />
            <Text style={[styles.noticeText, { color: colors.mutedForeground }]}>
              Short Answer and Matching questions are graded manually after scanning.
            </Text>
          </View>
          {questions.map(q => (
            <QuestionCard key={q.id} question={q} onUpdate={updateQuestion} colors={colors} />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomPad + 12, borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={handleStart}
          activeOpacity={0.8}
          style={[styles.startBtn, { backgroundColor: colors.primary }]}
        >
          <Feather name="camera" size={18} color="#fff" />
          <Text style={styles.startBtnText}>Start Grading — {totalPoints} pts total</Text>
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
  headerTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  ptsBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  ptsBadgeText: { fontSize: 13, fontFamily: 'Inter_700Bold' },
  content: { padding: 16, gap: 24 },
  section: { gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  label: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  hint: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  input: {
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, fontFamily: 'Inter_400Regular',
  },
  countRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  countBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22, borderWidth: 1.5 },
  countBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  noticeBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    padding: 10, borderRadius: 10, borderWidth: 1,
  },
  noticeText: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 17 },
  qCard: {
    padding: 12, borderRadius: 12, borderWidth: 1, gap: 8,
  },
  qRow1: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qNum: { width: 30, fontSize: 13, fontFamily: 'Inter_600SemiBold', textAlign: 'right' },
  typePills: { flex: 1, flexDirection: 'row', gap: 4 },
  typePill: { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  typePillText: { fontSize: 11, fontFamily: 'Inter_600SemiBold' },
  weightStepper: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepBtn: { width: 24, height: 24, borderRadius: 6, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', lineHeight: 20 },
  weightVal: { width: 24, textAlign: 'center', fontSize: 14, fontFamily: 'Inter_700Bold' },
  qRow2: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 38 },
  ansLabel: { fontSize: 12, fontFamily: 'Inter_400Regular', width: 52 },
  tfRow: { flexDirection: 'row', gap: 6 },
  tfBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  tfBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  manualNote: { fontSize: 12, fontFamily: 'Inter_400Regular', fontStyle: 'italic' },
  footer: { padding: 16, borderTopWidth: 1 },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 15, borderRadius: 14,
  },
  startBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
