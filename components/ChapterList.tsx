import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Chapter, SearchResult } from '../types';
import { searchGlobal } from '../services/quranService';
import { sanitizeHTML } from '../utils/sanitize';
import { SEARCH_DEBOUNCE_MS, SEARCH_MIN_LENGTH } from '../utils/constants';
import { useReadingProgress } from '../contexts/ReadingProgressContext';
import { SearchIcon } from './Icons';
import DailyVerse from './DailyVerse';

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
  const { getChapterProgress, getLastReadChapter } = useReadingProgress();

  const filteredChapters = useMemo(() => {
    if (!search) return chapters;
    return chapters.filter(c =>
      c.name_simple.toLowerCase().includes(search.toLowerCase()) ||
      c.name_arabic.includes(search) ||
      String(c.id).includes(search)
    );
  }, [chapters, search]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (debouncedSearch.length < SEARCH_MIN_LENGTH) {
      setVerseResults([]);
      return;
    }
    const performSearch = async () => {
      setIsSearching(true);
      const results = await searchGlobal(debouncedSearch);
      setVerseResults(results);
      setIsSearching(false);
    };
    performSearch();
  }, [debouncedSearch]);

  const lastRead = getLastReadChapter();
  const lastReadChapter = lastRead ? chapters.find(c => c.id === lastRead.chapterId) : null;

  if (chapters.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        <p className="text-sm text-zinc-500 font-sans">جاري تحميل السور...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Daily Verse */}
      {!search && <DailyVerse onNavigate={onVerseSelect} />}

      {/* Continue Reading */}
      {!search && lastReadChapter && lastRead && (
        <button
          onClick={() => onVerseSelect(lastRead.chapterId, lastRead.lastVerseKey)}
          className="w-full p-4 rounded-2xl bg-amber-600/10 dark:bg-amber-900/20 border border-amber-200/50 dark:border-amber-800/30 text-right flex items-center justify-between hover:bg-amber-600/20 transition-colors"
          aria-label="متابعة القراءة"
        >
          <div>
            <p className="text-sm font-bold text-amber-700 dark:text-amber-400 font-sans">متابعة القراءة</p>
            <p className="text-xs text-zinc-500 font-sans mt-0.5">{lastReadChapter.name_arabic} &bull; آية {lastRead.lastVerseKey.split(':')[1]}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-1.5 bg-amber-200 dark:bg-amber-800 rounded-full overflow-hidden">
              <div className="h-full bg-amber-600 rounded-full" style={{ width: `${Math.round((lastRead.versesRead / lastRead.totalVerses) * 100)}%` }} />
            </div>
            <span className="text-xs text-amber-600 font-sans">&larr;</span>
          </div>
        </button>
      )}

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="ابحث عن سورة أو آية..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl py-3 px-5 text-zinc-900 dark:text-zinc-200 placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-sans"
          aria-label="البحث في القرآن"
        />
        <div className="absolute left-4 top-3.5 text-zinc-400 dark:text-zinc-600">
          {isSearching ? (
            <div className="animate-spin h-5 w-5 border-2 border-zinc-300 border-t-amber-500 rounded-full"></div>
          ) : (
            <SearchIcon size={20} />
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {filteredChapters.length > 0 && (
          <div>
            {search && <h3 className="text-zinc-500 dark:text-zinc-400 text-sm font-bold mb-3 px-1 font-sans">السور</h3>}
            <div className="grid gap-3">
              {filteredChapters.map((chapter) => {
                const progress = getChapterProgress(chapter.id);
                const progressPercent = progress ? Math.round((progress.versesRead / progress.totalVerses) * 100) : 0;

                return (
                  <button
                    key={chapter.id}
                    onClick={() => onSelect(chapter)}
                    className="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-amber-500/30 transition-all active:scale-[0.98] shadow-sm dark:shadow-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 dark:bg-black border border-zinc-200 dark:border-zinc-800 group-hover:border-amber-500/50 text-zinc-600 dark:text-zinc-500 font-medium text-sm">
                        {chapter.id}
                        {progressPercent > 0 && progressPercent < 100 && (
                          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                            <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" className="text-amber-500/30" strokeWidth="2" />
                            <circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" className="text-amber-500" strokeWidth="2" strokeDasharray={`${progressPercent} 100`} strokeLinecap="round" />
                          </svg>
                        )}
                      </div>
                      <div className="text-right">
                        <h3 className="text-zinc-900 dark:text-zinc-100 font-bold font-arabic text-xl">{chapter.name_arabic}</h3>
                        <p className="text-zinc-500 text-xs mt-1 font-sans">{chapter.revelation_place === 'makkah' ? 'مكية' : 'مدنية'}</p>
                      </div>
                    </div>
                    <div className="text-left">
                      <span className="font-sans text-sm text-zinc-400 dark:text-zinc-500 group-hover:text-amber-600 transition-colors">آياتها {chapter.verses_count}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {verseResults.length > 0 && (
          <div>
            <h3 className="text-zinc-500 dark:text-zinc-400 text-sm font-bold mb-3 px-1 font-sans">نتائج البحث في الآيات</h3>
            <div className="grid gap-3">
              {verseResults.map((result, idx) => {
                const chapterId = parseInt(result.verse_key.split(':')[0]);
                const chapterName = chapters.find(c => c.id === chapterId)?.name_arabic || '';
                return (
                  <button
                    key={`${result.verse_key}-${idx}`}
                    onClick={() => onVerseSelect(chapterId, result.verse_key)}
                    className="group flex flex-col items-stretch text-right p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 hover:bg-amber-100/50 transition-all active:scale-[0.98]"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-amber-600 dark:text-amber-500 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-md font-sans">سورة {chapterName} &bull; {result.verse_key}</span>
                    </div>
                    <p className="font-arabic text-lg text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-loose" dangerouslySetInnerHTML={{ __html: sanitizeHTML(result.text) }}></p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {search.length > 1 && !isSearching && filteredChapters.length === 0 && verseResults.length === 0 && (
          <div className="text-center py-12 text-zinc-400 font-sans">لا توجد نتائج مطابقة لـ "{search}"</div>
        )}
      </div>
    </div>
  );
}
