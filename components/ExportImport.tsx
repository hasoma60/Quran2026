import React, { useRef } from 'react';
import { AppExportData } from '../types';
import { useBookmarks } from '../contexts/BookmarkContext';
import { useReadingProgress } from '../contexts/ReadingProgressContext';
import { useToast } from '../contexts/ToastContext';
import { DownloadIcon, UploadIcon } from './Icons';
import { APP_VERSION } from '../utils/constants';

export default function ExportImport() {
  const { bookmarks, notes } = useBookmarks();
  const { progress } = useReadingProgress();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data: AppExportData = {
      version: APP_VERSION,
      exportDate: Date.now(),
      bookmarks,
      notes,
      readingProgress: progress,
      settings: {},
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quran-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('تم تصدير البيانات بنجاح', 'success');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        if (!data || typeof data !== 'object' || !data.version || !Array.isArray(data.bookmarks)) {
          showToast('ملف غير صالح', 'error');
          return;
        }

        if (data.notes && !Array.isArray(data.notes)) {
          showToast('ملف غير صالح', 'error');
          return;
        }

        // Import bookmarks
        if (data.bookmarks?.length > 0) {
          localStorage.setItem('bookmarks', JSON.stringify(data.bookmarks));
        }
        // Import notes
        if (data.notes?.length > 0) {
          localStorage.setItem('verseNotes', JSON.stringify(data.notes));
        }
        // Import progress
        if (data.readingProgress) {
          localStorage.setItem('readingProgress', JSON.stringify(data.readingProgress));
        }

        showToast('تم استيراد البيانات. أعد تحميل التطبيق لتطبيق التغييرات.', 'success', 5000);
      } catch {
        showToast('فشل في قراءة الملف', 'error');
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      <label className="text-zinc-900 dark:text-zinc-300 font-bold mb-3 block font-sans text-sm">النسخ الاحتياطي</label>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors font-sans text-sm"
        >
          <DownloadIcon size={18} />
          تصدير البيانات
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors font-sans text-sm"
        >
          <UploadIcon size={18} />
          استيراد البيانات
        </button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        className="hidden"
      />
    </div>
  );
}
