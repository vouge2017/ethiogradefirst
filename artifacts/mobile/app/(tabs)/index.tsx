import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { useAssessment } from '@/context/AssessmentContext';
import { AssessmentCard } from '@/components/AssessmentCard';
import type { Assessment } from '@/lib/types';

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { assessments, deleteAssessment, setCurrentAssessment, loading } = useAssessment();
  const [, setDeleting] = useState<string | null>(null);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const handleOpen = useCallback((assessment: Assessment) => {
    setCurrentAssessment(assessment);
    router.push('/results');
  }, [setCurrentAssessment]);

  const handleDelete = useCallback((id: string, title: string) => {
    Alert.alert(
      'Delete Assessment',
      `Delete "${title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(id);
            await deleteAssessment(id);
            setDeleting(null);
          },
        },
      ]
    );
  }, [deleteAssessment]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={[styles.appName, { color: colors.primary }]}>EthioGrade</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Offline Exam Grading
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/setup')}
            style={[styles.newBtn, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={20} color="#fff" />
            <Text style={styles.newBtnText}>New</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Loading...</Text>
        </View>
      ) : assessments.length === 0 ? (
        <View style={styles.empty}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
            <Feather name="clipboard" size={32} color={colors.mutedForeground} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No assessments yet</Text>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            Tap "New" to start grading
          </Text>
        </View>
      ) : (
        <FlatList
          data={assessments}
          keyExtractor={a => a.id}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 16 }]}
          renderItem={({ item }) => (
            <AssessmentCard
              assessment={item}
              onPress={() => handleOpen(item)}
              onDelete={() => handleDelete(item.id, item.title)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  appName: {
    fontSize: 26,
    fontFamily: 'Inter_700Bold',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
  },
  newBtnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  list: { padding: 16 },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 32,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
  },
});
