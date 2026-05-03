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
import { calculateScore } from '@/lib/omr';
import type { Answer, PaperResult, QuestionDetection } from '@/lib/types';

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export default function ManualEntryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentAssessment, addPaper } = useAssessment();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const paperIndex = currentAssessment?.papers.length ?? 0;

  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [answers, setAnswers] = useState<Answer[]>(
    Array(currentAssessment?.questionCount ?? 0).fill(null)
  );
  const [saving, setSaving] = useState(false);

  const setAnswer = useCallback((idx: number, answer: Answer) => {
    Haptics.selectionAsync();
    setAnswers(prev => {
      const next = [...prev];
      next[idx] = answer;
      return next;
    });
  }, []);

  const filledCount = answers.filter(a => a !== null).length;
  const questionCount = currentAssessment?.questionCount ?? 0;

  const handleSave = useCallback(async () => {
    if (!currentAssessment) return;

    if (!studentName.trim()) {
      Alert.alert('Name required', 'Please enter the student\'s name.');
      return;
    }

    if (filledCount < questionCount) {
      Alert.alert(
        'Incomplete answers',
        `${questionCount - filledCount} question(s) are still blank. Save anyway?`,
        [
          { text: 'Keep editing', style: 'cancel' },
          { text: 'Save', onPress: doSave },
        ]
      );
      return;
    }

    await doSave();
  }, [currentAssessment, studentName, filledCount, questionCount]);

  const doSave = useCallback(async () => {
    if (!currentAssessment) return;
    setSaving(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const name = studentName.trim();
    const sid = studentId.trim();

    const detections: QuestionDetection[] = answers.map((answer, i) => ({
      questionNumber: i + 1,
      detectedAnswer: answer,
      status: 'SINGLE' as const,
      confidence: 1.0,
      needsReview: false,
    }));

    const finalAnswers = answers;
    const score = calculateScore(finalAnswers, currentAssessment.answerKey);
    const maxScore = currentAssessment.questionCount;

    const paper: PaperResult = {
      id: generateId(),
      label: name || `Paper ${paperIndex + 1}`,
      studentName: name || undefined,
      studentId: sid || undefined,
      detections,
      issues: [],
      finalAnswers,
      score,
      maxScore,
      percentage: maxScore > 0 ? Math.round((score / maxScore) * 100) : 0,
      reviewComplete: true,
      createdAt: Date.now(),
    };

    await addPaper(paper);
    setSaving(false);
    router.replace('/scan');
  }, [currentAssessment, studentName, studentId, answers, paperIndex, addPaper]);

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
          <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>
            Manual Entry
          </Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            Paper {paperIndex + 1}
            {currentAssessment.expectedPaperCount ? ` of ${currentAssessment.expectedPaperCount}` : ''}
          </Text>
        </View>
        <View style={[styles.progressPill, { backgroundColor: colors.primary + '18' }]}>
          <Text style={[styles.progressText, { color: filledCount === questionCount ? colors.success : colors.primary }]}>
            {filledCount}/{questionCount}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 100 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Student Identity */}
        <View style={[styles.studentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Student Info</Text>
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

        {/* OMR disclosure */}
        <View style={[styles.noticeBanner, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Feather name="info" size={13} color={colors.mutedForeground} />
          <Text style={[styles.noticeText, { color: colors.mutedForeground }]}>
            Manual mode: tap A–E for each question. This bypasses camera scanning.
          </Text>
        </View>

        {/* Answer entry */}
        <View style={[styles.answersCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.foreground }]}>Student Answers</Text>
          <Text style={[styles.answerHint, { color: colors.mutedForeground }]}>
            Tap the correct bubble for each question. Tap again to clear.
          </Text>
          <View style={styles.answerGrid}>
            {Array.from({ length: questionCount }, (_, i) => (
              <View key={i} style={[styles.answerRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.qNum, { color: colors.mutedForeground }]}>Q{i + 1}</Text>
                <View style={styles.keyHint}>
                  <Text style={[styles.keyLabel, { color: colors.mutedForeground }]}>Key:</Text>
                  <Text style={[styles.keyValue, { color: colors.primary }]}>
                    {currentAssessment.answerKey[i] ?? '—'}
                  </Text>
                </View>
                <AnswerSelector
                  selected={answers[i] ?? null}
                  onSelect={answer => setAnswer(i, answer)}
                  size="sm"
                />
              </View>
            ))}
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  headerSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  progressPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  progressText: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  scroll: { flex: 1 },
  content: {
    padding: 16,
    gap: 14,
  },
  studentCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  fieldGroup: {
    gap: 8,
  },
  fieldRow: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  noticeBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    lineHeight: 17,
  },
  answersCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  answerHint: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: -4,
  },
  answerGrid: {
    gap: 0,
  },
  answerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  qNum: {
    width: 32,
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    textAlign: 'right',
  },
  keyHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    width: 44,
  },
  keyLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  keyValue: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
});
