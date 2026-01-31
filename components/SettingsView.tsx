import React, { useState } from 'react';
import { Theme, QuranFont, LineHeight } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { getLineHeightValue } from '../utils/typography';
import { APP_VERSION, RECITERS } from '../utils/constants';
import ExportImport from './ExportImport';
import ReciterSelector from './ReciterSelector';

export default function SettingsView() {
  const {
    fontSize, setFontSize, quranFont, setQuranFont, lineHeight, setLineHeight,
    showTranslation, setShowTranslation, theme, setTheme,
    selectedReciterId, nightModeSchedule, setNightModeSchedule, reducedMotion, setReducedMotion
  } = useSettings();
  const [showReciterSelector, setShowReciterSelector] = useState(false);

  const fonts: { id: QuranFont; label: string; preview: string }[] = [
    { id: 'Amiri', label: 'الأميري (نسخ كلاسيكي)', preview: 'بِسْمِ ٱللَّهِ' },
    { id: 'Scheherazade New', label: 'شهرزاد (انسيابي)', preview: 'بِسْمِ ٱللَّهِ' },
    { id: 'Noto Naskh Arabic', label: 'نسخ حديث (واضح)', preview: 'بِسْمِ ٱللَّهِ' },
    { id: 'Lateef', label: 'لطيف (مجود)', preview: 'بِسْمِ ٱللَّهِ' },
  ];
  const spacings: { id: LineHeight; label: string }[] = [
    { id: 'compact', label: 'مضغوط' }, { id: 'normal', label: 'طبيعي' }, { id: 'loose', label: 'مريح' },
  ];

  const currentReciter = RECITERS.find(r => r.id === selectedReciterId);

  return (
    <div className="space-y-8 pt-6">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">إعدادات القراءة</h2>

      <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-8 shadow-sm dark:shadow-none">
        {/* Theme */}
        <div>
          <label className="text-zinc-900 dark:text-zinc-300 font-bold mb-3 block font-sans text-sm">مظهر التطبيق</label>
          <div className="grid grid-cols-4 gap-2 bg-zinc-100 dark:bg-black p-1 rounded-xl font-sans">
            {(['light', 'dark', 'sepia', 'system'] as Theme[]).map((t) => (
              <button key={t} onClick={() => setTheme(t)} className={`py-2 rounded-lg text-sm font-medium transition-all ${theme === t ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}>
                {t === 'light' ? 'فاتح' : t === 'dark' ? 'داكن' : t === 'sepia' ? 'بني' : 'النظام'}
              </button>
            ))}
          </div>
        </div>

        {/* Night Mode Schedule */}
        <div>
          <div className="flex items-center justify-between">
            <label className="text-zinc-900 dark:text-zinc-300 font-bold font-sans text-sm">الوضع الليلي التلقائي</label>
            <button onClick={() => setNightModeSchedule({ ...nightModeSchedule, enabled: !nightModeSchedule.enabled })} className={`w-12 h-6 rounded-full transition-colors relative ${nightModeSchedule.enabled ? 'bg-amber-600' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${nightModeSchedule.enabled ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
          {nightModeSchedule.enabled && (
            <div className="flex gap-4 mt-3">
              <div className="flex-1">
                <label className="text-xs text-zinc-500 font-sans">من الساعة</label>
                <input type="number" min={0} max={23} value={nightModeSchedule.startHour} onChange={e => setNightModeSchedule({ ...nightModeSchedule, startHour: Number(e.target.value) })} className="w-full p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-sans mt-1 text-zinc-900 dark:text-zinc-100" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-zinc-500 font-sans">إلى الساعة</label>
                <input type="number" min={0} max={23} value={nightModeSchedule.endHour} onChange={e => setNightModeSchedule({ ...nightModeSchedule, endHour: Number(e.target.value) })} className="w-full p-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-sm font-sans mt-1 text-zinc-900 dark:text-zinc-100" />
              </div>
            </div>
          )}
        </div>

        {/* Font Family */}
        <div>
          <label className="text-zinc-900 dark:text-zinc-300 font-bold mb-3 block font-sans text-sm">نوع الخط</label>
          <div className="grid grid-cols-1 gap-3">
            {fonts.map((f) => (
              <button key={f.id} onClick={() => setQuranFont(f.id)} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${quranFont === f.id ? 'border-amber-600 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/20 ring-1 ring-amber-600 dark:ring-amber-500' : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black hover:border-zinc-300 dark:hover:border-zinc-700'}`}>
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
          <input type="range" min="20" max="60" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-600 mb-6" aria-label="حجم الخط" />

          <label className="text-zinc-900 dark:text-zinc-300 font-bold mb-3 block font-sans text-sm">تباعد الأسطر</label>
          <div className="flex gap-2 bg-zinc-100 dark:bg-black p-1 rounded-xl font-sans mb-6">
            {spacings.map((s) => (
              <button key={s.id} onClick={() => setLineHeight(s.id)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${lineHeight === s.id ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-500 shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'}`}>{s.label}</button>
            ))}
          </div>

          {/* Live Preview */}
          <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-black transition-all">
            <p className="text-center text-zinc-900 dark:text-zinc-100 transition-all duration-300" style={{ fontFamily: quranFont, fontSize: `${fontSize}px`, lineHeight: getLineHeightValue(lineHeight) }}>
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ<br/>ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ
            </p>
          </div>
        </div>

        {/* Translation Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-zinc-900 dark:text-zinc-300 font-bold font-sans text-sm">عرض التفسير الميسر</label>
          <button onClick={() => setShowTranslation(!showTranslation)} className={`w-12 h-6 rounded-full transition-colors relative ${showTranslation ? 'bg-amber-600' : 'bg-zinc-200 dark:bg-zinc-800'}`} aria-label="تبديل التفسير">
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${showTranslation ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>

        {/* Reciter Selection */}
        <div>
          <label className="text-zinc-900 dark:text-zinc-300 font-bold mb-3 block font-sans text-sm">القارئ</label>
          <button onClick={() => setShowReciterSelector(true)} className="w-full flex items-center justify-between p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:border-amber-500/30 transition-colors">
            <span className="text-zinc-900 dark:text-zinc-100 font-sans text-sm">{currentReciter?.nameArabic || 'اختر القارئ'}</span>
            <span className="text-xs text-zinc-400 font-sans">&larr; تغيير</span>
          </button>
        </div>

        {/* Reduced Motion */}
        <div className="flex items-center justify-between">
          <label className="text-zinc-900 dark:text-zinc-300 font-bold font-sans text-sm">تقليل الحركة</label>
          <button onClick={() => setReducedMotion(!reducedMotion)} className={`w-12 h-6 rounded-full transition-colors relative ${reducedMotion ? 'bg-amber-600' : 'bg-zinc-200 dark:bg-zinc-800'}`} aria-label="تقليل الحركة">
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${reducedMotion ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>

        {/* Export/Import */}
        <ExportImport />
      </div>

      <div className="text-center pt-4">
        <p className="text-zinc-400 dark:text-zinc-700 text-xs mt-1 font-sans">الإصدار {APP_VERSION} &bull; نور القرآن</p>
      </div>

      {showReciterSelector && <ReciterSelector onClose={() => setShowReciterSelector(false)} />}
    </div>
  );
}
