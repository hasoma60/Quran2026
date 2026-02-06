import type { ReactNode } from 'react';

// =============================================
// Quran API Types
// =============================================

export interface Chapter {
  id: number;
  revelation_place: string;
  revelation_order: number;
  bismillah_pre: boolean;
  name_simple: string;
  name_complex: string;
  name_arabic: string;
  verses_count: number;
  translated_name: {
    language_name: string;
    name: string;
  };
}

export interface Verse {
  id: number;
  verse_key: string;
  text_uthmani: string;
  translations?: Array<{
    id: number;
    resource_id: number;
    text: string;
  }>;
  words?: Array<{
    id: number;
    position: number;
    text_uthmani: string;
    translation: { text: string };
    transliteration: { text: string };
  }>;
}

export interface SearchResult {
  verse_key: string;
  text: string;
  translations?: Array<{ text: string }>;
}

export interface SearchResponse {
  search: {
    query: string;
    total_results: number;
    results: SearchResult[];
  };
}

// =============================================
// Tafsir Types
// =============================================

export interface TafsirOption {
  id: number;
  name: string;
  author: string;
}

// =============================================
// Navigation Types
// =============================================

export enum View {
  HOME = 'HOME',
  READER = 'READER',
  AI_CHAT = 'AI_CHAT',
  SETTINGS = 'SETTINGS',
  BOOKMARKS = 'BOOKMARKS',
  JUZ_NAVIGATOR = 'JUZ_NAVIGATOR',
  KHATMAH = 'KHATMAH',
  NOTES = 'NOTES',
  MEMORIZATION = 'MEMORIZATION',
  STATS = 'STATS',
  THEMATIC = 'THEMATIC',
}

// =============================================
// Bookmark Types
// =============================================

export type BookmarkCategory = 'general' | 'dua' | 'stories' | 'rulings' | 'favorite' | 'memorize';

export const BOOKMARK_CATEGORIES: { id: BookmarkCategory; label: string; color: string }[] = [
  { id: 'general', label: 'عام', color: '#a3a3a3' },
  { id: 'favorite', label: 'مفضلة', color: '#f59e0b' },
  { id: 'dua', label: 'أدعية', color: '#10b981' },
  { id: 'stories', label: 'قصص', color: '#3b82f6' },
  { id: 'rulings', label: 'أحكام', color: '#8b5cf6' },
  { id: 'memorize', label: 'حفظ', color: '#ef4444' },
];

export interface Bookmark {
  id: string;
  verseKey: string;
  chapterId: number;
  chapterName: string;
  text: string;
  timestamp: number;
  category: BookmarkCategory;
  note?: string;
}

// =============================================
// Notes Types
// =============================================

export interface VerseNote {
  id: string;
  verseKey: string;
  chapterId: number;
  chapterName: string;
  verseText: string;
  note: string;
  createdAt: number;
  updatedAt: number;
}

// =============================================
// Audio / Reciter Types
// =============================================

export interface ReciterInfo {
  id: number;
  chapterRecitationId: number;
  verseRecitationId: number;
  name: string;
  nameArabic: string;
  style?: string;
}

// =============================================
// Theme & Appearance Types
// =============================================

export type Theme = 'light' | 'dark' | 'system' | 'sepia';
export type QuranFont = 'Amiri' | 'Scheherazade New' | 'Noto Naskh Arabic' | 'Lateef';
export type LineHeight = 'compact' | 'normal' | 'loose';
export type ReadingMode = 'flowing' | 'mushaf';

// =============================================
// Reading Progress Types
// =============================================

export interface ReadingProgress {
  chapterId: number;
  lastVerseKey: string;
  lastReadAt: number;
  versesRead: number;
  totalVerses: number;
}

// =============================================
// Khatmah (Reading Plan) Types
// =============================================

export interface KhatmahPlan {
  id: string;
  name: string;
  totalDays: number;
  startDate: number;
  completedDays: Record<string, boolean>; // date string -> completed
  currentDay: number;
  dailyTarget: { fromVerse: string; toVerse: string }[];
}

// =============================================
// Juz/Hizb Types
// =============================================

export interface JuzInfo {
  id: number;
  juzNumber: number;
  firstVerseKey: string;
  lastVerseKey: string;
  versesCount: number;
  chapterIds: number[];
}

// =============================================
// Toast / Notification Types
// =============================================

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// =============================================
// UI Component Types
// =============================================

export interface SkeletonProps {
  className?: string;
  count?: number;
}

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export type ReadingViewMode = 'flowing' | 'mushaf' | 'focus';

// =============================================
// Search Filter Types
// =============================================

export interface SearchFilter {
  surahRange?: { from: number; to: number };
  revelationType?: 'makkah' | 'madinah' | 'all';
  juzNumber?: number;
  searchIn?: 'quran' | 'translation' | 'both';
}

// =============================================
// Thematic Index Types
// =============================================

export interface ThematicTopic {
  id: string;
  name: string;
  icon: string;
  description: string;
  verses: string[]; // verse keys
}

// =============================================
// Statistics Types
// =============================================

export interface QuranStatistic {
  totalVersesRead: number;
  totalTimeSpent: number; // minutes
  chaptersCompleted: number;
  currentStreak: number;
  longestStreak: number;
  favoriteChapter?: number;
  lastReadDate: string;
}

// =============================================
// Gemini / AI Types
// =============================================

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

// =============================================
// Prayer Times Types
// =============================================

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  date: string;
}

// =============================================
// Night Mode Schedule Types
// =============================================

export interface NightModeSchedule {
  enabled: boolean;
  startHour: number;
  endHour: number;
}

// =============================================
// Export/Import Types
// =============================================

export interface AppExportData {
  version: string;
  exportDate: number;
  bookmarks: Bookmark[];
  notes: VerseNote[];
  readingProgress: Record<number, ReadingProgress>;
  settings: Record<string, unknown>;
}
