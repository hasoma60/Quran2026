import React from 'react';
import { Chapter } from '../types';
import { JUZ_BOUNDARIES } from '../utils/constants';
import { toArabicNumerals } from '../utils/typography';

interface JuzNavigatorProps {
  chapters: Chapter[];
  onNavigate: (chapterId: number, verseKey: string) => void;
}

export default function JuzNavigator({ chapters, onNavigate }: JuzNavigatorProps) {
  const getChapterName = (verseKey: string): string => {
    const chapterId = parseInt(verseKey.split(':')[0]);
    return chapters.find(c => c.id === chapterId)?.name_arabic || '';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">تصفح بالأجزاء</h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 font-sans">القرآن الكريم مقسم إلى ٣٠ جزءاً</p>

      <div className="grid gap-3">
        {JUZ_BOUNDARIES.map((juz) => {
          const chapterName = getChapterName(juz.verseKey);
          const chapterId = parseInt(juz.verseKey.split(':')[0]);

          return (
            <button
              key={juz.juz}
              onClick={() => onNavigate(chapterId, juz.verseKey)}
              className="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-amber-500/30 dark:hover:border-amber-900/30 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-400 font-bold text-sm font-sans">
                  {toArabicNumerals(juz.juz)}
                </div>
                <div className="text-right">
                  <h3 className="text-zinc-900 dark:text-zinc-100 font-bold font-sans">الجزء {toArabicNumerals(juz.juz)}</h3>
                  <p className="text-zinc-500 text-xs mt-0.5 font-sans">{juz.name} &bull; {chapterName}</p>
                </div>
              </div>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 font-sans group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                {juz.verseKey}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
