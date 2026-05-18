-- Fix lesson telemetry for the section-based curriculum.
--
-- The current app uses lesson ids such as "s1-l1" and "s1-boss".
-- Older Supabase schemas commonly created lesson_attempts.lesson_id as an
-- integer, which makes lesson_attempts inserts fail while sessions still work.
-- When that happens, the export view shows session time but 0 lessons/exercises.

DROP VIEW IF EXISTS public.v_exercise_log;

ALTER TABLE public.lesson_attempts
  ALTER COLUMN lesson_id TYPE text USING lesson_id::text;

-- Keep exercise telemetry available even if an attempt/session insert fails.
-- The export still joins attempts when present, and counts exercise rows by
-- participant even when lesson_attempt_id is null.
ALTER TABLE public.lesson_attempts
  ALTER COLUMN session_id DROP NOT NULL;

ALTER TABLE public.exercise_responses
  ALTER COLUMN session_id DROP NOT NULL,
  ALTER COLUMN lesson_attempt_id DROP NOT NULL;

-- RLS policies for the public study flow. The frontend generates UUIDs before
-- insert, so it does not need SELECT permission just to read IDs back.
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert participants" ON public.participants;
CREATE POLICY "Anyone can insert participants"
ON public.participants FOR INSERT
TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can insert sessions" ON public.sessions;
CREATE POLICY "Anyone can insert sessions"
ON public.sessions FOR INSERT
TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update sessions" ON public.sessions;
CREATE POLICY "Anyone can update sessions"
ON public.sessions FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can insert lesson_attempts" ON public.lesson_attempts;
CREATE POLICY "Anyone can insert lesson_attempts"
ON public.lesson_attempts FOR INSERT
TO anon
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update lesson_attempts" ON public.lesson_attempts;
CREATE POLICY "Anyone can update lesson_attempts"
ON public.lesson_attempts FOR UPDATE
TO anon
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can insert exercise_responses" ON public.exercise_responses;
CREATE POLICY "Anyone can insert exercise_responses"
ON public.exercise_responses FOR INSERT
TO anon
WITH CHECK (true);

CREATE OR REPLACE VIEW public.v_exercise_log AS
SELECT
  er.id                 AS response_id,
  er.participant_id,
  er.session_id,
  er.lesson_attempt_id,
  la.lesson_id,
  la.lesson_title,
  er.exercise_id,
  er.exercise_type,
  er.is_correct,
  er.response_time_sec
FROM public.exercise_responses er
LEFT JOIN public.lesson_attempts la ON la.id = er.lesson_attempt_id;
