import { useState, useEffect } from 'react';
import { getFastingState, formatTimer } from '../lib/dateUtils';
import { Moon, Sun } from 'lucide-react';

export default function FastTimer() {
  const [state, setState] = useState(getFastingState());

  useEffect(() => {
    const interval = setInterval(() => setState(getFastingState()), 1000);
    return () => clearInterval(interval);
  }, []);

  const { isFasting, remainingSeconds, progress } = state;
  const circumference = 2 * Math.PI * 62;
  const strokeOffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Status Badge */}
      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase animate-fade-in-up stagger-1 ${
        isFasting
          ? 'bg-terra-pale text-terracotta'
          : 'bg-sage-pale text-sage'
      }`}>
        {isFasting ? <Moon size={13} /> : <Sun size={13} />}
        {isFasting ? "Fasting" : 'Eating window'}
      </div>

      {/* Ring Timer */}
      <div className="relative w-[150px] h-[150px] animate-fade-in-up stagger-2">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140">
          <circle
            cx="70" cy="70" r="62"
            fill="none"
            stroke={isFasting ? '#FAF0EB' : '#EEF4EC'}
            strokeWidth="6"
          />
          <circle
            cx="70" cy="70" r="62"
            fill="none"
            stroke={isFasting ? '#C4714A' : '#7A9E7E'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-[36px] font-bold text-ink leading-none tracking-tight">
            {formatTimer(remainingSeconds)}
          </span>
          <span className="section-label mt-1">remaining</span>
        </div>
      </div>

      {/* Schedule Cards */}
      <div className="w-full grid grid-cols-2 gap-3 animate-fade-in-up stagger-3">
        <div className={`rounded-2xl p-4 transition-shadow ${
          !isFasting
            ? 'shadow-[var(--shadow-card-hover)] ring-1 ring-sage/20'
            : 'shadow-[var(--shadow-card)]'
        }`} style={{ backgroundColor: 'white' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Sun size={12} className="text-sage" />
            <span className="section-label">Eating</span>
          </div>
          <p className="font-display text-xl font-bold text-ink leading-tight">11:00 AM</p>
          <p className="text-[11px] text-ink-faint mt-0.5">to 7:00 PM</p>
        </div>
        <div className={`rounded-2xl p-4 transition-shadow ${
          isFasting
            ? 'shadow-[var(--shadow-card-hover)] ring-1 ring-terracotta/20'
            : 'shadow-[var(--shadow-card)]'
        }`} style={{ backgroundColor: 'white' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <Moon size={12} className="text-terracotta" />
            <span className="section-label">Fasting</span>
          </div>
          <p className="font-display text-xl font-bold text-ink leading-tight">7:00 PM</p>
          <p className="text-[11px] text-ink-faint mt-0.5">to 11:00 AM</p>
        </div>
      </div>

      {/* Tips */}
      <div className="w-full rounded-2xl p-4 shadow-[var(--shadow-card)] animate-fade-in-up stagger-4" style={{ backgroundColor: 'white' }}>
        <p className="section-label mb-3">
          {isFasting ? 'Fasting tips' : 'Eating window tips'}
        </p>
        <div className="flex flex-col gap-2.5">
          {(isFasting ? [
            'Drink water or black coffee to stay hydrated',
            'Keep yourself busy — rest, read, or plan meals',
            'Sleep early for better fasting results',
          ] : [
            'Start with a light, balanced meal',
            'Eat whole foods — vegetables, protein, and healthy fats',
            'Stop eating by 7:00 PM sharp',
          ]).map((tip, i) => (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-sage mt-1.5 flex-shrink-0" />
              <span className="text-[13px] text-ink-muted leading-snug">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
