import React, { useState } from 'react';
import { View } from '../types';
import { BookIcon, OpenBookIcon, BookmarkIcon, SparkleIcon, SettingsIcon, ListIcon, CalendarIcon, NoteIcon, BrainIcon, ChartIcon, CompassIcon } from './Icons';

interface BottomNavProps {
  currentView: View;
  onViewChange: (view: View) => void;
  bookmarkCount: number;
}

export default function BottomNav({ currentView, onViewChange, bookmarkCount }: BottomNavProps) {
  const [showMore, setShowMore] = useState(false);

  const mainNavItems = [
    { view: View.HOME, label: 'القرآن', icon: <BookIcon size={22} /> },
    { view: View.READER, label: 'القراءة', icon: <OpenBookIcon size={22} /> },
    { view: View.BOOKMARKS, label: 'المحفوظات', icon: <BookmarkIcon size={22} />, badge: bookmarkCount > 0 ? bookmarkCount : undefined },
    { view: View.AI_CHAT, label: 'نور', icon: <SparkleIcon size={22} /> },
    { view: View.SETTINGS, label: 'المزيد', icon: <ListIcon size={22} />, isMore: true },
  ];

  const moreItems = [
    { view: View.JUZ_NAVIGATOR, label: 'الأجزاء', icon: <CompassIcon size={20} /> },
    { view: View.KHATMAH, label: 'الختمة', icon: <CalendarIcon size={20} /> },
    { view: View.NOTES, label: 'ملاحظات', icon: <NoteIcon size={20} /> },
    { view: View.MEMORIZATION, label: 'الحفظ', icon: <BrainIcon size={20} /> },
    { view: View.STATS, label: 'إحصائيات', icon: <ChartIcon size={20} /> },
    { view: View.THEMATIC, label: 'موضوعات', icon: <BookIcon size={20} /> },
    { view: View.SETTINGS, label: 'الإعدادات', icon: <SettingsIcon size={20} /> },
  ];

  const handleNavClick = (item: typeof mainNavItems[0]) => {
    if (item.isMore) {
      setShowMore(!showMore);
    } else {
      onViewChange(item.view);
      setShowMore(false);
    }
  };

  return (
    <>
      {/* More menu overlay */}
      {showMore && (
        <div className="fixed inset-0 z-[90]" onClick={() => setShowMore(false)}>
          <div className="absolute bottom-[72px] left-0 right-0 p-4">
            <div className="max-w-lg mx-auto bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-3 grid grid-cols-4 gap-2" onClick={e => e.stopPropagation()}>
              {moreItems.map((item) => (
                <button
                  key={item.view + item.label}
                  onClick={() => { onViewChange(item.view); setShowMore(false); }}
                  className={`flex flex-col items-center p-3 rounded-xl transition-all text-center ${
                    currentView === item.view
                      ? 'text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/10'
                      : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                  aria-label={item.label}
                >
                  {item.icon}
                  <span className="text-[10px] font-medium mt-1.5 font-sans">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-black/95 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-900 pt-2 px-6 pb-2 transition-colors duration-300 font-sans z-[80]" role="navigation" aria-label="التنقل الرئيسي">
        <div className="flex justify-between items-center max-w-lg mx-auto">
          {mainNavItems.map((item) => (
            <button
              key={item.label}
              onClick={() => handleNavClick(item)}
              className={`relative flex flex-col items-center p-3 rounded-2xl transition-all ${
                (item.isMore ? showMore : currentView === item.view)
                  ? 'text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/10'
                  : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'
              }`}
              aria-label={item.label}
              aria-current={currentView === item.view ? 'page' : undefined}
            >
              {item.icon}
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
              {item.badge && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-600 text-white text-[8px] rounded-full flex items-center justify-center font-bold">
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
