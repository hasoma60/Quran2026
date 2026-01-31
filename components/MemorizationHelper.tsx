import React, { useState, useEffect, useCallback } from 'react';
import { Chapter, Verse } from '../types';
import { fetchVerses } from '../services/quranService';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { EyeIcon, EyeOffIcon, RepeatIcon, PlayIcon } from './Icons';
import { getLineHeightValue } from '../utils/typography';
import { useAudio } from '../contexts/AudioContext';

interface MemorizationHelperProps {
  chapters: Chapter[];
}

export default function MemorizationHelper({ chapters }: MemorizationHelperProps) {
  const { quranFont, fontSize, lineHeight } = useSettings();
  const { showToast } = useToast();
  const { playVerse } = useAudio();

  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [fromVerse, setFromVerse] = useState(1);
  const [toVerse, setToVerse] = useState(7);
  const [hiddenWords, setHiddenWords] = useState(0); // 0 = show all, higher = hide more
  const [currentVerseIdx, setCurrentVerseIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  useEffect(() => {
    const loadVerses = async () => {
      setLoading(true);
      const data = await fetchVerses(selectedChapter);
      setVerses(data);
      setToVerse(Math.min(7, data.length));
      setLoading(false);
    };
    loadVerses();
  }, [selectedChapter]);

  const activeVerses = verses.slice(fromVerse - 1, toVerse);
  const currentVerse = activeVerses[currentVerseIdx];

  const getDisplayText = useCallback((text: string): string => {
    if (revealed || hiddenWords === 0) return text;
    const words = text.split(/\s+/);
    const hideCount = Math.min(hiddenWords, words.length - 1);
    return words.map((w, i) => i >= words.length - hideCount ? '●●●' : w).join(' ');
  }, [hiddenWords, revealed]);

  const nextVerse = () => {
    setRevealed(false);
    if (currentVerseIdx < activeVerses.length - 1) {
      setCurrentVerseIdx(currentVerseIdx + 1);
    } else {
      setCurrentVerseIdx(0);
      showToast('تم إكمال الدورة! جاري الإعادة...', 'success');
    }
  };

  const increaseHidden = () => {
    setHiddenWords(prev => prev + 1);
    setRevealed(false);
  };

  const decreaseHidden = () => {
    setHiddenWords(prev => Math.max(0, prev - 1));
    setRevealed(false);
  };

  const markResult = (correct: boolean) => {
    setScore(prev => ({ correct: prev.correct + (correct ? 1 : 0), total: prev.total + 1 }));
    setRevealed(true);
  };

  const chapter = chapters.find(c => c.id === selectedChapter);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">مساعد الحفظ</h2>

      {/* Chapter & Range Selection */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-4">
        <div>
          <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300 font-sans block mb-2">السورة</label>
          <select
            value={selectedChapter}
            onChange={(e) => { setSelectedChapter(Number(e.target.value)); setCurrentVerseIdx(0); setFromVerse(1); }}
            className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-sans text-sm focus:outline-none focus:border-amber-500"
            dir="rtl"
          >
            {chapters.map(c => (
              <option key={c.id} value={c.id}>{c.name_arabic} ({c.verses_count} آية)</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-zinc-500 font-sans">من آية</label>
            <input type="number" min={1} max={verses.length} value={fromVerse}
              onChange={e => { setFromVerse(Number(e.target.value)); setCurrentVerseIdx(0); }}
              className="w-full p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm font-sans mt-1" />
          </div>
          <div>
            <label className="text-xs font-bold text-zinc-500 font-sans">إلى آية</label>
            <input type="number" min={fromVerse} max={verses.length} value={toVerse}
              onChange={e => setToVerse(Number(e.target.value))}
              className="w-full p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm font-sans mt-1" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div></div>
      ) : currentVerse ? (
        <>
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button onClick={decreaseHidden} className="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm font-sans" aria-label="إظهار كلمات">- كشف</button>
              <button onClick={increaseHidden} className="px-3 py-1.5 rounded-lg bg-amber-600 text-white text-sm font-sans" aria-label="إخفاء كلمات">+ إخفاء</button>
            </div>
            <span className="text-xs text-zinc-500 font-sans">
              {currentVerseIdx + 1} / {activeVerses.length}
            </span>
          </div>

          {/* Verse Display */}
          <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-500 font-sans">
                {chapter?.name_arabic} &bull; آية {currentVerse.verse_key.split(':')[1]}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => playVerse(selectedChapter, currentVerse.verse_key)}
                  className="p-2 rounded-full text-zinc-400 hover:text-amber-600 transition-colors"
                  aria-label="استماع"
                >
                  <PlayIcon size={16} />
                </button>
                <button
                  onClick={() => setRevealed(!revealed)}
                  className="p-2 rounded-full text-zinc-400 hover:text-amber-600 transition-colors"
                  aria-label={revealed ? 'إخفاء' : 'كشف'}
                >
                  {revealed ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              </div>
            </div>

            <p
              className="text-center text-zinc-900 dark:text-zinc-100 transition-all duration-300"
              style={{ fontFamily: quranFont, fontSize: `${fontSize}px`, lineHeight: getLineHeightValue(lineHeight) }}
            >
              {getDisplayText(currentVerse.text_uthmani)}
            </p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => markResult(false)}
              className="py-3 rounded-xl bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/30 font-sans text-sm font-medium"
            >
              لم أتذكر
            </button>
            <button
              onClick={() => { setRevealed(true); }}
              className="py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-sans text-sm font-medium"
            >
              عرض الإجابة
            </button>
            <button
              onClick={() => { markResult(true); nextVerse(); }}
              className="py-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 font-sans text-sm font-medium"
            >
              تذكرت
            </button>
          </div>

          {/* Score */}
          {score.total > 0 && (
            <div className="text-center text-sm text-zinc-500 font-sans">
              النتيجة: {score.correct} / {score.total} ({Math.round((score.correct / score.total) * 100)}%)
            </div>
          )}

          {/* Next button */}
          <button
            onClick={nextVerse}
            className="w-full py-3 rounded-xl bg-amber-600 text-white font-sans font-medium hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
          >
            <RepeatIcon size={18} />
            الآية التالية
          </button>
        </>
      ) : (
        <p className="text-center text-zinc-500 font-sans py-12">اختر نطاق الآيات للبدء</p>
      )}
    </div>
  );
}
