import React from 'react';

interface SkeletonProps {
    className?: string;
    count?: number;
}

export function Skeleton({ className = '', count = 1 }: SkeletonProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={`animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded ${className}`}
                />
            ))}
        </>
    );
}

export function ChapterCardSkeleton() {
    return (
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                    <div className="space-y-2">
                        <div className="h-5 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
                        <div className="h-3 w-16 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    </div>
                </div>
                <div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
        </div>
    );
}

export function VerseSkeleton() {
    return (
        <div className="p-4 rounded-3xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 animate-pulse space-y-4">
            <div className="flex justify-end gap-2">
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="space-y-2">
                <div className="h-6 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-6 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
            <div className="h-4 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
    );
}

export function DailyVerseSkeleton() {
    return (
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-zinc-900/50 border border-amber-200/50 dark:border-amber-800/30 animate-pulse">
            <div className="flex items-center justify-between mb-4">
                <div className="h-5 w-24 bg-amber-200/50 dark:bg-amber-800/30 rounded" />
                <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-200/50 dark:bg-amber-800/30" />
                    <div className="w-7 h-7 rounded-full bg-amber-200/50 dark:bg-amber-800/30" />
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-8 w-full bg-amber-200/50 dark:bg-amber-800/30 rounded" />
                <div className="h-8 w-3/4 bg-amber-200/50 dark:bg-amber-800/30 rounded" />
            </div>
            <div className="mt-4 h-4 w-32 bg-amber-200/50 dark:bg-amber-800/30 rounded" />
        </div>
    );
}

export function SearchResultSkeleton() {
    return (
        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 animate-pulse">
            <div className="h-4 w-32 bg-amber-200/50 dark:bg-amber-800/30 rounded mb-2" />
            <div className="h-6 w-full bg-amber-200/50 dark:bg-amber-800/30 rounded" />
        </div>
    );
}

export function BookmarkCardSkeleton() {
    return (
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 animate-pulse space-y-3">
            <div className="flex justify-between">
                <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-5 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
            <div className="h-16 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
    );
}

export function NoteCardSkeleton() {
    return (
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 animate-pulse space-y-3">
            <div className="flex justify-between">
                <div className="h-5 w-28 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="w-6 h-6 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="h-12 w-full bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-16 w-full bg-amber-100 dark:bg-amber-900/20 rounded" />
        </div>
    );
}

export function StatsCardSkeleton() {
    return (
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 animate-pulse text-center">
            <div className="w-5 h-5 mx-auto mb-2 bg-zinc-200 dark:bg-zinc-800 rounded" />
            <div className="h-6 w-12 mx-auto bg-zinc-200 dark:bg-zinc-800 rounded mb-1" />
            <div className="h-3 w-16 mx-auto bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
    );
}

export function KhatmahCardSkeleton() {
    return (
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50 animate-pulse space-y-3">
            <div className="flex justify-between">
                <div className="space-y-2">
                    <div className="h-5 w-32 bg-zinc-200 dark:bg-zinc-800 rounded" />
                    <div className="h-3 w-24 bg-zinc-200 dark:bg-zinc-800 rounded" />
                </div>
                <div className="w-6 h-6 rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-800 rounded-full" />
            <div className="flex justify-between">
                <div className="h-4 w-12 bg-zinc-200 dark:bg-zinc-800 rounded" />
                <div className="h-6 w-20 bg-zinc-200 dark:bg-zinc-800 rounded" />
            </div>
        </div>
    );
}
