import React from 'react';
import { Bookmark, QuranFont } from '../types';

interface BookmarksViewProps {
  bookmarks: Bookmark[];
  quranFont: QuranFont;
  onSelect: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
}

export default function BookmarksView({ bookmarks, quranFont, onSelect, onDelete }: BookmarksViewProps) {
  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 dark:text-zinc-600">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
        </div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">لا توجد إشارات مرجعية</h3>
        <p className="text-zinc-500 max-w-xs font-sans">اضغط على أيقونة الحفظ بجانب أي آية لحفظها هنا للوصول السريع.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 px-2 font-sans">الآيات المحفوظة</h2>
      <div className="grid gap-4">
        {bookmarks.map((bookmark) => (
          <div 
            key={bookmark.id} 
            className="group relative flex flex-col p-5 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 text-xs font-semibold font-sans">
                سورة {bookmark.chapterName} • {bookmark.verseKey}
              </span>
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(bookmark.id); }}
                className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                aria-label="حذف الإشارة"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            
            <p className="text-zinc-800 dark:text-zinc-200 text-lg line-clamp-3 mb-4 leading-loose cursor-pointer" 
               style={{ fontFamily: quranFont }}
               onClick={() => onSelect(bookmark)}>
              {bookmark.text}
            </p>
            
            <button 
              onClick={() => onSelect(bookmark)}
              className="text-sm font-medium text-amber-600 dark:text-amber-500 hover:underline self-end font-sans"
            >
              &larr; الانتقال للسورة كاملة
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}