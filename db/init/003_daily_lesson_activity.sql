CREATE TABLE IF NOT EXISTS public.thai_english_playland_activity_tracking (
    id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    started_at DATE NOT NULL DEFAULT CURRENT_DATE
);

INSERT INTO public.thai_english_playland_activity_tracking (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.thai_english_playland_daily_lesson_activity (
    activity_date DATE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES public.thai_english_playland_users(id) ON DELETE CASCADE,
    PRIMARY KEY (activity_date, user_id)
);
