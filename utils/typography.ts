import { LineHeight } from '../types';

/**
 * Get numeric line-height value from LineHeight type
 */
export function getLineHeightValue(lh: LineHeight): number {
  switch (lh) {
    case 'compact': return 1.8;
    case 'normal': return 2.2;
    case 'loose': return 2.8;
  }
}

/**
 * Format verse key for display (e.g., "2:255" -> "البقرة ٢٥٥")
 */
export function formatVerseNumber(verseKey: string): string {
  const parts = verseKey.split(':');
  return parts[1] || verseKey;
}

/**
 * Convert number to Arabic numerals
 */
const ARABIC_NUMERALS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'] as const;

export function toArabicNumerals(num: number): string {
  return String(num).replace(/[0-9]/g, (d) => ARABIC_NUMERALS[parseInt(d, 10)]);
}

/**
 * Format a timestamp to Arabic relative date
 */
export function formatRelativeDate(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'الآن';
  if (minutes < 60) return `منذ ${toArabicNumerals(minutes)} دقيقة`;
  if (hours < 24) return `منذ ${toArabicNumerals(hours)} ساعة`;
  if (days < 30) return `منذ ${toArabicNumerals(days)} يوم`;

  const date = new Date(timestamp);
  return date.toLocaleDateString('ar-SA');
}
