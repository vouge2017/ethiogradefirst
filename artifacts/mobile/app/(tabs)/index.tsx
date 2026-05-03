import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
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
  const [query, setQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const filtered = useMemo(() => {
    if (!query.trim()) return assessments;
    const q = query.toLowerCase();
    return assessments.filter(a => a.title.toLowerCase().includes(q));
  }, [assessments, query]);

  const totalStudents = useMemo(
    () => assessments.reduce((s, a) => s + a.results.filter(r => r.confirmedAt > 0).length, 0),
    [assessments]
  );

  const handleOpen = useCallback((assessment: Assessment) => {
    setCurrentAssessment(assessment);
    router.push('/results');
  }, [setCurrentAssessment]);

  const handleDeletePress = useCallback((id: string) => {
    setConfirmDeleteId(prev => prev === id ? null : id);
  }, []);

  const handleDeleteConfirm = useCallback(async (id: string) => {
    setDeleting(true);
    await deleteAssessment(id);
    setConfirmDeleteId(null);
    setDeleting(false);
  }, [deleteAssessment]);

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.appName, { color: colors.primary }]}>EthioGrade</Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Offline Exam Grading</Text>
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

        {/* Stats row */}
        {assessments.length > 0 && (
          <View style={[styles.statsRow, { backgroundColor: colors.muted, borderRadius: 10 }]}>
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: colors.primary }]}>{assessments.length}</Text>
              <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>Assessments</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: colors.primary }]}>{totalStudents}</Text>
              <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>Students Graded</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNum, { color: colors.primary }]}>
                {assessments.reduce((s, a) => s + a.questions.length, 0)}
              </Text>
              <Text style={[styles.statLbl, { color: colors.mutedForeground }]}>Total Questions</Text>
            </View>
          </View>
        )}

        {/* Search bar */}
        {assessments.length > 0 && (
          <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="search" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.searchInput, { color: colors.foreground }]}
              placeholder="Search assessments…"
              placeholderTextColor={colors.mutedForeground}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              clearButtonMode="while-editing"
              autoCorrect={false}
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery('')}>
                <Feather name="x" size={15} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {loading ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>Loading…</Text>
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
      ) : filtered.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="search" size={32} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No results for "{query}"</Text>
          <TouchableOpacity onPress={() => setQuery('')}>
            <Text style={[styles.clearSearch, { color: colors.primary }]}>Clear search</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={a => a.id}
          contentContainerStyle={[styles.list, { paddingBottom: bottomPad + 16 }]}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View>
              <AssessmentCard
                assessment={item}
                onPress={() => handleOpen(item)}
                onDelete={() => handleDeletePress(item.id)}
              />
              {confirmDeleteId === item.id && (
                <View style={[styles.confirmDelete, { backgroundColor: colors.destructive + '0E', borderColor: colors.destructive + '40' }]}>
                  <Text style={[styles.confirmDeleteText, { color: colors.destructive }]}>
                    Delete "{item.title}"? This cannot be undone.
                  </Text>
                  <View style={styles.confirmDeleteBtns}>
                    <TouchableOpacity
                      onPress={() => setConfirmDeleteId(null)}
                      style={[styles.confirmCancelBtn, { borderColor: colors.border }]}
                    >
                      <Text style={[styles.confirmCancelText, { color: colors.foreground }]}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteConfirm(item.id)}
                      disabled={deleting}
                      style={[styles.confirmDeleteBtn, { backgroundColor: colors.destructive }]}
                    >
                      <Text style={styles.confirmDeleteBtnText}>{deleting ? 'Deleting…' : 'Delete'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { borderBottomWidth: 1, paddingHorizontal: 16, paddingBottom: 12, gap: 12 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  appName: { fontSize: 26, fontFamily: 'Inter_700Bold', letterSpacing: -0.5 },
  subtitle: { fontSize: 12, fontFamily: 'Inter_400Regular', marginTop: 1 },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 22,
  },
  newBtnText: { color: '#fff', fontSize: 15, fontFamily: 'Inter_600SemiBold' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 4, paddingVertical: 8 },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statNum: { fontSize: 18, fontFamily: 'Inter_700Bold' },
  statLbl: { fontSize: 10, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  statDivider: { width: 1, marginVertical: 4 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    borderWidth: 1, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', padding: 0 },
  list: { padding: 16, gap: 2 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 },
  emptyIcon: { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  emptyTitle: { fontSize: 18, fontFamily: 'Inter_600SemiBold' },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', textAlign: 'center' },
  clearSearch: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  confirmDelete: {
    marginTop: 2, padding: 14, borderRadius: 12, borderWidth: 1, gap: 10, marginBottom: 8,
  },
  confirmDeleteText: { fontSize: 13, fontFamily: 'Inter_400Regular', lineHeight: 18 },
  confirmDeleteBtns: { flexDirection: 'row', gap: 8 },
  confirmCancelBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1,
    alignItems: 'center',
  },
  confirmCancelText: { fontSize: 14, fontFamily: 'Inter_600SemiBold' },
  confirmDeleteBtn: {
    flex: 1, paddingVertical: 10, borderRadius: 10,
    alignItems: 'center',
  },
  confirmDeleteBtnText: { color: '#fff', fontSize: 14, fontFamily: 'Inter_600SemiBold' },
});
