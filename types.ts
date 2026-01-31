// Quran API Types
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

export interface Word {
  id: number;
  position: number;
  text_uthmani: string;
  translation: { text: string; language_name: string };
  transliteration: { text: string };
}

export interface Verse {
  id: number;
  verse_key: string;
  verse_number: number;
  text_uthmani: string;
  text_uthmani_tajweed?: string;
  words?: Word[];
  translations?: Array<{
    id: number;
    resource_id: number;
    text: string;
  }>;
}

export interface RecitationResponse {
  audio_files: Array<{
    verse_key: string;
    url: string;
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

// Tafsir Types
export interface TafsirOption {
  id: number;
  name: string;
  author: string;
}

// App View Enum
export enum View {
  HOME = 'HOME',
  READER = 'READER',
  AI_CHAT = 'AI_CHAT',
  SETTINGS = 'SETTINGS',
  BOOKMARKS = 'BOOKMARKS'
}

// Bookmark Types
export interface Bookmark {
  id: string;
  verseKey: string;
  chapterId: number;
  chapterName: string;
  text: string;
  timestamp: number;
  collectionId: string;
}

export interface BookmarkCollection {
  id: string;
  name: string;
  color: string;
}

// Chat
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

// Theme & Appearance
export type Theme = 'light' | 'dark' | 'system';
export type QuranFont = 'Amiri' | 'Scheherazade New' | 'Noto Naskh Arabic' | 'Lateef';
export type LineHeight = 'compact' | 'normal' | 'loose';

// Reciter
export interface Reciter {
  id: number;
  name: string;
  nameEn: string;
}

// Reading Progress
export interface LastRead {
  chapterId: number;
  verseKey: string;
  chapterName: string;
  timestamp: number;
}

// Khatma (Reading Plan)
export interface KhatmaProgress {
  completedChapters: number[];
  startDate: number;
  targetDays: number;
}

// Search Filter
export interface SearchFilter {
  revelationType: 'all' | 'makkah' | 'madinah';
}

// Audio Controls (prop group)
export interface AudioControls {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackSpeed: number;
  currentChapterId: number | null;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onSpeedChange: (speed: number) => void;
}

// Prayer Times
export interface PrayerTimes {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}
