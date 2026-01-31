// API Configuration
export const QURAN_API_BASE = 'https://api.quran.com/api/v4';
export const ALADHAN_API_BASE = 'https://api.aladhan.com/v1';

// Default Values
export const DEFAULT_RECITER_ID = 7;
export const DEFAULT_TAFSIR_ID = 169;
export const DEFAULT_TRANSLATION_ID = 16;
export const DEFAULT_FONT_SIZE = 32;

// Limits
export const MAX_VERSES_PER_PAGE = 300;
export const SEARCH_RESULTS_LIMIT = 20;
export const SEARCH_DEBOUNCE_MS = 600;
export const SCROLL_DELAY_MS = 500;
export const MIN_SEARCH_LENGTH = 2;
export const AI_CONTEXT_MESSAGES = 3;
export const MAX_TAFSIR_CONTEXT_LENGTH = 500;
export const TOTAL_QURAN_PAGES = 604;

// Reciters
export const RECITERS = [
  { id: 7, name: 'مشاري راشد العفاسي', nameEn: 'Mishary Alafasy' },
  { id: 1, name: 'عبد الباسط عبد الصمد', nameEn: 'Abdul Basit' },
  { id: 2, name: 'عبد الرحمن السديس', nameEn: 'Al-Sudais' },
  { id: 3, name: 'أبو بكر الشاطري', nameEn: 'Abu Bakr Al-Shatri' },
  { id: 4, name: 'سعد الغامدي', nameEn: 'Saad Al-Ghamdi' },
  { id: 5, name: 'محمد صديق المنشاوي', nameEn: 'Al-Minshawi' },
  { id: 6, name: 'محمود خليل الحصري', nameEn: 'Al-Husary' },
  { id: 10, name: 'ماهر المعيقلي', nameEn: 'Maher Al-Muaiqly' },
  { id: 9, name: 'هاني الرفاعي', nameEn: 'Hani Ar-Rifai' },
  { id: 12, name: 'ياسر الدوسري', nameEn: 'Yasser Al-Dosari' },
];

// Playback Speeds
export const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

// Juz Data
export const JUZ_DATA = [
  { juz: 1, start: '1:1', startChapter: 1, name: 'الجزء الأول' },
  { juz: 2, start: '2:142', startChapter: 2, name: 'الجزء الثاني' },
  { juz: 3, start: '2:253', startChapter: 2, name: 'الجزء الثالث' },
  { juz: 4, start: '3:93', startChapter: 3, name: 'الجزء الرابع' },
  { juz: 5, start: '4:24', startChapter: 4, name: 'الجزء الخامس' },
  { juz: 6, start: '4:148', startChapter: 4, name: 'الجزء السادس' },
  { juz: 7, start: '5:83', startChapter: 5, name: 'الجزء السابع' },
  { juz: 8, start: '6:111', startChapter: 6, name: 'الجزء الثامن' },
  { juz: 9, start: '7:88', startChapter: 7, name: 'الجزء التاسع' },
  { juz: 10, start: '8:41', startChapter: 8, name: 'الجزء العاشر' },
  { juz: 11, start: '9:93', startChapter: 9, name: 'الجزء الحادي عشر' },
  { juz: 12, start: '11:6', startChapter: 11, name: 'الجزء الثاني عشر' },
  { juz: 13, start: '12:53', startChapter: 12, name: 'الجزء الثالث عشر' },
  { juz: 14, start: '15:1', startChapter: 15, name: 'الجزء الرابع عشر' },
  { juz: 15, start: '17:1', startChapter: 17, name: 'الجزء الخامس عشر' },
  { juz: 16, start: '18:75', startChapter: 18, name: 'الجزء السادس عشر' },
  { juz: 17, start: '21:1', startChapter: 21, name: 'الجزء السابع عشر' },
  { juz: 18, start: '23:1', startChapter: 23, name: 'الجزء الثامن عشر' },
  { juz: 19, start: '25:21', startChapter: 25, name: 'الجزء التاسع عشر' },
  { juz: 20, start: '27:56', startChapter: 27, name: 'الجزء العشرون' },
  { juz: 21, start: '29:46', startChapter: 29, name: 'الجزء الحادي والعشرون' },
  { juz: 22, start: '33:31', startChapter: 33, name: 'الجزء الثاني والعشرون' },
  { juz: 23, start: '36:28', startChapter: 36, name: 'الجزء الثالث والعشرون' },
  { juz: 24, start: '39:32', startChapter: 39, name: 'الجزء الرابع والعشرون' },
  { juz: 25, start: '41:47', startChapter: 41, name: 'الجزء الخامس والعشرون' },
  { juz: 26, start: '46:1', startChapter: 46, name: 'الجزء السادس والعشرون' },
  { juz: 27, start: '51:31', startChapter: 51, name: 'الجزء السابع والعشرون' },
  { juz: 28, start: '58:1', startChapter: 58, name: 'الجزء الثامن والعشرون' },
  { juz: 29, start: '67:1', startChapter: 67, name: 'الجزء التاسع والعشرون' },
  { juz: 30, start: '78:1', startChapter: 78, name: 'الجزء الثلاثون' },
];

// localStorage Keys
export const STORAGE_KEYS = {
  FONT_SIZE: 'fontSize',
  QURAN_FONT: 'quranFont',
  LINE_HEIGHT: 'lineHeight',
  THEME: 'theme',
  BOOKMARKS: 'bookmarks',
  SHOW_TRANSLATION: 'showTranslation',
  READING_PROGRESS: 'readingProgress',
  AI_CHAT_HISTORY: 'aiChatHistory',
  RECITER_ID: 'reciterId',
  NOTES: 'verseNotes',
  BOOKMARK_COLLECTIONS: 'bookmarkCollections',
  KHATMA: 'khatmaProgress',
  PLAYBACK_SPEED: 'playbackSpeed',
  LAST_READ: 'lastRead',
  TAJWEED_ENABLED: 'tajweedEnabled',
  MEMORIZE_DIFFICULTY: 'memorizeDifficulty',
} as const;
