const TIMEZONE = 'Asia/Manila';
const WEDDING_DATE = new Date('2026-04-10T00:00:00+08:00');
const FAST_START_HOUR = 19; // 7 PM
const FAST_END_HOUR = 11;   // 11 AM
const START_DATE = new Date('2026-03-15T00:00:00+08:00');

export function getPhilippineNow() {
  const str = new Date().toLocaleString('en-US', { timeZone: TIMEZONE });
  return new Date(str);
}

export function getPhilippineDateString() {
  const d = getPhilippineNow();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function getDaysRemaining() {
  const today = getPhilippineNow();
  today.setHours(0, 0, 0, 0);
  const diff = WEDDING_DATE.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / 86400000));
}

export function getDayNumber() {
  const today = getPhilippineNow();
  today.setHours(0, 0, 0, 0);
  const start = new Date(START_DATE);
  start.setHours(0, 0, 0, 0);
  const diff = today.getTime() - start.getTime();
  return Math.min(26, Math.max(1, Math.floor(diff / 86400000) + 1));
}

export function getFastingState() {
  const now = getPhilippineNow();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  const fastStartSeconds = FAST_START_HOUR * 3600; // 7 PM = 68400
  const fastEndSeconds = FAST_END_HOUR * 3600;     // 11 AM = 39600

  const isFasting = totalSeconds >= fastStartSeconds || totalSeconds < fastEndSeconds;

  let remainingSeconds;
  if (isFasting) {
    if (totalSeconds >= fastStartSeconds) {
      // After 7 PM, fasting until 11 AM next day
      remainingSeconds = (24 * 3600 - totalSeconds) + fastEndSeconds;
    } else {
      // Before 11 AM, fasting until 11 AM
      remainingSeconds = fastEndSeconds - totalSeconds;
    }
  } else {
    // Eating window: 11 AM to 7 PM
    remainingSeconds = fastStartSeconds - totalSeconds;
  }

  const totalWindowSeconds = isFasting ? 16 * 3600 : 8 * 3600;
  const elapsedSeconds = totalWindowSeconds - remainingSeconds;
  const progress = elapsedSeconds / totalWindowSeconds;

  return {
    isFasting,
    remainingSeconds: Math.max(0, remainingSeconds),
    progress: Math.min(1, Math.max(0, progress)),
    totalWindowSeconds,
  };
}

export function formatTimer(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function generateCalendarDays() {
  const days = [];
  const start = new Date(2026, 2, 15); // March 15
  for (let i = 0; i < 26; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    days.push(`${y}-${m}-${day}`);
  }
  return days;
}

export const HABITS = [
  'Fasted until 11 AM (no creamer)',
  'Stopped eating by 7 PM',
  'No rice at dinner',
  'No sugar all day',
  'Walked 20–30 mins',
  'Drank 8 glasses of water',
];
