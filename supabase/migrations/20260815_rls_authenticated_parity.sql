-- ════════════════════════════════════════════════════════════════
--  La telemetría también debe funcionar con sesión iniciada.
--
--  EL BUG
--  Todas las políticas de las tablas del estudio se escribieron `TO anon`.
--  Pero supabase-js cambia de rol al iniciar sesión: sin sesión manda como
--  `anon`, con sesión como `authenticated`. Como no había ninguna política
--  permisiva para ese segundo rol, el RLS rechazaba TODO lo que intentara
--  escribir un usuario con cuenta:
--
--    anon          → INSERT PERMITIDO
--    authenticated → BLOQUEADO (new row violates row-level security policy)
--
--  Es decir: crear una cuenta apagaba la telemetría de esa persona. Sesiones,
--  intentos de lección y respuestas se perdían en silencio, porque cada
--  llamada de services/analytics.js atrapa el error y sigue de largo. Pasó
--  desapercibido porque casi nadie tenía cuenta todavía.
--
--  EL ARREGLO
--  `ALTER POLICY ... TO anon, authenticated` — cambia SOLO los roles y deja
--  intactas las expresiones USING/WITH CHECK ya auditadas (ver 20260604 y
--  20260626). El criterio es que la app se comporte igual con sesión y sin
--  ella; ninguna política se vuelve más permisiva en lo que permite hacer.
--
--  Idempotente: ALTER POLICY fija la lista de roles, no la acumula.
-- ════════════════════════════════════════════════════════════════

BEGIN;

-- ── Identidad y telemetría de uso ───────────────────────────────
ALTER POLICY "anon insert participants" ON public.participants        TO anon, authenticated;

ALTER POLICY "anon insert sessions"     ON public.sessions            TO anon, authenticated;
ALTER POLICY "anon_select_sessions"     ON public.sessions            TO anon, authenticated;
ALTER POLICY "anon update sessions"     ON public.sessions            TO anon, authenticated;

ALTER POLICY "anon insert attempts"     ON public.lesson_attempts     TO anon, authenticated;
ALTER POLICY "anon_select_attempts"     ON public.lesson_attempts     TO anon, authenticated;
ALTER POLICY "anon update attempts"     ON public.lesson_attempts     TO anon, authenticated;

ALTER POLICY "anon insert responses"    ON public.exercise_responses  TO anon, authenticated;

-- ── Estudio (por si STUDY_OPEN se vuelve a abrir) ───────────────
ALTER POLICY "anon_insert_consent"      ON public.consent_records     TO anon, authenticated;

ALTER POLICY "anon_read_items"          ON public.questionnaire_items TO anon, authenticated;

ALTER POLICY "anon_insert_responses"    ON public.questionnaire_responses TO anon, authenticated;
ALTER POLICY "anon_select_responses"    ON public.questionnaire_responses TO anon, authenticated;
ALTER POLICY "anon_update_responses"    ON public.questionnaire_responses TO anon, authenticated;

ALTER POLICY "anon_insert_timeline"     ON public.intervention_timeline TO anon, authenticated;
ALTER POLICY "anon_select_timeline"     ON public.intervention_timeline TO anon, authenticated;
ALTER POLICY "anon_update_timeline"     ON public.intervention_timeline TO anon, authenticated;

COMMIT;

-- Verificación (esperado: ninguna fila queda solo con {anon}):
-- SELECT tablename, policyname, roles::text FROM pg_policies
-- WHERE schemaname='public' AND roles::text = '{anon}';
