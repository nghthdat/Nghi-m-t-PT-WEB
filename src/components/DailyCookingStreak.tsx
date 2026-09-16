import React, { useState, useEffect } from 'react';
import { Flame, CheckCircle2, Award, Calendar, Sparkles, ChevronRight, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const DailyCookingStreak: React.FC = () => {
  const { showToast } = useAuth();
  
  // Day indices 0 to 6 (Thứ 2 to Chủ nhật)
  const daysOfWeek = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  
  const [completedDays, setCompletedDays] = useState<boolean[]>([true, true, false, false, false, false, false]);
  const [currentStreak, setCurrentStreak] = useState<number>(2);
  const [isTodayDone, setIsTodayDone] = useState<boolean>(false);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cooking_streak_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.days)) setCompletedDays(parsed.days);
        if (typeof parsed.streak === 'number') setCurrentStreak(parsed.streak);
        if (typeof parsed.todayDone === 'boolean') setIsTodayDone(parsed.todayDone);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleToggleToday = () => {
    const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0
    const nextDays = [...completedDays];
    const nextTodayDone = !isTodayDone;
    nextDays[todayIndex] = nextTodayDone;

    const nextStreak = nextTodayDone ? currentStreak + 1 : Math.max(0, currentStreak - 1);
    setCompletedDays(nextDays);
    setIsTodayDone(nextTodayDone);
    setCurrentStreak(nextStreak);

    try {
      localStorage.setItem('cooking_streak_data', JSON.stringify({
        days: nextDays,
        streak: nextStreak,
        todayDone: nextTodayDone,
        lastUpdated: new Date().toISOString()
      }));
    } catch (e) {
      console.error(e);
    }

    if (nextTodayDone) {
      showToast(`Tuyệt vời! Bạn đã hoàn thành bữa cơm nhà hôm nay! 🔥 Chuỗi ${nextStreak} ngày`, 'success');
    } else {
      showToast('Đã bỏ đánh dấu bữa cơm hôm nay', 'info');
    }
  };

  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <div className="rounded-3xl bg-gradient-to-r from-[#2B2118] via-[#3B291D] to-[#2B2118] text-white p-5 sm:p-6 border border-[#523C2B] shadow-lg relative overflow-hidden">
      {/* Flame ambient glow */}
      <div className="absolute top-0 right-1/4 -mt-10 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Left info */}
        <div className="space-y-1 max-w-md">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-black text-orange-400 bg-orange-950/80 px-2.5 py-0.5 rounded-full border border-orange-700/50">
              <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-400 animate-pulse" />
              Chuỗi Bếp Ấm: {currentStreak} Ngày Liên Tiếp
            </span>
            <span className="text-[11px] text-amber-200/70">
              Cấp độ: {currentStreak >= 5 ? 'Bếp Trưởng' : 'Đầu Bếp Siêng Năng'}
            </span>
          </div>

          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Thử Thách 7 Ngày Nấu Cơm Nhà</span>
            <Trophy className="w-4 h-4 text-amber-300" />
          </h3>
          <p className="text-xs text-[#D1C2B4] leading-relaxed">
            Nấu ăn tại nhà giúp kiểm soát calo và gắn kết tình cảm gia đình. Hãy điểm danh mỗi ngày bạn vào bếp!
          </p>
        </div>

        {/* Right action & weekly dots */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-4 bg-white/5 backdrop-blur-md p-3 rounded-2xl border border-white/10">
          {/* Days loop */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {daysOfWeek.map((day, idx) => {
              const isDone = completedDays[idx];
              const isToday = idx === todayIndex;

              return (
                <div key={day} className="flex flex-col items-center gap-1">
                  <span className={`text-[10px] font-bold ${isToday ? 'text-orange-400 font-black underline' : 'text-stone-400'}`}>
                    {day}
                  </span>
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-xs shadow-orange-500/50 scale-105'
                        : isToday
                        ? 'border-2 border-orange-400 text-orange-300 bg-orange-900/30'
                        : 'bg-white/10 text-stone-400 border border-white/10'
                    }`}
                  >
                    {isDone ? '✓' : isToday ? '🍳' : '•'}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Check-in Button */}
          <button
            onClick={handleToggleToday}
            className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 active:scale-95 ${
              isTodayDone
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                : 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md shadow-orange-500/30'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{isTodayDone ? 'Đã Vào Bếp Hôm Nay ✓' : 'Điểm Danh Nấu Bữa Nay'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
