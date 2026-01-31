import React, { useState } from 'react';
import { useReadingProgress } from '../contexts/ReadingProgressContext';
import { useToast } from '../contexts/ToastContext';
import { CalendarIcon, TrashIcon, TrophyIcon } from './Icons';
import { toArabicNumerals } from '../utils/typography';

export default function KhatmahPlanner() {
  const { khatmahPlans, createKhatmahPlan, markDayComplete, deleteKhatmahPlan, stats } = useReadingProgress();
  const { showToast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [planName, setPlanName] = useState('');
  const [planDays, setPlanDays] = useState(30);

  const presets = [
    { days: 7, label: 'أسبوع واحد' },
    { days: 14, label: 'أسبوعان' },
    { days: 30, label: 'شهر واحد' },
    { days: 60, label: 'شهران' },
  ];

  const handleCreate = () => {
    if (!planName.trim()) {
      showToast('الرجاء إدخال اسم الختمة', 'warning');
      return;
    }
    createKhatmahPlan(planName, planDays);
    showToast('تم إنشاء خطة الختمة', 'success');
    setShowCreate(false);
    setPlanName('');
  };

  const getProgress = (plan: typeof khatmahPlans[0]) => {
    const completed = Object.keys(plan.completedDays).length;
    return Math.round((completed / plan.totalDays) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">خطة الختمة</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-xl bg-amber-600 text-white font-sans text-sm font-medium hover:bg-amber-700 transition-colors"
        >
          + ختمة جديدة
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200/50 dark:border-amber-800/30">
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-500 font-sans">{toArabicNumerals(stats.currentStreak)}</p>
          <p className="text-xs text-zinc-500 font-sans mt-1">أيام متتالية</p>
        </div>
        <div className="text-center p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">{toArabicNumerals(stats.chaptersCompleted)}</p>
          <p className="text-xs text-zinc-500 font-sans mt-1">سور مكتملة</p>
        </div>
        <div className="text-center p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800">
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">{toArabicNumerals(stats.longestStreak)}</p>
          <p className="text-xs text-zinc-500 font-sans mt-1">أطول سلسلة</p>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 space-y-4">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 font-sans">ختمة جديدة</h3>
          <input
            type="text"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="اسم الختمة..."
            className="w-full p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-sans text-sm focus:outline-none focus:border-amber-500"
            dir="rtl"
          />
          <div className="grid grid-cols-4 gap-2">
            {presets.map(p => (
              <button
                key={p.days}
                onClick={() => setPlanDays(p.days)}
                className={`p-2 rounded-lg text-xs font-sans transition-colors ${
                  planDays === p.days
                    ? 'bg-amber-600 text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowCreate(false)} className="flex-1 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-sans text-sm">إلغاء</button>
            <button onClick={handleCreate} className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white font-sans text-sm font-medium">إنشاء</button>
          </div>
        </div>
      )}

      {/* Active Plans */}
      {khatmahPlans.length === 0 && !showCreate ? (
        <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
          <CalendarIcon size={48} className="text-zinc-300 dark:text-zinc-700" />
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">لا توجد خطط</h3>
          <p className="text-zinc-500 max-w-xs font-sans">أنشئ خطة لختم القرآن وتابع تقدمك يومياً.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {khatmahPlans.map((plan) => {
            const progress = getProgress(plan);
            const completed = Object.keys(plan.completedDays).length;
            const today = new Date().toISOString().split('T')[0];
            const todayDone = plan.completedDays[today];

            return (
              <div key={plan.id} className="p-5 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800/50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-zinc-100 font-sans">{plan.name}</h4>
                    <p className="text-xs text-zinc-500 font-sans mt-0.5">
                      {toArabicNumerals(completed)} من {toArabicNumerals(plan.totalDays)} يوم
                    </p>
                  </div>
                  <button onClick={() => { deleteKhatmahPlan(plan.id); showToast('تم حذف الخطة', 'info'); }} className="p-1.5 text-zinc-400 hover:text-red-500" aria-label="حذف الخطة">
                    <TrashIcon size={16} />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full mb-3 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-500 font-sans">
                    {progress === 100 ? (
                      <span className="flex items-center gap-1"><TrophyIcon size={16} /> مكتملة!</span>
                    ) : `${toArabicNumerals(progress)}%`}
                  </span>
                  {!todayDone && progress < 100 && (
                    <button
                      onClick={() => { markDayComplete(plan.id); showToast('تم تسجيل يوم اليوم', 'success'); }}
                      className="px-4 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-sans font-medium hover:bg-amber-700 transition-colors"
                    >
                      تسجيل يوم اليوم
                    </button>
                  )}
                  {todayDone && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-sans font-medium">تم اليوم</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
