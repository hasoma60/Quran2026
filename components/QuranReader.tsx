import React, { useEffect, useState, useRef } from 'react';
import { Chapter, Verse, Bookmark, BookmarkCollection, QuranFont, LineHeight, AudioControls, KhatmaProgress } from '../types';
import { fetchVerses, fetchTafsirContent, TAFSIR_OPTIONS } from '../services/quranService';
import { PLAYBACK_SPEEDS, DEFAULT_TAFSIR_ID, SCROLL_DELAY_MS, MAX_TAFSIR_CONTEXT_LENGTH, STORAGE_KEYS } from '../constants';
import { getLineHeightValue, sanitizeHtml, formatTime, shareVerse } from '../utils';

interface QuranReaderProps {
  chapter: Chapter;
  chapters: Chapter[];
  highlightedVerseKey: string | null;
  fontSize: number;
  quranFont: QuranFont;
  lineHeight: LineHeight;
  showTranslation: boolean;
  tajweedEnabled: boolean;
  audio: AudioControls;
  bookmarks: Bookmark[];
  collections: BookmarkCollection[];
  verseNotes: Record<string, string>;
  khatmaProgress: KhatmaProgress;
  onToggleBookmark: (verse: Verse, collectionId?: string) => void;
  onSaveNote: (verseKey: string, text: string) => void;
  onDeleteNote: (verseKey: string) => void;
  onAskAi: (context: string) => void;
  onUpdateProgress: (verseKey: string) => void;
  onChapterChange: (chapter: Chapter) => void;
  onMarkChapterRead: (chapterId: number) => void;
}

export default function QuranReader({
  chapter, chapters, highlightedVerseKey, fontSize, quranFont, lineHeight, showTranslation, tajweedEnabled,
  audio, bookmarks, collections, verseNotes, khatmaProgress,
  onToggleBookmark, onSaveNote, onDeleteNote, onAskAi, onUpdateProgress, onChapterChange, onMarkChapterRead
}: QuranReaderProps) {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const verseRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Tafsir
  const [activeTafsirVerse, setActiveTafsirVerse] = useState<Verse | null>(null);
  const [selectedTafsirId, setSelectedTafsirId] = useState<number>(DEFAULT_TAFSIR_ID);
  const [tafsirContent, setTafsirContent] = useState<string>('');
  const [tafsirLoading, setTafsirLoading] = useState<boolean>(false);

  // Notes
  const [noteVerse, setNoteVerse] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  // Memorization
  const [memorizeMode, setMemorizeMode] = useState(false);
  const [memorizeDifficulty, setMemorizeDifficulty] = useState<number>(() => Number(localStorage.getItem(STORAGE_KEYS.MEMORIZE_DIFFICULTY)) || 30);
  const [revealedWords, setRevealedWords] = useState<Set<string>>(new Set());

  // Share feedback
  const [shareSuccess, setShareSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadVerses = async () => {
      setLoading(true);
      setLoadError(false);
      const data = await fetchVerses(chapter.id, tajweedEnabled);
      if (data.length === 0) setLoadError(true);
      setVerses(data);
      setLoading(false);
    };
    loadVerses();
  }, [chapter.id, tajweedEnabled]);

  // Tafsir loading
  useEffect(() => {
    if (!activeTafsirVerse) return;
    setTafsirLoading(true);
    fetchTafsirContent(selectedTafsirId, activeTafsirVerse.verse_key).then(text => {
      setTafsirContent(text);
      setTafsirLoading(false);
    });
  }, [activeTafsirVerse, selectedTafsirId]);

  // Scroll to highlighted
  useEffect(() => {
    if (!loading && highlightedVerseKey && verseRefs.current[highlightedVerseKey]) {
      setTimeout(() => {
        verseRefs.current[highlightedVerseKey]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, SCROLL_DELAY_MS);
    }
  }, [loading, highlightedVerseKey]);

  // Track reading progress via IntersectionObserver
  useEffect(() => {
    if (loading || verses.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const key = entry.target.getAttribute('data-verse-key');
          if (key) onUpdateProgress(key);
        }
      });
    }, { threshold: 0.5 });
    Object.values(verseRefs.current).forEach(el => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [loading, verses, onUpdateProgress]);

  // Keyboard handler for modal close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeTafsirVerse) closeTafsir();
        if (noteVerse) setNoteVerse(null);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [activeTafsirVerse, noteVerse]);

  const closeTafsir = () => { setActiveTafsirVerse(null); setTafsirContent(''); };

  const openNote = (verseKey: string) => {
    setNoteVerse(verseKey);
    setNoteText(verseNotes[verseKey] || '');
  };

  const saveNote = () => {
    if (noteVerse) {
      if (noteText.trim()) onSaveNote(noteVerse, noteText.trim());
      else onDeleteNote(noteVerse);
      setNoteVerse(null);
    }
  };

  const handleShare = async (verse: Verse) => {
    const ref = `سورة ${chapter.name_arabic} • الآية ${verse.verse_key.split(':')[1]}`;
    const ok = await shareVerse(verse.text_uthmani, ref);
    if (ok) { setShareSuccess(verse.verse_key); setTimeout(() => setShareSuccess(null), 2000); }
  };

  const toggleWordReveal = (verseKey: string, wordIndex: number) => {
    const key = `${verseKey}-${wordIndex}`;
    setRevealedWords(prev => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next; });
  };

  // Memorization text rendering
  const renderMemorizeText = (verse: Verse) => {
    const words = verse.text_uthmani.split(/\s+/);
    const hideCount = Math.floor(words.length * (memorizeDifficulty / 100));
    const hiddenIndices = new Set<number>();
    for (let i = 0; i < hideCount && hiddenIndices.size < words.length; i++) {
      hiddenIndices.add((i * 3 + 1) % words.length);
    }
    return words.map((word, idx) => {
      const key = `${verse.verse_key}-${idx}`;
      const isHidden = hiddenIndices.has(idx);
      const isRevealed = revealedWords.has(key);
      if (!isHidden) return <span key={idx}>{word} </span>;
      return (
        <span
          key={idx}
          onClick={() => toggleWordReveal(verse.verse_key, idx)}
          className={`memo-blank ${isRevealed ? 'revealed' : ''}`}
        >
          {isRevealed ? word : '\u00A0\u00A0\u00A0'}{' '}
        </span>
      );
    });
  };

  const prevChapter = chapters.find(c => c.id === chapter.id - 1);
  const nextChapter = chapters.find(c => c.id === chapter.id + 1);
  const isChapterComplete = khatmaProgress.completedChapters.includes(chapter.id);
  const isThisChapterPlaying = audio.isPlaying && audio.currentChapterId === chapter.id;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse" role="status" aria-label="جارٍ التحميل">
        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-zinc-100 dark:bg-zinc-900 rounded-2xl"></div>)}
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 text-center" role="alert">
        <p className="text-zinc-500 font-sans">تعذر تحميل الآيات. تأكد من اتصالك بالإنترنت.</p>
        <button onClick={() => { setLoadError(false); setLoading(true); fetchVerses(chapter.id, tajweedEnabled).then(d => { setVerses(d); setLoading(false); }); }} className="px-6 py-2 bg-amber-600 text-white rounded-full font-sans text-sm">إعادة المحاولة</button>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Chapter Header */}
      <div className="text-center mb-6 py-6 border-b border-zinc-200 dark:border-zinc-900">
        <h2 className="font-arabic text-5xl text-amber-600 dark:text-amber-500 mb-2">{chapter.name_arabic}</h2>
        <p className="text-zinc-500">{chapter.revelation_place === 'makkah' ? 'مكية' : 'مدنية'} • {chapter.verses_count} آية</p>

        {/* Audio Controls */}
        <div className="flex justify-center mt-6 gap-3 flex-wrap">
          <button
            onClick={audio.onTogglePlay}
            aria-label={isThisChapterPlaying ? 'إيقاف التلاوة' : 'تشغيل التلاوة'}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all font-medium ${isThisChapterPlaying ? 'bg-amber-600 text-white shadow-[0_0_20px_rgba(217,119,6,0.3)]' : 'bg-zinc-100 dark:bg-zinc-900 text-amber-600 dark:text-amber-500 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500'}`}
          >
            {isThisChapterPlaying ? (
              <><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>إيقاف التلاوة</>
            ) : (
              <><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>استماع</>
            )}
          </button>

          <button
            onClick={() => onAskAi(`لخص سورة ${chapter.name_arabic} واشرح مواضيعها الرئيسية.`)}
            aria-label="ملخص السورة"
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:text-amber-600 hover:border-amber-500 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            ملخص السورة
          </button>

          <button
            onClick={() => setMemorizeMode(!memorizeMode)}
            aria-label={memorizeMode ? 'إيقاف الحفظ' : 'وضع الحفظ'}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all ${memorizeMode ? 'bg-purple-600 text-white border-purple-600' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:text-purple-600 hover:border-purple-500'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            حفظ
          </button>
        </div>

        {/* Audio Progress Bar */}
        {isThisChapterPlaying && audio.duration > 0 && (
          <div className="mt-4 px-4 space-y-1">
            <input
              type="range"
              min="0"
              max={audio.duration}
              value={audio.currentTime}
              onChange={(e) => audio.onSeek(Number(e.target.value))}
              className="audio-slider w-full bg-zinc-200 dark:bg-zinc-800"
              aria-label="شريط تقدم التلاوة"
            />
            <div className="flex justify-between items-center text-xs text-zinc-500 font-sans">
              <span>{formatTime(audio.currentTime)}</span>
              <div className="flex items-center gap-2">
                {PLAYBACK_SPEEDS.map(s => (
                  <button
                    key={s}
                    onClick={() => audio.onSpeedChange(s)}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-colors ${audio.playbackSpeed === s ? 'bg-amber-600 text-white' : 'text-zinc-400 hover:text-amber-600'}`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
              <span>{formatTime(audio.duration)}</span>
            </div>
          </div>
        )}

        {/* Memorization Controls */}
        {memorizeMode && (
          <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-purple-700 dark:text-purple-400 text-xs font-bold font-sans">صعوبة الإخفاء</span>
              <span className="text-purple-600 font-mono text-xs">{memorizeDifficulty}%</span>
            </div>
            <input
              type="range" min="10" max="80" value={memorizeDifficulty}
              onChange={(e) => { const v = Number(e.target.value); setMemorizeDifficulty(v); localStorage.setItem(STORAGE_KEYS.MEMORIZE_DIFFICULTY, String(v)); setRevealedWords(new Set()); }}
              className="w-full h-2 bg-purple-200 dark:bg-purple-900 rounded-lg appearance-none cursor-pointer accent-purple-600"
              aria-label="مستوى صعوبة الحفظ"
            />
          </div>
        )}

        {/* Khatma mark */}
        <div className="mt-4">
          <button
            onClick={() => onMarkChapterRead(chapter.id)}
            className={`text-xs font-sans font-bold px-4 py-1.5 rounded-full transition-colors ${isChapterComplete ? 'bg-amber-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-amber-600'}`}
          >
            {isChapterComplete ? '✓ تمت القراءة (ختمة)' : 'وضع علامة قراءة (ختمة)'}
          </button>
        </div>
      </div>

      {/* Bismillah */}
      {chapter.bismillah_pre && (
        <div className="text-center font-arabic text-3xl text-zinc-400 dark:text-zinc-500 mb-12 select-none" style={{ fontFamily: quranFont }}>
          بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
        </div>
      )}

      {/* Verses */}
      <div className="space-y-8">
        {verses.map((verse) => {
          const isBookmarked = bookmarks.some(b => b.verseKey === verse.verse_key);
          const isHighlighted = verse.verse_key === highlightedVerseKey;
          const hasNote = !!verseNotes[verse.verse_key];
          const isShareSuccess = shareSuccess === verse.verse_key;

          return (
            <div
              key={verse.id}
              id={`verse-${verse.verse_key}`}
              ref={(el: HTMLDivElement | null) => { verseRefs.current[verse.verse_key] = el; }}
              data-verse-key={verse.verse_key}
              className={`group relative p-4 rounded-3xl transition-colors duration-500 ${isHighlighted ? 'bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30'}`}
            >
              {/* Toolbar */}
              <div className="absolute top-4 right-4 flex gap-1.5 opacity-50 hover:opacity-100 transition-opacity">
                <button onClick={() => onToggleBookmark(verse)} aria-label={isBookmarked ? 'إزالة من المحفوظات' : 'حفظ الآية'}
                  className={`p-2 rounded-full transition-colors ${isBookmarked ? 'text-amber-600' : 'text-zinc-300 dark:text-zinc-700 hover:text-zinc-500'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                </button>
                <button onClick={() => setActiveTafsirVerse(verse)} aria-label="تفسير" className="p-2 rounded-full text-zinc-300 dark:text-zinc-700 hover:text-amber-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                </button>
                <button onClick={() => openNote(verse.verse_key)} aria-label="ملاحظة" className={`p-2 rounded-full transition-colors ${hasNote ? 'text-blue-500' : 'text-zinc-300 dark:text-zinc-700 hover:text-blue-500'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={hasNote ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </button>
                <button onClick={() => handleShare(verse)} aria-label="مشاركة" className={`p-2 rounded-full transition-colors ${isShareSuccess ? 'text-green-500' : 'text-zinc-300 dark:text-zinc-700 hover:text-zinc-500'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                </button>
              </div>

              {/* Arabic Text */}
              {memorizeMode ? (
                <p className="text-right text-zinc-900 dark:text-zinc-100 mb-4 select-text pr-10 transition-all duration-300 pt-2"
                  style={{ fontSize: `${fontSize}px`, fontFamily: quranFont, lineHeight: getLineHeightValue(lineHeight) }}>
                  {renderMemorizeText(verse)}
                  <span className="text-amber-600 font-sans text-lg inline-block mx-2 border border-amber-500/30 rounded-full w-8 h-8 text-center leading-7 bg-amber-50 dark:bg-zinc-900/50">
                    {verse.verse_key.split(':')[1]}
                  </span>
                </p>
              ) : tajweedEnabled && verse.text_uthmani_tajweed ? (
                <div className="tajweed text-right text-zinc-900 dark:text-zinc-100 mb-4 select-text pr-10 transition-all duration-300 pt-2"
                  style={{ fontSize: `${fontSize}px`, fontFamily: quranFont, lineHeight: getLineHeightValue(lineHeight) }}
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(verse.text_uthmani_tajweed) + `<span class="text-amber-600 font-sans text-lg inline-block mx-2 border border-amber-500/30 rounded-full" style="width:2rem;height:2rem;text-align:center;line-height:1.75rem;background:rgba(245,158,11,0.05)">${verse.verse_key.split(':')[1]}</span>` }}
                />
              ) : (
                <p className="text-right text-zinc-900 dark:text-zinc-100 mb-4 select-text pr-10 transition-all duration-300 pt-2"
                  style={{ fontSize: `${fontSize}px`, fontFamily: quranFont, lineHeight: getLineHeightValue(lineHeight) }}>
                  {verse.text_uthmani}
                  <span className="text-amber-600 dark:text-amber-600 font-sans text-lg inline-block mx-2 border border-amber-500/30 dark:border-amber-900/50 rounded-full w-8 h-8 text-center leading-7 bg-amber-50 dark:bg-zinc-900/50">
                    {verse.verse_key.split(':')[1]}
                  </span>
                </p>
              )}

              {/* Note indicator */}
              {hasNote && (
                <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 cursor-pointer" onClick={() => openNote(verse.verse_key)}>
                  <p className="text-blue-700 dark:text-blue-400 text-xs font-sans line-clamp-1">📝 {verseNotes[verse.verse_key]}</p>
                </div>
              )}

              {/* Translation */}
              {showTranslation && verse.translations && (
                <div className="pr-4 mr-2 border-r-2 border-zinc-200 dark:border-zinc-800">
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg text-justify font-sans">
                    {verse.translations[0].text.replace(/<sup.*?<\/sup>/g, '')}
                  </p>
                  <button onClick={() => setActiveTafsirVerse(verse)} className="text-amber-600 dark:text-amber-500 text-xs mt-2 font-bold hover:underline">
                    قراءة التفسير الكامل &larr;
                  </button>
                </div>
              )}

              {/* Action Bar */}
              <div className="flex justify-end mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onAskAi(`اشرح الآية ${verse.verse_key} من سورة ${chapter.name_arabic}: "${verse.text_uthmani}"`)}
                  className="text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1 hover:underline font-sans"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                  تدبر الآية مع الذكاء الاصطناعي
                </button>
              </div>

              {!isHighlighted && <div className="h-px bg-zinc-200 dark:bg-zinc-900 mt-8 w-1/2 mx-auto"></div>}
            </div>
          );
        })}
      </div>

      {/* Next / Prev Chapter Navigation */}
      <div className="flex justify-between items-center mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800">
        {nextChapter ? (
          <button onClick={() => onChapterChange(nextChapter)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 transition-all font-sans text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
            {nextChapter.name_arabic}
          </button>
        ) : <div />}
        {prevChapter ? (
          <button onClick={() => onChapterChange(prevChapter)} className="flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 transition-all font-sans text-sm">
            {prevChapter.name_arabic}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg>
          </button>
        ) : <div />}
      </div>

      {/* Tafsir Modal */}
      {activeTafsirVerse && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center" role="dialog" aria-modal="true" aria-label="تفسير الآية">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeTafsir}></div>
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-[32px] shadow-2xl border-t border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[85vh]">
            <div className="w-full flex justify-center pt-3 pb-1" onClick={closeTafsir}><div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full cursor-pointer"></div></div>
            <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 font-sans">تفسير الآية</h3>
                <p className="text-zinc-500 text-sm font-sans">سورة {chapter.name_arabic} • الآية {activeTafsirVerse.verse_key.split(':')[1]}</p>
              </div>
              <button onClick={closeTafsir} aria-label="إغلاق" className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <div className="px-6 py-2 overflow-x-auto no-scrollbar border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex gap-2">
                {TAFSIR_OPTIONS.map((opt) => (
                  <button key={opt.id} onClick={() => setSelectedTafsirId(opt.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors font-sans ${selectedTafsirId === opt.id ? 'bg-amber-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
                    {opt.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {tafsirLoading ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
                    <p className="text-right font-arabic text-xl leading-loose text-zinc-800 dark:text-zinc-200" style={{ fontFamily: quranFont }}>{activeTafsirVerse.text_uthmani}</p>
                  </div>
                  <div className="prose dark:prose-invert prose-lg max-w-none text-justify font-arabic leading-loose text-zinc-700 dark:text-zinc-300"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(tafsirContent) }} style={{ fontFamily: 'Amiri' }} />
                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button onClick={() => { closeTafsir(); onAskAi(`اشرح لي هذا التفسير (${TAFSIR_OPTIONS.find(t => t.id === selectedTafsirId)?.name}) للآية ${activeTafsirVerse.verse_key} بشكل مبسط: ${tafsirContent.substring(0, MAX_TAFSIR_CONTEXT_LENGTH)}...`); }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-amber-600 dark:text-amber-500 font-bold hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors font-sans">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                      تبسيط الشرح بواسطة نور
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {noteVerse && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="ملاحظة على الآية">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setNoteVerse(null)}></div>
          <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold font-sans text-zinc-900 dark:text-zinc-100">ملاحظة • {noteVerse}</h3>
              <button onClick={() => setNoteVerse(null)} aria-label="إغلاق" className="p-1 text-zinc-400"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
            </div>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="اكتب ملاحظتك هنا..."
              rows={4}
              className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-sm font-sans text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-amber-500 resize-none"
              aria-label="نص الملاحظة"
            />
            <div className="flex gap-2 justify-end">
              {verseNotes[noteVerse] && (
                <button onClick={() => { onDeleteNote(noteVerse); setNoteVerse(null); }} className="px-4 py-2 text-red-500 text-sm font-sans font-bold rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10">حذف</button>
              )}
              <button onClick={saveNote} className="px-6 py-2 bg-amber-600 text-white text-sm font-sans font-bold rounded-lg hover:bg-amber-700">حفظ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
