
import { Chapter, Verse, SearchResult, TafsirOption } from '../types';
import { apiCache } from '../utils/cache';
import { QURAN_API_BASE_URL, VERSES_PER_PAGE, DEFAULT_RECITER_ID, INLINE_TRANSLATION_ID } from '../utils/constants';

const BASE_URL = QURAN_API_BASE_URL;

// Curated list of high-quality Tafsirs available in Quran.com API
export const TAFSIR_OPTIONS: TafsirOption[] = [
  { id: 169, name: 'تفسير السعدي', author: 'عبدالرحمن السعدي' },
  { id: 16, name: 'التفسير الميسر', author: 'نخبة من العلماء' },
  { id: 160, name: 'تفسير ابن كثير', author: 'ابن كثير' },
  { id: 166, name: 'تفسير البغوي', author: 'البغوي' },
];

export const fetchChapters = async (): Promise<Chapter[]> => {
  return apiCache.getOrFetch('chapters', async () => {
    try {
      const response = await fetch(`${BASE_URL}/chapters?language=ar`);
      if (!response.ok) throw new Error('Failed to fetch chapters');
      const data = await response.json();
      return data.chapters as Chapter[];
    } catch (error) {
      console.error(error);
      return [];
    }
  }, 60 * 60 * 1000); // Cache for 1 hour
};

export const fetchVerses = async (chapterId: number, translationIds: number[] = [INLINE_TRANSLATION_ID]): Promise<Verse[]> => {
  const cacheKey = `verses-${chapterId}-${translationIds.join(',')}`;
  return apiCache.getOrFetch(cacheKey, async () => {
    try {
      const translations = translationIds.join(',');
      const response = await fetch(
        `${BASE_URL}/verses/by_chapter/${chapterId}?language=ar&words=false&translations=${translations}&fields=text_uthmani&per_page=${VERSES_PER_PAGE}`
      );
      if (!response.ok) throw new Error('Failed to fetch verses');
      const data = await response.json();
      return data.verses as Verse[];
    } catch (error) {
      console.error(error);
      return [];
    }
  }, 30 * 60 * 1000); // Cache for 30 minutes
};

export const fetchVersesWithWords = async (chapterId: number): Promise<Verse[]> => {
  const cacheKey = `verses-words-${chapterId}`;
  return apiCache.getOrFetch(cacheKey, async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/verses/by_chapter/${chapterId}?language=ar&words=true&word_fields=text_uthmani,translation&translations=${INLINE_TRANSLATION_ID}&fields=text_uthmani&per_page=${VERSES_PER_PAGE}`
      );
      if (!response.ok) throw new Error('Failed to fetch verses with words');
      const data = await response.json();
      return data.verses as Verse[];
    } catch (error) {
      console.error(error);
      return [];
    }
  }, 30 * 60 * 1000);
};

export const fetchTafsirContent = async (tafsirId: number, verseKey: string): Promise<string> => {
  const cacheKey = `tafsir-${tafsirId}-${verseKey}`;
  return apiCache.getOrFetch(cacheKey, async () => {
    try {
      const response = await fetch(`${BASE_URL}/tafsirs/${tafsirId}/by_ayah/${verseKey}`);
      if (!response.ok) throw new Error('Failed to fetch tafsir');
      const data = await response.json();
      return data.tafsir.text as string;
    } catch (error) {
      console.error(error);
      return "تعذر تحميل التفسير. يرجى التأكد من الاتصال بالإنترنت.";
    }
  }, 60 * 60 * 1000);
};

export const fetchChapterAudio = async (chapterId: number, reciterId: number = DEFAULT_RECITER_ID): Promise<string | null> => {
  const cacheKey = `audio-chapter-${chapterId}-${reciterId}`;
  return apiCache.getOrFetch(cacheKey, async () => {
    try {
      const response = await fetch(`${BASE_URL}/chapter_recitations/${reciterId}/${chapterId}`);
      if (!response.ok) throw new Error("Failed to fetch audio");
      const data = await response.json();
      return data.audio_file.audio_url as string;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, 60 * 60 * 1000);
};

// Verse-level audio playback
export const fetchVerseAudio = async (verseKey: string, reciterId: number = DEFAULT_RECITER_ID): Promise<string | null> => {
  if (reciterId <= 0) return null; // Reciter not available at verse level
  const cacheKey = `audio-verse-${verseKey}-${reciterId}`;
  return apiCache.getOrFetch(cacheKey, async () => {
    try {
      const response = await fetch(`${BASE_URL}/recitations/${reciterId}/by_ayah/${verseKey}`);
      if (!response.ok) throw new Error("Failed to fetch verse audio");
      const data = await response.json();
      const audioFile = data.audio_files?.[0];
      if (audioFile?.url) {
        return audioFile.url.startsWith('http') ? audioFile.url : `https://audio.qurancdn.com/${audioFile.url}`;
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, 60 * 60 * 1000);
};

// Get a deterministic "verse of the day" based on date
export const fetchVerseOfTheDay = async (): Promise<{ verse: Verse; chapter: Chapter } | null> => {
  try {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
    const verseIndex = (dayOfYear * 17 + today.getFullYear()) % 6236;

    const chapters = await fetchChapters();
    let accumulated = 0;
    for (const ch of chapters) {
      if (accumulated + ch.verses_count > verseIndex) {
        const verseNum = verseIndex - accumulated + 1;
        const verseKey = `${ch.id}:${verseNum}`;
        const response = await fetch(
          `${BASE_URL}/verses/by_key/${verseKey}?language=ar&words=false&translations=${INLINE_TRANSLATION_ID}&fields=text_uthmani`
        );
        if (!response.ok) return null;
        const data = await response.json();
        return { verse: data.verse, chapter: ch };
      }
      accumulated += ch.verses_count;
    }
    return null;
  } catch (e) {
    return null;
  }
};

// Juz-level data
export const fetchJuzVerses = async (juzNumber: number): Promise<Verse[]> => {
  const cacheKey = `juz-verses-${juzNumber}`;
  return apiCache.getOrFetch(cacheKey, async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/verses/by_juz/${juzNumber}?language=ar&words=false&translations=${INLINE_TRANSLATION_ID}&fields=text_uthmani&per_page=${VERSES_PER_PAGE}`
      );
      if (!response.ok) return [];
      const data = await response.json();
      return data.verses as Verse[];
    } catch (e) {
      return [];
    }
  }, 30 * 60 * 1000);
};

export const searchGlobal = async (query: string): Promise<SearchResult[]> => {
  try {
    const cleanQuery = query?.trim();
    if (!cleanQuery || cleanQuery.length < 2) return [];

    const cacheKey = `search-${cleanQuery}`;
    return apiCache.getOrFetch(cacheKey, async () => {
      const response = await fetch(
        `${BASE_URL}/search?q=${encodeURIComponent(cleanQuery)}&size=20&page=1&language=ar`
      );

      if (!response.ok) return [];

      const text = await response.text();
      if (!text) return [];

      try {
        const data = JSON.parse(text);
        return data.search?.results || [];
      } catch (parseError) {
        console.error("Search parse error:", parseError);
        return [];
      }
    }, 5 * 60 * 1000);
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
};
