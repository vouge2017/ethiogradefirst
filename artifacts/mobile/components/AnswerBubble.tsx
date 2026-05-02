import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import type { Answer } from '@/lib/types';

const OPTIONS: Answer[] = ['A', 'B', 'C', 'D', 'E'];

interface AnswerBubbleProps {
  answer: Answer;
  selected?: boolean;
  correct?: boolean;
  incorrect?: boolean;
  onPress?: (answer: Answer) => void;
  size?: 'sm' | 'md' | 'lg';
}

export function AnswerBubble({
  answer,
  selected = false,
  correct = false,
  incorrect = false,
  onPress,
  size = 'md',
}: AnswerBubbleProps) {
  const colors = useColors();
  const dim = size === 'sm' ? 32 : size === 'lg' ? 48 : 40;
  const fontSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 15;

  let bgColor = colors.secondary;
  let textColor = colors.mutedForeground;
  let borderColor = colors.border;

  if (correct) {
    bgColor = colors.success;
    textColor = colors.successForeground;
    borderColor = colors.success;
  } else if (incorrect) {
    bgColor = colors.destructive;
    textColor = colors.destructiveForeground;
    borderColor = colors.destructive;
  } else if (selected) {
    bgColor = colors.primary;
    textColor = colors.primaryForeground;
    borderColor = colors.primary;
  }

  return (
    <TouchableOpacity
      onPress={() => onPress?.(answer)}
      disabled={!onPress}
      activeOpacity={0.7}
      style={[
        styles.bubble,
        {
          width: dim,
          height: dim,
          borderRadius: dim / 2,
          backgroundColor: bgColor,
          borderColor,
        },
      ]}
    >
      <Text style={[styles.label, { color: textColor, fontSize }]}>
        {answer ?? '—'}
      </Text>
    </TouchableOpacity>
  );
}

interface AnswerSelectorProps {
  selected: Answer;
  onSelect: (answer: Answer) => void;
  correctAnswer?: Answer;
  showResult?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function AnswerSelector({
  selected,
  onSelect,
  correctAnswer,
  showResult = false,
  size = 'md',
}: AnswerSelectorProps) {
  const colors = useColors();
  return (
    <View style={styles.selector}>
      {OPTIONS.map(opt => {
        const isSelected = selected === opt;
        const isCorrect = showResult && correctAnswer === opt;
        const isIncorrect = showResult && isSelected && opt !== correctAnswer;
        return (
          <AnswerBubble
            key={opt}
            answer={opt}
            selected={isSelected && !showResult}
            correct={isCorrect || (isSelected && showResult && opt === correctAnswer)}
            incorrect={isIncorrect}
            onPress={!showResult ? onSelect : undefined}
            size={size}
          />
        );
      })}
      <AnswerBubble
        answer={null}
        selected={selected === null && !showResult}
        onPress={!showResult ? () => onSelect(null) : undefined}
        size={size}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  label: {
    fontFamily: 'Inter_600SemiBold',
  },
  selector: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
});
