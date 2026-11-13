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

INSERT INTO public.thai_english_playland_schema_changes (name)
VALUES ('004_lesson_progress_preserve')
ON CONFLICT (name) DO NOTHING;
