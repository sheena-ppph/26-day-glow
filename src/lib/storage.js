import { supabase } from './supabase';

// Dual storage: Supabase as primary, localStorage as cache/fallback

function localGet(key) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
}

function localSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// --- Daily Log ---

export async function getDailyLog(dateStr) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('date', dateStr)
        .single();
      if (!error && data) {
        localSet(`daily_${dateStr}`, data);
        return data;
      }
    } catch {}
  }
  const cached = localGet(`daily_${dateStr}`);
  if (cached) return cached;
  return { date: dateStr, habits: [false, false, false, false, false, false], water_count: 0 };
}

export async function upsertDailyLog(dateStr, updates) {
  const existing = await getDailyLog(dateStr);
  const merged = { ...existing, ...updates, date: dateStr };

  localSet(`daily_${dateStr}`, merged);

  if (supabase) {
    try {
      await supabase
        .from('daily_logs')
        .upsert({ date: dateStr, ...updates }, { onConflict: 'date' });
    } catch {}
  }
  return merged;
}

// --- Weight Logs ---

export async function getWeightLogs() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('weight_logs')
        .select('*')
        .order('date', { ascending: true });
      if (!error && data) {
        localSet('weight_logs', data);
        return data;
      }
    } catch {}
  }
  return localGet('weight_logs') || [];
}

export async function addWeightLog(dateStr, kg) {
  const logs = await getWeightLogs();
  const idx = logs.findIndex(l => l.date === dateStr);
  if (idx >= 0) logs[idx].kg = kg;
  else logs.push({ date: dateStr, kg });
  logs.sort((a, b) => a.date.localeCompare(b.date));
  localSet('weight_logs', logs);

  if (supabase) {
    try {
      await supabase
        .from('weight_logs')
        .upsert({ date: dateStr, kg }, { onConflict: 'date' });
    } catch {}
  }
  return logs;
}

export async function deleteWeightLog(dateStr) {
  const logs = await getWeightLogs();
  const filtered = logs.filter(l => l.date !== dateStr);
  localSet('weight_logs', filtered);

  if (supabase) {
    try {
      await supabase
        .from('weight_logs')
        .delete()
        .eq('date', dateStr);
    } catch {}
  }
  return filtered;
}

// --- Meal Plans ---

const DEFAULT_MEALS = {
  0: [ // Monday
    { name: 'Tinolang Manok', description: 'Chicken soup with green papaya and moringa leaves', time: '11:00 AM', type: 'Lunch', tags: ['high-protein', 'soup'] },
    { name: 'Banana Cue', description: 'Caramelized saba banana on sticks', time: '3:00 PM', type: 'Snack', tags: ['local', 'sweet'] },
    { name: 'Grilled Tilapia', description: 'Fresh tilapia with tomato-onion salad and rice', time: '6:30 PM', type: 'Dinner', tags: ['fish', 'grilled'] },
  ],
  1: [ // Tuesday
    { name: 'Pinakbet', description: 'Mixed vegetables with shrimp paste — squash, eggplant, okra, bitter melon', time: '11:00 AM', type: 'Lunch', tags: ['vegetables', 'local'] },
    { name: 'Boiled Camote', description: 'Steamed sweet potato from the backyard', time: '3:00 PM', type: 'Snack', tags: ['root crop', 'fiber'] },
    { name: 'Sinigang na Hipon', description: 'Sour shrimp soup with kangkong and radish', time: '6:30 PM', type: 'Dinner', tags: ['soup', 'seafood'] },
  ],
  2: [ // Wednesday
    { name: 'Chicken Adobo', description: 'Classic soy-vinegar braised chicken, less oil', time: '11:00 AM', type: 'Lunch', tags: ['high-protein', 'classic'] },
    { name: 'Fresh Buko Juice', description: 'Young coconut water and meat', time: '3:00 PM', type: 'Snack', tags: ['hydrating', 'local'] },
    { name: 'Ginisang Monggo', description: 'Mung bean stew with malunggay and tinapa flakes', time: '6:30 PM', type: 'Dinner', tags: ['legumes', 'iron-rich'] },
  ],
  3: [ // Thursday
    { name: 'Fish Escabeche', description: 'Sweet and sour fried fish with bell peppers', time: '11:00 AM', type: 'Lunch', tags: ['fish', 'sweet-sour'] },
    { name: 'Puto', description: 'Steamed rice cake (2 pieces)', time: '3:00 PM', type: 'Snack', tags: ['rice cake', 'light'] },
    { name: 'Nilaga na Baka', description: 'Beef bone broth with potatoes, cabbage, and corn', time: '6:30 PM', type: 'Dinner', tags: ['soup', 'beef'] },
  ],
  4: [ // Friday
    { name: 'Laing', description: 'Taro leaves in coconut milk with chili — Bicolano classic', time: '11:00 AM', type: 'Lunch', tags: ['bicolano', 'coconut'] },
    { name: 'Turon', description: 'Banana spring roll with jackfruit (1 piece)', time: '3:00 PM', type: 'Snack', tags: ['fried', 'sweet'] },
    { name: 'Inihaw na Pusit', description: 'Grilled stuffed squid with tomato-vinegar dip', time: '6:30 PM', type: 'Dinner', tags: ['seafood', 'grilled'] },
  ],
  5: [ // Saturday
    { name: 'Pancit Canton', description: 'Stir-fried egg noodles with vegetables and pork', time: '11:00 AM', type: 'Lunch', tags: ['noodles', 'classic'] },
    { name: 'Mango Shake', description: 'Fresh Philippine mango blended with ice', time: '3:00 PM', type: 'Snack', tags: ['fruit', 'refreshing'] },
    { name: 'Bicol Express', description: 'Pork in spicy coconut milk with shrimp paste and chili', time: '6:30 PM', type: 'Dinner', tags: ['bicolano', 'spicy'] },
  ],
  6: [ // Sunday
    { name: 'Arroz Caldo', description: 'Rice porridge with chicken, ginger, and calamansi', time: '11:00 AM', type: 'Lunch', tags: ['comfort', 'soup'] },
    { name: 'Bibingka', description: 'Traditional rice cake with salted egg and cheese', time: '3:00 PM', type: 'Snack', tags: ['rice cake', 'traditional'] },
    { name: 'Kare-Kare', description: 'Oxtail peanut stew with banana blossom and string beans', time: '6:30 PM', type: 'Dinner', tags: ['special', 'peanut'] },
  ],
};

export async function getMealPlan(dayOfWeek) {
  const defaults = DEFAULT_MEALS[dayOfWeek] || DEFAULT_MEALS[0];

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('meal_plans')
        .select('*')
        .eq('day_of_week', dayOfWeek)
        .order('meal_index', { ascending: true });
      if (!error && data && data.length === 3) {
        const meals = data.map(d => ({ name: d.name, time: d.time }));
        localSet(`meals_${dayOfWeek}`, meals);
        return meals;
      }
    } catch {}
  }

  const cached = localGet(`meals_${dayOfWeek}`);
  if (cached && Array.isArray(cached) && cached.length === 3 && cached.every(m => m.name)) {
    return cached;
  }
  // Auto-recover: corrupted or incomplete, reset to defaults
  const simplified = defaults.map(m => ({ name: m.name, time: m.time }));
  localSet(`meals_${dayOfWeek}`, simplified);
  return simplified;
}

export async function updateMeal(dayOfWeek, mealIndex, mealData) {
  const TYPES = ['Lunch', 'Snack', 'Dinner'];
  const meals = await getMealPlan(dayOfWeek);
  meals[mealIndex] = { name: mealData.name || meals[mealIndex].name, time: mealData.time || meals[mealIndex].time };
  localSet(`meals_${dayOfWeek}`, meals);

  if (supabase) {
    try {
      await supabase
        .from('meal_plans')
        .upsert({
          day_of_week: dayOfWeek,
          meal_index: mealIndex,
          name: meals[mealIndex].name,
          time: meals[mealIndex].time,
          type: TYPES[mealIndex],
        }, { onConflict: 'day_of_week,meal_index' });
    } catch {}
  }
  return meals;
}

// --- Notification Preferences ---

const DEFAULT_NOTIF_PREFS = {
  break_fast: true,
  stop_eating: true,
  water_checkin: true,
  daily_habits: true,
  wedding_countdown: true,
};

export async function getNotifPrefs() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('notification_prefs')
        .select('*');
      if (!error && data && data.length > 0) {
        const prefs = {};
        data.forEach(d => { prefs[d.notif_type] = d.enabled; });
        localSet('notif_prefs', prefs);
        return prefs;
      }
    } catch {}
  }
  return localGet('notif_prefs') || { ...DEFAULT_NOTIF_PREFS };
}

export async function setNotifPref(type, enabled) {
  const prefs = await getNotifPrefs();
  prefs[type] = enabled;
  localSet('notif_prefs', prefs);

  if (supabase) {
    try {
      await supabase
        .from('notification_prefs')
        .upsert({ notif_type: type, enabled }, { onConflict: 'notif_type' });
    } catch {}
  }
  return prefs;
}
