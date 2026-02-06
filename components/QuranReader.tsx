
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { Chapter, Verse } from '../types';
import { fetchVerses, fetchTafsirContent, TAFSIR_OPTIONS } from '../services/quranService';
import { useSettings } from '../contexts/SettingsContext';
import { useBookmarks } from '../contexts/BookmarkContext';
import { useAudio } from '../contexts/AudioContext';
import { useReadingProgress } from '../contexts/ReadingProgressContext';
import { useToast } from '../contexts/ToastContext';
import { sanitizeHTML, stripHTML } from '../utils/sanitize';
import { getLineHeightValue, toArabicNumerals } from '../utils/typography';
import { DEFAULT_TAFSIR_ID, getReciterApiIds } from '../utils/constants';
import ShareModal from './ShareModal';
import {
  BookmarkIcon, SparkleIcon, PlayIcon, PauseIcon, OpenBookIcon,
  CloseIcon, ShareIcon, NoteIcon, BackIcon
} from './Icons';

const MUSHAF_VERSES_PER_PAGE = 10;

interface QuranReaderProps {
  chapter: Chapter;
  highlightedVerseKey: string | null;
  onAskAi: (context: string) => void;
}

export default function QuranReader({ chapter, highlightedVerseKey, onAskAi }: QuranReaderProps) {
  const { fontSize, quranFont, lineHeight, showTranslation, selectedReciterId, readingViewMode } = useSettings();
  const { toggleBookmark, isBookmarked, addNote } = useBookmarks();
  const { isPlaying, currentVerseKey, playChapter, playVerse, currentChapterId } = useAudio();
  const { updateProgress } = useReadingProgress();
  const { showToast } = useToast();

  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const verseRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const [activeTafsirVerse, setActiveTafsirVerse] = useState<Verse | null>(null);
  const [selectedTafsirId, setSelectedTafsirId] = useState<number>(DEFAULT_TAFSIR_ID);
  const [tafsirContent, setTafsirContent] = useState<string>('');
  const [tafsirLoading, setTafsirLoading] = useState(false);
  const [shareVerse, setShareVerse] = useState<Verse | null>(null);
  const [noteVerse, setNoteVerse] = useState<Verse | null>(null);
  const [noteText, setNoteText] = useState('');

  // Mushaf mode state
  const [mushafPage, setMushafPage] = useState(0);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    const loadVerses = async () => {
      setLoading(true);
      setError(false);
      const data = await fetchVerses(chapter.id);
      if (data.length === 0) setError(true);
      setVerses(data);
      setLoading(false);
    };
    loadVerses();
    setMushafPage(0);
  }, [chapter.id]);

  useEffect(() => {
    if (verses.length > 0 && !loading) {
      updateProgress(chapter.id, verses[0].verse_key, chapter.verses_count);
    }
  }, [verses, loading, chapter.id, chapter.verses_count]);

  useEffect(() => {
    if (!activeTafsirVerse) return;
    setTafsirLoading(true);
    fetchTafsirContent(selectedTafsirId, activeTafsirVerse.verse_key).then(text => {
      setTafsirContent(text);
      setTafsirLoading(false);
    });
  }, [activeTafsirVerse, selectedTafsirId]);

  // Scroll to highlighted verse (flowing/focus mode) or navigate to correct page (mushaf mode)
  useEffect(() => {
    if (!loading && highlightedVerseKey && verses.length > 0) {
      if (readingViewMode === 'mushaf') {
        const verseIndex = verses.findIndex(v => v.verse_key === highlightedVerseKey);
        if (verseIndex >= 0) {
          setMushafPage(Math.floor(verseIndex / MUSHAF_VERSES_PER_PAGE));
        }
      } else {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            verseRefs.current[highlightedVerseKey]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          });
        });
      }
    }
  }, [loading, highlightedVerseKey, verses, readingViewMode]);

  useEffect(() => {
    if (loading || verses.length === 0 || readingViewMode === 'mushaf') return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const vk = entry.target.getAttribute('id')?.replace('verse-', '');
          if (vk) updateProgress(chapter.id, vk, chapter.verses_count);
        }
      });
    }, { threshold: 0.5 });
    Object.values(verseRefs.current).forEach((el: HTMLDivElement | null) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [loading, verses, chapter.id, chapter.verses_count, readingViewMode]);

  const closeTafsir = () => { setActiveTafsirVerse(null); setTafsirContent(''); };

  const handleToggleBookmark = useCallback((verse: Verse) => {
    const added = toggleBookmark(verse, chapter);
    showToast(added ? 'تم حفظ الآية' : 'تم إزالة الإشارة', added ? 'success' : 'info');
  }, [toggleBookmark, chapter, showToast]);

  const handleSaveNote = () => {
    if (noteVerse && noteText.trim()) {
      addNote(noteVerse.verse_key, chapter.id, chapter.name_arabic, noteVerse.text_uthmani, noteText);
      showToast('تم حفظ الملاحظة', 'success');
      setNoteVerse(null);
      setNoteText('');
    }
  };

  const lhValue = getLineHeightValue(lineHeight);

  // Mushaf pagination
  const totalMushafPages = Math.ceil(verses.length / MUSHAF_VERSES_PER_PAGE);
  const mushafPageVerses = useMemo(() => {
    const start = mushafPage * MUSHAF_VERSES_PER_PAGE;
    return verses.slice(start, start + MUSHAF_VERSES_PER_PAGE);
  }, [verses, mushafPage]);

  const goToNextPage = useCallback(() => {
    if (mushafPage < totalMushafPages - 1) {
      setMushafPage(p => p + 1);
      window.scrollTo(0, 0);
    }
  }, [mushafPage, totalMushafPages]);

  const goToPrevPage = useCallback(() => {
    if (mushafPage > 0) {
      setMushafPage(p => p - 1);
      window.scrollTo(0, 0);
    }
  }, [mushafPage]);

  // Touch handlers for mushaf swipe - RTL: swipe left = next page
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Only trigger if horizontal swipe is dominant and > 50px
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx < 0) {
        // Swipe left = next page (natural RTL direction for reading forward)
        goToNextPage();
      } else {
        // Swipe right = previous page (go back)
        goToPrevPage();
      }
    }
  }, [goToNextPage, goToPrevPage]);

  // Shared modals renderer
  const renderModals = () => (
    <>
      {shareVerse && <ShareModal verse={shareVerse} chapter={chapter} onClose={() => setShareVerse(null)} />}

      {noteVerse && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setNoteVerse(null)}></div>
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-[32px] shadow-2xl border-t border-zinc-200 dark:border-zinc-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 font-sans">إضافة ملاحظة</h3>
              <button onClick={() => setNoteVerse(null)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500" aria-label="إغلاق"><CloseIcon size={20} /></button>
            </div>
            <p className="text-xs text-amber-600 font-sans mb-3">سورة {chapter.name_arabic} &bull; آية {noteVerse.verse_key.split(':')[1]}</p>
            <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="اكتب ملاحظتك..." className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-sans text-sm resize-none focus:outline-none focus:border-amber-500 mb-4" rows={4} dir="rtl" />
            <button onClick={handleSaveNote} className="w-full py-3 rounded-xl bg-amber-600 text-white font-sans font-medium hover:bg-amber-700 transition-colors">حفظ</button>
          </div>
        </div>
      )}

      {activeTafsirVerse && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={closeTafsir}></div>
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-[32px] shadow-2xl border-t border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[85vh]">
            <div className="w-full flex justify-center pt-3 pb-1" onClick={closeTafsir}><div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full cursor-pointer"></div></div>
            <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 font-sans">تفسير الآية</h3>
                <p className="text-zinc-500 text-sm font-sans">سورة {chapter.name_arabic} &bull; الآية {activeTafsirVerse.verse_key.split(':')[1]}</p>
              </div>
              <button onClick={closeTafsir} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500" aria-label="إغلاق التفسير"><CloseIcon size={20} /></button>
            </div>
            <div className="px-6 py-2 overflow-x-auto no-scrollbar border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex gap-2">
                {TAFSIR_OPTIONS.map((opt) => (
                  <button key={opt.id} onClick={() => setSelectedTafsirId(opt.id)} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors font-sans ${selectedTafsirId === opt.id ? 'bg-amber-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>{opt.name}</button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {tafsirLoading ? (
                <div className="space-y-4 animate-pulse"><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div><div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div></div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
                    <p className="text-right font-arabic text-xl leading-loose text-zinc-800 dark:text-zinc-200" style={{ fontFamily: quranFont }}>{activeTafsirVerse.text_uthmani}</p>
                  </div>
                  <div className="prose dark:prose-invert prose-lg max-w-none text-justify font-arabic leading-loose text-zinc-700 dark:text-zinc-300" dangerouslySetInnerHTML={{ __html: sanitizeHTML(tafsirContent) }} style={{ fontFamily: 'Amiri' }} />
                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button onClick={() => { closeTafsir(); onAskAi(`اشرح لي هذا التفسير (${TAFSIR_OPTIONS.find(t => t.id === selectedTafsirId)?.name}) للآية ${activeTafsirVerse.verse_key} بشكل مبسط: ${tafsirContent.substring(0, 500)}...`); }} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-amber-600 dark:text-amber-500 font-bold hover:bg-amber-50 transition-colors font-sans">
                      <SparkleIcon size={18} /> تبسيط الشرح بواسطة نور
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse" role="status" aria-label="جاري التحميل">
        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-zinc-100 dark:bg-zinc-900 rounded-2xl"></div>)}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
        <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">تعذر تحميل الآيات</p>
        <p className="text-zinc-500 font-sans">تأكد من اتصالك بالإنترنت.</p>
        <button onClick={() => { setLoading(true); setError(false); fetchVerses(chapter.id).then(d => { setVerses(d); if (!d.length) setError(true); setLoading(false); }); }} className="px-6 py-2 rounded-xl bg-amber-600 text-white font-sans">إعادة المحاولة</button>
      </div>
    );
  }

  // ============================
  // Mushaf View Mode
  // ============================
  if (readingViewMode === 'mushaf') {
    return (
      <div className="pb-24">
        {/* Mushaf Page Header */}
        <div className="text-center mb-6 py-4 border-b border-zinc-200 dark:border-zinc-900">
          <h2 className="font-arabic text-4xl text-amber-600 dark:text-amber-500 mb-1">{chapter.name_arabic}</h2>
          <p className="text-zinc-500 font-sans text-sm">
            {chapter.revelation_place === 'makkah' ? 'مكية' : 'مدنية'} &bull; {chapter.verses_count} آية
          </p>
          <div className="flex justify-center mt-4 gap-3">
            <button onClick={() => playChapter(chapter, getReciterApiIds(selectedReciterId).chapterApiId)} aria-label={isPlaying && currentChapterId === chapter.id ? 'إيقاف التلاوة' : 'استماع'} className={`flex items-center gap-2 px-5 py-2 rounded-full transition-all font-medium font-sans text-sm ${isPlaying && currentChapterId === chapter.id && !currentVerseKey ? 'bg-amber-600 text-white shadow-[0_0_20px_rgba(217,119,6,0.3)]' : 'bg-zinc-100 dark:bg-zinc-900 text-amber-600 dark:text-amber-500 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500'}`}>
              {isPlaying && currentChapterId === chapter.id && !currentVerseKey ? <><PauseIcon size={16} /> إيقاف</> : <><PlayIcon size={16} /> استماع</>}
            </button>
          </div>
        </div>

        {/* Mushaf Page Content */}
        <div
          className="min-h-[60vh] relative select-text"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Bismillah on first page */}
          {mushafPage === 0 && chapter.bismillah_pre && (
            <div className="text-center font-arabic text-2xl text-zinc-400 dark:text-zinc-500 mb-8 select-none" style={{ fontFamily: quranFont }}>
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
            </div>
          )}

          {/* Continuous text block - mushaf style */}
          <div className="text-right text-zinc-900 dark:text-zinc-100 leading-[2.8] px-2" style={{ fontSize: `${fontSize}px`, fontFamily: quranFont, lineHeight: lhValue }}>
            {mushafPageVerses.map((verse) => {
              const highlighted = verse.verse_key === highlightedVerseKey;
              const playingThis = isPlaying && currentVerseKey === verse.verse_key;

              return (
                <span
                  key={verse.id}
                  id={`verse-${verse.verse_key}`}
                  className={`inline transition-colors ${highlighted ? 'bg-amber-100/80 dark:bg-amber-900/30 rounded' : ''} ${playingThis ? 'text-amber-600 dark:text-amber-400' : ''}`}
                  onClick={() => setActiveTafsirVerse(verse)}
                >
                  {verse.text_uthmani}
                  {' '}
                  <span className="inline-flex items-center justify-center mx-1 text-amber-700 dark:text-amber-400 font-sans w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 align-middle cursor-pointer" style={{ fontSize: '14px' }}>
                    {verse.verse_key.split(':')[1]}
                  </span>
                  {' '}
                </span>
              );
            })}
          </div>

          {/* Translation for current page */}
          {showTranslation && (
            <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
              {mushafPageVerses.map((verse) => (
                verse.translations?.[0] && (
                  <div key={`tr-${verse.id}`} className="pr-4 border-r-2 border-amber-200 dark:border-amber-800/50">
                    <span className="text-xs text-amber-600 font-sans font-medium">{verse.verse_key.split(':')[1]}. </span>
                    <span className="text-zinc-600 dark:text-zinc-400 text-sm font-sans leading-relaxed">
                      {stripHTML(verse.translations[0].text)}
                    </span>
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        {/* Mushaf Page Navigation */}
        <div className="flex items-center justify-between mt-8 pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <button
            onClick={goToNextPage}
            disabled={mushafPage >= totalMushafPages - 1}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-sans text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            aria-label="الصفحة التالية"
          >
            <BackIcon size={16} />
            التالي
          </button>

          <span className="text-zinc-500 dark:text-zinc-400 font-sans text-sm">
            صفحة {toArabicNumerals(mushafPage + 1)} من {toArabicNumerals(totalMushafPages)}
          </span>

          <button
            onClick={goToPrevPage}
            disabled={mushafPage <= 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-sans text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            aria-label="الصفحة السابقة"
          >
            السابق
            <span className="rotate-180 inline-block"><BackIcon size={16} /></span>
          </button>
        </div>

        {renderModals()}
      </div>
    );
  }

  // ============================
  // Focus View Mode
  // ============================
  if (readingViewMode === 'focus') {
    return (
      <div className="pb-24">
        <div className="text-center mb-10 py-6 border-b border-zinc-200 dark:border-zinc-900">
          <h2 className="font-arabic text-5xl text-amber-600 dark:text-amber-500 mb-2">{chapter.name_arabic}</h2>
          <p className="text-zinc-500 font-sans">{chapter.revelation_place === 'makkah' ? 'مكية' : 'مدنية'} &bull; {chapter.verses_count} آية</p>
        </div>

        {chapter.bismillah_pre && (
          <div className="text-center font-arabic text-3xl text-zinc-400 dark:text-zinc-500 mb-12 select-none" style={{ fontFamily: quranFont }}>بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>
        )}

        <div className="space-y-10" role="list" aria-label="آيات السورة">
          {verses.map((verse) => {
            const highlighted = verse.verse_key === highlightedVerseKey;
            return (
              <div
                key={verse.id}
                id={`verse-${verse.verse_key}`}
                ref={(el) => { verseRefs.current[verse.verse_key] = el; }}
                className={`text-center transition-colors duration-500 px-4 py-6 ${highlighted ? 'bg-amber-50/80 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800' : ''}`}
              >
                <p className="text-zinc-900 dark:text-zinc-100 select-text leading-loose" style={{ fontSize: `${fontSize}px`, fontFamily: quranFont, lineHeight: lhValue }}>
                  {verse.text_uthmani}
                  <span className="inline-flex items-center justify-center mx-2 text-amber-700 dark:text-amber-400 font-sans text-sm w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 align-middle">
                    {verse.verse_key.split(':')[1]}
                  </span>
                </p>
                {showTranslation && verse.translations?.[0] && (
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-base font-sans mt-4 max-w-lg mx-auto">
                    {stripHTML(verse.translations[0].text)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
        {renderModals()}
      </div>
    );
  }

  // ============================
  // Flowing View Mode (default)
  // ============================
  return (
    <div className="pb-24">
      {/* Chapter Header */}
      <div className="text-center mb-10 py-6 border-b border-zinc-200 dark:border-zinc-900">
        <h2 className="font-arabic text-5xl text-amber-600 dark:text-amber-500 mb-2">{chapter.name_arabic}</h2>
        <p className="text-zinc-500 font-sans">{chapter.revelation_place === 'makkah' ? 'مكية' : 'مدنية'} &bull; {chapter.verses_count} آية</p>
        <div className="flex justify-center mt-6 gap-3 flex-wrap">
          <button onClick={() => playChapter(chapter, getReciterApiIds(selectedReciterId).chapterApiId)} aria-label={isPlaying && currentChapterId === chapter.id ? 'إيقاف التلاوة' : 'استماع'} className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all font-medium font-sans ${isPlaying && currentChapterId === chapter.id && !currentVerseKey ? 'bg-amber-600 text-white shadow-[0_0_20px_rgba(217,119,6,0.3)]' : 'bg-zinc-100 dark:bg-zinc-900 text-amber-600 dark:text-amber-500 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500'}`}>
            {isPlaying && currentChapterId === chapter.id && !currentVerseKey ? <><PauseIcon size={18} /> إيقاف التلاوة</> : <><PlayIcon size={18} /> استماع</>}
          </button>
          <button onClick={() => onAskAi(`لخص سورة ${chapter.name_arabic} واشرح مواضيعها الرئيسية.`)} className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:text-amber-600 transition-all font-sans" aria-label="ملخص السورة">
            <SparkleIcon size={18} /> ملخص السورة
          </button>
        </div>
      </div>

      {chapter.bismillah_pre && (
        <div className="text-center font-arabic text-3xl text-zinc-400 dark:text-zinc-500 mb-12 select-none" style={{ fontFamily: quranFont }}>بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</div>
      )}

      <div className="space-y-8" role="list" aria-label="آيات السورة">
        {verses.map((verse) => {
          const bookmarked = isBookmarked(verse.verse_key);
          const highlighted = verse.verse_key === highlightedVerseKey;
          const playingThis = isPlaying && currentVerseKey === verse.verse_key;

          return (
            <div key={verse.id} id={`verse-${verse.verse_key}`} ref={(el) => { verseRefs.current[verse.verse_key] = el; }} className={`group relative p-4 rounded-3xl transition-colors duration-500 ${highlighted ? 'bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30'}`}>
              {/* Toolbar */}
              <div className="absolute top-4 right-4 flex gap-1">
                <button onClick={() => handleToggleBookmark(verse)} className={`p-2 rounded-full transition-colors ${bookmarked ? 'text-amber-600 dark:text-amber-500' : 'text-zinc-300 dark:text-zinc-700 hover:text-zinc-500'}`} aria-label={bookmarked ? 'إزالة الإشارة' : 'حفظ الآية'}>
                  <BookmarkIcon size={18} filled={bookmarked} />
                </button>
                <button onClick={() => setActiveTafsirVerse(verse)} className="p-2 rounded-full text-zinc-300 dark:text-zinc-700 hover:text-amber-600 transition-colors" aria-label="تفسير">
                  <OpenBookIcon size={18} />
                </button>
                <button onClick={() => playVerse(chapter.id, verse.verse_key, getReciterApiIds(selectedReciterId).verseApiId)} className={`p-2 rounded-full transition-colors ${playingThis ? 'text-amber-600' : 'text-zinc-300 dark:text-zinc-700 hover:text-amber-600'}`} aria-label="استماع للآية">
                  {playingThis ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
                </button>
              </div>

              <p className="text-right text-zinc-900 dark:text-zinc-100 mb-5 select-text pr-10 transition-all duration-300 pt-2 leading-loose" style={{ fontSize: `${fontSize}px`, fontFamily: quranFont, lineHeight: lhValue }}>
                {verse.text_uthmani}
                <span className="inline-flex items-center justify-center mx-2 text-amber-700 dark:text-amber-400 font-sans text-sm w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 align-middle">
                  {verse.verse_key.split(':')[1]}
                </span>
              </p>

              {showTranslation && verse.translations && (
                <div className="pr-4 mr-2 border-r-2 border-amber-200 dark:border-amber-800/50">
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-base text-justify font-sans">{stripHTML(verse.translations[0].text)}</p>
                  <button onClick={() => setActiveTafsirVerse(verse)} className="text-amber-600 dark:text-amber-500 text-xs mt-3 font-medium hover:underline flex items-center gap-1">
                    قراءة التفسير
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </button>
                </div>
              )}

              <div className="flex justify-end mt-5 gap-2 flex-wrap">
                <button
                  onClick={() => onAskAi(`اشرح الآية ${verse.verse_key} من سورة ${chapter.name_arabic}: "${verse.text_uthmani}"`)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors flex items-center gap-1.5 font-sans font-medium"
                  aria-label="تدبر مع الذكاء الاصطناعي"
                >
                  <SparkleIcon size={12} /> تدبر مع نور
                </button>
                <button
                  onClick={() => setShareVerse(verse)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5 font-sans"
                  aria-label="مشاركة"
                >
                  <ShareIcon size={12} /> مشاركة
                </button>
                <button
                  onClick={() => { setNoteVerse(verse); setNoteText(''); }}
                  className="px-3 py-1.5 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors flex items-center gap-1.5 font-sans"
                  aria-label="ملاحظة"
                >
                  <NoteIcon size={12} /> ملاحظة
                </button>
              </div>

              {!highlighted && <div className="h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent mt-8"></div>}
            </div>
          );
        })}
      </div>

      {renderModals()}
    </div>
  );
}
