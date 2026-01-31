import React from 'react';

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    action?: {
        label: string;
        onClick: () => void;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
    };
}

export function EmptyState({ icon, title, description, action, secondaryAction }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center h-96 text-center space-y-5 px-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-zinc-900/50 border border-amber-200/50 dark:border-amber-800/30 flex items-center justify-center text-amber-500 dark:text-amber-400 shadow-sm">
                {icon}
            </div>

            <div className="space-y-2">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">
                    {title}
                </h3>
                <p className="text-zinc-500 max-w-xs mx-auto font-sans text-sm leading-relaxed">
                    {description}
                </p>
            </div>

            {(action || secondaryAction) && (
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    {action && (
                        <button
                            onClick={action.onClick}
                            className="px-6 py-2.5 rounded-xl bg-amber-600 text-white font-sans text-sm font-medium hover:bg-amber-700 transition-all active:scale-[0.98] shadow-sm hover:shadow-md"
                        >
                            {action.label}
                        </button>
                    )}
                    {secondaryAction && (
                        <button
                            onClick={secondaryAction.onClick}
                            className="px-6 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-sans text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-[0.98]"
                        >
                            {secondaryAction.label}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

// Pre-configured empty states for common use cases
export function EmptyBookmarks({ onBrowse }: { onBrowse: () => void }) {
    return (
        <EmptyState
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </svg>
            }
            title="لا توجد إشارات مرجعية"
            description="احفظ آياتك المفضلة للوصول إليها بسرعة في أي وقت. اضغط على أيقونة الحفظ بجانب أي آية."
            action={{
                label: "تصفح القرآن",
                onClick: onBrowse
            }}
        />
    );
}

export function EmptyNotes({ onBrowse }: { onBrowse: () => void }) {
    return (
        <EmptyState
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
            }
            title="لا توجد ملاحظات"
            description="سجل تأملاتك وملاحظاتك على الآيات أثناء قراءتك. الملاحظات تساعدك على فهم أعمق للقرآن."
            action={{
                label: "تصفح القرآن",
                onClick: onBrowse
            }}
        />
    );
}

export function EmptySearch({ query, onClear }: { query: string; onClear: () => void }) {
    return (
        <EmptyState
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                </svg>
            }
            title="لا توجد نتائج"
            description={`لم نجد نتائج مطابقة لـ "${query}". جرب كلمات مختلفة أو تحقق من الإملاء.`}
            action={{
                label: "مسح البحث",
                onClick: onClear
            }}
        />
    );
}

export function EmptyKhatmah({ onCreate }: { onCreate: () => void }) {
    return (
        <EmptyState
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                    <line x1="16" x2="16" y1="2" y2="6" />
                    <line x1="8" x2="8" y1="2" y2="6" />
                    <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
            }
            title="لا توجد خطط ختمة"
            description="خطط لختم القرآن في وقت محدد. حدد هدفك اليومي وتابع تقدمك خطوة بخطوة."
            action={{
                label: "إنشاء خطة جديدة",
                onClick: onCreate
            }}
        />
    );
}

export function EmptyMemorization({ onBrowse }: { onBrowse: () => void }) {
    return (
        <EmptyState
            icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
                    <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
                </svg>
            }
            title="ابدأ رحلة الحفظ"
            description="اختر سورة ونطاق الآيات للبدء في التدريب. استخدم خاصية إخفاء الكلمات لاختبار حفظك."
            action={{
                label: "اختيار السورة",
                onClick: onBrowse
            }}
        />
    );
}
