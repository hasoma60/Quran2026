import React, { useState, useEffect, lazy, Suspense } from 'react';
import { View, Chapter, ChatMessage } from './types';
import { fetchChapters } from './services/quranService';

// Context Providers
import { ToastProvider } from './contexts/ToastContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { BookmarkProvider } from './contexts/BookmarkContext';
import { AudioProvider, useAudio } from './contexts/AudioContext';
import { ReadingProgressProvider } from './contexts/ReadingProgressContext';

// Core components (always loaded)
import ErrorBoundary from './components/ErrorBoundary';
import BottomNav from './components/BottomNav';
import ScrollToTop from './components/ScrollToTop';
import ChapterList from './components/ChapterList';
import QuranReader from './components/QuranReader';
import { BackIcon } from './components/Icons';
import { useBookmarks } from './contexts/BookmarkContext';

// Lazy-loaded feature components
const AIChat = lazy(() => import('./components/AIChat'));
const SettingsView = lazy(() => import('./components/SettingsView'));
const BookmarksView = lazy(() => import('./components/BookmarksView'));
const JuzNavigator = lazy(() => import('./components/JuzNavigator'));
const KhatmahPlanner = lazy(() => import('./components/KhatmahPlanner'));
const NotesView = lazy(() => import('./components/NotesView'));
const MemorizationHelper = lazy(() => import('./components/MemorizationHelper'));
const QuranStats = lazy(() => import('./components/QuranStats'));
const ThematicIndex = lazy(() => import('./components/ThematicIndex'));

function LoadingFallback() {
  return (
    <div className="flex flex-col justify-center items-center h-64 gap-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
      <p className="text-sm text-zinc-500 font-sans">جاري التحميل...</p>
    </div>
  );
}

/** Inner app that can use context hooks */
function AppContent() {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [activeChapter, setActiveChapter] = useState<Chapter | null>(null);
  const [highlightedVerseKey, setHighlightedVerseKey] = useState<string | null>(null);
  const [aiContext, setAiContext] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'السلام عليكم! أنا نور، مساعدك الذكي للقرآن الكريم. كيف يمكنني مساعدتك اليوم؟' }
  ]);

  const { isPlaying, currentChapterId } = useAudio();
  const { bookmarks } = useBookmarks();

  // Load chapters on mount
  useEffect(() => {
    fetchChapters().then(setChapters);
  }, []);

  const playingChapter = chapters.find(c => c.id === currentChapterId);

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

  const handleAiInquiry = (context: string) => {
    setAiContext(context);
    setCurrentView(View.AI_CHAT);
  };

  const handleBookmarkSelect = (bookmark: { chapterId: number; verseKey: string }) => {
    const chapter = chapters.find(c => c.id === bookmark.chapterId);
    if (chapter) {
      setActiveChapter(chapter);
      setHighlightedVerseKey(bookmark.verseKey);
      setCurrentView(View.READER);
    }
  };

  const showBackButton = currentView !== View.HOME;

  const getViewTitle = (): string | null => {
    switch (currentView) {
      case View.BOOKMARKS: return 'المحفوظات';
      case View.AI_CHAT: return 'نور الذكي';
      case View.SETTINGS: return 'الإعدادات';
      case View.JUZ_NAVIGATOR: return 'الأجزاء';
      case View.KHATMAH: return 'خطة الختمة';
      case View.NOTES: return 'ملاحظاتي';
      case View.MEMORIZATION: return 'الحفظ';
      case View.STATS: return 'إحصائياتي';
      case View.THEMATIC: return 'تصفح موضوعي';
      default: return null;
    }
  };

  const viewTitle = getViewTitle();

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black sepia:bg-amber-50 text-zinc-900 dark:text-zinc-100 sepia:text-amber-950 font-sans flex flex-col pb-24 selection:bg-amber-500 selection:text-white transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 sepia:bg-amber-50/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 sepia:border-amber-200 px-6 py-4 flex items-center justify-between transition-colors duration-300" role="banner">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button
              onClick={() => setCurrentView(View.HOME)}
              className="p-2 -mr-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-zinc-500 dark:text-zinc-400"
              aria-label="العودة للرئيسية"
            >
              <BackIcon size={24} />
            </button>
          )}
          {viewTitle ? (
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 font-sans">{viewTitle}</h1>
          ) : (
            <h1 className="text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-500 font-arabic pt-1">نور القرآن</h1>
          )}
        </div>

        {/* Active Audio Indicator */}
        {isPlaying && playingChapter && (
          <button
            className="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-amber-600 dark:text-amber-500 animate-pulse"
            onClick={() => {
              setActiveChapter(playingChapter);
              setCurrentView(View.READER);
            }}
            aria-label={`جاري تلاوة ${playingChapter.name_arabic}`}
          >
            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
            <span className="hidden sm:inline">جارٍ تلاوة</span> {playingChapter.name_arabic}
          </button>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-3xl mx-auto p-4 sm:p-6" role="main">
        <ErrorBoundary>
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
              onAskAi={handleAiInquiry}
            />
          )}

          <Suspense fallback={<LoadingFallback />}>
            {currentView === View.BOOKMARKS && (
              <BookmarksView onSelect={handleBookmarkSelect} />
            )}

            {currentView === View.AI_CHAT && (
              <AIChat
                initialContext={aiContext}
                chatMessages={chatMessages}
                setChatMessages={setChatMessages}
              />
            )}

            {currentView === View.SETTINGS && (
              <SettingsView />
            )}

            {currentView === View.JUZ_NAVIGATOR && (
              <JuzNavigator onNavigate={handleVerseSearchSelect} />
            )}

            {currentView === View.KHATMAH && (
              <KhatmahPlanner />
            )}

            {currentView === View.NOTES && (
              <NotesView onNavigate={handleVerseSearchSelect} />
            )}

            {currentView === View.MEMORIZATION && (
              <MemorizationHelper chapters={chapters} />
            )}

            {currentView === View.STATS && (
              <QuranStats />
            )}

            {currentView === View.THEMATIC && (
              <ThematicIndex onNavigate={handleVerseSearchSelect} />
            )}
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        currentView={currentView}
        onViewChange={setCurrentView}
        bookmarkCount={bookmarks.length}
      />

      {/* Scroll to Top */}
      <ScrollToTop />
    </div>
  );
}

/** Root App component wrapping all context providers */
export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <SettingsProvider>
          <BookmarkProvider>
            <AudioProvider>
              <ReadingProgressProvider>
                <AppContent />
              </ReadingProgressProvider>
            </AudioProvider>
          </BookmarkProvider>
        </SettingsProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
