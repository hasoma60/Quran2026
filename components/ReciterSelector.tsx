import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { RECITERS } from '../utils/constants';
import { CloseIcon } from './Icons';

interface ReciterSelectorProps {
  onClose: () => void;
}

export default function ReciterSelector({ onClose }: ReciterSelectorProps) {
  const { selectedReciterId, setSelectedReciterId } = useSettings();

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-t-[32px] shadow-2xl border-t border-zinc-200 dark:border-zinc-800 flex flex-col max-h-[75vh]">
        <div className="px-6 py-4 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100 font-sans">اختر القارئ</h3>
          <button onClick={onClose} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full text-zinc-500" aria-label="إغلاق">
            <CloseIcon size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid gap-2">
            {RECITERS.map((reciter) => (
              <button
                key={reciter.id}
                onClick={() => { setSelectedReciterId(reciter.id); onClose(); }}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all font-sans ${
                  selectedReciterId === reciter.id
                    ? 'border-amber-600 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="text-right">
                  <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{reciter.nameArabic}</h4>
                  <p className="text-xs text-zinc-500 mt-0.5">{reciter.name} {reciter.style ? `• ${reciter.style}` : ''}</p>
                </div>
                {selectedReciterId === reciter.id && (
                  <div className="w-5 h-5 rounded-full bg-amber-600 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
