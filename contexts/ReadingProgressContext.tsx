import React, { createContext, useContext, useState, useCallback } from 'react';
import { ReadingProgress, QuranStatistic, KhatmahPlan } from '../types';
import { safeGetItem, safeSetItem } from '../utils/localStorage';
import { TOTAL_VERSES } from '../utils/constants';

interface ReadingProgressContextValue {
  progress: Record<number, ReadingProgress>;
  updateProgress: (chapterId: number, verseKey: string, totalVerses: number) => void;
  getChapterProgress: (chapterId: number) => ReadingProgress | null;
  getOverallProgress: () => number; // 0-100 percentage
  getLastReadChapter: () => ReadingProgress | null;
  stats: QuranStatistic;
  updateReadingTime: (minutes: number) => void;
  // Khatmah
  khatmahPlans: KhatmahPlan[];
  createKhatmahPlan: (name: string, totalDays: number) => void;
  markDayComplete: (planId: string) => void;
  deleteKhatmahPlan: (planId: string) => void;
}

const ReadingProgressContext = createContext<ReadingProgressContextValue | null>(null);

export function useReadingProgress() {
  const ctx = useContext(ReadingProgressContext);
  if (!ctx) throw new Error('useReadingProgress must be used within ReadingProgressProvider');
  return ctx;
}

function calculateStreak(stats: QuranStatistic): number {
  const today = new Date().toISOString().split('T')[0];
  if (stats.lastReadDate === today) return stats.currentStreak;

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (stats.lastReadDate === yesterday) return stats.currentStreak;

  return 0; // streak broken
}

export function ReadingProgressProvider({ children }: { children: React.ReactNode }) {
  const [progress, setProgress] = useState<Record<number, ReadingProgress>>(() =>
    safeGetItem('readingProgress', {})
  );

  const [stats, setStats] = useState<QuranStatistic>(() =>
    safeGetItem('quranStats', {
      totalVersesRead: 0,
      totalTimeSpent: 0,
      chaptersCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastReadDate: '',
    })
  );

  const [khatmahPlans, setKhatmahPlans] = useState<KhatmahPlan[]>(() =>
    safeGetItem('khatmahPlans', [])
  );

  const updateProgress = useCallback((chapterId: number, verseKey: string, totalVerses: number) => {
    const verseNum = parseInt(verseKey.split(':')[1]) || 0;
    const existing = progress[chapterId];
    const newVersesRead = Math.max(existing?.versesRead || 0, verseNum);

    const updated = {
      ...progress,
      [chapterId]: {
        chapterId,
        lastVerseKey: verseKey,
        lastReadAt: Date.now(),
        versesRead: newVersesRead,
        totalVerses,
      },
    };
    setProgress(updated);
    safeSetItem('readingProgress', updated);

    // Update stats
    const today = new Date().toISOString().split('T')[0];
    const isNewDay = stats.lastReadDate !== today;
    const newStreak = isNewDay ? calculateStreak(stats) + 1 : stats.currentStreak;
    const wasCompleted = existing?.versesRead === totalVerses;
    const isNowCompleted = newVersesRead >= totalVerses;

    const newStats: QuranStatistic = {
      ...stats,
      totalVersesRead: stats.totalVersesRead + (newVersesRead > (existing?.versesRead || 0) ? 1 : 0),
      chaptersCompleted: stats.chaptersCompleted + (!wasCompleted && isNowCompleted ? 1 : 0),
      currentStreak: newStreak,
      longestStreak: Math.max(stats.longestStreak, newStreak),
      lastReadDate: today,
    };
    setStats(newStats);
    safeSetItem('quranStats', newStats);
  }, [progress, stats]);

  const getChapterProgress = useCallback((chapterId: number): ReadingProgress | null => {
    return progress[chapterId] || null;
  }, [progress]);

  const getOverallProgress = useCallback((): number => {
    const totalRead = Object.values(progress).reduce((sum, p) => sum + p.versesRead, 0);
    return Math.round((totalRead / TOTAL_VERSES) * 100);
  }, [progress]);

  const getLastReadChapter = useCallback((): ReadingProgress | null => {
    const entries = Object.values(progress);
    if (entries.length === 0) return null;
    return entries.reduce((latest, p) => p.lastReadAt > latest.lastReadAt ? p : latest);
  }, [progress]);

  const updateReadingTime = useCallback((minutes: number) => {
    const newStats = { ...stats, totalTimeSpent: stats.totalTimeSpent + minutes };
    setStats(newStats);
    safeSetItem('quranStats', newStats);
  }, [stats]);

  // Khatmah plan management
  const createKhatmahPlan = useCallback((name: string, totalDays: number) => {
    const plan: KhatmahPlan = {
      id: `khatmah-${Date.now()}`,
      name,
      totalDays,
      startDate: Date.now(),
      completedDays: {},
      currentDay: 1,
      dailyTarget: [],
    };

    // Calculate daily targets (approximate pages per day)
    const versesPerDay = Math.ceil(TOTAL_VERSES / totalDays);
    let currentVerse = 0;
    for (let day = 0; day < totalDays; day++) {
      const fromVerse = currentVerse + 1;
      const toVerse = Math.min(currentVerse + versesPerDay, TOTAL_VERSES);
      plan.dailyTarget.push({ fromVerse: String(fromVerse), toVerse: String(toVerse) });
      currentVerse = toVerse;
    }

    const updated = [...khatmahPlans, plan];
    setKhatmahPlans(updated);
    safeSetItem('khatmahPlans', updated);
  }, [khatmahPlans]);

  const markDayComplete = useCallback((planId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = khatmahPlans.map(p =>
      p.id === planId
        ? { ...p, completedDays: { ...p.completedDays, [today]: true }, currentDay: p.currentDay + 1 }
        : p
    );
    setKhatmahPlans(updated);
    safeSetItem('khatmahPlans', updated);
  }, [khatmahPlans]);

  const deleteKhatmahPlan = useCallback((planId: string) => {
    const updated = khatmahPlans.filter(p => p.id !== planId);
    setKhatmahPlans(updated);
    safeSetItem('khatmahPlans', updated);
  }, [khatmahPlans]);

  return (
    <ReadingProgressContext.Provider value={{
      progress, updateProgress, getChapterProgress, getOverallProgress, getLastReadChapter,
      stats, updateReadingTime,
      khatmahPlans, createKhatmahPlan, markDayComplete, deleteKhatmahPlan,
    }}>
      {children}
    </ReadingProgressContext.Provider>
  );
}
