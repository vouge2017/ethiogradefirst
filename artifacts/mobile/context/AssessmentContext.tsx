import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Assessment, StudentResult } from '@/lib/types';
import { makeId } from '@/lib/types';
import { loadAllAssessments, saveAssessment, deleteAssessment as dbDelete } from '@/lib/storage';

interface AssessmentContextValue {
  assessments: Assessment[];
  currentAssessment: Assessment | null;
  loading: boolean;
  beginAssessment: (data: Omit<Assessment, 'id' | 'results' | 'createdAt' | 'updatedAt'>) => Promise<Assessment>;
  setCurrentAssessment: (a: Assessment | null) => void;
  addResult: (result: StudentResult) => Promise<void>;
  updateResult: (resultId: string, updated: StudentResult) => Promise<void>;
  deleteAssessment: (id: string) => Promise<void>;
  refreshAssessments: () => Promise<void>;
}

const Ctx = createContext<AssessmentContextValue | null>(null);

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [currentAssessment, setCurrentAssessmentState] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAssessments = useCallback(async () => {
    const all = await loadAllAssessments();
    setAssessments(all);
  }, []);

  useEffect(() => { refreshAssessments().finally(() => setLoading(false)); }, [refreshAssessments]);

  const persist = useCallback(async (updated: Assessment) => {
    setCurrentAssessmentState(updated);
    setAssessments(prev => {
      const idx = prev.findIndex(a => a.id === updated.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = updated; return n; }
      return [updated, ...prev];
    });
    await saveAssessment(updated);
  }, []);

  const setCurrentAssessment = useCallback((a: Assessment | null) => {
    setCurrentAssessmentState(a);
  }, []);

  const beginAssessment = useCallback(async (
    data: Omit<Assessment, 'id' | 'results' | 'createdAt' | 'updatedAt'>
  ): Promise<Assessment> => {
    const now = Date.now();
    const assessment: Assessment = { ...data, id: makeId(), results: [], createdAt: now, updatedAt: now };
    await persist(assessment);
    return assessment;
  }, [persist]);

  const addResult = useCallback(async (result: StudentResult) => {
    if (!currentAssessment) return;
    await persist({
      ...currentAssessment,
      results: [...currentAssessment.results, result],
      updatedAt: Date.now(),
    });
  }, [currentAssessment, persist]);

  const updateResult = useCallback(async (resultId: string, updated: StudentResult) => {
    if (!currentAssessment) return;
    const results = currentAssessment.results.map(r => r.id === resultId ? updated : r);
    await persist({ ...currentAssessment, results, updatedAt: Date.now() });
  }, [currentAssessment, persist]);

  const deleteAssessment = useCallback(async (id: string) => {
    await dbDelete(id);
    setAssessments(prev => prev.filter(a => a.id !== id));
    if (currentAssessment?.id === id) setCurrentAssessmentState(null);
  }, [currentAssessment]);

  return (
    <Ctx.Provider value={{
      assessments, currentAssessment, loading,
      beginAssessment, setCurrentAssessment,
      addResult, updateResult, deleteAssessment, refreshAssessments,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAssessment(): AssessmentContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAssessment must be used within AssessmentProvider');
  return ctx;
}
