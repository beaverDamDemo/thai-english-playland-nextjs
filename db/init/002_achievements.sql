-- Achievements schema for Thai English Playland

-- Static definitions of achievements (seeded from application code)
CREATE TABLE IF NOT EXISTS public.thai_english_playland_achievement_definitions (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(128) NOT NULL,
    description VARCHAR(256) NOT NULL,
    icon VARCHAR(16) NOT NULL,
    category VARCHAR(32) NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

-- Per-user earned achievements
CREATE TABLE IF NOT EXISTS public.thai_english_playland_user_achievements (
    user_id INTEGER NOT NULL REFERENCES public.thai_english_playland_users(id) ON DELETE CASCADE,
    achievement_id VARCHAR(64) NOT NULL REFERENCES public.thai_english_playland_achievement_definitions(id) ON DELETE CASCADE,
    earned_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id)
);

-- Streak / daily tracking state (one row per user)
CREATE TABLE IF NOT EXISTS public.thai_english_playland_user_streak_state (
    user_id INTEGER PRIMARY KEY REFERENCES public.thai_english_playland_users(id) ON DELETE CASCADE,
    current_streak INTEGER NOT NULL DEFAULT 0,
    max_streak INTEGER NOT NULL DEFAULT 0,
    last_play_date DATE,
    consecutive_days INTEGER NOT NULL DEFAULT 0,
    max_consecutive_days INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_thai_english_playland_user_achievements_user_id
    ON public.thai_english_playland_user_achievements(user_id);
