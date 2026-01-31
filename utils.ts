import { LineHeight } from './types';

export const getLineHeightValue = (lh: LineHeight): number => {
  switch (lh) {
    case 'compact': return 1.8;
    case 'normal': return 2.2;
    case 'loose': return 2.8;
  }
};

export const sanitizeHtml = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const dangerous = doc.querySelectorAll('script, iframe, object, embed, form, input, link');
  dangerous.forEach(el => el.remove());
  const allElements = doc.body.querySelectorAll('*');
  allElements.forEach(el => {
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on') || attr.value.startsWith('javascript:')) {
        el.removeAttribute(attr.name);
      }
    });
    if (el.hasAttribute('href') && el.getAttribute('href')?.startsWith('javascript:')) {
      el.removeAttribute('href');
    }
  });
  return doc.body.innerHTML;
};

export const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getDailyVerseSeed = (): { chapter: number; verseIndex: number } => {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const chapter = (dayOfYear % 114) + 1;
  const verseIndex = dayOfYear % 20;
  return { chapter, verseIndex };
};

export const stripHtml = (html: string): string => {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
};

export const calculateProgress = (current: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
};

export const shareVerse = async (text: string, reference: string): Promise<boolean> => {
  const shareData = {
    title: `${reference} — نور القرآن`,
    text: `${text}\n\n— ${reference}`,
  };
  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return true;
    } catch { return false; }
  }
  try {
    await navigator.clipboard.writeText(shareData.text);
    return true;
  } catch { return false; }
};

export const hideWordsForMemorization = (
  text: string,
  difficulty: number // 0-100 percentage of words to hide
): { display: string; words: { word: string; hidden: boolean; index: number }[] } => {
  const words = text.split(/\s+/);
  const hideCount = Math.floor(words.length * (difficulty / 100));
  const indices = new Set<number>();
  // Deterministic hiding based on word positions
  for (let i = 0; i < hideCount && indices.size < words.length; i++) {
    indices.add((i * 3 + 1) % words.length);
  }
  const result = words.map((word, index) => ({
    word,
    hidden: indices.has(index),
    index,
  }));
  const display = result.map(w => w.hidden ? '____' : w.word).join(' ');
  return { display, words: result };
};
