import { Chapter, Verse, SearchResult, TafsirOption } from '../types';
import { QURAN_API_BASE, DEFAULT_TRANSLATION_ID, MAX_VERSES_PER_PAGE, SEARCH_RESULTS_LIMIT, MIN_SEARCH_LENGTH } from '../constants';

export const TAFSIR_OPTIONS: TafsirOption[] = [
  { id: 169, name: 'تفسير السعدي', author: 'عبدالرحمن السعدي' },
  { id: 16, name: 'التفسير الميسر', author: 'نخبة من العلماء' },
  { id: 160, name: 'تفسير ابن كثير', author: 'ابن كثير' },
  { id: 166, name: 'تفسير البغوي', author: 'البغوي' }
];

// In-memory cache
const versesCache = new Map<string, Verse[]>();
const chaptersCache: { data: Chapter[] | null } = { data: null };

export const fetchChapters = async (): Promise<Chapter[]> => {
  if (chaptersCache.data) return chaptersCache.data;
  try {
    const response = await fetch(`${QURAN_API_BASE}/chapters?language=ar`);
    if (!response.ok) throw new Error('Failed to fetch chapters');
    const data = await response.json();
    chaptersCache.data = data.chapters;
    return data.chapters;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchVerses = async (chapterId: number, tajweed: boolean = false): Promise<Verse[]> => {
  const cacheKey = `${chapterId}-${tajweed}`;
  if (versesCache.has(cacheKey)) return versesCache.get(cacheKey)!;
  try {
    const fields = tajweed ? 'text_uthmani,text_uthmani_tajweed' : 'text_uthmani';
    const response = await fetch(
      `${QURAN_API_BASE}/verses/by_chapter/${chapterId}?language=ar&words=false&translations=${DEFAULT_TRANSLATION_ID}&fields=${fields}&per_page=${MAX_VERSES_PER_PAGE}`
    );
    if (!response.ok) throw new Error('Failed to fetch verses');
    const data = await response.json();
    versesCache.set(cacheKey, data.verses);
    return data.verses;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchVersesWithWords = async (chapterId: number): Promise<Verse[]> => {
  const cacheKey = `words-${chapterId}`;
  if (versesCache.has(cacheKey)) return versesCache.get(cacheKey)!;
  try {
    const response = await fetch(
      `${QURAN_API_BASE}/verses/by_chapter/${chapterId}?language=ar&words=true&word_fields=text_uthmani,translation&translations=${DEFAULT_TRANSLATION_ID}&fields=text_uthmani&per_page=${MAX_VERSES_PER_PAGE}`
    );
    if (!response.ok) throw new Error('Failed to fetch verses with words');
    const data = await response.json();
    versesCache.set(cacheKey, data.verses);
    return data.verses;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchVersesByPage = async (pageNumber: number): Promise<Verse[]> => {
  const cacheKey = `page-${pageNumber}`;
  if (versesCache.has(cacheKey)) return versesCache.get(cacheKey)!;
  try {
    const response = await fetch(
      `${QURAN_API_BASE}/verses/by_page/${pageNumber}?language=ar&words=false&translations=${DEFAULT_TRANSLATION_ID}&fields=text_uthmani&per_page=${MAX_VERSES_PER_PAGE}`
    );
    if (!response.ok) throw new Error('Failed to fetch page');
    const data = await response.json();
    versesCache.set(cacheKey, data.verses);
    return data.verses;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchVersesByJuz = async (juzNumber: number): Promise<Verse[]> => {
  const cacheKey = `juz-${juzNumber}`;
  if (versesCache.has(cacheKey)) return versesCache.get(cacheKey)!;
  try {
    const response = await fetch(
      `${QURAN_API_BASE}/verses/by_juz/${juzNumber}?language=ar&words=false&translations=${DEFAULT_TRANSLATION_ID}&fields=text_uthmani&per_page=${MAX_VERSES_PER_PAGE}`
    );
    if (!response.ok) throw new Error('Failed to fetch juz');
    const data = await response.json();
    versesCache.set(cacheKey, data.verses);
    return data.verses;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchTafsirContent = async (tafsirId: number, verseKey: string): Promise<string> => {
  try {
    const response = await fetch(`${QURAN_API_BASE}/tafsirs/${tafsirId}/by_ayah/${verseKey}`);
    if (!response.ok) throw new Error('Failed to fetch tafsir');
    const data = await response.json();
    return data.tafsir.text;
  } catch (error) {
    console.error(error);
    return "تعذر تحميل التفسير. يرجى التأكد من الاتصال بالإنترنت.";
  }
};

export const fetchChapterAudio = async (chapterId: number, reciterId: number = 7) => {
  try {
    const response = await fetch(`${QURAN_API_BASE}/chapter_recitations/${reciterId}/${chapterId}`);
    if (!response.ok) throw new Error("Failed to fetch audio");
    const data = await response.json();
    return data.audio_file.audio_url;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export const fetchVerseOfDay = async (): Promise<{ verse: Verse; chapterId: number } | null> => {
  try {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
    );
    const chapterId = (dayOfYear % 114) + 1;
    const verses = await fetchVerses(chapterId);
    const verseIndex = dayOfYear % Math.max(verses.length, 1);
    return verses[verseIndex] ? { verse: verses[verseIndex], chapterId } : null;
  } catch {
    return null;
  }
};

export const fetchRandomVerse = async (): Promise<Verse | null> => {
  try {
    const randomChapter = Math.floor(Math.random() * 114) + 1;
    const verses = await fetchVerses(randomChapter);
    return verses[Math.floor(Math.random() * verses.length)] || null;
  } catch {
    return null;
  }
};

export const searchGlobal = async (query: string): Promise<SearchResult[]> => {
  try {
    const cleanQuery = query?.trim();
    if (!cleanQuery || cleanQuery.length < MIN_SEARCH_LENGTH) return [];
    const response = await fetch(
      `${QURAN_API_BASE}/search?q=${encodeURIComponent(cleanQuery)}&size=${SEARCH_RESULTS_LIMIT}&page=1&language=ar`
    );
    if (!response.ok) return [];
    const text = await response.text();
    if (!text) return [];
    try {
      const data = JSON.parse(text);
      return data.search?.results || [];
    } catch {
      return [];
    }
  } catch {
    return [];
  }
};

export const fetchPrayerTimes = async (latitude: number, longitude: number): Promise<any> => {
  try {
    const today = new Date();
    const dateStr = `${today.getDate()}-${today.getMonth() + 1}-${today.getFullYear()}`;
    const response = await fetch(
      `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=4`
    );
    if (!response.ok) throw new Error('Failed to fetch prayer times');
    const data = await response.json();
    return data.data.timings;
  } catch {
    return null;
  }
};
