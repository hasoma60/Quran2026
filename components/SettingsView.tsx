import React, { useState, useEffect } from 'react';
import { Theme, QuranFont, LineHeight, PrayerTimes } from '../types';
import { RECITERS, STORAGE_KEYS } from '../constants';
import { getLineHeightValue } from '../utils';
import { fetchPrayerTimes } from '../services/quranService';

interface SettingsViewProps {
  fontSize: number;
  setFontSize: (size: number) => void;
  quranFont: QuranFont;
  setQuranFont: (font: QuranFont) => void;
  lineHeight: LineHeight;
  setLineHeight: (height: LineHeight) => void;
  showTranslation: boolean;
  setShowTranslation: (show: boolean) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  reciterId: number;
  setReciterId: (id: number) => void;
  tajweedEnabled: boolean;
  setTajweedEnabled: (v: boolean) => void;
}

export default function SettingsView({
  fontSize, setFontSize, quranFont, setQuranFont, lineHeight, setLineHeight,
  showTranslation, setShowTranslation, theme, setTheme, reciterId, setReciterId,
  tajweedEnabled, setTajweedEnabled
}: SettingsViewProps) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [prayerLoading, setPrayerLoading] = useState(false);
  const [locationError, setLocationError] = useState(false);

  const fonts: { id: QuranFont; label: string; preview: string }[] = [
    { id: 'Amiri', label: 'الأميري (نسخ كلاسيكي)', preview: 'بِسْمِ ٱللَّهِ' },
    { id: 'Scheherazade New', label: 'شهرزاد (انسيابي)', preview: 'بِسْمِ ٱللَّهِ' },
    { id: 'Noto Naskh Arabic', label: 'نسخ حديث (واضح)', preview: 'بِسْمِ ٱللَّهِ' },
    { id: 'Lateef', label: 'لطيف (مجود)', preview: 'بِسْمِ ٱللَّهِ' },
  ];

  const spacings: { id: LineHeight; label: string }[] = [
    { id: 'compact', label: 'مضغوط' },
    { id: 'normal', label: 'طبيعي' },
    { id: 'loose', label: 'مريح' },
  ];

  const prayerNames: Record<string, string> = {
    Fajr: 'الفجر', Sunrise: 'الشروق', Dhuhr: 'الظهر', Asr: 'العصر', Maghrib: 'المغرب', Isha: 'العشاء'
  };

  useEffect(() => {
    loadPrayerTimes();
  }, []);

  const loadPrayerTimes = () => {
    if (!navigator.geolocation) { setLocationError(true); return; }
    setPrayerLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const times = await fetchPrayerTimes(pos.coords.latitude, pos.coords.longitude);
        if (times) setPrayerTimes(times);
        else setLocationError(true);
        setPrayerLoading(false);
      },
      () => { setLocationError(true); setPrayerLoading(false); },
      { timeout: 10000 }
    );
  };

  return (
    <div className="space-y-8 pt-6">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">إعدادات القراءة</h2>

      <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-8 shadow-sm dark:shadow-none">

        {/* Theme */}
        <div>
          <label className="text-zinc-900 dark:text-zinc-300 font-bold mb-3 block font-sans text-sm">مظهر التطبيق</label>
          <div className="grid grid-cols-3 gap-2 bg-zinc-100 dark:bg-black p-1 rounded-xl font-sans">
            {(['light', 'dark', 'system'] as Theme[]).map((t) => (
              <button key={t} onClick={() => setTheme(t)} aria-label={t === 'light' ? 'فاتح' : t === 'dark' ? 'داكن' : 'النظام'}
                className={`py-2 rounded-lg text-sm font-medium transition-all ${theme === t ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}>
                {t === 'light' ? 'فاتح' : t === 'dark' ? 'داكن' : 'النظام'}
              </button>
            ))}
          </div>
        </div>

        {/* Reciter */}
        <div>
          <label className="text-zinc-900 dark:text-zinc-300 font-bold mb-3 block font-sans text-sm">القارئ</label>
          <div className="grid gap-2 max-h-48 overflow-y-auto no-scrollbar">
            {RECITERS.map((r) => (
              <button key={r.id} onClick={() => setReciterId(r.id)}
                className={`flex items-center justify-between p-3 rounded-xl border transition-all text-right ${reciterId === r.id ? 'border-amber-600 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/20 ring-1 ring-amber-600' : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'}`}>
                <span className="text-zinc-700 dark:text-zinc-300 text-sm font-sans">{r.name}</span>
                {reciterId === r.id && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="text-amber-600"><polyline points="20 6 9 17 4 12"/></svg>}
              </button>
            ))}
          </div>
        </div>

        {/* Font Family */}
        <div>
          <label className="text-zinc-900 dark:text-zinc-300 font-bold mb-3 block font-sans text-sm">نوع الخط</label>
          <div className="grid grid-cols-1 gap-3">
            {fonts.map((f) => (
              <button key={f.id} onClick={() => setQuranFont(f.id)}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${quranFont === f.id ? 'border-amber-600 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/20 ring-1 ring-amber-600' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black hover:border-zinc-300'}`}>
                <span className="text-zinc-700 dark:text-zinc-300 text-sm font-sans font-medium">{f.label}</span>
                <span className="text-2xl text-zinc-900 dark:text-zinc-100" style={{ fontFamily: f.id }}>{f.preview}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font Size & Line Height */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="text-zinc-900 dark:text-zinc-300 font-bold font-sans text-sm">حجم الخط</label>
            <span className="text-amber-600 dark:text-amber-500 font-mono text-sm">{fontSize}px</span>
          </div>
          <input type="range" min="20" max="60" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-600 mb-6" aria-label="حجم الخط" />

          <label className="text-zinc-900 dark:text-zinc-300 font-bold mb-3 block font-sans text-sm">تباعد الأسطر</label>
          <div className="flex gap-2 bg-zinc-100 dark:bg-black p-1 rounded-xl font-sans mb-6">
            {spacings.map((s) => (
              <button key={s.id} onClick={() => setLineHeight(s.id)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${lineHeight === s.id ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-500 shadow-sm' : 'text-zinc-500'}`}>
                {s.label}
              </button>
            ))}
          </div>

          {/* Live Preview */}
          <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-black transition-all">
            <p className="text-center text-zinc-900 dark:text-zinc-100 transition-all duration-300"
              style={{ fontFamily: quranFont, fontSize: `${fontSize}px`, lineHeight: getLineHeightValue(lineHeight) }}>
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ<br />ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ
            </p>
          </div>
        </div>

        {/* Tajweed Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <label className="text-zinc-900 dark:text-zinc-300 font-bold font-sans text-sm block">ألوان التجويد</label>
            <p className="text-zinc-500 text-xs font-sans mt-0.5">تلوين أحكام التجويد في النص</p>
          </div>
          <button onClick={() => setTajweedEnabled(!tajweedEnabled)} aria-label="تفعيل التجويد"
            className={`w-12 h-6 rounded-full transition-colors relative ${tajweedEnabled ? 'bg-amber-600' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${tajweedEnabled ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>

        {/* Translation Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-zinc-900 dark:text-zinc-300 font-bold font-sans text-sm">عرض التفسير الميسر</label>
          <button onClick={() => setShowTranslation(!showTranslation)} aria-label="عرض التفسير"
            className={`w-12 h-6 rounded-full transition-colors relative ${showTranslation ? 'bg-amber-600' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${showTranslation ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>
      </div>

      {/* Prayer Times */}
      <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm dark:shadow-none">
        <h3 className="text-zinc-900 dark:text-zinc-100 font-bold font-sans text-sm mb-4">مواقيت الصلاة</h3>
        {prayerLoading ? (
          <div className="flex justify-center py-4"><div className="animate-spin h-6 w-6 border-2 border-zinc-300 border-t-amber-500 rounded-full"></div></div>
        ) : prayerTimes ? (
          <div className="grid grid-cols-3 gap-3">
            {(['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const).map(key => (
              <div key={key} className="text-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                <p className="text-zinc-500 text-xs font-sans mb-1">{prayerNames[key]}</p>
                <p className="text-zinc-900 dark:text-zinc-100 font-bold font-mono text-sm">{(prayerTimes as any)[key]}</p>
              </div>
            ))}
          </div>
        ) : locationError ? (
          <div className="text-center py-4">
            <p className="text-zinc-500 text-xs font-sans mb-2">يتطلب الوصول للموقع الجغرافي</p>
            <button onClick={loadPrayerTimes} className="text-amber-600 text-xs font-bold font-sans hover:underline">إعادة المحاولة</button>
          </div>
        ) : null}
      </div>

      <div className="text-center pt-8">
        <p className="text-zinc-500 dark:text-zinc-600 text-sm font-sans">مخصص لجهاز S25 Ultra</p>
        <p className="text-zinc-400 dark:text-zinc-700 text-xs mt-1">الإصدار 2.0.0 • نور القرآن</p>
      </div>
    </div>
  );
}
