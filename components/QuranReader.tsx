
import React, { useEffect, useState, useRef, useCallback, memo } from 'react';
import { Chapter, Verse, BookmarkCategory, BOOKMARK_CATEGORIES } from '../types';
import { fetchVerses, fetchTafsirContent, TAFSIR_OPTIONS } from '../services/quranService';
import { useSettings } from '../contexts/SettingsContext';
import { useBookmarks } from '../contexts/BookmarkContext';
import { useAudio } from '../contexts/AudioContext';
import { useReadingProgress } from '../contexts/ReadingProgressContext';
import { useToast } from '../contexts/ToastContext';
import { sanitizeHTML } from '../utils/sanitize';
import { getLineHeightValue } from '../utils/typography';
import { DEFAULT_TAFSIR_ID, getReciterApiIds } from '../utils/constants';
import ShareModal from './ShareModal';
import {
  BookmarkIcon, SparkleIcon, PlayIcon, PauseIcon, OpenBookIcon,
  CloseIcon, ShareIcon, NoteIcon, TagIcon
} from './Icons';

interface QuranReaderProps {
  chapter: Chapter;
  highlightedVerseKey: string | null;
  onAskAi: (context: string) => void;
}

export default function QuranReader({ chapter, highlightedVerseKey, onAskAi }: QuranReaderProps) {
  const { fontSize, quranFont, lineHeight, showTranslation, selectedReciterId } = useSettings();
  const { toggleBookmark, isBookmarked, updateBookmarkCategory, addNote } = useBookmarks();
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

  useEffect(() => {
    if (!loading && highlightedVerseKey && verseRefs.current[highlightedVerseKey]) {
      setTimeout(() => {
        verseRefs.current[highlightedVerseKey]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 500);
    }
  }, [loading, highlightedVerseKey]);

  useEffect(() => {
    if (loading || verses.length === 0) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const vk = entry.target.getAttribute('id')?.replace('verse-', '');
          if (vk) updateProgress(chapter.id, vk, chapter.verses_count);
        }
      });
    }, { threshold: 0.5 });
    Object.values(verseRefs.current).forEach(el => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [loading, verses, chapter.id, chapter.verses_count]);

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

              <p className="text-right text-zinc-900 dark:text-zinc-100 mb-4 select-text pr-10 transition-all duration-300 pt-2" style={{ fontSize: `${fontSize}px`, fontFamily: quranFont, lineHeight: lhValue }}>
                {verse.text_uthmani}
                <span className="text-amber-600 dark:text-amber-600 font-sans text-lg inline-block mx-2 border border-amber-500/30 dark:border-amber-900/50 rounded-full w-8 h-8 text-center leading-7 bg-amber-50 dark:bg-zinc-900/50">{verse.verse_key.split(':')[1]}</span>
              </p>

              {showTranslation && verse.translations && (
                <div className="pr-4 mr-2 border-r-2 border-zinc-200 dark:border-zinc-800">
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg text-justify font-sans">{verse.translations[0].text.replace(/<sup.*?<\/sup>/g, '')}</p>
                  <button onClick={() => setActiveTafsirVerse(verse)} className="text-amber-600 dark:text-amber-500 text-xs mt-2 font-bold hover:underline">قراءة التفسير الكامل &larr;</button>
                </div>
              )}

              <div className="flex justify-end mt-4 gap-3 flex-wrap">
                <button onClick={() => onAskAi(`اشرح الآية ${verse.verse_key} من سورة ${chapter.name_arabic}: "${verse.text_uthmani}"`)} className="text-xs text-amber-600 dark:text-amber-500 flex items-center gap-1 hover:underline font-sans" aria-label="تدبر مع الذكاء الاصطناعي">
                  <SparkleIcon size={12} /> تدبر مع نور
                </button>
                <button onClick={() => setShareVerse(verse)} className="text-xs text-zinc-400 flex items-center gap-1 hover:text-amber-600 font-sans" aria-label="مشاركة">
                  <ShareIcon size={12} /> مشاركة
                </button>
                <button onClick={() => { setNoteVerse(verse); setNoteText(''); }} className="text-xs text-zinc-400 flex items-center gap-1 hover:text-amber-600 font-sans" aria-label="ملاحظة">
                  <NoteIcon size={12} /> ملاحظة
                </button>
              </div>

              {!highlighted && <div className="h-px bg-zinc-200 dark:bg-zinc-900 mt-8 w-1/2 mx-auto"></div>}
            </div>
          );
        })}
      </div>

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
    </div>
  );
}
