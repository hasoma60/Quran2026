import React from 'react';
import { Verse, Chapter } from '../types';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { CloseIcon, CopyIcon, ShareIcon } from './Icons';

interface ShareModalProps {
  verse: Verse;
  chapter: Chapter;
  onClose: () => void;
}

export default function ShareModal({ verse, chapter, onClose }: ShareModalProps) {
  const { quranFont } = useSettings();
  const { showToast } = useToast();

  const arabicOnly = verse.text_uthmani;
  const fullText = `${verse.text_uthmani}\n\n${verse.translations?.[0]?.text.replace(/<sup.*?<\/sup>/g, '') || ''}\n\n- سورة ${chapter.name_arabic} (${verse.verse_key})`;
  const referenceText = `سورة ${chapter.name_arabic} - الآية ${verse.verse_key.split(':')[1]}`;

  const copyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`تم نسخ ${label}`, 'success');
    } catch {
      showToast('فشل النسخ', 'error');
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: referenceText, text: fullText });
      } catch { /* cancelled */ }
    } else {
      copyText(fullText, 'الآية مع التفسير');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-[32px] shadow-2xl border-t border-zinc-200 dark:border-zinc-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 font-sans">مشاركة الآية</h3>
          <button onClick={onClose} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500" aria-label="إغلاق">
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Preview */}
        <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30 mb-6">
          <p className="text-right text-lg leading-loose text-zinc-800 dark:text-zinc-200" style={{ fontFamily: quranFont }}>
            {verse.text_uthmani}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-500 font-sans mt-2 text-center">
            {referenceText}
          </p>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => copyText(arabicOnly, 'النص العربي')}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors font-sans text-sm"
          >
            <CopyIcon size={18} />
            نسخ النص
          </button>
          <button
            onClick={() => copyText(fullText, 'الآية مع التفسير')}
            className="flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors font-sans text-sm"
          >
            <CopyIcon size={18} />
            نسخ مع التفسير
          </button>
        </div>

        <button
          onClick={shareNative}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-700 transition-colors font-sans"
        >
          <ShareIcon size={18} />
          مشاركة
        </button>
      </div>
    </div>
  );
}
