-- ════════════════════════════════════════════════════════════════
--  Endurecimiento de RLS + consolidación de políticas (2026-06-26)
--
--  Contexto: el `anon key` viaja en el bundle del navegador. La app SOLO
--  escribe estas tablas (insert/update de telemetría); nunca las lee
--  client-side (las lecturas para análisis son server-side / service role).
--
--  1) Quita el SELECT de `anon` sobre datos de usuario (evita fuga de PII).
--  2) Consolida políticas de INSERT/UPDATE duplicadas (eran idénticas:
--     {anon} / using true / with check true).
--
--  Aplicada vía Supabase MCP en migraciones:
--    harden_anon_select_user_data · dedupe_insert_policies · dedupe_update_policies
--  Este archivo deja el repo alineado con el estado de la base de datos.
-- ════════════════════════════════════════════════════════════════

-- 1. Sin lectura para anon en tablas con datos de participante.
DROP POLICY IF EXISTS "anon select participants" ON public.participants;
DROP POLICY IF EXISTS "anon select sessions"     ON public.sessions;
DROP POLICY IF EXISTS "anon select attempts"     ON public.lesson_attempts;
DROP POLICY IF EXISTS "anon select responses"    ON public.exercise_responses;

-- 2. Elimina las políticas duplicadas (se conservan las "anon insert/update X").
DROP POLICY IF EXISTS "Anyone can insert participants"       ON public.participants;
DROP POLICY IF EXISTS "Anyone can insert sessions"           ON public.sessions;
DROP POLICY IF EXISTS "Anyone can insert lesson_attempts"    ON public.lesson_attempts;
DROP POLICY IF EXISTS "Anyone can insert exercise_responses" ON public.exercise_responses;
DROP POLICY IF EXISTS "Anyone can update sessions"           ON public.sessions;
DROP POLICY IF EXISTS "Anyone can update lesson_attempts"    ON public.lesson_attempts;
