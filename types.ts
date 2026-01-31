
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

export interface Verse {
  id: number;
  verse_key: string;
  text_uthmani: string;
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

// App State Types
export enum View {
  HOME = 'HOME',
  READER = 'READER',
  AI_CHAT = 'AI_CHAT',
  SETTINGS = 'SETTINGS',
  BOOKMARKS = 'BOOKMARKS'
}

export interface AppState {
  currentView: View;
  activeChapterId: number | null;
  activeVerseKey: string | null;
  darkMode: boolean;
  fontSize: number;
  showTranslation: boolean;
  reciterId: number; // Default 7 (Mishary)
}

// Bookmark Type
export interface Bookmark {
  id: string; // usually verse_key
  verseKey: string;
  chapterId: number;
  chapterName: string;
  text: string;
  timestamp: number;
}

// Theme Type
export type Theme = 'light' | 'dark' | 'system';

// Font Configuration Types
export type QuranFont = 'Amiri' | 'Scheherazade New' | 'Noto Naskh Arabic' | 'Lateef';
export type LineHeight = 'compact' | 'normal' | 'loose';

// Gemini Types
export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}
