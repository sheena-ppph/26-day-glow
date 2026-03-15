import { useState, useEffect } from 'react';
import { X, Bell, Coffee, Droplets, ListChecks, Heart } from 'lucide-react';
import { getNotifPrefs, setNotifPref } from '../lib/storage';

const NOTIFICATIONS = [
  { key: 'break_fast', label: 'Break fast reminder', time: '10:55 AM', icon: Coffee, description: 'Almost time to eat! Your fast ends at 11:00 AM.' },
  { key: 'stop_eating', label: 'Stop eating reminder', time: '6:45 PM', icon: Bell, description: 'Stop eating in 15 minutes! Fast starts at 7:00 PM.' },
  { key: 'water_checkin', label: 'Water check-in', time: 'Every 2hrs', icon: Droplets, description: 'Time to drink water! How many glasses today?' },
  { key: 'daily_habits', label: 'Daily habit check', time: '8:00 PM', icon: ListChecks, description: 'Did you complete all your habits today?' },
  { key: 'wedding_countdown', label: 'Wedding countdown', time: '7:30 AM', icon: Heart, description: 'X days to April 10! Keep going, Sheena!' },
];

export default function Reminders({ onClose }) {
  const [prefs, setPrefs] = useState({});
  const [permission, setPermission] = useState('default');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifPrefs().then(p => { setPrefs(p); setLoading(false); });
    if ('Notification' in window) setPermission(Notification.permission);
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
    }
  };

  const toggle = async (key) => {
    const updated = await setNotifPref(key, !prefs[key]);
    setPrefs(updated);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-5">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-[400px] bg-white rounded-2xl max-h-[85vh] flex flex-col shadow-[0_8px_40px_rgba(30,30,26,0.12)] animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 flex-shrink-0">
          <h3 className="font-display text-base font-semibold text-ink">Reminders</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-cream text-ink-muted"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-5 pb-5 flex flex-col gap-3 overflow-y-auto">
          {/* Permission Banner */}
          {permission !== 'granted' && (
            <button
              onClick={requestPermission}
              className="w-full p-4 rounded-xl bg-sage-pale text-left"
            >
              <p className="text-xs font-bold text-sage mb-0.5">Enable Notifications</p>
              <p className="text-[11px] text-sage/60">Tap to allow push notifications so you never miss a reminder.</p>
            </button>
          )}

          {/* Notification Toggles */}
          {loading ? (
            <div className="text-ink-muted text-sm text-center py-8">Loading...</div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {NOTIFICATIONS.map(({ key, label, time, icon: Icon }) => (
                <div key={key} className="rounded-xl p-3.5 shadow-[var(--shadow-card)]" style={{ backgroundColor: 'white' }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-sage-pale flex items-center justify-center flex-shrink-0">
                        <Icon size={15} className="text-sage" />
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-ink">{label}</p>
                        <p className="text-[10px] text-ink-faint font-medium">{time}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggle(key)}
                      className={`relative w-10 h-[22px] rounded-full transition-colors [-webkit-tap-highlight-color:transparent] ${
                        prefs[key] ? 'bg-sage' : 'bg-ink-faint/25'
                      }`}
                    >
                      <div className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-white shadow-sm transition-transform ${
                        prefs[key] ? 'translate-x-[20px]' : 'translate-x-[2px]'
                      }`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
