import React, { useState } from 'react';
import { Bookmark, BookmarkCollection, QuranFont } from '../types';

interface BookmarksViewProps {
  bookmarks: Bookmark[];
  collections: BookmarkCollection[];
  quranFont: QuranFont;
  onSelect: (bookmark: Bookmark) => void;
  onDelete: (id: string) => void;
  onAddCollection: (name: string, color: string) => void;
  onDeleteCollection: (id: string) => void;
  onMoveBookmark: (bookmarkId: string, collectionId: string) => void;
}

export default function BookmarksView({ bookmarks, collections, quranFont, onSelect, onDelete, onAddCollection, onDeleteCollection, onMoveBookmark }: BookmarksViewProps) {
  const [activeCollection, setActiveCollection] = useState<string>('all');
  const [showNewCollection, setShowNewCollection] = useState(false);
  const [newCollName, setNewCollName] = useState('');
  const [newCollColor, setNewCollColor] = useState('#d97706');
  const [movingBookmark, setMovingBookmark] = useState<string | null>(null);

  const colors = ['#d97706', '#ef4444', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

  const filtered = activeCollection === 'all'
    ? bookmarks
    : bookmarks.filter(b => b.collectionId === activeCollection);

  const handleCreateCollection = () => {
    if (newCollName.trim()) {
      onAddCollection(newCollName.trim(), newCollColor);
      setNewCollName('');
      setShowNewCollection(false);
    }
  };

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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 px-2 font-sans">الآيات المحفوظة</h2>
        <button
          onClick={() => setShowNewCollection(!showNewCollection)}
          className="text-amber-600 dark:text-amber-500 font-sans text-sm font-bold hover:underline"
          aria-label="إنشاء مجموعة جديدة"
        >
          + مجموعة
        </button>
      </div>

      {/* New Collection Form */}
      {showNewCollection && (
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <input
            type="text"
            value={newCollName}
            onChange={(e) => setNewCollName(e.target.value)}
            placeholder="اسم المجموعة..."
            className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl py-2 px-4 text-sm font-sans text-zinc-900 dark:text-zinc-200 focus:outline-none focus:border-amber-500"
            aria-label="اسم المجموعة الجديدة"
          />
          <div className="flex items-center gap-2">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => setNewCollColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-all ${newCollColor === c ? 'border-zinc-900 dark:border-white scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c }}
                aria-label={`لون ${c}`}
              />
            ))}
            <button onClick={handleCreateCollection} className="mr-auto px-4 py-1.5 bg-amber-600 text-white text-xs font-bold rounded-full font-sans">
              إنشاء
            </button>
          </div>
        </div>
      )}

      {/* Collection Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setActiveCollection('all')}
          className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap font-sans transition-colors ${
            activeCollection === 'all' ? 'bg-amber-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
          }`}
        >
          الكل ({bookmarks.length})
        </button>
        {collections.map(coll => {
          const count = bookmarks.filter(b => b.collectionId === coll.id).length;
          return (
            <div key={coll.id} className="flex items-center gap-1">
              <button
                onClick={() => setActiveCollection(coll.id)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap font-sans transition-colors ${
                  activeCollection === coll.id ? 'bg-amber-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: coll.color }}></span>
                {coll.name} ({count})
              </button>
              {coll.id !== 'default' && (
                <button onClick={() => onDeleteCollection(coll.id)} className="text-zinc-400 hover:text-red-500 text-xs" aria-label={`حذف ${coll.name}`}>&times;</button>
              )}
            </div>
          );
        })}
      </div>

      {/* Bookmarks List */}
      <div className="grid gap-4">
        {filtered.map((bookmark) => {
          const coll = collections.find(c => c.id === bookmark.collectionId);
          return (
            <div
              key={bookmark.id}
              className="group relative flex flex-col p-5 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 text-xs font-semibold font-sans">
                    سورة {bookmark.chapterName} • {bookmark.verseKey}
                  </span>
                  {coll && (
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: coll.color }} title={coll.name}></span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); setMovingBookmark(movingBookmark === bookmark.id ? null : bookmark.id); }}
                    className="text-zinc-400 hover:text-amber-500 transition-colors p-1"
                    aria-label="نقل للمجموعة"
                    title="نقل للمجموعة"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(bookmark.id); }}
                    className="text-zinc-400 hover:text-red-500 transition-colors p-1"
                    aria-label="حذف الإشارة"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
              </div>

              {/* Move to collection dropdown */}
              {movingBookmark === bookmark.id && (
                <div className="flex flex-wrap gap-2 mb-3 p-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl">
                  {collections.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { onMoveBookmark(bookmark.id, c.id); setMovingBookmark(null); }}
                      className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-sans bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 hover:border-amber-500"
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }}></span>
                      {c.name}
                    </button>
                  ))}
                </div>
              )}

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
          );
        })}
      </div>
    </div>
  );
}
