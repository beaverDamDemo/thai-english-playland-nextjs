-- Database schema for English Lessons Maze

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

-- Game progress table
CREATE TABLE IF NOT EXISTS public.thai_english_playland_game_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.thai_english_playland_users(id) ON DELETE CASCADE,
    level INTEGER NOT NULL DEFAULT 1,
    score INTEGER NOT NULL DEFAULT 0,
    completed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Maze table
CREATE TABLE IF NOT EXISTS public.thai_english_playland_maze (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES public.thai_english_playland_users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    grid_data JSONB,
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
CREATE INDEX IF NOT EXISTS idx_thai_english_playland_game_progress_user_id ON public.thai_english_playland_game_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_thai_english_playland_maze_user_id ON public.thai_english_playland_maze(user_id);
CREATE INDEX IF NOT EXISTS idx_thai_english_playland_user_sessions_token ON public.thai_english_playland_user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_thai_english_playland_user_sessions_user_id ON public.thai_english_playland_user_sessions(user_id);

-- Create admin user and initial data
-- This will be executed after all tables are created

-- Create admin user
INSERT INTO public.thai_english_playland_users (username, password_hash, created_at, updated_at)
VALUES (
    'fjasdojf',
    crypt('password', 'gen_salt'),
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (username) DO NOTHING;

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Admin user fjasdojf created successfully';
END;
$$;
