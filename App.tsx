import React, { useState, useEffect } from 'react';
import { View, AppState, Chapter, Verse, Bookmark, Theme, QuranFont, LineHeight } from './types';
import { fetchChapters, fetchVerses, fetchChapterAudio } from './services/quranService';
import ChapterList from './components/ChapterList';
import QuranReader from './components/QuranReader';
import AIChat from './components/AIChat';
import BottomNav from './components/BottomNav';
import SettingsView from './components/SettingsView';
import BookmarksView from './components/BookmarksView';

export default function App() {
  // Application State
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [highlightedVerseKey, setHighlightedVerseKey] = useState<string | null>(null);
  
  // Appearance State
  const [fontSize, setFontSize] = useState<number>(() => {
    return Number(localStorage.getItem('fontSize')) || 32;
  });
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [quranFont, setQuranFont] = useState<QuranFont>(() => {
    return (localStorage.getItem('quranFont') as QuranFont) || 'Amiri';
  });
  const [lineHeight, setLineHeight] = useState<LineHeight>(() => {
    return (localStorage.getItem('lineHeight') as LineHeight) || 'normal';
  });

  // Theme State
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem('theme') as Theme) || 'system';
  });

  // Bookmarks State
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    const saved = localStorage.getItem('bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  // Audio State
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [currentAudioChapterId, setCurrentAudioChapterId] = useState<number | null>(null);

  // AI Context
  const [aiContext, setAiContext] = useState<string>('');

  // Initial Load
  useEffect(() => {
    loadChapters();
  }, []);

  // Persist Appearance Settings
  useEffect(() => {
    localStorage.setItem('quranFont', quranFont);
    localStorage.setItem('lineHeight', lineHeight);
    localStorage.setItem('fontSize', String(fontSize));
  }, [quranFont, lineHeight, fontSize]);

  // Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = () => {
      const isDark = 
        theme === 'dark' || 
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      if (isDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();
    localStorage.setItem('theme', theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') applyTheme();
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // Bookmarks Persistence
  useEffect(() => {
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  const loadChapters = async () => {
    const data = await fetchChapters();
    setChapters(data);
  };

  // Audio Logic
  useEffect(() => {
    if (audioElement) {
      if (isPlaying) audioElement.play();
      else audioElement.pause();
    }
  }, [isPlaying, audioElement]);

  const playChapter = async (chapter: Chapter) => {
    // If clicking play/pause on the currently playing chapter
    if (currentAudioChapterId === chapter.id && audioElement) {
      setIsPlaying(!isPlaying);
      return;
    }

    // If starting a new chapter, stop the old one
    if (audioElement) {
      audioElement.pause();
      setIsPlaying(false);
    }

    const url = await fetchChapterAudio(chapter.id);
    if (url) {
      const audio = new Audio(url);
      audio.addEventListener('ended', () => setIsPlaying(false));
      setAudioElement(audio);
      setAudioUrl(url);
      setCurrentAudioChapterId(chapter.id);
      setIsPlaying(true);
    }
  };

  const handleChapterSelect = (chapter: Chapter) => {
    setActiveChapter(chapter);
    setHighlightedVerseKey(null);
    setCurrentView(View.READER);
    window.scrollTo(0,0);
  };

  const handleVerseSearchSelect = (chapterId: number, verseKey: string) => {
    const chapter = chapters.find(c => c.id === chapterId);
    if (chapter) {
      setActiveChapter(chapter);
      setHighlightedVerseKey(verseKey);
      setCurrentView(View.READER);
    }
  };

  const handleAiInquiry = (context: string) => {
    setAiContext(context);
    setCurrentView(View.AI_CHAT);
  };

  const toggleBookmark = (verse: Verse, chapter: Chapter) => {
    setBookmarks(prev => {
      const exists = prev.some(b => b.verseKey === verse.verse_key);
      if (exists) {
        return prev.filter(b => b.verseKey !== verse.verse_key);
      } else {
        const newBookmark: Bookmark = {
          id: verse.verse_key,
          verseKey: verse.verse_key,
          chapterId: chapter.id,
          chapterName: chapter.name_arabic,
          text: verse.translations?.[0]?.text || verse.text_uthmani,
          timestamp: Date.now()
        };
        return [newBookmark, ...prev];
      }
    });
  };

  const handleBookmarkSelect = (bookmark: Bookmark) => {
    // Find chapter info from cached chapters to pass full object
    const chapter = chapters.find(c => c.id === bookmark.chapterId);
    if (chapter) {
      setActiveChapter(chapter);
      setHighlightedVerseKey(bookmark.verseKey);
      setCurrentView(View.READER);
    }
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
            >
              {/* Rotated arrow for RTL back button */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
          )}
          <h1 className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-500 font-arabic pt-1">نور القرآن</h1>
        </div>
        
        {/* Active Audio Indicator */}
        {isPlaying && playingChapter && (
          <div 
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-amber-600 dark:text-amber-500 animate-pulse cursor-pointer" 
            onClick={() => {
              setActiveChapter(playingChapter);
              setCurrentView(View.READER);
            }}
          >
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="hidden sm:inline">جارٍ تلاوة</span> {playingChapter.name_arabic}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-6">
        {currentView === View.HOME && (
          <ChapterList 
            chapters={chapters} 
            onSelect={handleChapterSelect} 
            onVerseSelect={handleVerseSearchSelect}
          />
        )}
        
        {currentView === View.READER && activeChapter && (
          <QuranReader
            chapter={activeChapter}
            highlightedVerseKey={highlightedVerseKey}
            fontSize={fontSize}
            quranFont={quranFont}
            lineHeight={lineHeight}
            showTranslation={showTranslation}
            isPlaying={isPlaying && currentAudioChapterId === activeChapter.id}
            onTogglePlay={() => playChapter(activeChapter)}
            onAskAi={handleAiInquiry}
            bookmarks={bookmarks}
            onToggleBookmark={(verse) => toggleBookmark(verse, activeChapter)}
          />
        )}

        {currentView === View.BOOKMARKS && (
          <BookmarksView 
            bookmarks={bookmarks}
            quranFont={quranFont}
            onSelect={handleBookmarkSelect}
            onDelete={(id) => setBookmarks(prev => prev.filter(b => b.id !== id))}
          />
        )}

        {currentView === View.AI_CHAT && (
          <AIChat initialContext={aiContext} />
        )}

        {currentView === View.SETTINGS && (
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
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav currentView={currentView} onViewChange={setCurrentView} />
    </div>
  );
}