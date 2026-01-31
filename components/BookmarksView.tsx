import React, { useState } from 'react';
import { Bookmark, BookmarkCategory, BOOKMARK_CATEGORIES } from '../types';
import { useBookmarks } from '../contexts/BookmarkContext';
import { useSettings } from '../contexts/SettingsContext';
import { useToast } from '../contexts/ToastContext';
import { BookmarkIcon, CloseIcon, TrashIcon, TagIcon } from './Icons';

interface BookmarksViewProps {
  onSelect: (bookmark: Bookmark) => void;
}

export default function BookmarksView({ onSelect }: BookmarksViewProps) {
  const { bookmarks, deleteBookmark, updateBookmarkCategory } = useBookmarks();
  const { quranFont } = useSettings();
  const { showToast } = useToast();
  const [activeCategory, setActiveCategory] = useState<BookmarkCategory | 'all'>('all');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = activeCategory === 'all' ? bookmarks : bookmarks.filter(b => b.category === activeCategory);

  const handleDelete = (id: string) => {
    if (confirmDelete === id) {
      deleteBookmark(id);
      showToast('تم حذف الإشارة المرجعية', 'info');
      setConfirmDelete(null);
    } else {
      setConfirmDelete(id);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  if (bookmarks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center space-y-5 px-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-zinc-900/50 border border-amber-200/50 dark:border-amber-800/30 flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-sm">
          <BookmarkIcon size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">لا توجد إشارات مرجعية</h3>
          <p className="text-zinc-500 max-w-xs mx-auto font-sans text-sm leading-relaxed">
            احفظ آياتك المفضلة للوصول إليها بسرعة في أي وقت. اضغط على أيقونة الحفظ بجانب أي آية.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 px-2 font-sans">الآيات المحفوظة</h2>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors ${activeCategory === 'all' ? 'bg-amber-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
        >
          الكل ({bookmarks.length})
        </button>
        {BOOKMARK_CATEGORIES.map(cat => {
          const count = bookmarks.filter(b => b.category === cat.id).length;
          if (count === 0) return null;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-sans font-medium transition-colors ${activeCategory === cat.id ? 'bg-amber-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}
            >
              {cat.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="grid gap-4">
        {filtered.map((bookmark) => (
          <div
            key={bookmark.id}
            className="group relative flex flex-col p-5 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 text-xs font-semibold font-sans">
                سورة {bookmark.chapterName} &bull; {bookmark.verseKey}
              </span>
              <div className="flex gap-1">
                <select
                  value={bookmark.category || 'general'}
                  onChange={(e) => { updateBookmarkCategory(bookmark.id, e.target.value as BookmarkCategory); showToast('تم تحديث التصنيف', 'success'); }}
                  className="text-xs bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 font-sans text-zinc-600 dark:text-zinc-400"
                  aria-label="تصنيف الإشارة"
                >
                  {BOOKMARK_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(bookmark.id); }}
                  className={`transition-colors p-1 rounded ${confirmDelete === bookmark.id ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-zinc-400 hover:text-red-500'}`}
                  aria-label={confirmDelete === bookmark.id ? 'تأكيد الحذف' : 'حذف الإشارة'}
                >
                  {confirmDelete === bookmark.id ? <span className="text-xs font-sans font-bold">تأكيد؟</span> : <TrashIcon size={16} />}
                </button>
              </div>
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
