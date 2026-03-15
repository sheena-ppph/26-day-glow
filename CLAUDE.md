# 26 Day Glow — Claude Code Instructions

> **Owner:** Sheena · Donsol, Sorsogon, Philippines
> **Purpose:** Mobile PWA for 16:8 intermittent fasting tracking with a 26-day wedding countdown (April 10, 2026)

---

## Self-Improvement Rule (Read This First)

Whenever Sheena approves a decision, change, or improvement during a session:
- Update this `CLAUDE.md` immediately to reflect the final approved state
- Add it under the relevant section below, or create a new section if needed
- Mark it with the date it was approved: `<!-- approved: YYYY-MM-DD -->`
- Never remove old approved decisions — only append or update
- The goal: this file always reflects the current truth of the project

---

## Project Overview

**App name:** 26 Day Glow
**Countdown:** March 15 → April 10, 2026 (Mara's wedding — Sheena's sister)
**User:** Sheena, mobile-first, Philippines (Asia/Manila, UTC+8)
**Design reference:** Full HTML artifact exists — match it pixel-for-pixel

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) + Tailwind CSS |
| Database | Supabase (free tier) |
| Auth | Skipped in v1 (single-user personal app) |
| PWA | manifest.json + service worker |
| Push notifications | Web Push API + Supabase Edge Functions |
| Hosting | Vercel or Netlify (free tier) |
| Timezone | Asia/Manila (UTC+8) — all time logic must use this |

---

## Design System

**Fonts** (Google Fonts):
- Display/numbers: `Playfair Display`
- UI/body: `DM Sans`

**Colors:**
```
--sage:        #7A9E7E   (primary accent, active states, progress)
--sage-light:  #B5CEAB   (decorative)
--sage-pale:   #EEF4EC   (badge backgrounds, card fills)
--terra:       #C4714A   (fasting state, warnings)
--terra-pale:  #FAF0EB   (terracotta badge backgrounds)
--cream:       #FAF8F3   (app background)
--white:       #FFFFFF   (card surfaces)
--ink:         #1E1E1A   (primary text)
--ink-muted:   #6B6B64   (secondary text)
--ink-faint:   #A8A89F   (placeholders, disabled)
--border:      rgba(30,30,26,0.1)
```

**Components:**
- Cards: white bg, 1px border, 16px radius, 16px padding
- Buttons: sage green (primary), cream (secondary)
- Bottom sheet: slides up, 20px top radius, 80vh max
- Mobile max-width: 430px centered

---

## App Structure

5 tabs in bottom nav:

| Tab | What it does |
|---|---|
| Fast | Live 16:8 fasting ring timer. Fasting: 7PM→11AM. Eating: 11AM→7PM |
| Water | 8-glass daily tracker. Resets midnight daily |
| Track | 26-day countdown + habit checklist (6 habits) + calendar + streak stats |
| Weight | Daily weight log, progress bar toward −4kg goal, history |
| Meals | 7-day meal plan (Mon–Sun), 3 meals/day, editable via bottom sheet |

**Reminders** accessible from settings icon — 5 toggleable push notifications.

---

## The 6 Daily Habits

These are fixed (not user-configurable in v1):
1. Fasted until 11 AM (no creamer)
2. Stopped eating by 7 PM
3. No rice at dinner
4. No sugar all day
5. Walked 20–30 mins
6. Drank 8 glasses of water

A day is marked **complete** (green on calendar) only when ALL 6 are checked.

---

## Design Direction: "Botanical Journal"

**Tone:** Organic luxury meets editorial calm — a hand-curated wellness journal for a bride-to-be.

**Key principles:**
- Typography as hero: Playfair Display at 36-52px for key numbers, tight line-height
- Soft shadows (`--shadow-card`) replace harsh borders — warm-tinted, layered
- Faint paper grain texture on cream background via CSS SVG filter
- Staggered fade-in-up entrance animations on tab switch (60ms delay per element)
- Letterspaced uppercase `.section-label` class for all section headers
- Sage gradient progress bars (sage-light → sage, 2.5-10px height)
- Sage dot indicator under active nav tab
- Micro-interactions: glass scale-pop on tap, checkbox bounce on toggle
- All modals centered with backdrop blur, no bottom sheets
- Cards use shadow-card/shadow-card-hover, no 1px borders

<!-- approved: 2026-03-15 -->

---

## Business Logic

- **Streak** = consecutive days with all 6 habits complete, counting back from today
- **Progress** = `checkedDays.length / 26 * 100`
- **Weight goal** = starting weight − 4 kg (starting = first entry ever logged)
- **Fasting window** = 7 PM → 11 AM (16 hrs). Fixed. Not configurable.
- **Eating window** = 11 AM → 7 PM (8 hrs)
- **Daily reset** (midnight Asia/Manila): habits → all false, water → 0
- **Persistent** (never reset): weight logs, meal plan edits, checkedDays, notification prefs

---

## Database Schema (Supabase)

```sql
-- No auth — single-user personal app

create table daily_logs (
  id uuid default gen_random_uuid() primary key,
  date date not null unique,
  habits jsonb default '[]',
  water_count int default 0
);

create table weight_logs (
  id uuid default gen_random_uuid() primary key,
  date date not null unique,
  kg numeric(5,2) not null
);

create table meal_plans (
  id uuid default gen_random_uuid() primary key,
  day_of_week int not null check (day_of_week between 0 and 6),
  meal_index int not null,
  name text,
  description text,
  time text,
  type text,
  tags jsonb default '[]',
  unique(day_of_week, meal_index)
);

create table notification_prefs (
  id uuid default gen_random_uuid() primary key,
  notif_type text not null unique,
  enabled boolean default true
);
```

---

## Push Notification Schedule

| Type | Time | Message |
|---|---|---|
| Break fast | Daily 10:55 AM | "Almost time to eat! Fast ends at 11:00 AM." |
| Stop eating | Daily 6:45 PM | "Stop eating in 15 mins! Fast starts at 7:00 PM." |
| Water check | Every 2hrs, 11AM–6PM | "Time to drink water! How many glasses today?" |
| Habit check | Daily 8:00 PM | "Did you complete all your habits today?" |
| Countdown | Daily 7:30 AM | "X days to April 10! Keep going, Sheena!" |

---

## Folder Structure

```
26-day-glow/
  src/
    components/
      FastTimer.jsx
      WaterTracker.jsx
      HabitTracker.jsx
      WeightLog.jsx
      MealPlan.jsx
      Reminders.jsx
    lib/
      supabase.js
      storage.js
      dateUtils.js
    App.jsx
    main.jsx
  public/
    manifest.json
    sw.js
  supabase/
    schema.sql
  .env
  CLAUDE.md   ← this file
```

---

## Rules

- **Never hardcode API keys** — always use `.env` (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
- **Free tier only** — Supabase free, Vercel/Netlify free
- **Mobile-first** — max-width 430px, test on mobile viewport
- **Single files** — keep components in one file unless told otherwise
- **Match the design** — the HTML artifact is the source of truth for UI
- **Timezone always** — every date/time operation must use Asia/Manila
- **Meal data** — do not change or "improve" the Filipino meal plan content
- **Output files** — any generated files go in `/outputs`
- **Errors** — handle gracefully, never crash silently, show user-friendly messages

---

## How to Start a Session

1. Read this entire `CLAUDE.md` first
2. Check what's already built in the folder
3. Ask Sheena: "What do you want to work on today?"
4. After each approved decision, update this file immediately
5. Confirm the update: "I've updated CLAUDE.md with [what changed]"

---

## Approved Decisions Log

_This section is auto-maintained by Claude Code. Each entry is added when Sheena approves a decision._

- **Auth skipped** — single-user personal app, no login needed <!-- approved: 2026-03-15 -->
- **Habits updated** — replaced generic habits with CLAUDE.md's 6 specific habits <!-- approved: 2026-03-15 -->
- **storage.js + dateUtils.js added** — utility modules for localStorage/Supabase fallback and PH timezone logic <!-- approved: 2026-03-15 -->
- **Edit Meal modal fix** — centered modal with rounded corners, z-60, max-h 85vh, internal scroll, Cancel + Save buttons always visible. Removed tap highlight on pencil icon. <!-- approved: 2026-03-15 -->
- **Full UI polish pass** — visual-only fixes across all tabs <!-- approved: 2026-03-15 -->
  - Fast: ring shrunk to 170px (was 220px), timer font bumped to 40px bold, window card times now text-xl font-bold, tips use sage dots instead of dashes, tightened gap from 6 to 4
  - Water: glass grid tightened to 240px max-w with gap-2, icons shrunk to 20px, rounded-xl, +/- buttons matched with border-2 and strokeWidth 2.2, progress bar thickened to h-2.5, tips use sage dots
  - Meals: card gap tightened to 2.5, day tabs gap tightened to 3, padding kept at px-4 py-4
  - Global: header uses fixed pt-3 (was env() variable causing shift), nav buttons have -webkit-tap-highlight-color:transparent
- **"Botanical Journal" full visual redesign** — applied SKILL.md frontend-design guidelines across entire app <!-- approved: 2026-03-15 -->
  - Foundation: paper grain texture on cream bg, shadow-card/shadow-card-hover CSS vars, fade-in-up + scale-pop + check-bounce keyframes, stagger delay classes, section-label utility class
  - App shell: header with subtitle label, nav with sage dot indicator under active tab, backdrop-blur nav, fade-in-up on tab switch
  - Fast: ring shrunk to 150px, 36px timer, soft shadow cards replace borders, uppercase section labels, staggered entrance
  - Water: scale-pop animation on glass tap, gradient progress bar, matched +/- buttons with sage shadow, tighter 230px grid
  - Track: soft shadow stat cards, check-bounce on habit toggle, gradient progress bar, tighter calendar grid
  - Weight: editorial empty state with sage icon, gradient progress bar, section-label headers, delete button on history rows
  - Meals: shadow cards with hover lift, day tabs with sage shadow on active, centered edit modal with backdrop blur
  - Reminders: centered modal (not bottom sheet), compact toggle cards with shadow, smaller toggles
- **Meal cards simplified** — removed description and tags, cards show only type badge + name + time. Edit modal has name + time only. <!-- approved: 2026-03-15 -->
- **Weight delete feature** — added trash icon on history rows + deleteWeightLog storage function <!-- approved: 2026-03-15 -->

---

## Current Status

| Feature | Status |
|---|---|
| HTML prototype | ✅ Complete (artifact in Claude.ai) |
| React port | ✅ Complete (all 5 tabs + Reminders) |
| Supabase schema | ✅ Complete (schema.sql, no auth) |
| Auth | ⏭️ Skipped (single-user app) |
| PWA manifest + SW | ✅ Complete (manifest.json + sw.js + icons) |
| Push notifications | ✅ Complete (Web Push API, 5 toggleable reminders) |
| Deployment | 🔲 Not started (recommended: Vercel) |