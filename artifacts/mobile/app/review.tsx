import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useAssessment } from '@/context/AssessmentContext';
import { AnswerSelector } from '@/components/AnswerBubble';
import { applyCorrections, getIssueLabel, getStatusLabel } from '@/lib/omr';
import type { Answer, PaperResult, QuestionDetection } from '@/lib/types';

function IssueChip({ label, colors }: { label: string; colors: any }) {
  return (
    <View style={[styles.chip, { backgroundColor: colors.warning + '18', borderColor: colors.warning + '40' }]}>
      <Feather name="alert-triangle" size={11} color={colors.warning} />
      <Text style={[styles.chipText, { color: colors.warning }]}>{label}</Text>
    </View>
  );
}

function QuestionReviewRow({
  detection,
  answerKey,
  colors,
  onCorrect,
}: {
  detection: QuestionDetection;
  answerKey: Answer;
  colors: any;
  onCorrect: (q: number, a: Answer) => void;
}) {
  const finalAnswer = detection.correctedAnswer !== undefined ? detection.correctedAnswer : detection.detectedAnswer;
  const isCorrect = finalAnswer !== null && finalAnswer === answerKey;
  const isBlank = finalAnswer === null;

  const statusColor =
    detection.status === 'SINGLE' && detection.confidence >= 0.75
      ? colors.success
      : detection.status === 'BLANK'
      ? colors.mutedForeground
      : colors.warning;

  return (
    <View style={[styles.qRow, { borderBottomColor: colors.border }]}>
      <View style={styles.qRowLeft}>
        <Text style={[styles.qNum, { color: colors.mutedForeground }]}>Q{detection.questionNumber}</Text>
        <View>
          <Text style={[styles.statusText, { color: statusColor }]}>
            {getStatusLabel(detection.status)}
            {detection.correctedAnswer !== undefined ? ' · Corrected' : ''}
          </Text>
          <Text style={[styles.confText, { color: colors.mutedForeground }]}>
            Confidence: {Math.round(detection.confidence * 100)}%
          </Text>
        </View>
      </View>

      <View style={styles.qRowRight}>
        <AnswerSelector
          selected={finalAnswer}
          onSelect={answer => onCorrect(detection.questionNumber, answer)}
          size="sm"
        />
        <View style={styles.keyAnswer}>
          <Text style={[styles.keyLabel, { color: colors.mutedForeground }]}>Key:</Text>
          <Text style={[styles.keyValue, { color: colors.primary }]}>{answerKey ?? '—'}</Text>
        </View>
      </View>
    </View>
  );
}

export default function ReviewScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { paperId } = useLocalSearchParams<{ paperId: string }>();
  const { currentAssessment, updatePaper } = useAssessment();

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const paper = useMemo(
    () => currentAssessment?.papers.find(p => p.id === paperId),
    [currentAssessment, paperId]
  );

  const [localDetections, setLocalDetections] = useState<QuestionDetection[]>(
    paper?.detections ?? []
  );
  const [confirming, setConfirming] = useState(false);

  const handleCorrect = useCallback((qNum: number, answer: Answer) => {
    Haptics.selectionAsync();
    setLocalDetections(prev =>
      prev.map(d =>
        d.questionNumber === qNum ? { ...d, correctedAnswer: answer } : d
      )
    );
  }, []);

  const needsReviewCount = localDetections.filter(d => d.needsReview && d.correctedAnswer === undefined).length;

  const handleConfirm = useCallback(async () => {
    if (needsReviewCount > 0) {
      Alert.alert(
        `${needsReviewCount} question${needsReviewCount !== 1 ? 's' : ''} need review`,
        'Some answers are uncertain and have not been corrected. Confirm anyway?',
        [
          { text: 'Review more', style: 'cancel' },
          { text: 'Confirm', onPress: doConfirm },
        ]
      );
      return;
    }
    await doConfirm();
  }, [needsReviewCount]);

  const doConfirm = useCallback(async () => {
    if (!paper || !currentAssessment) return;
    setConfirming(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const updatedPaper: PaperResult = {
      ...paper,
      detections: localDetections,
    };
    const finalized = applyCorrections(updatedPaper, currentAssessment.answerKey);
    await updatePaper(paper.id, finalized);
    setConfirming(false);
    router.replace('/scan');
  }, [paper, currentAssessment, localDetections, updatePaper]);

  const handleRetake = useCallback(() => {
    router.back();
  }, []);

  if (!paper || !currentAssessment) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.destructive }]}>Paper not found.</Text>
      </View>
    );
  }

  const previewScore = (() => {
    const finals = localDetections.map(d => d.correctedAnswer !== undefined ? d.correctedAnswer : d.detectedAnswer);
    return finals.filter((a, i) => a !== null && a === currentAssessment.answerKey[i]).length;
  })();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 12, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={handleRetake} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Feather name="arrow-left" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Review — {paper.label}</Text>
        <View style={[styles.scorePill, { backgroundColor: colors.primary + '18' }]}>
          <Text style={[styles.scorePillText, { color: colors.primary }]}>
            {previewScore}/{currentAssessment.questionCount}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {paper.imageUri ? (
          <View style={styles.imageWrap}>
            <Image source={{ uri: paper.imageUri }} style={styles.paperImage} resizeMode="contain" />
          </View>
        ) : null}

        {paper.issues.length > 0 && (
          <View style={[styles.issuesBox, { backgroundColor: colors.warning + '0E', borderColor: colors.warning + '30' }]}>
            <Text style={[styles.issuesTitle, { color: colors.foreground }]}>Detection Issues</Text>
            {paper.issues.map(code => (
              <IssueChip key={code} label={getIssueLabel(code)} colors={colors} />
            ))}
          </View>
        )}

        {needsReviewCount > 0 && (
          <View style={[styles.reviewBanner, { backgroundColor: colors.accent + '18', borderColor: colors.accent + '40' }]}>
            <Feather name="edit-2" size={14} color={colors.accent} />
            <Text style={[styles.reviewBannerText, { color: colors.accent }]}>
              {needsReviewCount} answer{needsReviewCount !== 1 ? 's' : ''} need your review
            </Text>
          </View>
        )}

        <View style={styles.instructions}>
          <Text style={[styles.instructionsText, { color: colors.mutedForeground }]}>
            Tap any answer to correct it. Uncertain detections are highlighted.
          </Text>
        </View>

        <View style={styles.questionsSection}>
          {localDetections.map(detection => (
            <QuestionReviewRow
              key={detection.questionNumber}
              detection={detection}
              answerKey={currentAssessment.answerKey[detection.questionNumber - 1]}
              colors={colors}
              onCorrect={handleCorrect}
            />
          ))}
        </View>

        <View style={{ height: bottomPad + 100 }} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomPad + 12, borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={handleRetake}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    flex: 1,
    marginHorizontal: 10,
  },
  scorePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scorePillText: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  scroll: {
    flex: 1,
  },
  imageWrap: {
    margin: 16,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  paperImage: {
    width: '100%',
    height: '100%',
  },
  issuesBox: {
    margin: 16,
    marginTop: 0,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  issuesTitle: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  chipText: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
  },
  reviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  reviewBannerText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
  },
  instructions: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  instructionsText: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  questionsSection: {
    paddingHorizontal: 16,
  },
  qRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  qRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 6,
  },
  qRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  qNum: {
    width: 32,
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    textAlign: 'right',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
  },
  confText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  keyAnswer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  keyLabel: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  keyValue: {
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
  },
  footer: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
  },
  retakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  retakeBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  confirmBtnText: {
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
