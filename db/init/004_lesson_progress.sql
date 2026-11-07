CREATE TABLE IF NOT EXISTS public.thai_english_playland_schema_changes (
    name VARCHAR(128) PRIMARY KEY,
    applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.thai_english_playland_lesson_progress (
    user_id INTEGER NOT NULL REFERENCES public.thai_english_playland_users(id) ON DELETE CASCADE,
    lesson_id VARCHAR(128) NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    correct_answers INTEGER NOT NULL DEFAULT 0,
    wrong_answers INTEGER NOT NULL DEFAULT 0,
    quiz_attempts INTEGER NOT NULL DEFAULT 0,
    total_moves_earned INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, lesson_id)
);

DO $$
BEGIN
    INSERT INTO public.thai_english_playland_schema_changes (name)
    VALUES ('004_lesson_progress_reset')
    ON CONFLICT (name) DO NOTHING;

    IF FOUND THEN
        DELETE FROM public.thai_english_playland_lesson_progress;
        DELETE FROM public.thai_english_playland_user_progress;
        DELETE FROM public.thai_english_playland_user_achievements;
        DELETE FROM public.thai_english_playland_user_streak_state;
        DELETE FROM public.thai_english_playland_daily_lesson_activity;
        UPDATE public.thai_english_playland_activity_tracking
        SET started_at = CURRENT_DATE WHERE id = 1;
    END IF;
END $$;
