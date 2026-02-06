import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Chapter, Bookmark } from '../types';
import { useBookmarks } from '../contexts/BookmarkContext';
import { useSettings } from '../contexts/SettingsContext';
import { JUZ_BOUNDARIES, JUZ_ARABIC_NAMES, SURAH_PAGES } from '../utils/constants';
import { toArabicNumerals } from '../utils/typography';
import { BookmarkIcon } from './Icons';

type NavigatorTab = 'surahs' | 'juz' | 'bookmarks';

interface MushafNavigatorProps {
  chapters: Chapter[];
  isOpen: boolean;
  onClose: () => void;
  onChapterSelect: (chapter: Chapter) => void;
  onVerseSelect: (chapterId: number, verseKey: string) => void;
  onBookmarkSelect: (bookmark: { chapterId: number; verseKey: string }) => void;
}

export default function MushafNavigator({
  chapters,
  isOpen,
  onClose,
  onChapterSelect,
  onVerseSelect,
  onBookmarkSelect,
}: MushafNavigatorProps) {
  const [activeTab, setActiveTab] = useState<NavigatorTab>('surahs');
  const { bookmarks } = useBookmarks();
  const { quranFont } = useSettings();
  const contentRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const dragStartY = useRef(0);
  const dragging = useRef(false);

  // Reset scroll when tab changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Swipe-down to close
  const handleDragStart = useCallback((clientY: number) => {
    dragStartY.current = clientY;
    dragging.current = true;
  }, []);

  const handleDragEnd = useCallback((clientY: number) => {
    if (!dragging.current) return;
    dragging.current = false;
    const dy = clientY - dragStartY.current;
    if (dy > 80) onClose();
    if (sheetRef.current) {
      sheetRef.current.style.transform = '';
    }
  }, [onClose]);

  const handleDragMove = useCallback((clientY: number) => {
    if (!dragging.current || !sheetRef.current) return;
    const dy = clientY - dragStartY.current;
    if (dy > 0) {
      sheetRef.current.style.transform = `translateY(${dy}px)`;
    }
  }, []);

  const handleChapterTap = (chapter: Chapter) => {
    onChapterSelect(chapter);
    onClose();
  };

  const handleJuzTap = (juz: typeof JUZ_BOUNDARIES[0]) => {
    const chapterId = parseInt(juz.verseKey.split(':')[0], 10);
    onVerseSelect(chapterId, juz.verseKey);
    onClose();
  };

  const handleBookmarkTap = (bookmark: Bookmark) => {
    onBookmarkSelect({ chapterId: bookmark.chapterId, verseKey: bookmark.verseKey });
    onClose();
  };

  const tabs: { id: NavigatorTab; label: string }[] = [
    { id: 'surahs', label: 'فهرس السور' },
    { id: 'juz', label: 'فهرس الأجزاء' },
    { id: 'bookmarks', label: 'العلامة المرجعية' },
  ];

  return (
    <div
      className={`fixed inset-0 z-[95] transition-all duration-300 ${isOpen ? 'visible' : 'invisible pointer-events-none'}`}
      role="dialog"
      aria-modal="true"
      aria-label="فهرس القرآن"
    >
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div
        ref={sheetRef}
        className={`absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 rounded-t-[28px] shadow-2xl border-t border-zinc-200 dark:border-zinc-800 flex flex-col transition-transform duration-300 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight: '70vh' }}
      >
        {/* Drag Handle */}
        <div
          className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing touch-none"
          onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
          onTouchMove={(e) => handleDragMove(e.touches[0].clientY)}
          onTouchEnd={(e) => handleDragEnd(e.changedTouches[0].clientY)}
          onMouseDown={(e) => handleDragStart(e.clientY)}
          onMouseMove={(e) => { if (dragging.current) handleDragMove(e.clientY); }}
          onMouseUp={(e) => handleDragEnd(e.clientY)}
        >
          <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-full" />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 px-4 pb-4 justify-center flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-full text-sm font-sans font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Content */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto px-4 pb-8 overscroll-contain"
          style={{ maxHeight: 'calc(70vh - 100px)' }}
        >
          {/* Surah Index */}
          {activeTab === 'surahs' && (
            <div className="space-y-0.5">
              {chapters.map(chapter => (
                <button
                  key={chapter.id}
                  onClick={() => handleChapterTap(chapter)}
                  className="w-full text-right p-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors active:scale-[0.98]"
                >
                  <h3
                    className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-1"
                    style={{ fontFamily: quranFont }}
                  >
                    سُورَةُ {chapter.name_arabic}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans">
                    صفحة {SURAH_PAGES[chapter.id - 1] || 1} - عدد الآيات {toArabicNumerals(chapter.verses_count)} - {chapter.revelation_place === 'makkah' ? 'مكية' : 'مدنية'}
                  </p>
                </button>
              ))}
            </div>
          )}

          {/* Juz Index */}
          {activeTab === 'juz' && (
            <div className="space-y-0.5">
              {JUZ_BOUNDARIES.map((juz, index) => (
                <button
                  key={juz.juz}
                  onClick={() => handleJuzTap(juz)}
                  className="w-full text-right p-5 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors active:scale-[0.98]"
                >
                  <h3
                    className="text-xl font-bold text-zinc-900 dark:text-zinc-100"
                    style={{ fontFamily: quranFont }}
                  >
                    {JUZ_ARABIC_NAMES[index]}
                  </h3>
                </button>
              ))}
            </div>
          )}

          {/* Bookmarks */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-0.5">
              {bookmarks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
                  <BookmarkIcon size={32} className="text-zinc-300 dark:text-zinc-700" />
                  <p className="text-zinc-500 dark:text-zinc-400 font-sans text-sm">
                    لا توجد علامات مرجعية محفوظة
                  </p>
                </div>
              ) : (
                bookmarks.map(bookmark => (
                  <button
                    key={bookmark.id}
                    onClick={() => handleBookmarkTap(bookmark)}
                    className="w-full flex items-center gap-3 p-4 rounded-xl text-right hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors active:scale-[0.98]"
                  >
                    <BookmarkIcon size={22} filled className="text-amber-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3
                        className="text-lg font-bold text-zinc-900 dark:text-zinc-100 truncate"
                        style={{ fontFamily: quranFont }}
                      >
                        سُورَةُ {bookmark.chapterName}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-sans mt-0.5">
                        الآية {bookmark.verseKey.split(':')[1]}
                      </p>
                    </div>
                    <span className="text-xs text-zinc-400 dark:text-zinc-600 font-sans flex-shrink-0">
                      {toArabicNumerals(parseInt(bookmark.verseKey.split(':')[0], 10))}
                    </span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
