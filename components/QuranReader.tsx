
import React, { useEffect, useState, useRef } from 'react';
import { Chapter, Verse, Bookmark, QuranFont, LineHeight } from '../types';
import { fetchVerses, fetchTafsirContent, TAFSIR_OPTIONS } from '../services/quranService';

interface QuranReaderProps {
  chapter: Chapter;
  highlightedVerseKey: string | null;
  fontSize: number;
  quranFont: QuranFont;
  lineHeight: LineHeight;
  showTranslation: boolean;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onAskAi: (context: string) => void;
  bookmarks: Bookmark[];
  onToggleBookmark: (verse: Verse) => void;
}

export default function QuranReader({ 
  chapter, 
  highlightedVerseKey,
  fontSize,
  quranFont,
  lineHeight,
  showTranslation, 
  isPlaying, 
  onTogglePlay,
  onAskAi,
  bookmarks,
  onToggleBookmark
}: QuranReaderProps) {
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(true);
  const verseRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  
  // Tafsir Modal State
  const [activeTafsirVerse, setActiveTafsirVerse] = useState<Verse | null>(null);
  const [selectedTafsirId, setSelectedTafsirId] = useState<number>(169); // Default to Al-Sadi
  const [tafsirContent, setTafsirContent] = useState<string>('');
  const [tafsirLoading, setTafsirLoading] = useState<boolean>(false);

  useEffect(() => {
    const loadVerses = async () => {
      setLoading(true);
      const data = await fetchVerses(chapter.id);
      setVerses(data);
      setLoading(false);
    };
    loadVerses();
  }, [chapter.id]);

  // Load Tafsir content when verse or source changes
  useEffect(() => {
    const loadTafsir = async () => {
      if (!activeTafsirVerse) return;
      
      setTafsirLoading(true);
      const text = await fetchTafsirContent(selectedTafsirId, activeTafsirVerse.verse_key);
      setTafsirContent(text);
      setTafsirLoading(false);
    };

    if (activeTafsirVerse) {
      loadTafsir();
    }
  }, [activeTafsirVerse, selectedTafsirId]);

  // Handle scrolling to highlighted verse
  useEffect(() => {
    if (!loading && highlightedVerseKey && verseRefs.current[highlightedVerseKey]) {
      setTimeout(() => {
        verseRefs.current[highlightedVerseKey]?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 500); 
    }
  }, [loading, highlightedVerseKey]);

  const getLineHeightValue = (lh: LineHeight) => {
    switch(lh) {
        case 'compact': return 1.8;
        case 'normal': return 2.2;
        case 'loose': return 2.8;
    }
  };

  const closeTafsir = () => {
    setActiveTafsirVerse(null);
    setTafsirContent('');
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-40 bg-zinc-100 dark:bg-zinc-900 rounded-2xl"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Chapter Header */}
      <div className="text-center mb-10 py-6 border-b border-zinc-200 dark:border-zinc-900">
        <h2 className="font-arabic text-5xl text-amber-600 dark:text-amber-500 mb-2">{chapter.name_arabic}</h2>
        <p className="text-zinc-500">{chapter.revelation_place === 'makkah' ? 'مكية' : 'مدنية'} • {chapter.verses_count} آية</p>
        
        <div className="flex justify-center mt-6 gap-3 flex-wrap">
          <button 
            onClick={onTogglePlay}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full transition-all font-medium ${isPlaying ? 'bg-amber-600 text-white shadow-[0_0_20px_rgba(217,119,6,0.3)]' : 'bg-zinc-100 dark:bg-zinc-900 text-amber-600 dark:text-amber-500 border border-zinc-200 dark:border-zinc-800 hover:border-amber-500 dark:hover:border-amber-900'}`}
          >
            {isPlaying ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                إيقاف التلاوة
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                استماع
              </>
            )}
          </button>
          
          <button 
            onClick={() => onAskAi(`لخص سورة ${chapter.name_arabic} واشرح مواضيعها الرئيسية.`)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500 dark:hover:border-amber-900/50 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            ملخص السورة
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
          
          return (
            <div 
              key={verse.id} 
              id={`verse-${verse.verse_key}`}
              ref={(el) => (verseRefs.current[verse.verse_key] = el)}
              className={`group relative p-4 rounded-3xl transition-colors duration-500 ${isHighlighted ? 'bg-amber-50/80 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800' : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30'}`}
            >
              {/* Toolbar */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-50 hover:opacity-100 transition-opacity">
                 <button 
                    onClick={() => onToggleBookmark(verse)}
                    className={`p-2 rounded-full transition-colors ${isBookmarked ? 'text-amber-600 dark:text-amber-500' : 'text-zinc-300 dark:text-zinc-700 hover:text-zinc-500 dark:hover:text-zinc-400'}`}
                    title="حفظ الآية"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                 </button>
                 <button 
                    onClick={() => setActiveTafsirVerse(verse)}
                    className="p-2 rounded-full text-zinc-300 dark:text-zinc-700 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
                    title="تفسير مفصل"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                 </button>
              </div>

              {/* Arabic Text */}
              <p 
                className="text-right text-zinc-900 dark:text-zinc-100 mb-4 select-text pr-10 transition-all duration-300 pt-2"
                style={{ 
                    fontSize: `${fontSize}px`, 
                    fontFamily: quranFont,
                    lineHeight: getLineHeightValue(lineHeight) 
                }}
              >
                {verse.text_uthmani} 
                <span className="text-amber-600 dark:text-amber-600 font-sans text-lg inline-block mx-2 border border-amber-500/30 dark:border-amber-900/50 rounded-full w-8 h-8 text-center leading-7 bg-amber-50 dark:bg-zinc-900/50">
                  {verse.verse_key.split(':')[1]}
                </span>
              </p>

              {/* Translation (Simplified View) */}
              {showTranslation && verse.translations && (
                <div className="pr-4 mr-2 border-r-2 border-zinc-200 dark:border-zinc-800">
                  <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-lg text-justify font-sans">
                    {verse.translations[0].text.replace(/<sup.*?<\/sup>/g, '')}
                  </p>
                  <button 
                    onClick={() => setActiveTafsirVerse(verse)}
                    className="text-amber-600 dark:text-amber-500 text-xs mt-2 font-bold hover:underline"
                  >
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
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                  تدبر الآية مع الذكاء الاصطناعي
                </button>
              </div>
              
              {!isHighlighted && <div className="h-px bg-zinc-200 dark:bg-zinc-900 mt-8 w-1/2 mx-auto"></div>}
            </div>
          );
        })}
      </div>

      {/* Interactive Tafsir Bottom Sheet Modal */}
      {activeTafsirVerse && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={closeTafsir}
          ></div>
          
          {/* Sheet */}
          <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-[32px] shadow-2xl transform transition-transform border-t border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[85vh]">
            {/* Handle */}
            <div className="w-full flex justify-center pt-3 pb-1" onClick={closeTafsir}>
              <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full cursor-pointer"></div>
            </div>

            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
               <div>
                 <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 font-sans">تفسير الآية</h3>
                 <p className="text-zinc-500 text-sm font-sans">سورة {chapter.name_arabic} • الآية {activeTafsirVerse.verse_key.split(':')[1]}</p>
               </div>
               <button onClick={closeTafsir} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
               </button>
            </div>

            {/* Source Selector */}
            <div className="px-6 py-2 overflow-x-auto no-scrollbar border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex gap-2">
                {TAFSIR_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSelectedTafsirId(opt.id)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors font-sans ${
                      selectedTafsirId === opt.id
                        ? 'bg-amber-600 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {tafsirLoading ? (
                <div className="space-y-4 animate-pulse">
                   <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4"></div>
                   <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full"></div>
                   <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-5/6"></div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* The Verse Text again for context */}
                  <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
                     <p className="text-right font-arabic text-xl leading-loose text-zinc-800 dark:text-zinc-200" style={{ fontFamily: quranFont }}>
                        {activeTafsirVerse.text_uthmani}
                     </p>
                  </div>

                  {/* HTML Content of Tafsir */}
                  <div 
                    className="prose dark:prose-invert prose-lg max-w-none text-justify font-arabic leading-loose text-zinc-700 dark:text-zinc-300"
                    dangerouslySetInnerHTML={{ __html: tafsirContent }}
                    style={{ fontFamily: 'Amiri' }} // Force Amiri for Tafsir text readability
                  />

                  {/* AI Integration within Modal */}
                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                    <button 
                      onClick={() => {
                        closeTafsir();
                        onAskAi(`اشرح لي هذا التفسير (${TAFSIR_OPTIONS.find(t => t.id === selectedTafsirId)?.name}) للآية ${activeTafsirVerse.verse_key} بشكل مبسط: ${tafsirContent.substring(0, 500)}...`);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-amber-600 dark:text-amber-500 font-bold hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors font-sans"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                      تبسيط الشرح بواسطة نور
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
