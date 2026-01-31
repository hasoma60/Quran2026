import { ReciterInfo, ThematicTopic } from '../types';

// =============================================
// API Constants
// =============================================

export const QURAN_API_BASE_URL = 'https://api.quran.com/api/v4';
export const DEFAULT_RECITER_ID = 7; // Mishary Rashid Alafasy
export const DEFAULT_TAFSIR_ID = 169; // Al-Sadi
export const INLINE_TRANSLATION_ID = 16; // Al-Muyassar
export const VERSES_PER_PAGE = 300;
export const SEARCH_DEBOUNCE_MS = 600;
export const SEARCH_MIN_LENGTH = 2;
export const AI_CONTEXT_HISTORY_LIMIT = 3;

// =============================================
// Appearance Constants
// =============================================

export const FONT_SIZE_MIN = 20;
export const FONT_SIZE_MAX = 60;
export const DEFAULT_FONT_SIZE = 32;
export const DEFAULT_FONT = 'Amiri';
export const DEFAULT_LINE_HEIGHT = 'normal';
export const DEFAULT_THEME = 'system';

// =============================================
// Quran Structure Constants
// =============================================

export const TOTAL_CHAPTERS = 114;
export const TOTAL_VERSES = 6236;
export const TOTAL_JUZ = 30;
export const TOTAL_HIZB = 60;
export const TOTAL_PAGES = 604;

// =============================================
// Reciter List
// =============================================

export const RECITERS: ReciterInfo[] = [
  { id: 7, chapterRecitationId: 7, verseRecitationId: 7, name: 'Mishary Rashid Alafasy', nameArabic: 'مشاري راشد العفاسي', style: 'حدر' },
  { id: 1, chapterRecitationId: 1, verseRecitationId: 1, name: 'AbdulBaset AbdulSamad', nameArabic: 'عبدالباسط عبدالصمد', style: 'مجود' },
  { id: 6, chapterRecitationId: 6, verseRecitationId: 6, name: 'Mahmoud Khalil Al-Husary', nameArabic: 'محمود خليل الحصري', style: 'مرتل' },
  { id: 5, chapterRecitationId: 52, verseRecitationId: 0, name: 'Maher Al-Muaiqly', nameArabic: 'ماهر المعيقلي', style: 'حدر' },
  { id: 3, chapterRecitationId: 13, verseRecitationId: 0, name: 'Saad Al-Ghamdi', nameArabic: 'سعد الغامدي', style: 'حدر' },
  { id: 2, chapterRecitationId: 3, verseRecitationId: 3, name: 'Abdul Rahman Al-Sudais', nameArabic: 'عبدالرحمن السديس', style: 'حدر' },
  { id: 10, chapterRecitationId: 10, verseRecitationId: 10, name: 'Saud Al-Shuraim', nameArabic: 'سعود الشريم', style: 'حدر' },
  { id: 4, chapterRecitationId: 4, verseRecitationId: 4, name: 'Abu Bakr Al-Shatri', nameArabic: 'أبو بكر الشاطري', style: 'حدر' },
  { id: 9, chapterRecitationId: 5, verseRecitationId: 5, name: 'Hani Ar-Rifai', nameArabic: 'هاني الرفاعي', style: 'حدر' },
  { id: 12, chapterRecitationId: 104, verseRecitationId: 0, name: 'Nasser Al Qatami', nameArabic: 'ناصر القطامي', style: 'حدر' },
];

export function getReciterApiIds(internalId: number): { chapterApiId: number; verseApiId: number } {
  const reciter = RECITERS.find(r => r.id === internalId);
  if (!reciter) return { chapterApiId: DEFAULT_RECITER_ID, verseApiId: DEFAULT_RECITER_ID };
  return { chapterApiId: reciter.chapterRecitationId, verseApiId: reciter.verseRecitationId };
}

// =============================================
// Tafsir Sources
// =============================================

export const TAFSIR_IDS = {
  AL_SADI: 169,
  AL_MUYASSAR: 16,
  IBN_KATHIR: 160,
  AL_BAGHAWI: 166,
} as const;

// =============================================
// Juz Boundaries (first verse of each Juz)
// =============================================

export const JUZ_BOUNDARIES: { juz: number; verseKey: string; name: string }[] = [
  { juz: 1, verseKey: '1:1', name: 'الفاتحة' },
  { juz: 2, verseKey: '2:142', name: 'سيقول' },
  { juz: 3, verseKey: '2:253', name: 'تلك الرسل' },
  { juz: 4, verseKey: '3:93', name: 'لن تنالوا' },
  { juz: 5, verseKey: '4:24', name: 'والمحصنات' },
  { juz: 6, verseKey: '4:148', name: 'لا يحب الله' },
  { juz: 7, verseKey: '5:82', name: 'لتجدن' },
  { juz: 8, verseKey: '6:111', name: 'ولو أننا' },
  { juz: 9, verseKey: '7:88', name: 'قال الملأ' },
  { juz: 10, verseKey: '8:41', name: 'واعلموا' },
  { juz: 11, verseKey: '9:93', name: 'يعتذرون' },
  { juz: 12, verseKey: '11:6', name: 'وما من دابة' },
  { juz: 13, verseKey: '12:53', name: 'وما أبرئ' },
  { juz: 14, verseKey: '15:1', name: 'الحجر' },
  { juz: 15, verseKey: '17:1', name: 'سبحان الذي' },
  { juz: 16, verseKey: '18:75', name: 'قال ألم' },
  { juz: 17, verseKey: '21:1', name: 'اقترب للناس' },
  { juz: 18, verseKey: '23:1', name: 'قد أفلح' },
  { juz: 19, verseKey: '25:21', name: 'وقال الذين' },
  { juz: 20, verseKey: '27:56', name: 'أمن خلق' },
  { juz: 21, verseKey: '29:46', name: 'اتل ما أوحي' },
  { juz: 22, verseKey: '33:31', name: 'ومن يقنت' },
  { juz: 23, verseKey: '36:28', name: 'وما أنزلنا' },
  { juz: 24, verseKey: '39:32', name: 'فمن أظلم' },
  { juz: 25, verseKey: '41:47', name: 'إليه يرد' },
  { juz: 26, verseKey: '46:1', name: 'حم' },
  { juz: 27, verseKey: '51:31', name: 'قال فما' },
  { juz: 28, verseKey: '58:1', name: 'قد سمع' },
  { juz: 29, verseKey: '67:1', name: 'تبارك' },
  { juz: 30, verseKey: '78:1', name: 'عم' },
];

// =============================================
// Thematic Index Topics
// =============================================

export const THEMATIC_TOPICS: ThematicTopic[] = [
  {
    id: 'paradise',
    name: 'الجنة ونعيمها',
    icon: '🌴',
    description: 'آيات تصف الجنة ونعيمها وأهلها',
    verses: ['2:25', '3:15', '3:133', '3:136', '4:57', '9:72', '10:9', '13:35', '18:31', '22:23', '36:55', '37:43', '38:50', '43:71', '44:51', '47:15', '55:46', '55:54', '56:15', '76:12'],
  },
  {
    id: 'prophets',
    name: 'قصص الأنبياء',
    icon: '📖',
    description: 'آيات تذكر قصص الأنبياء والمرسلين',
    verses: ['2:124', '2:246', '3:33', '6:84', '7:59', '7:65', '7:73', '7:85', '10:71', '11:25', '11:50', '11:61', '11:84', '12:4', '14:35', '15:51', '19:16', '19:41', '19:51', '21:51', '21:68', '21:76', '21:83', '26:10', '27:15', '28:7', '37:75', '37:99', '37:123', '38:17'],
  },
  {
    id: 'dua',
    name: 'الأدعية القرآنية',
    icon: '🤲',
    description: 'الأدعية المذكورة في القرآن الكريم',
    verses: ['1:5', '1:6', '2:127', '2:128', '2:201', '2:250', '2:286', '3:8', '3:16', '3:26', '3:147', '3:191', '3:193', '3:194', '7:23', '7:89', '7:126', '7:155', '10:85', '10:86', '14:35', '14:38', '14:40', '14:41', '17:24', '17:80', '20:114', '23:29', '23:97', '23:109', '23:118', '25:65', '25:74', '27:19', '40:7', '46:15', '59:10', '60:4', '66:8', '71:28'],
  },
  {
    id: 'rulings',
    name: 'آيات الأحكام',
    icon: '⚖️',
    description: 'الآيات المتعلقة بالأحكام الشرعية',
    verses: ['2:183', '2:185', '2:196', '2:219', '2:222', '2:226', '2:228', '2:233', '2:234', '2:275', '2:282', '4:3', '4:7', '4:11', '4:12', '4:23', '4:24', '4:34', '4:43', '4:92', '4:101', '4:176', '5:1', '5:3', '5:5', '5:6', '5:33', '5:38', '5:45', '5:89', '5:90', '24:2', '24:4', '24:30', '24:31', '33:49', '33:53', '65:1', '65:4', '65:6'],
  },
  {
    id: 'tawheed',
    name: 'التوحيد وأسماء الله',
    icon: '✨',
    description: 'آيات التوحيد وأسماء الله الحسنى',
    verses: ['2:163', '2:255', '3:2', '3:18', '6:3', '7:180', '17:110', '20:8', '21:22', '23:91', '28:70', '35:3', '39:4', '40:65', '42:11', '57:3', '59:22', '59:23', '59:24', '112:1', '112:2', '112:3', '112:4'],
  },
  {
    id: 'afterlife',
    name: 'اليوم الآخر',
    icon: '⏳',
    description: 'آيات تصف يوم القيامة والحساب',
    verses: ['6:73', '14:48', '18:47', '20:102', '22:1', '22:2', '22:7', '23:99', '23:100', '27:87', '36:51', '39:67', '39:68', '50:20', '50:22', '54:6', '56:1', '69:13', '70:8', '73:14', '75:7', '78:17', '79:34', '80:33', '81:1', '82:1', '84:1', '99:1', '100:9', '101:1'],
  },
  {
    id: 'science',
    name: 'الإعجاز العلمي',
    icon: '🔬',
    description: 'آيات فيها إشارات علمية',
    verses: ['2:22', '10:5', '13:2', '16:15', '16:66', '16:68', '16:69', '21:30', '21:33', '23:12', '23:13', '23:14', '24:40', '24:43', '25:53', '27:88', '30:48', '31:10', '36:36', '36:38', '36:40', '39:5', '41:11', '51:47', '51:49', '55:19', '55:33', '57:25', '67:3', '71:15', '71:16', '78:6', '78:7', '86:11', '86:12'],
  },
  {
    id: 'patience',
    name: 'الصبر والتوكل',
    icon: '💪',
    description: 'آيات عن الصبر والثبات والتوكل على الله',
    verses: ['2:45', '2:153', '2:155', '2:156', '2:157', '3:17', '3:120', '3:125', '3:159', '3:186', '3:200', '7:128', '8:46', '10:109', '11:115', '12:18', '12:83', '13:22', '14:12', '16:42', '16:96', '16:127', '20:130', '29:59', '31:17', '38:44', '39:10', '40:55', '41:35', '42:43', '46:35', '65:3', '70:5', '73:10', '103:3'],
  },
];

// =============================================
// Translation Sources
// =============================================

export const TRANSLATION_OPTIONS = [
  { id: 16, name: 'التفسير الميسر', language: 'ar' },
  { id: 131, name: 'Sahih International', language: 'en' },
  { id: 20, name: 'Pickthall', language: 'en' },
  { id: 22, name: 'Yusuf Ali', language: 'en' },
  { id: 97, name: 'Maulana Maududi', language: 'ur' },
  { id: 77, name: 'Diyanet İşleri', language: 'tr' },
  { id: 136, name: 'Muhammad Hamidullah', language: 'fr' },
  { id: 33, name: 'Kemenag', language: 'id' },
];

// =============================================
// App Info
// =============================================

export const APP_VERSION = '3.0.0';
export const APP_NAME = 'نور القرآن';
