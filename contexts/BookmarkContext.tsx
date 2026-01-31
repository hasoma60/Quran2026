import React, { createContext, useContext, useState, useCallback } from 'react';
import { Bookmark, BookmarkCategory, Verse, Chapter, VerseNote } from '../types';
import { safeGetItem, safeSetItem } from '../utils/localStorage';

interface BookmarkContextValue {
  bookmarks: Bookmark[];
  toggleBookmark: (verse: Verse, chapter: Chapter, category?: BookmarkCategory) => boolean;
  updateBookmarkCategory: (id: string, category: BookmarkCategory) => void;
  deleteBookmark: (id: string) => void;
  isBookmarked: (verseKey: string) => boolean;
  getBookmarksByCategory: (category: BookmarkCategory) => Bookmark[];
  // Notes
  notes: VerseNote[];
  addNote: (verseKey: string, chapterId: number, chapterName: string, verseText: string, note: string) => void;
  updateNote: (id: string, note: string) => void;
  deleteNote: (id: string) => void;
  getNoteForVerse: (verseKey: string) => VerseNote | undefined;
}

const BookmarkContext = createContext<BookmarkContextValue | null>(null);

export function useBookmarks() {
  const ctx = useContext(BookmarkContext);
  if (!ctx) throw new Error('useBookmarks must be used within BookmarkProvider');
  return ctx;
}

// Migrate old bookmarks without category
function migrateBookmarks(bookmarks: Bookmark[]): Bookmark[] {
  return bookmarks.map(b => ({
    ...b,
    category: b.category || 'general',
  }));
}

export function BookmarkProvider({ children }: { children: React.ReactNode }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() =>
    migrateBookmarks(safeGetItem<Bookmark[]>('bookmarks', []))
  );
  const [notes, setNotes] = useState<VerseNote[]>(() =>
    safeGetItem<VerseNote[]>('verseNotes', [])
  );

  const persistBookmarks = (updated: Bookmark[]) => {
    setBookmarks(updated);
    safeSetItem('bookmarks', updated);
  };

  const persistNotes = (updated: VerseNote[]) => {
    setNotes(updated);
    safeSetItem('verseNotes', updated);
  };

  const toggleBookmark = useCallback((verse: Verse, chapter: Chapter, category: BookmarkCategory = 'general'): boolean => {
    const exists = bookmarks.some(b => b.verseKey === verse.verse_key);
    if (exists) {
      persistBookmarks(bookmarks.filter(b => b.verseKey !== verse.verse_key));
      return false; // removed
    } else {
      const newBookmark: Bookmark = {
        id: verse.verse_key,
        verseKey: verse.verse_key,
        chapterId: chapter.id,
        chapterName: chapter.name_arabic,
        text: verse.text_uthmani,
        timestamp: Date.now(),
        category,
      };
      persistBookmarks([newBookmark, ...bookmarks]);
      return true; // added
    }
  }, [bookmarks]);

  const updateBookmarkCategory = useCallback((id: string, category: BookmarkCategory) => {
    persistBookmarks(bookmarks.map(b => b.id === id ? { ...b, category } : b));
  }, [bookmarks]);

  const deleteBookmark = useCallback((id: string) => {
    persistBookmarks(bookmarks.filter(b => b.id !== id));
  }, [bookmarks]);

  const isBookmarked = useCallback((verseKey: string) => {
    return bookmarks.some(b => b.verseKey === verseKey);
  }, [bookmarks]);

  const getBookmarksByCategory = useCallback((category: BookmarkCategory) => {
    return bookmarks.filter(b => b.category === category);
  }, [bookmarks]);

  // Notes
  const addNote = useCallback((verseKey: string, chapterId: number, chapterName: string, verseText: string, note: string) => {
    const existing = notes.find(n => n.verseKey === verseKey);
    if (existing) {
      persistNotes(notes.map(n => n.verseKey === verseKey ? { ...n, note, updatedAt: Date.now() } : n));
    } else {
      const newNote: VerseNote = {
        id: `note-${verseKey}-${Date.now()}`,
        verseKey, chapterId, chapterName, verseText, note,
        createdAt: Date.now(), updatedAt: Date.now(),
      };
      persistNotes([newNote, ...notes]);
    }
  }, [notes]);

  const updateNote = useCallback((id: string, note: string) => {
    persistNotes(notes.map(n => n.id === id ? { ...n, note, updatedAt: Date.now() } : n));
  }, [notes]);

  const deleteNote = useCallback((id: string) => {
    persistNotes(notes.filter(n => n.id !== id));
  }, [notes]);

  const getNoteForVerse = useCallback((verseKey: string) => {
    return notes.find(n => n.verseKey === verseKey);
  }, [notes]);

  return (
    <BookmarkContext.Provider value={{
      bookmarks, toggleBookmark, updateBookmarkCategory, deleteBookmark, isBookmarked, getBookmarksByCategory,
      notes, addNote, updateNote, deleteNote, getNoteForVerse,
    }}>
      {children}
    </BookmarkContext.Provider>
  );
}
