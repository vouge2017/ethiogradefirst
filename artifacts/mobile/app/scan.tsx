import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/hooks/useColors';
import { useAssessment } from '@/context/AssessmentContext';
import { runOMRDetection } from '@/lib/omr';

export default function ScanScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { currentAssessment, addPaper, setCurrentAssessment } = useAssessment();
  const [processing, setProcessing] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);

  const topPad = Platform.OS === 'web' ? 67 : insets.top;
  const bottomPad = Platform.OS === 'web' ? 34 : insets.bottom;

  const paperIndex = currentAssessment?.papers.length ?? 0;

  const processImage = useCallback(async (uri: string) => {
    if (!currentAssessment) return;
    setCapturedUri(uri);
    setProcessing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    await new Promise(res => setTimeout(res, 800));

    const paper = runOMRDetection(uri, currentAssessment.answerKey, paperIndex);
    await addPaper(paper);

    setProcessing(false);
    setCapturedUri(null);

    const updatedAssessment = {
      ...currentAssessment,
      papers: [...currentAssessment.papers, paper],
    };
    setCurrentAssessment(updatedAssessment);

    router.push({ pathname: '/review', params: { paperId: paper.id } });
  }, [currentAssessment, paperIndex, addPaper, setCurrentAssessment]);

  const handleCamera = useCallback(async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Camera not available', 'Use "Import from Gallery" on web.');
      return;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Camera permission required',
        'Please allow camera access in Settings to scan papers.',
        [{ text: 'OK' }]
      );
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      await processImage(result.assets[0].uri);
    }
  }, [processImage]);

  const handleGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Gallery permission required',
        'Please allow photo library access to import papers.',
        [{ text: 'OK' }]
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      await processImage(result.assets[0].uri);
    }
  }, [processImage]);

  const handleViewResults = useCallback(() => {
    router.push('/results');
  }, []);

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
            {currentAssessment.title}
          </Text>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]}>
            Paper {paperIndex + 1}
            {currentAssessment.expectedPaperCount
              ? ` of ${currentAssessment.expectedPaperCount}`
              : ''}
          </Text>
        </View>
        {currentAssessment.papers.length > 0 ? (
          <TouchableOpacity onPress={handleViewResults}>
            <Text style={[styles.resultsLink, { color: colors.primary }]}>Results</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 50 }} />
        )}
      </View>

      <View style={styles.body}>
        {processing ? (
          <View style={styles.processingWrap}>
            {capturedUri && (
              <Image source={{ uri: capturedUri }} style={styles.preview} resizeMode="contain" />
            )}
            <View style={[styles.processingOverlay, { backgroundColor: colors.background + 'cc' }]}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.processingText, { color: colors.foreground }]}>
                Detecting answers...
              </Text>
              <Text style={[styles.processingHint, { color: colors.mutedForeground }]}>
                Using GradeFlow Bubble 20 v1 template
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.scanArea}>
            <View style={[styles.frameBox, { borderColor: colors.border }]}>
              <View style={[styles.corner, styles.cornerTL, { borderColor: colors.primary }]} />
              <View style={[styles.corner, styles.cornerTR, { borderColor: colors.primary }]} />
              <View style={[styles.corner, styles.cornerBL, { borderColor: colors.primary }]} />
              <View style={[styles.corner, styles.cornerBR, { borderColor: colors.primary }]} />
              <View style={styles.frameInner}>
                <Feather name="file-text" size={48} color={colors.mutedForeground} />
                <Text style={[styles.frameHint, { color: colors.mutedForeground }]}>
                  Position the answer sheet within the frame
                </Text>
                <Text style={[styles.templateLabel, { color: colors.accent, backgroundColor: colors.accent + '18' }]}>
                  GradeFlow Bubble 20 v1
                </Text>
              </View>
            </View>

            <View style={[styles.tipBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Feather name="sun" size={14} color={colors.mutedForeground} />
              <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
                Good lighting improves accuracy. Avoid shadows and glare.
              </Text>
            </View>
          </View>
        )}
      </View>

      {!processing && (
        <View style={[styles.footer, { paddingBottom: bottomPad + 12, borderTopColor: colors.border, backgroundColor: colors.background }]}>
          <View style={styles.footerRow}>
            <TouchableOpacity
              onPress={handleGallery}
              activeOpacity={0.8}
              style={[styles.galleryBtn, { borderColor: colors.primary, backgroundColor: colors.card }]}
            >
              <Feather name="image" size={20} color={colors.primary} />
              <Text style={[styles.galleryBtnText, { color: colors.primary }]}>Import</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCamera}
              activeOpacity={0.8}
              style={[styles.cameraBtn, { backgroundColor: colors.primary }]}
            >
              <Feather name="camera" size={22} color="#fff" />
              <Text style={styles.cameraBtnText}>Scan Paper</Text>
            </TouchableOpacity>
          </View>
          {currentAssessment.papers.length > 0 && (
            <TouchableOpacity onPress={handleViewResults} style={styles.finishLink}>
              <Text style={[styles.finishLinkText, { color: colors.mutedForeground }]}>
                Done scanning — view {currentAssessment.papers.length} result{currentAssessment.papers.length !== 1 ? 's' : ''}
              </Text>
              <Feather name="chevron-right" size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      )}
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
  headerCenter: { flex: 1, alignItems: 'center', paddingHorizontal: 8 },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  headerSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  resultsLink: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    width: 50,
    textAlign: 'right',
  },
  body: {
    flex: 1,
    padding: 20,
  },
  processingWrap: {
    flex: 1,
    position: 'relative',
  },
  preview: {
    flex: 1,
    borderRadius: 12,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderRadius: 12,
  },
  processingText: {
    fontSize: 17,
    fontFamily: 'Inter_600SemiBold',
  },
  processingHint: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  scanArea: {
    flex: 1,
    gap: 16,
  },
  frameBox: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    position: 'relative',
    overflow: 'visible',
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderWidth: 3,
  },
  cornerTL: { top: -2, left: -2, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  cornerTR: { top: -2, right: -2, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  cornerBL: { bottom: -2, left: -2, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: -2, right: -2, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
  frameInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  frameHint: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  templateLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
  },
  tipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    gap: 10,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  galleryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  galleryBtnText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  cameraBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  cameraBtnText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  finishLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  finishLinkText: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 60,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
});
