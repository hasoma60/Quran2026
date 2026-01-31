import React from 'react';
import { Theme, QuranFont, LineHeight } from '../types';

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
}

export default function SettingsView({ 
  fontSize, 
  setFontSize, 
  quranFont,
  setQuranFont,
  lineHeight,
  setLineHeight,
  showTranslation, 
  setShowTranslation,
  theme,
  setTheme
}: SettingsViewProps) {

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

  const getLineHeightValue = (lh: LineHeight) => {
      switch(lh) {
          case 'compact': return 1.8;
          case 'normal': return 2.2;
          case 'loose': return 2.8;
      }
  };

  return (
    <div className="space-y-8 pt-6">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">إعدادات القراءة</h2>
      
      <div className="bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-8 shadow-sm dark:shadow-none">
        
        {/* Theme Selector */}
        <div>
           <label className="text-zinc-900 dark:text-zinc-300 font-bold mb-3 block font-sans text-sm">مظهر التطبيق</label>
           <div className="grid grid-cols-3 gap-2 bg-zinc-100 dark:bg-black p-1 rounded-xl font-sans">
               {(['light', 'dark', 'system'] as Theme[]).map((t) => (
                   <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`py-2 rounded-lg text-sm font-medium transition-all ${
                      theme === t 
                        ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-500 shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                    }`}
                   >
                     {t === 'light' ? 'فاتح' : t === 'dark' ? 'داكن' : 'النظام'}
                   </button>
               ))}
           </div>
        </div>

        {/* Font Family Selector */}
        <div>
            <label className="text-zinc-900 dark:text-zinc-300 font-bold mb-3 block font-sans text-sm">نوع الخط</label>
            <div className="grid grid-cols-1 gap-3">
                {fonts.map((f) => (
                    <button
                        key={f.id}
                        onClick={() => setQuranFont(f.id)}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                            quranFont === f.id
                                ? 'border-amber-600 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/20 ring-1 ring-amber-600 dark:ring-amber-500'
                                : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black hover:border-zinc-300 dark:hover:border-zinc-700'
                        }`}
                    >
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
          <input 
            type="range" 
            min="20" 
            max="60" 
            value={fontSize} 
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-600 mb-6"
          />

          <label className="text-zinc-900 dark:text-zinc-300 font-bold mb-3 block font-sans text-sm">تباعد الأسطر</label>
          <div className="flex gap-2 bg-zinc-100 dark:bg-black p-1 rounded-xl font-sans mb-6">
               {spacings.map((s) => (
                   <button
                    key={s.id}
                    onClick={() => setLineHeight(s.id)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                      lineHeight === s.id
                        ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-500 shadow-sm' 
                        : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300'
                    }`}
                   >
                     {s.label}
                   </button>
               ))}
           </div>

          {/* Live Preview */}
          <div className="p-6 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50 dark:bg-black transition-all">
            <p className="text-center text-zinc-900 dark:text-zinc-100 transition-all duration-300" 
               style={{ 
                   fontFamily: quranFont, 
                   fontSize: `${fontSize}px`,
                   lineHeight: getLineHeightValue(lineHeight)
                }}>
              بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
              <br/>
              ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَـٰلَمِينَ
            </p>
          </div>
        </div>

        {/* Translation Toggle */}
        <div className="flex items-center justify-between">
          <label className="text-zinc-900 dark:text-zinc-300 font-bold font-sans text-sm">عرض التفسير الميسر</label>
          <button 
            onClick={() => setShowTranslation(!showTranslation)}
            className={`w-12 h-6 rounded-full transition-colors relative ${showTranslation ? 'bg-amber-600' : 'bg-zinc-200 dark:bg-zinc-800'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${showTranslation ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>
      </div>
      
      <div className="text-center pt-8">
        <p className="text-zinc-500 dark:text-zinc-600 text-sm font-sans">مخصص لجهاز S25 Ultra</p>
        <p className="text-zinc-400 dark:text-zinc-700 text-xs mt-1">الإصدار 1.3.0 • نور القرآن</p>
      </div>
    </div>
  );
}