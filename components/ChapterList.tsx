import React, { useState, useMemo, useEffect } from 'react';
import { Chapter, SearchResult, Verse, LastRead, KhatmaProgress, SearchFilter } from '../types';
import { searchGlobal, fetchVerseOfDay } from '../services/quranService';
import { JUZ_DATA, SEARCH_DEBOUNCE_MS } from '../constants';
import { sanitizeHtml, calculateProgress } from '../utils';

interface ChapterListProps {
  chapters: Chapter[];
  onSelect: (chapter: Chapter) => void;
  onVerseSelect: (chapterId: number, verseKey: string) => void;
  lastRead: LastRead | null;
  readingProgress: Record<number, string>;
  khatmaProgress: KhatmaProgress;
  onMarkChapterRead: (chapterId: number) => void;
}

export default function ChapterList({ chapters, onSelect, onVerseSelect, lastRead, readingProgress, khatmaProgress, onMarkChapterRead }: ChapterListProps) {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [verseResults, setVerseResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [homeTab, setHomeTab] = useState<'chapters' | 'juz'>('chapters');
  const [filter, setFilter] = useState<SearchFilter>({ revelationType: 'all' });
  const [verseOfDay, setVerseOfDay] = useState<{ verse: Verse; chapterId: number } | null>(null);
  const [showKhatma, setShowKhatma] = useState(false);

  // Fetch verse of the day
  useEffect(() => {
    fetchVerseOfDay().then(v => { if (v) setVerseOfDay(v); });
  }, []);

  // Filter chapters locally
  const filteredChapters = useMemo(() => {
    let list = chapters;
    if (filter.revelationType !== 'all') {
      list = list.filter(c => c.revelation_place === (filter.revelationType === 'makkah' ? 'makkah' : 'madinah'));
    }
    if (!search) return list;
    return list.filter(c =>
      c.name_simple.toLowerCase().includes(search.toLowerCase()) ||
      c.name_arabic.includes(search) ||
      String(c.id).includes(search)
    );
  }, [chapters, search, filter]);

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [search]);

  // API search
  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearch.length < 2) { setVerseResults([]); return; }
      setIsSearching(true);
      const results = await searchGlobal(debouncedSearch);
      setVerseResults(results);
      setIsSearching(false);
    };
    performSearch();
  }, [debouncedSearch]);

  const completedCount = khatmaProgress.completedChapters.length;
  const khatmaPercent = calculateProgress(completedCount, 114);

  if (chapters.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
        <p className="text-zinc-500 font-sans text-sm">جارٍ تحميل السور...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Continue Reading Card */}
      {lastRead && !search && (
        <button
          onClick={() => onVerseSelect(lastRead.chapterId, lastRead.verseKey)}
          className="w-full flex items-center gap-4 p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all text-right"
          aria-label="متابعة القراءة"
        >
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center text-amber-600 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-amber-700 dark:text-amber-400 font-bold font-sans text-sm">متابعة القراءة</p>
            <p className="text-zinc-600 dark:text-zinc-400 text-xs font-sans truncate">سورة {lastRead.chapterName} • الآية {lastRead.verseKey.split(':')[1]}</p>
          </div>
          <svg className="w-5 h-5 text-amber-500 transform rotate-180 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
        </button>
      )}

      {/* Verse of the Day */}
      {verseOfDay && !search && (
        <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10 border border-amber-200/50 dark:border-amber-800/30">
          <div className="flex items-center gap-2 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-600"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            <span className="text-amber-700 dark:text-amber-400 font-bold font-sans text-xs">آية اليوم</span>
          </div>
          <p className="font-arabic text-xl text-zinc-800 dark:text-zinc-200 leading-loose text-right line-clamp-3 mb-2" style={{ fontFamily: 'Amiri' }}>
            {verseOfDay.verse.text_uthmani}
          </p>
          <button
            onClick={() => onVerseSelect(verseOfDay.chapterId, verseOfDay.verse.verse_key)}
            className="text-amber-600 dark:text-amber-500 text-xs font-bold font-sans hover:underline"
          >
            اقرأ في السورة &larr;
          </button>
        </div>
      )}

      {/* Khatma Progress Card */}
      {!search && (
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50">
          <button onClick={() => setShowKhatma(!showKhatma)} className="w-full flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-amber-600 dark:text-amber-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
              <div className="text-right">
                <p className="font-bold font-sans text-sm text-zinc-900 dark:text-zinc-100">خطة الختمة</p>
                <p className="text-zinc-500 text-xs font-sans">{completedCount}/114 سورة ({khatmaPercent}%)</p>
              </div>
            </div>
            <svg className={`w-4 h-4 text-zinc-400 transition-transform ${showKhatma ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
          </button>
          {/* Progress bar */}
          <div className="mt-3 h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${khatmaPercent}%` }}></div>
          </div>
          {showKhatma && (
            <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
              <p className="text-zinc-500 text-xs font-sans">الهدف: {khatmaProgress.targetDays} يوم • البداية: {new Date(khatmaProgress.startDate).toLocaleDateString('ar-SA')}</p>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: 114 }, (_, i) => i + 1).map(id => (
                  <button
                    key={id}
                    onClick={(e) => { e.stopPropagation(); onMarkChapterRead(id); }}
                    className={`w-7 h-7 rounded text-[10px] font-bold transition-colors ${
                      khatmaProgress.completedChapters.includes(id)
                        ? 'bg-amber-500 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-amber-100 dark:hover:bg-amber-900/20'
                    }`}
                    title={chapters.find(c => c.id === id)?.name_arabic}
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="ابحث عن سورة أو آية..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="البحث في القرآن"
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

      {/* Search Filters */}
      {search && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar font-sans">
          {([['all', 'الكل'], ['makkah', 'مكية'], ['madinah', 'مدنية']] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setFilter({ revelationType: val })}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter.revelationType === val
                  ? 'bg-amber-600 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Tabs: Chapters / Juz */}
      {!search && (
        <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl font-sans">
          <button
            onClick={() => setHomeTab('chapters')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              homeTab === 'chapters' ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-500 shadow-sm' : 'text-zinc-500'
            }`}
          >
            السور ({chapters.length})
          </button>
          <button
            onClick={() => setHomeTab('juz')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              homeTab === 'juz' ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-500 shadow-sm' : 'text-zinc-500'
            }`}
          >
            الأجزاء (30)
          </button>
        </div>
      )}

      <div className="grid gap-6">
        {/* Juz View */}
        {homeTab === 'juz' && !search && (
          <div className="grid gap-3">
            {JUZ_DATA.map((juz) => {
              const chapter = chapters.find(c => c.id === juz.startChapter);
              return (
                <button
                  key={juz.juz}
                  onClick={() => {
                    if (chapter) {
                      onVerseSelect(juz.startChapter, juz.start);
                    }
                  }}
                  className="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-amber-500/30 transition-all active:scale-[0.98] shadow-sm dark:shadow-none"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-amber-600 font-bold text-sm">
                      {juz.juz}
                    </div>
                    <div className="text-right">
                      <h3 className="text-zinc-900 dark:text-zinc-100 font-bold font-sans text-base">{juz.name}</h3>
                      <p className="text-zinc-500 text-xs mt-0.5">يبدأ من {chapter?.name_arabic} • {juz.start}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Chapters Section */}
        {(homeTab === 'chapters' || search) && filteredChapters.length > 0 && (
          <div>
            {search && <h3 className="text-zinc-500 dark:text-zinc-400 text-sm font-bold mb-3 px-1 font-sans">السور</h3>}
            <div className="grid gap-3">
              {filteredChapters.map((chapter) => {
                const progress = readingProgress[chapter.id];
                const isKhatmaComplete = khatmaProgress.completedChapters.includes(chapter.id);
                const progressPercent = progress ? Math.round((parseInt(progress.split(':')[1]) / chapter.verses_count) * 100) : 0;

                return (
                  <button
                    key={chapter.id}
                    onClick={() => onSelect(chapter)}
                    className="group flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:border-amber-500/30 dark:hover:border-amber-900/30 transition-all active:scale-[0.98] shadow-sm dark:shadow-none"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`relative flex items-center justify-center w-10 h-10 rounded-full border text-sm font-medium ${
                        isKhatmaComplete
                          ? 'bg-amber-500 border-amber-500 text-white'
                          : 'bg-zinc-100 dark:bg-black border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-500 group-hover:border-amber-500/50'
                      }`}>
                        {isKhatmaComplete ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        ) : chapter.id}
                      </div>
                      <div className="text-right">
                        <h3 className="text-zinc-900 dark:text-zinc-100 font-bold font-arabic text-xl">{chapter.name_arabic}</h3>
                        <p className="text-zinc-500 text-xs mt-1">{chapter.revelation_place === 'makkah' ? 'مكية' : 'مدنية'}</p>
                      </div>
                    </div>
                    <div className="text-left flex flex-col items-end gap-1">
                      <span className="font-sans text-sm text-zinc-400 dark:text-zinc-500 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">آياتها {chapter.verses_count}</span>
                      {progressPercent > 0 && (
                        <div className="w-16 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500/60 rounded-full" style={{ width: `${Math.min(progressPercent, 100)}%` }}></div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Verse Results */}
        {verseResults.length > 0 && (
          <div>
            <h3 className="text-zinc-500 dark:text-zinc-400 text-sm font-bold mb-3 px-1 font-sans">نتائج البحث في الآيات</h3>
            <div className="grid gap-3">
              {verseResults.map((result, idx) => {
                const [chapterIdStr] = result.verse_key.split(':');
                const chapterId = parseInt(chapterIdStr);
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
                    </div>
                    <p className="font-arabic text-lg text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-loose" dangerouslySetInnerHTML={{ __html: sanitizeHtml(result.text) }}></p>
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
