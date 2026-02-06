import React, { useState, useEffect } from 'react';
import { Verse, Chapter } from '../types';
import { fetchVerseOfTheDay } from '../services/quranService';
import { useSettings } from '../contexts/SettingsContext';
import { SparkleIcon, ShareIcon, CopyIcon } from './Icons';
import { useToast } from '../contexts/ToastContext';
import { stripHTML } from '../utils/sanitize';

interface DailyVerseProps {
  onNavigate: (chapterId: number, verseKey: string) => void;
}

export default function DailyVerse({ onNavigate }: DailyVerseProps) {
  const [data, setData] = useState<{ verse: Verse; chapter: Chapter } | null>(null);
  const [loading, setLoading] = useState(true);
  const { quranFont } = useSettings();
  const { showToast } = useToast();

  useEffect(() => {
    fetchVerseOfTheDay()
      .then(result => {
        setData(result);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleCopy = async () => {
    if (!data) return;
    const text = `${data.verse.text_uthmani}\n\n- سورة ${data.chapter.name_arabic} (${data.verse.verse_key})`;
    try {
      await navigator.clipboard.writeText(text);
      showToast('تم نسخ الآية', 'success');
    } catch {
      showToast('فشل النسخ', 'error');
    }
  };

  const handleShare = async () => {
    if (!data) return;
    const text = `${data.verse.text_uthmani}\n\n- سورة ${data.chapter.name_arabic} (${data.verse.verse_key})`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'آية اليوم', text });
      } catch { /* cancelled */ }
    } else {
      handleCopy();
    }
  };

  if (loading) {
    return (
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-zinc-900/50 border border-amber-200/50 dark:border-amber-800/30 animate-pulse">
        <div className="h-6 bg-amber-200/50 dark:bg-amber-800/30 rounded w-24 mb-4"></div>
        <div className="h-8 bg-amber-200/50 dark:bg-amber-800/30 rounded w-full mb-2"></div>
        <div className="h-8 bg-amber-200/50 dark:bg-amber-800/30 rounded w-3/4"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-zinc-900/50 border border-amber-200/50 dark:border-amber-800/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SparkleIcon size={16} className="text-amber-600 dark:text-amber-500" />
          <span className="text-sm font-bold text-amber-700 dark:text-amber-400 font-sans">آية اليوم</span>
        </div>
        <div className="flex gap-2">
          <button onClick={handleCopy} aria-label="نسخ الآية" className="p-1.5 rounded-full text-amber-600/60 hover:text-amber-600 dark:text-amber-500/60 dark:hover:text-amber-500 transition-colors">
            <CopyIcon size={16} />
          </button>
          <button onClick={handleShare} aria-label="مشاركة الآية" className="p-1.5 rounded-full text-amber-600/60 hover:text-amber-600 dark:text-amber-500/60 dark:hover:text-amber-500 transition-colors">
            <ShareIcon size={16} />
          </button>
        </div>
      </div>

      <button
        onClick={() => onNavigate(data.chapter.id, data.verse.verse_key)}
        className="text-right w-full"
      >
        <p
          className="text-xl text-zinc-800 dark:text-zinc-200 leading-loose mb-3"
          style={{ fontFamily: quranFont }}
        >
          {data.verse.text_uthmani}
        </p>
        {data.verse.translations?.[0] && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400 font-sans leading-relaxed mb-2">
            {stripHTML(data.verse.translations[0].text)}
          </p>
        )}
        <span className="text-xs font-semibold text-amber-600 dark:text-amber-500 font-sans">
          سورة {data.chapter.name_arabic} &bull; الآية {data.verse.verse_key.split(':')[1]}
        </span>
      </button>
    </div>
  );
}
