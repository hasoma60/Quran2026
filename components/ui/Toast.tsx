import React, { useEffect, useState } from 'react';
import { ToastType } from '../../types';

interface ToastProps {
    id: string;
    message: string;
    type: ToastType;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
    onDismiss: (id: string) => void;
}

const toastConfig = {
    success: {
        bg: 'bg-emerald-50/95 dark:bg-emerald-900/90',
        border: 'border-emerald-200 dark:border-emerald-800',
        text: 'text-emerald-800 dark:text-emerald-200',
        icon: 'text-emerald-500',
        Icon: CheckIcon,
    },
    error: {
        bg: 'bg-red-50/95 dark:bg-red-900/90',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-800 dark:text-red-200',
        icon: 'text-red-500',
        Icon: XIcon,
    },
    warning: {
        bg: 'bg-amber-50/95 dark:bg-amber-900/90',
        border: 'border-amber-200 dark:border-amber-800',
        text: 'text-amber-800 dark:text-amber-200',
        icon: 'text-amber-500',
        Icon: AlertIcon,
    },
    info: {
        bg: 'bg-blue-50/95 dark:bg-blue-900/90',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-800 dark:text-blue-200',
        icon: 'text-blue-500',
        Icon: InfoIcon,
    },
};

function CheckIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M20 6 9 17l-5-5" />
        </svg>
    );
}

function XIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
        </svg>
    );
}

function AlertIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" />
        </svg>
    );
}

function InfoIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
        </svg>
    );
}

export function ToastItem({ id, message, type, duration = 3000, action, onDismiss }: ToastProps) {
    const [isExiting, setIsExiting] = useState(false);
    const [progress, setProgress] = useState(100);
    const config = toastConfig[type];
    const Icon = config.Icon;

    useEffect(() => {
        if (duration <= 0) return;

        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);

            if (remaining <= 0) {
                clearInterval(interval);
                handleDismiss();
            }
        }, 16);

        return () => clearInterval(interval);
    }, [duration]);

    const handleDismiss = () => {
        setIsExiting(true);
        setTimeout(() => onDismiss(id), 300);
    };

    return (
        <div
            className={`
        relative overflow-hidden rounded-xl px-4 py-3 shadow-lg backdrop-blur-sm border
        ${config.bg} ${config.border} ${config.text}
        transform transition-all duration-300 ease-out
        ${isExiting ? 'opacity-0 translate-x-full scale-95' : 'opacity-100 translate-x-0 scale-100'}
        hover:scale-[1.02] cursor-pointer
      `}
            onClick={handleDismiss}
            role="alert"
            aria-live="polite"
        >
            {/* Progress bar */}
            {duration > 0 && (
                <div
                    className={`absolute bottom-0 left-0 h-0.5 ${config.icon.replace('text-', 'bg-')}`}
                    style={{ width: `${progress}%`, transition: 'width 16ms linear' }}
                />
            )}

            <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 ${config.icon}`}>
                    <Icon />
                </div>

                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-5 font-sans">{message}</p>

                    {action && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                action.onClick();
                                handleDismiss();
                            }}
                            className={`
                mt-2 text-xs font-semibold underline underline-offset-2
                ${config.text} hover:opacity-80 transition-opacity
              `}
                        >
                            {action.label}
                        </button>
                    )}
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDismiss();
                    }}
                    className="flex-shrink-0 -mr-1 -mt-1 p-1 rounded-full opacity-60 hover:opacity-100 transition-opacity"
                    aria-label="إغلاق"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
