import React, { useState } from 'react';
import { useBookmarks } from '../contexts/BookmarkContext';
import { useSettings } from '../contexts/SettingsContext';
import { NoteIcon, TrashIcon, CloseIcon } from './Icons';
import { formatRelativeDate } from '../utils/typography';
import { useToast } from '../contexts/ToastContext';

interface NotesViewProps {
  onNavigate: (chapterId: number, verseKey: string) => void;
}

export default function NotesView({ onNavigate }: NotesViewProps) {
  const { notes, deleteNote, updateNote } = useBookmarks();
  const { quranFont } = useSettings();
  const { showToast } = useToast();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const startEdit = (id: string, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const saveEdit = () => {
    if (editingId && editText.trim()) {
      updateNote(editingId, editText);
      showToast('تم حفظ الملاحظة', 'success');
    }
    setEditingId(null);
    setEditText('');
  };

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center space-y-5 px-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-zinc-900/50 border border-amber-200/50 dark:border-amber-800/30 flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-sm">
          <NoteIcon size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">لا توجد ملاحظات</h3>
          <p className="text-zinc-500 max-w-xs mx-auto font-sans text-sm leading-relaxed">
            سجل تأملاتك وملاحظاتك على الآيات أثناء قراءتك. الملاحظات تساعدك على فهم أعمق للقرآن.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">ملاحظاتي</h2>
        <span className="text-sm text-zinc-500 font-sans">{notes.length} ملاحظة</span>
      </div>

      <div className="grid gap-4">
        {notes.map((note) => (
          <div key={note.id} className="p-5 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50">
            <div className="flex justify-between items-start mb-3">
              <button
                onClick={() => onNavigate(note.chapterId, note.verseKey)}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-500 text-xs font-semibold font-sans hover:underline"
              >
                سورة {note.chapterName} &bull; {note.verseKey}
              </button>
              <div className="flex gap-1">
                <button onClick={() => { deleteNote(note.id); showToast('تم حذف الملاحظة', 'info'); }} className="p-1.5 text-zinc-400 hover:text-red-500 transition-colors" aria-label="حذف الملاحظة">
                  <TrashIcon size={16} />
                </button>
              </div>
            </div>

            <p className="text-zinc-700 dark:text-zinc-300 text-sm line-clamp-2 mb-2 leading-loose" style={{ fontFamily: quranFont }}>
              {note.verseText}
            </p>

            {editingId === note.id ? (
              <div className="mt-3 space-y-2">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-sans text-sm resize-none focus:outline-none focus:border-amber-500"
                  rows={3}
                  dir="rtl"
                />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-sans">إلغاء</button>
                  <button onClick={saveEdit} className="px-3 py-1.5 text-xs rounded-lg bg-amber-600 text-white font-sans">حفظ</button>
                </div>
              </div>
            ) : (
              <div
                className="mt-3 p-3 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 text-sm text-zinc-700 dark:text-zinc-300 font-sans leading-relaxed cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                onClick={() => startEdit(note.id, note.note)}
              >
                {note.note}
              </div>
            )}

            <p className="text-xs text-zinc-400 mt-2 font-sans">{formatRelativeDate(note.updatedAt)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
