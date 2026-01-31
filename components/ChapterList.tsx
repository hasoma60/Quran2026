import React, { useState, useMemo, useEffect } from 'react';
import { Chapter, SearchResult } from '../types';
import { searchGlobal } from '../services/quranService';

interface ChapterListProps {
  chapters: Chapter[];
  onSelect: (chapter: Chapter) => void;
  onVerseSelect: (chapterId: number, verseKey: string) => void;
}

export default function ChapterList({ chapters, onSelect, onVerseSelect }: ChapterListProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [verseResults, setVerseResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Filter Chapters locally
  const filteredChapters = useMemo(() => {
    if (!search) return chapters;
    return chapters.filter(c => 
      c.name_simple.toLowerCase().includes(search.toLowerCase()) || 
      c.name_arabic.includes(search) ||
      String(c.id).includes(search)
    );
  }, [chapters, search]);

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 600); // 600ms delay to prevent API spam

    return () => clearTimeout(timer);
  }, [search]);

  // Perform API Search when debounced value changes
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearch.length < 2) {
        setVerseResults([]);
        return;
      }

      setIsSearching(true);
      const results = await searchGlobal(debouncedSearch);
      setVerseResults(results);
      setIsSearching(false);
    };

    performSearch();
  }, [debouncedSearch]);

  if (chapters.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <input
          type="text"
          placeholder="ابحث عن سورة أو آية..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 px-5 text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
        />
        <div className="absolute left-4 top-3.5 text-zinc-400 dark:text-zinc-600">
           {isSearching ? (
             <div className="animate-spin h-5 w-5 border-2 border-zinc-300 border-t-amber-500 rounded-full"></div>
           ) : (
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
           )}
        </div>
      </div>

      <div className="grid gap-6">
        {/* Chapters Section */}
        {filteredChapters.length > 0 && (
          <div>
            {search && <h3 className="text-zinc-500 dark:text-zinc-400 text-sm font-bold mb-3 px-1 font-sans">السور</h3>}
            <div className="grid gap-3">
              {filteredChapters.map((chapter) => (
                <button
                  key={chapter.id}
                  onClick={() => onSelect(chapter)}
                  className="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-amber-500/30 dark:hover:border-amber-900/30 transition-all active:scale-[0.98] shadow-sm dark:shadow-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-zinc-800 group-hover:border-amber-500/50 dark:group-hover:border-amber-900/50 text-zinc-600 dark:text-zinc-500 font-medium text-sm">
                      {chapter.id}
                    </div>
                    <div className="text-right">
                      <h3 className="text-zinc-900 dark:text-zinc-100 font-bold font-arabic text-xl">{chapter.name_arabic}</h3>
                      <p className="text-zinc-500 text-xs mt-1">{chapter.revelation_place === 'makkah' ? 'مكية' : 'مدنية'}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="font-sans text-sm text-zinc-400 dark:text-zinc-500 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">آياتها {chapter.verses_count}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Verse Results Section */}
        {verseResults.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h3 className="text-zinc-500 dark:text-zinc-400 text-sm font-bold mb-3 px-1 font-sans">نتائج البحث في الآيات</h3>
             <div className="grid gap-3">
                {verseResults.map((result, idx) => {
                  const [chapterIdStr] = result.verse_key.split(':');
                  const chapterId = parseInt(chapterIdStr);
                  // Find chapter name from props
                  const chapterName = chapters.find(c => c.id === chapterId)?.name_arabic || '';

                  return (
                    <button
                      key={`${result.verse_key}-${idx}`}
                      onClick={() => onVerseSelect(chapterId, result.verse_key)}
                      className="group flex flex-col items-stretch text-right p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-all active:scale-[0.98]"
                    >
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-xs font-semibold text-amber-600 dark:text-amber-500 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-md font-sans">
                           سورة {chapterName} • {result.verse_key}
                         </span>
                         <svg className="w-4 h-4 text-zinc-400 group-hover:text-amber-500 transform rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                      </div>
                      <p className="font-arabic text-lg text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-loose" dangerouslySetInnerHTML={{ __html: result.text }}></p>
                    </button>
                  );
                })}
             </div>
          </div>
        )}

        {search.length > 1 && !isSearching && filteredChapters.length === 0 && verseResults.length === 0 && (
           <div className="text-center py-12 text-zinc-400 font-sans">
              لا توجد نتائج مطابقة لـ "{search}"
           </div>
        )}
      </div>
    </div>
  );
}