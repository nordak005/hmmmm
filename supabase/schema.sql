-- TrustFlow Database Schema
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New query)

-- ==========================================
-- Trust Scores Table
-- ==========================================
CREATE TABLE IF NOT EXISTS trust_scores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 1000),
  earnings_weight NUMERIC DEFAULT 0.35,
  ratings_weight NUMERIC DEFAULT 0.25,
  completion_weight NUMERIC DEFAULT 0.20,
  repayment_weight NUMERIC DEFAULT 0.20,
  platforms_connected INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- Micro Loans Table
-- ==========================================
CREATE TABLE IF NOT EXISTS micro_loans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  fee NUMERIC NOT NULL,
  total_repayment NUMERIC NOT NULL,
  daily_deduction NUMERIC NOT NULL,
  trust_score INTEGER NOT NULL,
  status TEXT DEFAULT 'approved' CHECK (status IN ('approved', 'rejected', 'repaid', 'defaulted')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- Connected Platforms Table
-- ==========================================
CREATE TABLE IF NOT EXISTS connected_platforms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform_name TEXT NOT NULL,
  platform_icon TEXT,
  earnings NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'synced',
  last_synced TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- Row Level Security (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE trust_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE micro_loans ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_platforms ENABLE ROW LEVEL SECURITY;

-- Users can read/write their own data
CREATE POLICY "Users can manage own scores" ON trust_scores
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own loans" ON micro_loans
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own platforms" ON connected_platforms
  FOR ALL USING (auth.uid() = user_id);

-- ==========================================
-- Indexes
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_trust_scores_user ON trust_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_micro_loans_user ON micro_loans(user_id);
CREATE INDEX IF NOT EXISTS idx_connected_platforms_user ON connected_platforms(user_id);
