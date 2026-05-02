import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Assessment } from './types';

const ASSESSMENTS_KEY = 'ethiograde_assessments';

export async function saveAssessment(assessment: Assessment): Promise<void> {
  const all = await loadAllAssessments();
  const idx = all.findIndex(a => a.id === assessment.id);
  if (idx >= 0) {
    all[idx] = assessment;
  } else {
    all.unshift(assessment);
  }
  await AsyncStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(all));
}

export async function loadAllAssessments(): Promise<Assessment[]> {
  try {
    const raw = await AsyncStorage.getItem(ASSESSMENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Assessment[];
  } catch {
    return [];
  }
}

export async function loadAssessment(id: string): Promise<Assessment | null> {
  const all = await loadAllAssessments();
  return all.find(a => a.id === id) ?? null;
}

export async function deleteAssessment(id: string): Promise<void> {
  const all = await loadAllAssessments();
  const filtered = all.filter(a => a.id !== id);
  await AsyncStorage.setItem(ASSESSMENTS_KEY, JSON.stringify(filtered));
}
