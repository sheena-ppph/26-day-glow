import { useState, useEffect } from 'react';
import { Clock, Pencil, X } from 'lucide-react';
import { getMealPlan, updateMeal } from '../lib/storage';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MealPlan() {
  const today = new Date().getDay();
  const [activeDay, setActiveDay] = useState(today === 0 ? 6 : today - 1);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingMeal, setEditingMeal] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    setLoading(true);
    getMealPlan(activeDay).then(data => {
      setMeals(data);
      setLoading(false);
    });
  }, [activeDay]);

  const openEdit = (index) => {
    setEditingMeal(index);
    setEditForm({ name: meals[index].name, time: meals[index].time });
  };

  const saveEdit = async () => {
    const updated = await updateMeal(activeDay, editingMeal, editForm);
    setMeals(updated);
    setEditingMeal(null);
  };

  const typeColor = (type) => {
    switch (type) {
      case 'Lunch': return 'bg-sage-pale text-sage';
      case 'Snack': return 'bg-terra-pale text-terracotta';
      case 'Dinner': return 'bg-sage-pale text-sage';
      default: return 'bg-cream text-ink-muted';
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Day Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide animate-fade-in-up stagger-1">
        {DAYS.map((day, i) => (
          <button
            key={day}
            onClick={() => setActiveDay(i)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all [-webkit-tap-highlight-color:transparent] ${
              activeDay === i
                ? 'bg-sage text-white shadow-[0_2px_8px_rgba(122,158,126,0.3)]'
                : 'bg-white text-ink-muted shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-card-hover)]'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      {/* Meal Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-40 text-ink-muted">Loading...</div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {meals.map((meal, i) => (
            <div
              key={i}
              className="rounded-2xl shadow-[var(--shadow-card)] overflow-hidden transition-shadow hover:shadow-[var(--shadow-card-hover)] animate-fade-in-up"
              style={{ backgroundColor: 'white', animationDelay: `${(i + 2) * 60}ms` }}
            >
              <div className="px-4 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${typeColor(meal.type)} mb-1.5`}>
                      {meal.type}
                    </span>
                    <h3 className="font-display text-[15px] font-semibold text-ink leading-snug">{meal.name}</h3>
                    <div className="flex items-center gap-1 text-[11px] text-ink-faint mt-1">
                      <Clock size={10} />
                      {meal.time}
                    </div>
                  </div>
                  <button
                    onClick={() => openEdit(i)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-sage-pale transition-colors text-ink-faint [-webkit-tap-highlight-color:transparent]"
                  >
                    <Pencil size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingMeal !== null && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-5">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setEditingMeal(null)} />
          <div className="relative w-full max-w-[380px] bg-white rounded-2xl flex flex-col shadow-[0_8px_40px_rgba(30,30,26,0.12)]">
            <div className="flex items-center justify-between px-5 py-3.5">
              <h3 className="font-display text-base font-semibold text-ink">Edit Meal</h3>
              <button
                onClick={() => setEditingMeal(null)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-cream text-ink-muted"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-5 pb-5 flex flex-col gap-3">
              <div>
                <label className="section-label mb-1.5 block">Meal name</label>
                <input
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-cream text-sm text-ink focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage transition-shadow"
                />
              </div>
              <div>
                <label className="section-label mb-1.5 block">Time</label>
                <input
                  value={editForm.time || ''}
                  onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-cream text-sm text-ink focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage transition-shadow"
                />
              </div>
              <div className="flex gap-2.5 mt-1">
                <button
                  onClick={() => setEditingMeal(null)}
                  className="flex-1 py-2.5 rounded-xl bg-cream text-ink-muted text-sm font-semibold hover:bg-cream/70 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="flex-1 py-2.5 rounded-xl bg-sage text-white text-sm font-semibold shadow-[0_2px_8px_rgba(122,158,126,0.3)] hover:shadow-[0_4px_12px_rgba(122,158,126,0.4)] transition-all"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
