import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Assessment } from './types';

const KEY = 'ethiograde_v2';

export async function saveAssessment(assessment: Assessment): Promise<void> {
  const all = await loadAllAssessments();
  const idx = all.findIndex(a => a.id === assessment.id);
  if (idx >= 0) { all[idx] = assessment; } else { all.unshift(assessment); }
  await AsyncStorage.setItem(KEY, JSON.stringify(all));
}

export async function loadAllAssessments(): Promise<Assessment[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Assessment[]) : [];
  } catch { return []; }
}

export async function deleteAssessment(id: string): Promise<void> {
  const all = await loadAllAssessments();
  await AsyncStorage.setItem(KEY, JSON.stringify(all.filter(a => a.id !== id)));
}
