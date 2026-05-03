import React, { useCallback, useRef, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
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
  return { id: makeId(), number, type: 'mcq', weight: 1, gradingMode: 'auto' };
}

function QuestionCard({
  question,
  onUpdate,
  hasError,
  colors,
}: {
  question: Question;
  onUpdate: (id: string, patch: Partial<Question>) => void;
  hasError: boolean;
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

  const errorColor = colors.destructive;

  return (
    <View style={[
      styles.qCard,
      {
        backgroundColor: colors.card,
        borderColor: hasError ? errorColor : colors.border,
        borderWidth: hasError ? 1.5 : 1,
      },
    ]}>
      {/* Row 1: number + type pills + weight stepper */}
      <View style={styles.qRow1}>
        <Text style={[styles.qNum, { color: hasError ? errorColor : colors.mutedForeground }]}>
          Q{question.number}
        </Text>

        <View style={styles.typePills}>
          {ALL_TYPES.map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => updateType(t)}
              activeOpacity={0.7}
              style={[
                styles.typePill,
                {
                  backgroundColor: question.type === t ? colors.primary : colors.secondary,
                  borderColor: question.type === t ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[
                styles.typePillText,
                { color: question.type === t ? colors.primaryForeground : colors.mutedForeground },
              ]}>
                {TYPE_LABELS[t]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.weightStepper}>
          <TouchableOpacity onPress={() => adjustWeight(-1)} activeOpacity={0.7} style={[styles.stepBtn, { borderColor: colors.border }]}>
            <Text style={[styles.stepBtnText, { color: colors.foreground }]}>−</Text>
          </TouchableOpacity>
          <Text style={[styles.weightVal, { color: colors.foreground }]}>{question.weight}</Text>
          <TouchableOpacity onPress={() => adjustWeight(1)} activeOpacity={0.7} style={[styles.stepBtn, { borderColor: colors.border }]}>
            <Text style={[styles.stepBtnText, { color: colors.foreground }]}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Row 2: answer input */}
      {question.type === 'mcq' && (
        <View style={styles.qRow2}>
          <Text style={[styles.ansLabel, { color: hasError ? errorColor : colors.mutedForeground }]}>
            {hasError ? '⚠ Pick:' : 'Correct:'}
          </Text>
          <AnswerSelector
            selected={question.correctAnswer ?? null}
            onSelect={a => { Haptics.selectionAsync(); onUpdate(question.id, { correctAnswer: a ?? undefined }); }}
            size="sm"
          />
        </View>
      )}
      {question.type === 'true_false' && (
        <View style={styles.qRow2}>
          <Text style={[styles.ansLabel, { color: hasError ? errorColor : colors.mutedForeground }]}>
            {hasError ? '⚠ Pick:' : 'Correct:'}
          </Text>
          <View style={styles.tfRow}>
            {[true, false].map(val => {
              const sel = question.correctBoolean === val;
              return (
                <TouchableOpacity
                  key={String(val)}
                  onPress={() => { Haptics.selectionAsync(); onUpdate(question.id, { correctBoolean: val }); }}
                  activeOpacity={0.7}
                  style={[
                    styles.tfBtn,
                    {
                      backgroundColor: sel ? colors.primary : colors.secondary,
                      borderColor: sel ? colors.primary : (hasError ? errorColor : colors.border),
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
      )}
      {(question.type === 'short_answer' || question.type === 'matching') && (
        <>
          <View style={styles.qRow2}>
            <Feather name="edit-2" size={12} color={colors.mutedForeground} />
            <Text style={[styles.manualNote, { color: colors.mutedForeground }]}>
              Scored manually · {question.weight} pt{question.weight !== 1 ? 's' : ''}
            </Text>
          </View>
          <View style={[styles.qRow2, { alignItems: 'flex-start' }]}>
            <Feather name="file-text" size={12} color={colors.mutedForeground} style={{ marginTop: 9 }} />
            <TextInput
              style={[styles.noteInput, { borderColor: colors.border, backgroundColor: colors.background, color: colors.foreground }]}
              placeholder={question.type === 'short_answer' ? 'Expected answer / rubric hint (optional)' : 'Matching pairs / key (optional)'}
              placeholderTextColor={colors.mutedForeground}
              value={question.type === 'short_answer' ? (question.expectedAnswer ?? '') : (question.matchingPairs ?? '')}
              onChangeText={text => {
                if (question.type === 'short_answer') onUpdate(question.id, { expectedAnswer: text || undefined });
                else onUpdate(question.id, { matchingPairs: text || undefined });
              }}
              maxLength={200}
              multiline
              returnKeyType="done"
            />
          </View>
        </>
      )}
    </View>
  );
}

export default function SetupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { beginAssessment, setCurrentAssessment } = useAssessment();
  const scrollRef = useRef<ScrollView>(null);

  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState(false);
  const [questionCount, setQuestionCount] = useState(20);
  const [expectedCount, setExpectedCount] = useState('');
  const [questions, setQuestions] = useState<Question[]>(
    Array.from({ length: 20 }, (_, i) => makeDefaultQuestion(i + 1))
  );
  const [errorIds, setErrorIds] = useState<Set<string>>(new Set());
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const updateQuestionCount = useCallback((count: number) => {
    setQuestionCount(count);
    setErrorIds(new Set());
    setInlineError(null);
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
    setErrorIds(prev => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (patch.correctAnswer !== undefined || patch.correctBoolean !== undefined || patch.type !== undefined) {
      setInlineError(null);
    }
  }, []);

  const totalPoints = questions.reduce((s, q) => s + q.weight, 0);

  const answeredCount = questions.filter(q =>
    (q.type === 'mcq' && q.correctAnswer) ||
    (q.type === 'true_false' && q.correctBoolean !== undefined) ||
    q.type === 'short_answer' || q.type === 'matching'
  ).length;

  const handleStart = useCallback(async () => {
    setInlineError(null);
    setTitleError(false);

    if (!title.trim()) {
      setTitleError(true);
      setInlineError('Enter an assessment title first.');
      scrollRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    const missing = questions.filter(q =>
      (q.type === 'mcq' && !q.correctAnswer) ||
      (q.type === 'true_false' && q.correctBoolean === undefined)
    );

    if (missing.length > 0) {
      const newErrorIds = new Set(missing.map(q => q.id));
      setErrorIds(newErrorIds);
      const nums = missing.map(q => `Q${q.number}`).join(', ');
      setInlineError(
        `${missing.length} question${missing.length !== 1 ? 's' : ''} need an answer: ${nums}`
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setStarting(true);
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
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Quick Assessment</Text>
        <View style={styles.headerRight}>
          <View style={[styles.progressBadge, { backgroundColor: answeredCount === questionCount ? colors.success + '20' : colors.primary + '15' }]}>
            <Text style={[styles.progressBadgeText, { color: answeredCount === questionCount ? colors.success : colors.primary }]}>
              {answeredCount}/{questionCount} ✓
            </Text>
          </View>
          <View style={[styles.ptsBadge, { backgroundColor: colors.muted }]}>
            <Text style={[styles.ptsBadgeText, { color: colors.mutedForeground }]}>{totalPoints} pts</Text>
          </View>
        </View>
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 110 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.foreground }]}>Assessment Title</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: titleError ? colors.destructive : colors.border,
                color: colors.foreground,
              },
            ]}
            placeholder="e.g. Grade 8 Math Chapter 4"
            placeholderTextColor={colors.mutedForeground}
            value={title}
            onChangeText={v => { setTitle(v); setTitleError(false); if (inlineError?.includes('title')) setInlineError(null); }}
            returnKeyType="done"
            maxLength={60}
          />
          {titleError && (
            <Text style={[styles.fieldError, { color: colors.destructive }]}>Title is required</Text>
          )}
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
                  activeOpacity={0.7}
                  style={[
                    styles.countBtn,
                    {
                      backgroundColor: questionCount === n ? colors.primary : colors.card,
                      borderColor: questionCount === n ? colors.primary : colors.border,
                    },
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

        {/* Inline error banner */}
        {inlineError && (
          <View style={[styles.errorBanner, { backgroundColor: colors.destructive + '12', borderColor: colors.destructive + '40' }]}>
            <Feather name="alert-circle" size={15} color={colors.destructive} />
            <Text style={[styles.errorBannerText, { color: colors.destructive }]}>{inlineError}</Text>
            <TouchableOpacity onPress={() => { setInlineError(null); setErrorIds(new Set()); }}>
              <Feather name="x" size={15} color={colors.destructive} />
            </TouchableOpacity>
          </View>
        )}

        {/* Question setup */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.label, { color: colors.foreground }]}>Questions &amp; Answer Key</Text>
            <Text style={[styles.hint, { color: colors.mutedForeground }]}>type · pts · answer</Text>
          </View>

          <View style={[styles.noticeBanner, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="info" size={12} color={colors.mutedForeground} />
            <Text style={[styles.noticeText, { color: colors.mutedForeground }]}>
              MCQ and T/F need a correct answer. Short Answer and Matching are scored manually during grading.
            </Text>
          </View>

          <View style={styles.qList}>
            {questions.map(q => (
              <QuestionCard
                key={q.id}
                question={q}
                onUpdate={updateQuestion}
                hasError={errorIds.has(q.id)}
                colors={colors}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { paddingBottom: bottomPad + 12, borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={handleStart}
          activeOpacity={0.8}
          disabled={starting}
          style={[styles.startBtn, { backgroundColor: colors.primary, opacity: starting ? 0.7 : 1 }]}
        >
          <Feather name="camera" size={18} color="#fff" />
          <Text style={styles.startBtnText}>
            {starting ? 'Starting...' : `Start Grading — ${totalPoints} pts`}
          </Text>
        </TouchableOpacity>
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
  headerTitle: { flex: 1, fontSize: 17, fontFamily: 'Inter_600SemiBold' },
  headerRight: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  progressBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10 },
  progressBadgeText: { fontSize: 12, fontFamily: 'Inter_700Bold' },
  ptsBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 10 },
  ptsBadgeText: { fontSize: 12, fontFamily: 'Inter_600SemiBold' },
  content: { padding: 16, gap: 22 },
  section: { gap: 10 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  label: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  hint: { fontSize: 11, fontFamily: 'Inter_400Regular' },
  fieldError: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: -4 },
  input: {
    borderWidth: 1, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, fontFamily: 'Inter_400Regular',
  },
  countRow: { flexDirection: 'row', gap: 8, paddingBottom: 4 },
  countBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22, borderWidth: 1.5 },
  countBtnText: { fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  errorBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    padding: 12, borderRadius: 10, borderWidth: 1,
  },
  errorBannerText: { flex: 1, fontSize: 13, fontFamily: 'Inter_500Medium', lineHeight: 18 },
  noticeBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    padding: 10, borderRadius: 10, borderWidth: 1,
  },
  noticeText: { flex: 1, fontSize: 12, fontFamily: 'Inter_400Regular', lineHeight: 17 },
  qList: { gap: 8 },
  qCard: { padding: 12, borderRadius: 12, gap: 8 },
  qRow1: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qNum: { width: 28, fontSize: 13, fontFamily: 'Inter_700Bold', textAlign: 'right' },
  typePills: { flex: 1, flexDirection: 'row', gap: 4 },
  typePill: { flex: 1, alignItems: 'center', paddingVertical: 5, borderRadius: 8, borderWidth: 1 },
  typePillText: { fontSize: 10, fontFamily: 'Inter_700Bold' },
  weightStepper: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stepBtn: { width: 26, height: 26, borderRadius: 6, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 17, fontFamily: 'Inter_600SemiBold', lineHeight: 22 },
  weightVal: { width: 26, textAlign: 'center', fontSize: 14, fontFamily: 'Inter_700Bold' },
  qRow2: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingLeft: 34 },
  ansLabel: { fontSize: 12, fontFamily: 'Inter_500Medium', minWidth: 50 },
  tfRow: { flexDirection: 'row', gap: 6 },
  tfBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  tfBtnText: { fontSize: 13, fontFamily: 'Inter_600SemiBold' },
  manualNote: { fontSize: 12, fontFamily: 'Inter_400Regular', fontStyle: 'italic' },
  noteInput: {
    flex: 1, borderWidth: 1, borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 7,
    fontSize: 12, fontFamily: 'Inter_400Regular',
    minHeight: 34, textAlignVertical: 'top',
  },
  footer: { paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1 },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 15, borderRadius: 14,
  },
  startBtnText: { color: '#fff', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
