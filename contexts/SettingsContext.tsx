import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Theme, QuranFont, LineHeight, NightModeSchedule } from '../types';
import { safeGetString, safeSetString, safeGetNumber, safeGetBoolean, safeGetItem, safeSetItem } from '../utils/localStorage';
import { DEFAULT_FONT_SIZE, DEFAULT_FONT, DEFAULT_LINE_HEIGHT, DEFAULT_THEME, DEFAULT_RECITER_ID } from '../utils/constants';

interface SettingsContextValue {
  // Appearance
  fontSize: number;
  setFontSize: (size: number) => void;
  quranFont: QuranFont;
  setQuranFont: (font: QuranFont) => void;
  lineHeight: LineHeight;
  setLineHeight: (height: LineHeight) => void;
  showTranslation: boolean;
  setShowTranslation: (show: boolean) => void;
  activeTranslationIds: number[];
  setActiveTranslationIds: (ids: number[]) => void;
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;
  nightModeSchedule: NightModeSchedule;
  setNightModeSchedule: (schedule: NightModeSchedule) => void;
  // Audio
  selectedReciterId: number;
  setSelectedReciterId: (id: number) => void;
  // Accessibility
  reducedMotion: boolean;
  setReducedMotion: (val: boolean) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSizeState] = useState<number>(() => safeGetNumber('fontSize', DEFAULT_FONT_SIZE));
  const [quranFont, setQuranFontState] = useState<QuranFont>(() => safeGetString('quranFont', DEFAULT_FONT) as QuranFont);
  const [lineHeight, setLineHeightState] = useState<LineHeight>(() => safeGetString('lineHeight', DEFAULT_LINE_HEIGHT) as LineHeight);
  const [showTranslation, setShowTranslationState] = useState<boolean>(() => safeGetBoolean('showTranslation', true));
  const [activeTranslationIds, setActiveTranslationIdsState] = useState<number[]>(() => safeGetItem('activeTranslationIds', [16]));
  const [theme, setThemeState] = useState<Theme>(() => safeGetString('theme', DEFAULT_THEME) as Theme);
  const [selectedReciterId, setSelectedReciterIdState] = useState<number>(() => safeGetNumber('selectedReciterId', DEFAULT_RECITER_ID));
  const [reducedMotion, setReducedMotionState] = useState<boolean>(() => safeGetBoolean('reducedMotion', false));
  const [nightModeSchedule, setNightModeScheduleState] = useState<NightModeSchedule>(() =>
    safeGetItem('nightModeSchedule', { enabled: false, startHour: 19, endHour: 6 })
  );

  // Persist all settings
  const setFontSize = useCallback((v: number) => { setFontSizeState(v); safeSetString('fontSize', String(v)); }, []);
  const setQuranFont = useCallback((v: QuranFont) => { setQuranFontState(v); safeSetString('quranFont', v); }, []);
  const setLineHeight = useCallback((v: LineHeight) => { setLineHeightState(v); safeSetString('lineHeight', v); }, []);
  const setShowTranslation = useCallback((v: boolean) => { setShowTranslationState(v); safeSetString('showTranslation', String(v)); }, []);
  const setActiveTranslationIds = useCallback((v: number[]) => { setActiveTranslationIdsState(v); safeSetItem('activeTranslationIds', v); }, []);
  const setTheme = useCallback((v: Theme) => { setThemeState(v); safeSetString('theme', v); }, []);
  const setSelectedReciterId = useCallback((v: number) => { setSelectedReciterIdState(v); safeSetString('selectedReciterId', String(v)); }, []);
  const setReducedMotion = useCallback((v: boolean) => { setReducedMotionState(v); safeSetString('reducedMotion', String(v)); }, []);
  const setNightModeSchedule = useCallback((v: NightModeSchedule) => { setNightModeScheduleState(v); safeSetItem('nightModeSchedule', v); }, []);

  // Theme effect
  useEffect(() => {
    const root = window.document.documentElement;
    const applyTheme = () => {
      root.classList.remove('dark', 'sepia');

      let effectiveTheme = theme;
      // Night mode auto-schedule check
      if (nightModeSchedule.enabled && theme === 'system') {
        const hour = new Date().getHours();
        const { startHour, endHour } = nightModeSchedule;
        const isNight = startHour > endHour
          ? (hour >= startHour || hour < endHour)
          : (hour >= startHour && hour < endHour);
        if (isNight) effectiveTheme = 'dark';
      }

      if (effectiveTheme === 'dark' || (effectiveTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
      } else if (effectiveTheme === 'sepia') {
        root.classList.add('sepia');
      }
    };

    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => { if (theme === 'system') applyTheme(); };
    mediaQuery.addEventListener('change', handleChange);

    // Re-check night mode every minute
    const interval = nightModeSchedule.enabled
      ? setInterval(applyTheme, 60000)
      : undefined;

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      if (interval) clearInterval(interval);
    };
  }, [theme, nightModeSchedule]);

  return (
    <SettingsContext.Provider value={{
      fontSize, setFontSize,
      quranFont, setQuranFont,
      lineHeight, setLineHeight,
      showTranslation, setShowTranslation,
      activeTranslationIds, setActiveTranslationIds,
      theme, setTheme,
      nightModeSchedule, setNightModeSchedule,
      selectedReciterId, setSelectedReciterId,
      reducedMotion, setReducedMotion,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}
