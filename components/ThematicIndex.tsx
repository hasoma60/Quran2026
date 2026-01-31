import React, { useState } from 'react';
import { Chapter } from '../types';
import { THEMATIC_TOPICS } from '../utils/constants';

interface ThematicIndexProps {
  chapters: Chapter[];
  onNavigate: (chapterId: number, verseKey: string) => void;
}

export default function ThematicIndex({ chapters, onNavigate }: ThematicIndexProps) {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const topic = THEMATIC_TOPICS.find(t => t.id === selectedTopic);

  const getChapterName = (verseKey: string): string => {
    const chapterId = parseInt(verseKey.split(':')[0]);
    return chapters.find(c => c.id === chapterId)?.name_arabic || '';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">الفهرس الموضوعي</h2>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 font-sans">تصفح القرآن بحسب الموضوعات</p>

      {!selectedTopic ? (
        <div className="grid grid-cols-2 gap-3">
          {THEMATIC_TOPICS.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTopic(t.id)}
              className="p-4 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 hover:border-amber-500/30 dark:hover:border-amber-900/30 transition-all text-right active:scale-[0.98]"
            >
              <span className="text-2xl mb-2 block">{t.icon}</span>
              <h3 className="font-bold text-zinc-900 dark:text-zinc-100 font-sans text-sm">{t.name}</h3>
              <p className="text-xs text-zinc-500 mt-1 font-sans line-clamp-2">{t.description}</p>
              <p className="text-xs text-amber-600 dark:text-amber-500 font-sans mt-2">{t.verses.length} آية</p>
            </button>
          ))}
        </div>
      ) : topic ? (
        <div>
          <button
            onClick={() => setSelectedTopic(null)}
            className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-sans text-sm mb-4 hover:underline"
          >
            &rarr; العودة للموضوعات
          </button>

          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl">{topic.icon}</span>
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">{topic.name}</h3>
              <p className="text-sm text-zinc-500 font-sans">{topic.description}</p>
            </div>
          </div>

          <div className="grid gap-2">
            {topic.verses.map((vk) => {
              const chapterId = parseInt(vk.split(':')[0]);
              const chapterName = getChapterName(vk);

              return (
                <button
                  key={vk}
                  onClick={() => onNavigate(chapterId, vk)}
                  className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 hover:bg-amber-50/50 dark:hover:bg-amber-900/10 transition-all text-right active:scale-[0.98] font-sans"
                >
                  <div>
                    <span className="text-sm text-zinc-900 dark:text-zinc-100 font-medium">سورة {chapterName}</span>
                    <span className="text-xs text-zinc-500 mr-2">&bull; آية {vk.split(':')[1]}</span>
                  </div>
                  <span className="text-xs text-amber-600 dark:text-amber-500">{vk}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
