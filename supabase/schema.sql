-- 26 Day Glow — Supabase Schema
-- Run this in the Supabase SQL Editor to set up your tables

CREATE TABLE IF NOT EXISTS daily_logs (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date       DATE NOT NULL UNIQUE,
  habits     JSONB NOT NULL DEFAULT '[false,false,false,false,false,false]',
  water_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS weight_logs (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date       DATE NOT NULL UNIQUE,
  kg         NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meal_plans (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  meal_index  INTEGER NOT NULL CHECK (meal_index BETWEEN 0 AND 2),
  name        TEXT NOT NULL,
  description TEXT,
  time        TEXT,
  type        TEXT,
  tags        JSONB DEFAULT '[]',
  UNIQUE (day_of_week, meal_index)
);

CREATE TABLE IF NOT EXISTS notification_prefs (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  notif_type TEXT NOT NULL UNIQUE,
  enabled    BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription JSONB NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security — allow all for single-user personal app
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on daily_logs" ON daily_logs FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE weight_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on weight_logs" ON weight_logs FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on meal_plans" ON meal_plans FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE notification_prefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on notification_prefs" ON notification_prefs FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on push_subscriptions" ON push_subscriptions FOR ALL USING (true) WITH CHECK (true);
