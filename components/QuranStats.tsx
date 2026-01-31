import React from 'react';
import { Chapter } from '../types';
import { useReadingProgress } from '../contexts/ReadingProgressContext';
import { useBookmarks } from '../contexts/BookmarkContext';
import { toArabicNumerals } from '../utils/typography';
import { ChartIcon, TrophyIcon, BookmarkIcon, CalendarIcon, NoteIcon } from './Icons';
import { TOTAL_VERSES, TOTAL_CHAPTERS } from '../utils/constants';

interface QuranStatsProps {
  chapters: Chapter[];
}

export default function QuranStats({ chapters }: QuranStatsProps) {
  const { progress, stats, getOverallProgress } = useReadingProgress();
  const { bookmarks, notes } = useBookmarks();
  const overallPercent = getOverallProgress();

  const chaptersWithProgress = Object.values(progress)
    .sort((a, b) => b.lastReadAt - a.lastReadAt)
    .slice(0, 10);

  const getChapterName = (chapterId: number) =>
    chapters.find(c => c.id === chapterId)?.name_arabic || '';

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">إحصائياتي</h2>

      {/* Overall Progress */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-zinc-900/50 border border-amber-200/50 dark:border-amber-800/30 text-center">
        <div className="relative w-24 h-24 mx-auto mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              className="text-amber-200 dark:text-amber-900/50"
              strokeWidth="3"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              className="text-amber-600 dark:text-amber-500"
              strokeWidth="3"
              strokeDasharray={`${overallPercent}, 100`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-amber-600 dark:text-amber-500 font-sans">{toArabicNumerals(overallPercent)}%</span>
          </div>
        </div>
        <h3 className="font-bold text-zinc-900 dark:text-zinc-100 font-sans">التقدم العام</h3>
        <p className="text-xs text-zinc-500 font-sans mt-1">{toArabicNumerals(stats.totalVersesRead)} آية من {toArabicNumerals(TOTAL_VERSES)}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 text-center">
          <TrophyIcon size={20} className="text-amber-500 mx-auto mb-2" />
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-sans">{toArabicNumerals(stats.currentStreak)}</p>
          <p className="text-xs text-zinc-500 font-sans">يوم متتالي</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 text-center">
          <ChartIcon size={20} className="text-blue-500 mx-auto mb-2" />
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-sans">{toArabicNumerals(stats.chaptersCompleted)}/{toArabicNumerals(TOTAL_CHAPTERS)}</p>
          <p className="text-xs text-zinc-500 font-sans">سور مكتملة</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 text-center">
          <BookmarkIcon size={20} className="text-emerald-500 mx-auto mb-2" />
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-sans">{toArabicNumerals(bookmarks.length)}</p>
          <p className="text-xs text-zinc-500 font-sans">إشارة مرجعية</p>
        </div>
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 text-center">
          <NoteIcon size={20} className="text-purple-500 mx-auto mb-2" />
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-sans">{toArabicNumerals(notes.length)}</p>
          <p className="text-xs text-zinc-500 font-sans">ملاحظة</p>
        </div>
      </div>

      {/* Recent Reading */}
      {chaptersWithProgress.length > 0 && (
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 font-sans mb-3">آخر القراءات</h3>
          <div className="space-y-2">
            {chaptersWithProgress.map(p => (
              <div key={p.chapterId} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50">
                <div className="flex items-center gap-3">
                  <CalendarIcon size={16} className="text-zinc-400" />
                  <span className="font-sans text-sm text-zinc-900 dark:text-zinc-100">{getChapterName(p.chapterId)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${Math.round((p.versesRead / p.totalVerses) * 100)}%` }} />
                  </div>
                  <span className="text-xs text-zinc-500 font-sans">{Math.round((p.versesRead / p.totalVerses) * 100)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
