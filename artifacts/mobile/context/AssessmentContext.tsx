import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { Assessment, PaperResult } from '@/lib/types';
import { loadAllAssessments, saveAssessment, deleteAssessment as deleteAssessmentFromStorage } from '@/lib/storage';

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

interface AssessmentContextValue {
  assessments: Assessment[];
  currentAssessment: Assessment | null;
  loading: boolean;
  createAssessment: (data: Omit<Assessment, 'id' | 'papers' | 'createdAt' | 'updatedAt'>) => Assessment;
  setCurrentAssessment: (a: Assessment | null) => void;
  addPaper: (paper: PaperResult) => Promise<void>;
  updatePaper: (paperId: string, updated: PaperResult) => Promise<void>;
  deleteAssessment: (id: string) => Promise<void>;
  refreshAssessments: () => Promise<void>;
}

const AssessmentContext = createContext<AssessmentContextValue | null>(null);

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [currentAssessment, setCurrentAssessmentState] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAssessments = useCallback(async () => {
    const all = await loadAllAssessments();
    setAssessments(all);
  }, []);

  useEffect(() => {
    refreshAssessments().finally(() => setLoading(false));
  }, [refreshAssessments]);

  const createAssessment = useCallback((
    data: Omit<Assessment, 'id' | 'papers' | 'createdAt' | 'updatedAt'>
  ): Assessment => {
    const now = Date.now();
    const assessment: Assessment = {
      ...data,
      id: generateId(),
      papers: [],
      createdAt: now,
      updatedAt: now,
    };
    return assessment;
  }, []);

  const setCurrentAssessment = useCallback((a: Assessment | null) => {
    setCurrentAssessmentState(a);
  }, []);

  const addPaper = useCallback(async (paper: PaperResult) => {
    if (!currentAssessment) return;
    const updated: Assessment = {
      ...currentAssessment,
      papers: [...currentAssessment.papers, paper],
      updatedAt: Date.now(),
    };
    setCurrentAssessmentState(updated);
    setAssessments(prev => {
      const idx = prev.findIndex(a => a.id === updated.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [updated, ...prev];
    });
    await saveAssessment(updated);
  }, [currentAssessment]);

  const updatePaper = useCallback(async (paperId: string, updatedPaper: PaperResult) => {
    if (!currentAssessment) return;
    const papers = currentAssessment.papers.map(p => p.id === paperId ? updatedPaper : p);
    const updated: Assessment = {
      ...currentAssessment,
      papers,
      updatedAt: Date.now(),
    };
    setCurrentAssessmentState(updated);
    setAssessments(prev => {
      const idx = prev.findIndex(a => a.id === updated.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [updated, ...prev];
    });
    await saveAssessment(updated);
  }, [currentAssessment]);

  const deleteAssessment = useCallback(async (id: string) => {
    await deleteAssessmentFromStorage(id);
    setAssessments(prev => prev.filter(a => a.id !== id));
    if (currentAssessment?.id === id) {
      setCurrentAssessmentState(null);
    }
  }, [currentAssessment]);

  return (
    <AssessmentContext.Provider
      value={{
        assessments,
        currentAssessment,
        loading,
        createAssessment,
        setCurrentAssessment,
        addPaper,
        updatePaper,
        deleteAssessment,
        refreshAssessments,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment(): AssessmentContextValue {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error('useAssessment must be used within AssessmentProvider');
  return ctx;
}
