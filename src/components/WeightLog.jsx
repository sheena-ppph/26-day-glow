import { useState, useEffect } from 'react';
import { TrendingDown, Plus, Trash2, Pencil, X } from 'lucide-react';
import { getPhilippineDateString } from '../lib/dateUtils';
import { getWeightLogs, addWeightLog, deleteWeightLog } from '../lib/storage';

export default function WeightLog() {
  const [logs, setLogs] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingDate, setEditingDate] = useState(null);
  const dateStr = getPhilippineDateString();

  useEffect(() => {
    getWeightLogs().then(data => {
      setLogs(data);
      setLoading(false);
    });
  }, []);

  const handleAdd = async () => {
    const kg = parseFloat(input);
    if (isNaN(kg) || kg < 20 || kg > 200) return;
    const targetDate = editingDate || dateStr;
    const updated = await addWeightLog(targetDate, kg);
    setLogs(updated);
    setInput('');
    setEditingDate(null);
  };

  const handleEdit = (log) => {
    setInput(String(log.kg));
    setEditingDate(log.date);
  };

  const cancelEdit = () => {
    setInput('');
    setEditingDate(null);
  };

  const handleDelete = async (date) => {
    const updated = await deleteWeightLog(date);
    setLogs(updated);
  };

  const startWeight = logs.length > 0 ? logs[0].kg : null;
  const currentWeight = logs.length > 0 ? logs[logs.length - 1].kg : null;
  const goalWeight = startWeight ? startWeight - 4 : null;
  const lost = startWeight && currentWeight ? startWeight - currentWeight : 0;
  const progressPct = startWeight ? Math.min(100, Math.max(0, (lost / 4) * 100)) : 0;

  if (loading) return <div className="flex items-center justify-center h-40 text-ink-muted">Loading...</div>;

  return (
    <div className="flex flex-col gap-3">
      {/* Current Weight */}
      {currentWeight ? (
        <div className="text-center animate-fade-in-up stagger-1">
          <p className="font-display text-[52px] font-bold text-ink leading-none">
            {currentWeight}
          </p>
          <p className="section-label mt-1.5">kg current weight</p>
        </div>
      ) : (
        <div className="text-center py-6 animate-fade-in-up stagger-1">
          <div className="w-14 h-14 rounded-2xl bg-sage-pale flex items-center justify-center mx-auto mb-3">
            <TrendingDown size={24} className="text-sage" />
          </div>
          <p className="text-sm text-ink-muted">Log your first weight to start tracking</p>
        </div>
      )}

      {/* Goal Progress */}
      {startWeight && (
        <div className="rounded-2xl p-4 shadow-[var(--shadow-card)] animate-fade-in-up stagger-2" style={{ backgroundColor: 'white' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingDown size={14} className="text-sage" />
              <span className="section-label">Goal: lose 4 kg</span>
            </div>
            <span className="text-xs font-bold text-sage">{lost.toFixed(1)} kg lost</span>
          </div>
          <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ backgroundColor: '#EEF4EC' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, #B5CEAB, #7A9E7E)',
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-[10px] font-medium text-ink-faint">
            <span>{startWeight} kg</span>
            <span>{goalWeight} kg goal</span>
          </div>
        </div>
      )}

      {/* Log Input */}
      <div className="rounded-2xl p-4 shadow-[var(--shadow-card)] animate-fade-in-up stagger-3" style={{ backgroundColor: 'white' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="section-label">
            {editingDate
              ? `Editing ${new Date(editingDate + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}`
              : "Log today's weight"}
          </p>
          {editingDate && (
            <button onClick={cancelEdit} className="text-ink-faint hover:text-terracotta transition-colors [-webkit-tap-highlight-color:transparent]">
              <X size={16} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            step="0.1"
            placeholder="e.g. 58.5"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-cream text-ink text-sm font-body placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-sage/20 focus:border-sage transition-shadow"
          />
          <button
            onClick={handleAdd}
            disabled={!input}
            className="px-4 py-2.5 rounded-xl bg-sage text-white text-sm font-semibold shadow-[0_2px_8px_rgba(122,158,126,0.3)] hover:shadow-[0_4px_12px_rgba(122,158,126,0.4)] disabled:opacity-30 transition-all flex items-center gap-1.5"
          >
            <Plus size={14} />
            {editingDate ? 'Save' : 'Log'}
          </button>
        </div>
      </div>

      {/* Weight History */}
      {logs.length > 0 && (
        <div className="rounded-2xl shadow-[var(--shadow-card)] overflow-hidden animate-fade-in-up stagger-4" style={{ backgroundColor: 'white' }}>
          <div className="px-4 py-3">
            <p className="section-label">History</p>
          </div>
          <div className="border-t border-border/50 max-h-[280px] overflow-y-auto">
            {[...logs].reverse().map((log) => {
              const d = new Date(log.date + 'T00:00:00');
              const formatted = d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', weekday: 'short' });
              const diff = startWeight ? log.kg - startWeight : 0;
              return (
                <div key={log.date} className={`flex items-center justify-between px-4 py-2.5 border-b border-border/30 last:border-b-0 transition-colors ${
                  editingDate === log.date ? 'bg-sage-pale' : ''
                }`}>
                  <span className="text-[13px] text-ink-muted">{formatted}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-base font-semibold text-ink">{log.kg} kg</span>
                    {diff !== 0 && (
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                        diff < 0 ? 'bg-sage-pale text-sage' : 'bg-terra-pale text-terracotta'
                      }`}>
                        {diff > 0 ? '+' : ''}{diff.toFixed(1)}
                      </span>
                    )}
                    <button
                      onClick={() => handleEdit(log)}
                      className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-sage-pale text-ink-faint hover:text-sage transition-colors [-webkit-tap-highlight-color:transparent]"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(log.date)}
                      className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-terra-pale text-ink-faint hover:text-terracotta transition-colors [-webkit-tap-highlight-color:transparent]"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
