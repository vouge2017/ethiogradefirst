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
import type { Answer } from '@/lib/types';
import { saveAssessment } from '@/lib/storage';

const QUESTION_COUNTS = [10, 15, 20, 25, 30, 40, 50];

export default function SetupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { createAssessment, setCurrentAssessment } = useAssessment();

  const [title, setTitle] = useState('');
  const [questionCount, setQuestionCount] = useState(20);
  const [expectedCount, setExpectedCount] = useState('');
  const [answerKey, setAnswerKey] = useState<Answer[]>(Array(20).fill(null));

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const updateQuestionCount = useCallback((count: number) => {
    setQuestionCount(count);
    setAnswerKey(prev => {
      const next = [...prev];
      if (count > next.length) {
        return [...next, ...Array(count - next.length).fill(null)];
      }
      return next.slice(0, count);
    });
  }, []);

  const setAnswer = useCallback((idx: number, answer: Answer) => {
    Haptics.selectionAsync();
    setAnswerKey(prev => {
      const next = [...prev];
      next[idx] = answer;
      return next;
    });
  }, []);

  const filledCount = answerKey.filter(a => a !== null).length;

  const handleStart = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('Title required', 'Please enter an assessment title.');
      return;
    }
    if (filledCount === 0) {
      Alert.alert('Answer key required', 'Please enter at least one answer in the key.');
      return;
    }
    if (filledCount < questionCount) {
      Alert.alert(
        'Incomplete answer key',
        `${questionCount - filledCount} question(s) are blank. Continue anyway?`,
        [
          { text: 'Go back', style: 'cancel' },
          { text: 'Continue', onPress: startAssessment },
        ]
      );
      return;
    }
    await startAssessment();
  }, [title, filledCount, questionCount]);

  const startAssessment = useCallback(async () => {
    const assessment = createAssessment({
      title: title.trim(),
      answerKey,
      questionCount,
      expectedPaperCount: expectedCount ? parseInt(expectedCount, 10) : undefined,
    });
    await saveAssessment(assessment);
    setCurrentAssessment(assessment);
    router.replace('/scan');
  }, [title, answerKey, questionCount, expectedCount, createAssessment, setCurrentAssessment]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>New Assessment</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPad + 24 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.foreground }]}>Number of Questions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.countScroll}>
            <View style={styles.countRow}>
              {QUESTION_COUNTS.map(n => (
                <TouchableOpacity
                  key={n}
                  onPress={() => {
                    Haptics.selectionAsync();
                    updateQuestionCount(n);
                  }}
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

        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.foreground }]}>
            Expected Paper Count{' '}
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

        <View style={styles.section}>
          <View style={styles.keyHeader}>
            <Text style={[styles.label, { color: colors.foreground }]}>Answer Key</Text>
            <Text style={[styles.keyProgress, { color: filledCount === questionCount ? colors.success : colors.mutedForeground }]}>
              {filledCount}/{questionCount}
            </Text>
          </View>
          <Text style={[styles.keyHint, { color: colors.mutedForeground }]}>
            Tap a bubble to set the correct answer. Tap again to clear.
          </Text>

          <View style={styles.keyGrid}>
            {Array.from({ length: questionCount }, (_, i) => (
              <View key={i} style={[styles.keyRow, { borderBottomColor: colors.border }]}>
                <Text style={[styles.qNum, { color: colors.mutedForeground }]}>
                  Q{i + 1}
                </Text>
                <AnswerSelector
                  selected={answerKey[i] ?? null}
                  onSelect={answer => setAnswer(i, answer)}
                />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomPad + 12, borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={handleStart}
          activeOpacity={0.8}
          style={[styles.startBtn, { backgroundColor: colors.primary }]}
        >
          <Feather name="camera" size={18} color="#fff" />
          <Text style={styles.startBtnText}>Start Scanning</Text>
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
  headerTitle: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
  },
  content: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  countScroll: {},
  countRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
  },
  countBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1.5,
  },
  countBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  keyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  keyProgress: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
  },
  keyHint: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: -4,
  },
  keyGrid: {
    gap: 0,
  },
  keyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  qNum: {
    width: 32,
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    textAlign: 'right',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 14,
  },
  startBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
});
