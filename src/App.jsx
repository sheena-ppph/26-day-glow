import { useState } from 'react';
import { Timer, Droplets, CalendarCheck, Scale, Utensils, Bell } from 'lucide-react';
import FastTimer from './components/FastTimer';
import WaterTracker from './components/WaterTracker';
import HabitTracker from './components/HabitTracker';
import WeightLog from './components/WeightLog';
import MealPlan from './components/MealPlan';
import Reminders from './components/Reminders';
import './index.css';

const TABS = [
  { id: 'fast', label: 'Fast', icon: Timer },
  { id: 'water', label: 'Water', icon: Droplets },
  { id: 'track', label: 'Track', icon: CalendarCheck },
  { id: 'weight', label: 'Weight', icon: Scale },
  { id: 'meals', label: 'Meals', icon: Utensils },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('fast');
  const [showReminders, setShowReminders] = useState(false);

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-4 pb-3 bg-cream/80 backdrop-blur-sm sticky top-0 z-40">
        <h1 className="font-display text-xl font-semibold text-ink tracking-tight">
          26 Day Glow
        </h1>
        <button
          onClick={() => setShowReminders(true)}
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-white/60 transition-colors [-webkit-tap-highlight-color:transparent]"
          aria-label="Reminders"
        >
          <Bell size={18} className="text-ink-muted" />
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 pt-3 pb-20" key={activeTab}>
        <div className="animate-fade-in-up">
          {activeTab === 'fast' && <FastTimer />}
          {activeTab === 'water' && <WaterTracker />}
          {activeTab === 'track' && <HabitTracker />}
          {activeTab === 'weight' && <WeightLog />}
          {activeTab === 'meals' && <MealPlan />}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white/90 backdrop-blur-md pb-[env(safe-area-inset-bottom,6px)] z-50 shadow-[0_-1px_12px_rgba(30,30,26,0.04)]">
        <div className="flex items-center justify-around h-14">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 transition-all [-webkit-tap-highlight-color:transparent] outline-none focus:outline-none"
            >
              <Icon
                size={20}
                strokeWidth={activeTab === id ? 2.2 : 1.6}
                className={`transition-colors ${activeTab === id ? 'text-sage' : 'text-ink-faint'}`}
              />
              <span className={`text-[10px] font-medium transition-colors ${activeTab === id ? 'text-sage' : 'text-ink-faint'}`}>
                {label}
              </span>
              {activeTab === id && (
                <div className="w-1 h-1 rounded-full bg-sage mt-0.5" />
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Reminders Bottom Sheet */}
      {showReminders && <Reminders onClose={() => setShowReminders(false)} />}
    </div>
  );
}
