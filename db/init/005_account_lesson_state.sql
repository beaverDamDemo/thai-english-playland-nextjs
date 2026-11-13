CREATE TABLE IF NOT EXISTS public.thai_english_playland_lesson_state (
    user_id INTEGER NOT NULL REFERENCES public.thai_english_playland_users(id) ON DELETE CASCADE,
    lesson_id VARCHAR(128) NOT NULL,
    generation UUID NOT NULL,
    state JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, lesson_id)
);

INSERT INTO public.thai_english_playland_schema_changes (name)
VALUES ('005_account_lesson_state_preserve')
ON CONFLICT (name) DO NOTHING;
