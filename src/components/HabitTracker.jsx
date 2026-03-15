import { useState, useEffect, useCallback } from 'react';
import { Check, Flame, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPhilippineDateString, getDaysRemaining, getDayNumber, generateCalendarDays, HABITS } from '../lib/dateUtils';
import { getDailyLog, upsertDailyLog } from '../lib/storage';

export default function HabitTracker() {
  const [habits, setHabits] = useState([false, false, false, false, false, false]);
  const [checkedDays, setCheckedDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastToggled, setLastToggled] = useState(null);
  const todayStr = getPhilippineDateString();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const daysRemaining = getDaysRemaining();
  const selectedDayNumber = getDayNumber(selectedDate);
  const calendarDays = generateCalendarDays();
  const isToday = selectedDate === todayStr;

  const loadCheckedDays = useCallback(async () => {
    const checked = [];
    for (const day of calendarDays) {
      if (day > todayStr) break;
      const dayLog = await getDailyLog(day);
      if (dayLog.habits && dayLog.habits.every(h => h === true)) {
        checked.push(day);
      }
    }
    setCheckedDays(checked);
  }, [todayStr]);

  const loadSelectedDay = useCallback(async () => {
    const log = await getDailyLog(selectedDate);
    setHabits(log.habits || [false, false, false, false, false, false]);
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => { loadCheckedDays(); }, [loadCheckedDays]);
  useEffect(() => { loadSelectedDay(); }, [loadSelectedDay]);

  const toggleHabit = async (index) => {
    const updated = [...habits];
    updated[index] = !updated[index];
    setHabits(updated);
    setLastToggled(index);
    setTimeout(() => setLastToggled(null), 250);
    await upsertDailyLog(selectedDate, { habits: updated });

    const allDone = updated.every(h => h);
    setCheckedDays(prev => {
      if (allDone && !prev.includes(selectedDate)) return [...prev, selectedDate];
      if (!allDone && prev.includes(selectedDate)) return prev.filter(d => d !== selectedDate);
      return prev;
    });
  };

  const goToPreviousDay = () => {
    const idx = calendarDays.indexOf(selectedDate);
    if (idx > 0) setSelectedDate(calendarDays[idx - 1]);
  };

  const goToNextDay = () => {
    const idx = calendarDays.indexOf(selectedDate);
    if (idx < calendarDays.length - 1 && calendarDays[idx + 1] <= todayStr) {
      setSelectedDate(calendarDays[idx + 1]);
    }
  };

  const formatSelectedDate = () => {
    if (isToday) return 'Today';
    const d = new Date(selectedDate + 'T00:00:00');
    return d.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getStreak = () => {
    let streak = 0;
    const today = todayStr;
    const sorted = [...checkedDays].sort().reverse();
    for (let i = 0; i < calendarDays.length; i++) {
      const dayIdx = calendarDays.indexOf(today) - i;
      if (dayIdx < 0) break;
      const day = calendarDays[dayIdx];
      if (sorted.includes(day)) streak++;
      else break;
    }
    return streak;
  };

  const streak = getStreak();
  const progress = Math.round((checkedDays.length / 26) * 100);
  const allComplete = habits.every(h => h);

  if (loading) return <div className="flex items-center justify-center h-40 text-ink-muted">Loading...</div>;

  return (
    <div className="flex flex-col gap-3">
      {/* Countdown */}
      <div className="text-center animate-fade-in-up stagger-1">
        <p className="font-display text-[52px] font-bold text-ink leading-none">{daysRemaining}</p>
        <p className="section-label mt-1.5">days to april 10</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 animate-fade-in-up stagger-2">
        <div className="rounded-2xl p-3 shadow-[var(--shadow-card)] text-center" style={{ backgroundColor: 'white' }}>
          <p className="font-display text-lg font-bold text-ink">{checkedDays.length}</p>
          <p className="section-label">Days Done</p>
        </div>
        <div className="rounded-2xl p-3 shadow-[var(--shadow-card)] text-center" style={{ backgroundColor: 'white' }}>
          <div className="flex items-center justify-center gap-1">
            <Flame size={14} className="text-terracotta" />
            <p className="font-display text-lg font-bold text-ink">{streak}</p>
          </div>
          <p className="section-label">Streak</p>
        </div>
        <div className="rounded-2xl p-3 shadow-[var(--shadow-card)] text-center" style={{ backgroundColor: 'white' }}>
          <p className="font-display text-lg font-bold text-ink">{progress}%</p>
          <p className="section-label">Complete</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full rounded-full h-2 overflow-hidden animate-fade-in-up stagger-2" style={{ backgroundColor: '#EEF4EC' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #B5CEAB, #7A9E7E)',
          }}
        />
      </div>

      {/* Habits with Date Navigation */}
      <div className="rounded-2xl shadow-[var(--shadow-card)] overflow-hidden animate-fade-in-up stagger-3" style={{ backgroundColor: 'white' }}>
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={goToPreviousDay}
              disabled={calendarDays.indexOf(selectedDate) === 0}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-cream transition-colors disabled:opacity-30 [-webkit-tap-highlight-color:transparent]"
            >
              <ChevronLeft size={16} className="text-ink-muted" />
            </button>
            <p className="text-sm font-semibold text-ink">Day {selectedDayNumber} — {formatSelectedDate()}</p>
            <button
              onClick={goToNextDay}
              disabled={isToday}
              className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-cream transition-colors disabled:opacity-30 [-webkit-tap-highlight-color:transparent]"
            >
              <ChevronRight size={16} className="text-ink-muted" />
            </button>
          </div>
          {allComplete && (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-sage bg-sage-pale px-2 py-1 rounded-full uppercase tracking-wide">
              <Trophy size={10} /> Done
            </span>
          )}
        </div>
        <div className="border-t border-border/50">
          {HABITS.map((habit, i) => (
            <button
              key={i}
              onClick={() => toggleHabit(i)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-cream/40 transition-colors [-webkit-tap-highlight-color:transparent] border-b border-border/30 last:border-b-0"
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-all ${
                habits[i]
                  ? 'bg-sage text-white'
                  : 'border-[1.5px] border-ink-faint/50'
              } ${lastToggled === i && habits[i] ? 'animate-check-bounce' : ''}`}>
                {habits[i] && <Check size={12} strokeWidth={3} />}
              </div>
              <span className={`text-[13px] font-medium ${habits[i] ? 'text-ink-faint line-through' : 'text-ink'}`}>
                {habit}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-2xl p-4 shadow-[var(--shadow-card)] animate-fade-in-up stagger-4" style={{ backgroundColor: 'white' }}>
        <p className="section-label mb-3">26-Day Calendar</p>
        <div className="grid grid-cols-7 gap-1.5">
          {calendarDays.map((day) => {
            const dayNum = parseInt(day.split('-')[2]);
            const isDayToday = day === todayStr;
            const isSelected = day === selectedDate;
            const isComplete = checkedDays.includes(day);
            const isFuture = day > todayStr;

            return (
              <button
                key={day}
                disabled={isFuture}
                onClick={() => !isFuture && setSelectedDate(day)}
                className={`w-full aspect-square rounded-lg flex items-center justify-center text-[11px] font-semibold transition-all [-webkit-tap-highlight-color:transparent] ${
                  isComplete
                    ? `bg-sage text-white ${isSelected ? 'ring-2 ring-ink/20' : ''}`
                    : isSelected
                      ? 'ring-2 ring-sage bg-sage-pale text-sage'
                      : isDayToday
                        ? 'ring-1.5 ring-sage/40 bg-sage-pale/50 text-sage'
                        : isFuture
                          ? 'bg-cream/60 text-ink-faint cursor-default'
                          : 'bg-white text-ink-muted shadow-[0_1px_3px_rgba(30,30,26,0.04)]'
                }`}
              >
                {dayNum}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
