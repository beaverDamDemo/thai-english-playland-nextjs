-- Database schema for Thai English Playland

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS public.thai_english_playland_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User progress table (one row per user per game mode)
CREATE TABLE IF NOT EXISTS public.thai_english_playland_user_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.thai_english_playland_users(id) ON DELETE CASCADE,
    game_mode VARCHAR(32) NOT NULL,
    unlocked_lessons INTEGER NOT NULL DEFAULT 1,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    wrong_answers INTEGER NOT NULL DEFAULT 0,
    quiz_attempts INTEGER NOT NULL DEFAULT 0,
    total_moves_earned INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, game_mode)
);

-- Sessions table
CREATE TABLE IF NOT EXISTS public.thai_english_playland_user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES public.thai_english_playland_users(id) ON DELETE CASCADE,
    session_token VARCHAR(128) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_thai_english_playland_users_username ON public.thai_english_playland_users(username);
CREATE INDEX IF NOT EXISTS idx_thai_english_playland_user_sessions_token ON public.thai_english_playland_user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_thai_english_playland_user_sessions_user_id ON public.thai_english_playland_user_sessions(user_id);
