import React, { useState, useEffect, useCallback } from 'react';
import { View, Chapter, Verse, Bookmark, BookmarkCollection, Theme, QuranFont, LineHeight, LastRead, KhatmaProgress, AudioControls } from './types';
import { fetchChapters, fetchChapterAudio } from './services/quranService';
import { STORAGE_KEYS, DEFAULT_RECITER_ID, DEFAULT_FONT_SIZE } from './constants';
import ChapterList from './components/ChapterList';
import QuranReader from './components/QuranReader';
import AIChat from './components/AIChat';
import BottomNav from './components/BottomNav';
import SettingsView from './components/SettingsView';
import BookmarksView from './components/BookmarksView';
import ErrorBoundary from './components/ErrorBoundary';

export default function App() {
  // Core
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [highlightedVerseKey, setHighlightedVerseKey] = useState<string | null>(null);

  // Appearance
  const [fontSize, setFontSize] = useState<number>(() => Number(localStorage.getItem(STORAGE_KEYS.FONT_SIZE)) || DEFAULT_FONT_SIZE);
  const [showTranslation, setShowTranslation] = useState<boolean>(() => localStorage.getItem(STORAGE_KEYS.SHOW_TRANSLATION) !== 'false');
  const [quranFont, setQuranFont] = useState<QuranFont>(() => (localStorage.getItem(STORAGE_KEYS.QURAN_FONT) as QuranFont) || 'Amiri');
  const [lineHeight, setLineHeight] = useState<LineHeight>(() => (localStorage.getItem(STORAGE_KEYS.LINE_HEIGHT) as LineHeight) || 'normal');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(STORAGE_KEYS.THEME) as Theme) || 'system');
  const [tajweedEnabled, setTajweedEnabled] = useState<boolean>(() => localStorage.getItem(STORAGE_KEYS.TAJWEED_ENABLED) === 'true');

  // Reciter
  const [reciterId, setReciterId] = useState<number>(() => Number(localStorage.getItem(STORAGE_KEYS.RECITER_ID)) || DEFAULT_RECITER_ID);

  // Bookmarks with Collections
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
    return saved ? JSON.parse(saved) : [];
  });
  const [collections, setCollections] = useState<BookmarkCollection[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BOOKMARK_COLLECTIONS);
    return saved ? JSON.parse(saved) : [{ id: 'default', name: 'المحفوظات', color: '#d97706' }];
  });

  // Audio
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [currentAudioChapterId, setCurrentAudioChapterId] = useState<number | null>(null);
  const [audioCurrentTime, setAudioCurrentTime] = useState<number>(0);
  const [audioDuration, setAudioDuration] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(() => Number(localStorage.getItem(STORAGE_KEYS.PLAYBACK_SPEED)) || 1);

  // AI
  const [aiContext, setAiContext] = useState<string>('');

  // Reading Progress
  const [readingProgress, setReadingProgress] = useState<Record<number, string>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.READING_PROGRESS);
    return saved ? JSON.parse(saved) : {};
  });
  const [lastRead, setLastRead] = useState<LastRead | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LAST_READ);
    return saved ? JSON.parse(saved) : null;
  });

  // Notes
  const [verseNotes, setVerseNotes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTES);
    return saved ? JSON.parse(saved) : {};
  });

  // Khatma
  const [khatmaProgress, setKhatmaProgress] = useState<KhatmaProgress>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.KHATMA);
    return saved ? JSON.parse(saved) : { completedChapters: [], startDate: Date.now(), targetDays: 30 };
  });

  // --- Effects ---

  useEffect(() => { fetchChapters().then(setChapters); }, []);

  // Persist all settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QURAN_FONT, quranFont);
    localStorage.setItem(STORAGE_KEYS.LINE_HEIGHT, lineHeight);
    localStorage.setItem(STORAGE_KEYS.FONT_SIZE, String(fontSize));
    localStorage.setItem(STORAGE_KEYS.SHOW_TRANSLATION, String(showTranslation));
    localStorage.setItem(STORAGE_KEYS.TAJWEED_ENABLED, String(tajweedEnabled));
    localStorage.setItem(STORAGE_KEYS.RECITER_ID, String(reciterId));
    localStorage.setItem(STORAGE_KEYS.PLAYBACK_SPEED, String(playbackSpeed));
  }, [quranFont, lineHeight, fontSize, showTranslation, tajweedEnabled, reciterId, playbackSpeed]);

  // Theme
  useEffect(() => {
    const root = document.documentElement;
    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      root.classList.toggle('dark', isDark);
    };
    applyTheme();
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => { if (theme === 'system') applyTheme(); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  // Persist bookmarks + collections
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks)); }, [bookmarks]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.BOOKMARK_COLLECTIONS, JSON.stringify(collections)); }, [collections]);

  // Persist reading progress
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.READING_PROGRESS, JSON.stringify(readingProgress)); }, [readingProgress]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LAST_READ, JSON.stringify(lastRead)); }, [lastRead]);

  // Persist notes
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(verseNotes)); }, [verseNotes]);

  // Persist khatma
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.KHATMA, JSON.stringify(khatmaProgress)); }, [khatmaProgress]);

  // Audio play/pause control
  useEffect(() => {
    if (audioElement) {
      if (isPlaying) audioElement.play().catch(() => setIsPlaying(false));
      else audioElement.pause();
    }
  }, [isPlaying, audioElement]);

  // Audio progress tracking
  useEffect(() => {
    if (!audioElement) return;
    const onTimeUpdate = () => setAudioCurrentTime(audioElement.currentTime);
    const onLoadedMetadata = () => setAudioDuration(audioElement.duration);
    const onEnded = () => setIsPlaying(false);

    audioElement.addEventListener('timeupdate', onTimeUpdate);
    audioElement.addEventListener('loadedmetadata', onLoadedMetadata);
    audioElement.addEventListener('ended', onEnded);
    audioElement.playbackRate = playbackSpeed;

    return () => {
      audioElement.removeEventListener('timeupdate', onTimeUpdate);
      audioElement.removeEventListener('loadedmetadata', onLoadedMetadata);
      audioElement.removeEventListener('ended', onEnded);
    };
  }, [audioElement, playbackSpeed]);

  // --- Handlers ---

  const playChapter = async (chapter: Chapter) => {
    if (currentAudioChapterId === chapter.id && audioElement) {
      setIsPlaying(!isPlaying);
      return;
    }
    // Cleanup previous audio
    if (audioElement) {
      audioElement.pause();
      audioElement.src = '';
      setIsPlaying(false);
    }
    const url = await fetchChapterAudio(chapter.id, reciterId);
    if (url) {
      const audio = new Audio(url);
      audio.playbackRate = playbackSpeed;
      setAudioElement(audio);
      setAudioUrl(url);
      setCurrentAudioChapterId(chapter.id);
      setAudioCurrentTime(0);
      setAudioDuration(0);
      setIsPlaying(true);
    }
  };

  const handleSeek = (time: number) => {
    if (audioElement) {
      audioElement.currentTime = time;
      setAudioCurrentTime(time);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioElement) audioElement.playbackRate = speed;
  };

  const handleChapterSelect = (chapter: Chapter) => {
    setActiveChapter(chapter);
    setHighlightedVerseKey(null);
    setCurrentView(View.READER);
    window.scrollTo(0, 0);
  };

  const handleVerseSearchSelect = (chapterId: number, verseKey: string) => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (chapter) {
      setActiveChapter(chapter);
      setHighlightedVerseKey(verseKey);
      setCurrentView(View.READER);
    }
  };

  const handleChapterChange = (chapter: Chapter) => {
    setActiveChapter(chapter);
    setHighlightedVerseKey(null);
    window.scrollTo(0, 0);
  };

  const handleAiInquiry = (context: string) => {
    setAiContext(context);
    setCurrentView(View.AI_CHAT);
  };

  const toggleBookmark = (verse: Verse, collectionId?: string) => {
    if (!activeChapter) return;
    setBookmarks(prev => {
      const exists = prev.some(b => b.verseKey === verse.verse_key);
      if (exists) return prev.filter(b => b.verseKey !== verse.verse_key);
      const newBookmark: Bookmark = {
        id: verse.verse_key,
        verseKey: verse.verse_key,
        chapterId: activeChapter.id,
        chapterName: activeChapter.name_arabic,
        text: verse.translations?.[0]?.text || verse.text_uthmani,
        timestamp: Date.now(),
        collectionId: collectionId || 'default',
      };
      return [newBookmark, ...prev];
    });
  };

  const handleBookmarkSelect = (bookmark: Bookmark) => {
    const chapter = chapters.find(c => c.id === bookmark.chapterId);
    if (chapter) {
      setActiveChapter(chapter);
      setHighlightedVerseKey(bookmark.verseKey);
      setCurrentView(View.READER);
    }
  };

  const handleAddCollection = (name: string, color: string) => {
    setCollections(prev => [...prev, { id: `coll-${Date.now()}`, name, color }]);
  };

  const handleDeleteCollection = (id: string) => {
    setCollections(prev => prev.filter(c => c.id !== id));
    setBookmarks(prev => prev.map(b => b.collectionId === id ? { ...b, collectionId: 'default' } : b));
  };

  const handleMoveBookmark = (bookmarkId: string, collectionId: string) => {
    setBookmarks(prev => prev.map(b => b.id === bookmarkId ? { ...b, collectionId } : b));
  };

  const handleUpdateProgress = useCallback((verseKey: string) => {
    if (!activeChapter) return;
    const chapterId = activeChapter.id;
    setReadingProgress(prev => ({ ...prev, [chapterId]: verseKey }));
    setLastRead({
      chapterId,
      verseKey,
      chapterName: activeChapter.name_arabic,
      timestamp: Date.now(),
    });
  }, [activeChapter]);

  const handleSaveNote = (verseKey: string, text: string) => {
    setVerseNotes(prev => ({ ...prev, [verseKey]: text }));
  };

  const handleDeleteNote = (verseKey: string) => {
    setVerseNotes(prev => { const next = { ...prev }; delete next[verseKey]; return next; });
  };

  const handleMarkChapterRead = (chapterId: number) => {
    setKhatmaProgress(prev => {
      const exists = prev.completedChapters.includes(chapterId);
      return {
        ...prev,
        completedChapters: exists
          ? prev.completedChapters.filter(id => id !== chapterId)
          : [...prev.completedChapters, chapterId],
      };
    });
  };

  // Audio controls object for QuranReader
  const audioControls: AudioControls = {
    isPlaying: isPlaying && currentAudioChapterId === activeChapter?.id,
    currentTime: audioCurrentTime,
    duration: audioDuration,
    playbackSpeed,
    currentChapterId: currentAudioChapterId,
    onTogglePlay: () => { if (activeChapter) playChapter(activeChapter); },
    onSeek: handleSeek,
    onSpeedChange: handleSpeedChange,
  };

  const playingChapter = chapters.find(c => c.id === currentAudioChapterId);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans flex flex-col pb-24 selection:bg-amber-500 selection:text-white transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 px-6 py-4 flex items-center justify-between transition-colors duration-300">
        <div className="flex items-center gap-3">
          {(currentView === View.READER || currentView === View.BOOKMARKS) && (
            <button
              onClick={() => setCurrentView(View.HOME)}
              className="p-2 -mr-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500 dark:text-zinc-400 transform rotate-180"
              aria-label="الرجوع"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-500 font-arabic pt-1">نور القرآن</h1>
        </div>

        {/* Audio Indicator */}
        {isPlaying && playingChapter && (
          <div
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-amber-600 dark:text-amber-500 animate-pulse cursor-pointer"
            onClick={() => { setActiveChapter(playingChapter); setCurrentView(View.READER); }}
            role="status"
            aria-label={`جارٍ تلاوة ${playingChapter.name_arabic}`}
          >
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="hidden sm:inline">جارٍ تلاوة</span> {playingChapter.name_arabic}
          </div>
        )}
      </header>

      {/* Main */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-6">
        {currentView === View.HOME && (
          <ErrorBoundary fallbackMessage="تعذر تحميل قائمة السور">
            <ChapterList
              chapters={chapters}
              onSelect={handleChapterSelect}
              onVerseSelect={handleVerseSearchSelect}
              lastRead={lastRead}
              readingProgress={readingProgress}
              khatmaProgress={khatmaProgress}
              onMarkChapterRead={handleMarkChapterRead}
            />
          </ErrorBoundary>
        )}

        {currentView === View.READER && activeChapter && (
          <ErrorBoundary fallbackMessage="تعذر عرض السورة">
            <QuranReader
              chapter={activeChapter}
              chapters={chapters}
              highlightedVerseKey={highlightedVerseKey}
              fontSize={fontSize}
              quranFont={quranFont}
              lineHeight={lineHeight}
              showTranslation={showTranslation}
              tajweedEnabled={tajweedEnabled}
              audio={audioControls}
              bookmarks={bookmarks}
              collections={collections}
              verseNotes={verseNotes}
              khatmaProgress={khatmaProgress}
              onToggleBookmark={(verse) => toggleBookmark(verse)}
              onSaveNote={handleSaveNote}
              onDeleteNote={handleDeleteNote}
              onAskAi={handleAiInquiry}
              onUpdateProgress={handleUpdateProgress}
              onChapterChange={handleChapterChange}
              onMarkChapterRead={handleMarkChapterRead}
            />
          </ErrorBoundary>
        )}

        {currentView === View.BOOKMARKS && (
          <ErrorBoundary fallbackMessage="تعذر عرض المحفوظات">
            <BookmarksView
              bookmarks={bookmarks}
              collections={collections}
              quranFont={quranFont}
              onSelect={handleBookmarkSelect}
              onDelete={(id) => setBookmarks(prev => prev.filter(b => b.id !== id))}
              onAddCollection={handleAddCollection}
              onDeleteCollection={handleDeleteCollection}
              onMoveBookmark={handleMoveBookmark}
            />
          </ErrorBoundary>
        )}

        {currentView === View.AI_CHAT && (
          <ErrorBoundary fallbackMessage="تعذر تحميل المحادثة">
            <AIChat initialContext={aiContext} />
          </ErrorBoundary>
        )}

        {currentView === View.SETTINGS && (
          <ErrorBoundary fallbackMessage="تعذر تحميل الإعدادات">
            <SettingsView
              fontSize={fontSize}
              setFontSize={setFontSize}
              quranFont={quranFont}
              setQuranFont={setQuranFont}
              lineHeight={lineHeight}
              setLineHeight={setLineHeight}
              showTranslation={showTranslation}
              setShowTranslation={setShowTranslation}
              theme={theme}
              setTheme={setTheme}
              reciterId={reciterId}
              setReciterId={setReciterId}
              tajweedEnabled={tajweedEnabled}
              setTajweedEnabled={setTajweedEnabled}
            />
          </ErrorBoundary>
        )}
      </main>

      <BottomNav
        currentView={currentView}
        onViewChange={setCurrentView}
        hasActiveChapter={!!activeChapter}
      />
    </div>
  );
}
