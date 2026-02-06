/**
 * Safe localStorage utilities with JSON parsing protection
 */

export function safeGetItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return fallback;
    return JSON.parse(item) as T;
  } catch {
    // Corrupted data - remove it and return fallback
    try { localStorage.removeItem(key); } catch { /* ignore */ }
    return fallback;
  }
}

export function safeSetItem(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    // localStorage full or disabled
    console.warn('Failed to save to localStorage:', e);
    return false;
  }
}

export function safeGetString(key: string, fallback: string): string {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function safeSetString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn('Failed to save to localStorage:', e);
  }
}

export function safeGetNumber(key: string, fallback: number): number {
  try {
    const val = localStorage.getItem(key);
    if (val === null) return fallback;
    const num = Number(val);
    return isNaN(num) ? fallback : num;
  } catch {
    return fallback;
  }
}

export function safeGetBoolean(key: string, fallback: boolean): boolean {
  try {
    const val = localStorage.getItem(key);
    if (val === null) return fallback;
    return val === 'true';
  } catch {
    return fallback;
  }
}
