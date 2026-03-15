import { useState, useEffect } from 'react';
import { Droplets, Plus, Minus } from 'lucide-react';
import { getPhilippineDateString } from '../lib/dateUtils';
import { getDailyLog, upsertDailyLog } from '../lib/storage';

export default function WaterTracker() {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tappedGlass, setTappedGlass] = useState(null);
  const dateStr = getPhilippineDateString();

  useEffect(() => {
    getDailyLog(dateStr).then(log => {
      setCount(log.water_count || 0);
      setLoading(false);
    });
  }, [dateStr]);

  const updateCount = async (newCount) => {
    const clamped = Math.max(0, Math.min(12, newCount));
    setCount(clamped);
    await upsertDailyLog(dateStr, { water_count: clamped });
  };

  const tapGlass = (i) => {
    setTappedGlass(i);
    setTimeout(() => setTappedGlass(null), 300);
    updateCount(i < count ? i : i + 1);
  };

  if (loading) return <div className="flex items-center justify-center h-40 text-ink-muted">Loading...</div>;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Progress Text */}
      <div className="text-center animate-fade-in-up stagger-1">
        <p className="font-display text-[52px] font-bold text-ink leading-none">{count}</p>
        <p className="section-label mt-1.5">of 8 glasses today</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full rounded-full h-2.5 overflow-hidden animate-fade-in-up stagger-2" style={{ backgroundColor: '#EEF4EC' }}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${Math.min(100, (count / 8) * 100)}%`,
            background: 'linear-gradient(90deg, #B5CEAB, #7A9E7E)',
          }}
        />
      </div>

      {/* Glass Grid */}
      <div className="grid grid-cols-4 gap-2.5 w-full max-w-[230px] animate-fade-in-up stagger-3">
        {Array.from({ length: 8 }, (_, i) => (
          <button
            key={i}
            onClick={() => tapGlass(i)}
            className={`flex flex-col items-center justify-center w-full aspect-square rounded-xl transition-all duration-200 [-webkit-tap-highlight-color:transparent] ${
              i < count
                ? 'bg-sage/10 text-sage shadow-[var(--shadow-card)]'
                : 'bg-white text-ink-faint shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]'
            } ${tappedGlass === i ? 'animate-scale-pop' : ''}`}
          >
            <Droplets size={18} className={i < count ? 'fill-sage/20' : ''} />
            <span className="text-[9px] font-semibold mt-0.5">{i + 1}</span>
          </button>
        ))}
      </div>

      {/* Quick Controls */}
      <div className="flex items-center gap-3 animate-fade-in-up stagger-4">
        <button
          onClick={() => updateCount(count - 1)}
          disabled={count <= 0}
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-white shadow-[var(--shadow-card)] text-ink-muted hover:shadow-[var(--shadow-card-hover)] disabled:opacity-30 transition-all [-webkit-tap-highlight-color:transparent]"
        >
          <Minus size={18} strokeWidth={2.2} />
        </button>
        <button
          onClick={() => updateCount(count + 1)}
          disabled={count >= 12}
          className="w-11 h-11 flex items-center justify-center rounded-xl bg-sage text-white shadow-[0_2px_8px_rgba(122,158,126,0.3)] hover:shadow-[0_4px_12px_rgba(122,158,126,0.4)] disabled:opacity-30 transition-all [-webkit-tap-highlight-color:transparent]"
        >
          <Plus size={18} strokeWidth={2.2} />
        </button>
      </div>

      {/* Completion Badge */}
      {count >= 8 && (
        <div className="bg-sage-pale text-sage rounded-xl px-4 py-2.5 text-xs font-semibold text-center tracking-wide animate-fade-in-up">
          Goal reached! Great hydration today
        </div>
      )}

      {/* Tips */}
      <div className="w-full rounded-2xl p-4 shadow-[var(--shadow-card)] animate-fade-in-up stagger-5" style={{ backgroundColor: 'white' }}>
        <p className="section-label mb-3">Hydration tips</p>
        <div className="flex flex-col gap-2.5">
          {[
            'Drink a glass when you wake up',
            'Keep a water bottle nearby at all times',
            'Set reminders every 2 hours',
            'Add calamansi for flavor if needed',
          ].map((tip, i) => (
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
