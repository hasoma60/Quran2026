import React, { useState, useEffect, useRef } from 'react';
import { Verse, Chapter } from '../../types';

interface QuickActionsProps {
    verse: Verse;
    chapter: Chapter;
    isOpen: boolean;
    onClose: () => void;
    onBookmark: () => void;
    onShare: () => void;
    onNote: () => void;
    onPlay: () => void;
    onTafsir: () => void;
    onAskAI: () => void;
    isBookmarked: boolean;
}

export function QuickActionsMenu({
    verse,
    chapter,
    isOpen,
    onClose,
    onBookmark,
    onShare,
    onNote,
    onPlay,
    onTafsir,
    onAskAI,
    isBookmarked
}: QuickActionsProps) {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const actions = [
        { icon: isBookmarked ? BookmarkFilledIcon : BookmarkIcon, label: isBookmarked ? 'إزالة الحفظ' : 'حفظ', onClick: onBookmark, color: 'text-amber-600' },
        { icon: PlayIcon, label: 'استماع', onClick: onPlay, color: 'text-emerald-600' },
        { icon: BookIcon, label: 'تفسير', onClick: onTafsir, color: 'text-blue-600' },
        { icon: SparkleIcon, label: 'تدبر', onClick: onAskAI, color: 'text-purple-600' },
        { icon: NoteIcon, label: 'ملاحظة', onClick: onNote, color: 'text-orange-600' },
        { icon: ShareIcon, label: 'مشاركة', onClick: onShare, color: 'text-cyan-600' },
    ];

    return (
        <div
            ref={menuRef}
            className="absolute z-50 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-2 min-w-[160px] animate-in fade-in zoom-in-95 duration-200"
            style={{ direction: 'rtl' }}
        >
            <div className="text-xs text-zinc-500 font-sans px-3 py-2 border-b border-zinc-100 dark:border-zinc-800 mb-1">
                سورة {chapter.name_arabic} - آية {verse.verse_key.split(':')[1]}
            </div>
            <div className="grid grid-cols-2 gap-1">
                {actions.map((action) => (
                    <button
                        key={action.label}
                        onClick={() => {
                            action.onClick();
                            onClose();
                        }}
                        className="flex flex-col items-center gap-1.5 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <action.icon className={`w-5 h-5 ${action.color}`} />
                        <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 font-sans">{action.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

// Icons
function BookmarkIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </svg>
    );
}

function BookmarkFilledIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
        </svg>
    );
}

function PlayIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
    );
}

function BookIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
    );
}

function SparkleIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
        </svg>
    );
}

function NoteIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    );
}

function ShareIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" x2="12" y1="2" y2="15" />
        </svg>
    );
}
