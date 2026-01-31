
import { Chapter, Verse, SearchResult, TafsirOption } from '../types';

const BASE_URL = 'https://api.quran.com/api/v4';

// Curated list of high-quality Tafsirs available in Quran.com API
export const TAFSIR_OPTIONS: TafsirOption[] = [
  { id: 169, name: 'تفسير السعدي', author: 'عبدالرحمن السعدي' },
  { id: 16, name: 'التفسير الميسر', author: 'نخبة من العلماء' },
  { id: 160, name: 'تفسير ابن كثير', author: 'ابن كثير' },
  { id: 166, name: 'تفسير البغوي', author: 'البغوي' }
];

export const fetchChapters = async (): Promise<Chapter[]> => {
  try {
    // Fetch chapters with Arabic language preference for translated names
    const response = await fetch(`${BASE_URL}/chapters?language=ar`);
    if (!response.ok) throw new Error('Failed to fetch chapters');
    const data = await response.json();
    return data.chapters;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchVerses = async (chapterId: number): Promise<Verse[]> => {
  try {
    // 16 is Tafsir Al-Muyassar (Arabic) which we use for the inline "Simplified" view
    const response = await fetch(
      `${BASE_URL}/verses/by_chapter/${chapterId}?language=ar&words=false&translations=16&fields=text_uthmani&per_page=300`
    );
    if (!response.ok) throw new Error('Failed to fetch verses');
    const data = await response.json();
    return data.verses;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchTafsirContent = async (tafsirId: number, verseKey: string): Promise<string> => {
  try {
    const response = await fetch(`${BASE_URL}/tafsirs/${tafsirId}/by_ayah/${verseKey}`);
    if (!response.ok) throw new Error('Failed to fetch tafsir');
    const data = await response.json();
    return data.tafsir.text;
  } catch (error) {
    console.error(error);
    return "تعذر تحميل التفسير. يرجى التأكد من الاتصال بالإنترنت.";
  }
};

export const fetchChapterAudio = async (chapterId: number, reciterId: number = 7) => {
    // 7 is Mishary Rashid Alafasy
    try {
        const response = await fetch(`${BASE_URL}/chapter_recitations/${reciterId}/${chapterId}`);
        if(!response.ok) throw new Error("Failed to fetch audio");
        const data = await response.json();
        return data.audio_file.audio_url; 
    } catch (e) {
        console.error(e);
        return null;
    }
}

// Helper to get a random verse for "Verse of the day" style features or loading
export const fetchRandomVerse = async (): Promise<Verse | null> => {
    try {
        const randomChapter = Math.floor(Math.random() * 114) + 1;
        const verses = await fetchVerses(randomChapter);
        const randomVerseIndex = Math.floor(Math.random() * verses.length);
        return verses[randomVerseIndex];
    } catch (e) {
        return null;
    }
}

export const searchGlobal = async (query: string): Promise<SearchResult[]> => {
  try {
    const cleanQuery = query?.trim();
    if (!cleanQuery || cleanQuery.length < 2) return [];
    
    // Using Arabic language for search results
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
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
};
