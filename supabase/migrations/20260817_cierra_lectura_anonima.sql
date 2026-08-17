-- ════════════════════════════════════════════════════════════════════════════
--  Cierra la lectura anónima del dataset (2026-08-17)
--
--  QUÉ ARREGLA
--  La clave anónima viaja en el bundle público. Hoy, cualquiera que la copie
--  del JS puede hacer esto contra la base de producción:
--
--    • SELECT sobre sessions, lesson_attempts, questionnaire_responses e
--      intervention_timeline → se lleva el dataset entero (3.558 respuestas,
--      1.006 sesiones) incluidas las de texto libre.
--    • UPDATE con USING(true) sobre esas mismas tablas → puede reescribir o
--      vaciar respuestas ajenas sin dejar rastro.
--
--  Es la deuda que dejó anotada el hotfix del 27-jun-2026: el SELECT se
--  reabrió porque `.upsert()` de PostgREST genera `INSERT ... ON CONFLICT DO
--  UPDATE`, y Postgres exige policy de SELECT para ver la fila en conflicto.
--  Este archivo aplica el arreglo definitivo que ese hotfix dejó pendiente:
--  mover la escritura a funciones SECURITY DEFINER y volver a cerrar la lectura.
--
--  CÓMO FUNCIONA
--  Las funciones corren con los permisos del dueño, así que saltan RLS y no
--  necesitan que anon tenga SELECT. Ninguna DEVUELVE filas: se puede escribir,
--  no leer. Y las que cierran un registro (sesión, intento) solo escriben si el
--  campo está vacío, así que un tercero no puede pisar un dato ya guardado.
--
--  ⚠️ ORDEN DE DESPLIEGUE — importa
--  1. Aplicar ESTA migración primero.
--  2. Después desplegar el frontend que llama a las RPC.
--  Al revés, el frontend nuevo llama a funciones que no existen y la telemetría
--  se pierde EN SILENCIO (cada llamada de analytics.js tiene catch mudo). Es
--  exactamente lo que pasó del 4 al 27 de junio: 23 días sin guardar nada y 70
--  participantes perdidos.
--
--  VERIFICACIÓN al final del archivo.
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. Respuestas de cuestionario ───────────────────────────────────────────
-- Mantiene la semántica de upsert (el participante puede corregir una
-- respuesta antes de enviar) sobre la única (participant_id, phase, item_code).
CREATE OR REPLACE FUNCTION public.save_questionnaire_response(
  p_participant_id  uuid,
  p_session_id      uuid,
  p_phase           text,
  p_item_code       text,
  p_value_numeric   int     DEFAULT NULL,
  p_value_text      text    DEFAULT NULL,
  p_value_other     text    DEFAULT NULL,
  p_response_time_ms int    DEFAULT NULL
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  INSERT INTO public.questionnaire_responses (
    participant_id, session_id, phase, item_code,
    value_numeric, value_text, value_other, response_time_ms, answered_at
  )
  VALUES (
    p_participant_id, p_session_id, p_phase, p_item_code,
    p_value_numeric, p_value_text, p_value_other, p_response_time_ms, now()
  )
  ON CONFLICT (participant_id, phase, item_code) DO UPDATE SET
    session_id       = EXCLUDED.session_id,
    value_numeric    = EXCLUDED.value_numeric,
    value_text       = EXCLUDED.value_text,
    value_other      = EXCLUDED.value_other,
    response_time_ms = EXCLUDED.response_time_ms,
    answered_at      = EXCLUDED.answered_at;
$$;

-- ── 2. Hitos de la intervención ─────────────────────────────────────────────
-- El trigger `preserve_first_timeline_ts` ya protege el primer timestamp; acá
-- solo se acota QUÉ columna se puede tocar, para que el nombre de columna no
-- llegue como texto libre desde el cliente.
CREATE OR REPLACE FUNCTION public.mark_intervention_milestone(
  p_participant_id uuid,
  p_milestone      text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF p_milestone NOT IN ('pretest_completed', 'posttest_unlocked', 'posttest_completed') THEN
    RAISE EXCEPTION 'hito desconocido: %', p_milestone;
  END IF;

  INSERT INTO public.intervention_timeline AS t (
    participant_id,
    pretest_completed_at,
    posttest_unlocked_at,
    posttest_completed_at
  )
  VALUES (
    p_participant_id,
    CASE WHEN p_milestone = 'pretest_completed'  THEN now() END,
    CASE WHEN p_milestone = 'posttest_unlocked'  THEN now() END,
    CASE WHEN p_milestone = 'posttest_completed' THEN now() END
  )
  ON CONFLICT (participant_id) DO UPDATE SET
    pretest_completed_at  = COALESCE(t.pretest_completed_at,  EXCLUDED.pretest_completed_at),
    posttest_unlocked_at  = COALESCE(t.posttest_unlocked_at,  EXCLUDED.posttest_unlocked_at),
    posttest_completed_at = COALESCE(t.posttest_completed_at, EXCLUDED.posttest_completed_at);
END;
$$;

-- ── 3. Cierre de sesión ─────────────────────────────────────────────────────
-- Solo escribe si `ended_at` está vacío: una sesión ya cerrada no se re-escribe.
CREATE OR REPLACE FUNCTION public.end_session(
  p_session_id       uuid,
  p_duration_seconds int
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  UPDATE public.sessions
     SET ended_at = now(),
         duration_seconds = p_duration_seconds
   WHERE id = p_session_id
     AND ended_at IS NULL;
$$;

-- ── 4. Cierre de intento de lección ─────────────────────────────────────────
-- Misma regla: un intento ya completado no se puede pisar.
CREATE OR REPLACE FUNCTION public.complete_lesson_attempt(
  p_attempt_id       uuid,
  p_duration_seconds int,
  p_score            numeric,
  p_stars            int,
  p_xp_earned        int,
  p_passed           boolean
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  UPDATE public.lesson_attempts
     SET completed_at = now(),
         duration_seconds = p_duration_seconds,
         score = p_score,
         stars = p_stars,
         xp_earned = p_xp_earned,
         passed = p_passed
   WHERE id = p_attempt_id
     AND completed_at IS NULL;
$$;

-- ── 5. Permisos de ejecución ────────────────────────────────────────────────
-- REVOKE primero: por defecto Postgres concede EXECUTE a PUBLIC.
DO $$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'public.save_questionnaire_response(uuid,uuid,text,text,int,text,text,int)',
    'public.mark_intervention_milestone(uuid,text)',
    'public.end_session(uuid,int)',
    'public.complete_lesson_attempt(uuid,int,numeric,int,int,boolean)'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO anon, authenticated', fn);
  END LOOP;
END;
$$;

-- ── 6. Se cierra la lectura y la escritura directa ──────────────────────────
-- Ya nada del cliente necesita SELECT: las RPC de arriba hacen el trabajo.
DROP POLICY IF EXISTS "anon_select_responses" ON public.questionnaire_responses;
DROP POLICY IF EXISTS "anon_update_responses" ON public.questionnaire_responses;
DROP POLICY IF EXISTS "anon_insert_responses" ON public.questionnaire_responses;

DROP POLICY IF EXISTS "anon_select_timeline"  ON public.intervention_timeline;
DROP POLICY IF EXISTS "anon_update_timeline"  ON public.intervention_timeline;
DROP POLICY IF EXISTS "anon_insert_timeline"  ON public.intervention_timeline;

DROP POLICY IF EXISTS "anon_select_sessions"  ON public.sessions;
DROP POLICY IF EXISTS "anon update sessions"  ON public.sessions;

DROP POLICY IF EXISTS "anon_select_attempts"  ON public.lesson_attempts;
DROP POLICY IF EXISTS "anon update attempts"  ON public.lesson_attempts;

-- Se CONSERVAN los INSERT directos: son `.insert()` planos, no necesitan SELECT
-- y crean filas propias, no tocan ajenas.
--   participants          · anon insert participants
--   sessions              · anon insert sessions
--   lesson_attempts       · anon insert attempts
--   exercise_responses    · anon insert responses
--   consent_records       · anon_insert_consent
--   participant_registration_updates · insert_registration_updates
-- Y el SELECT de questionnaire_items, que es el catálogo de preguntas: contenido
-- de la app, no dato de nadie.

-- ── 7. search_path fijo en los triggers existentes ──────────────────────────
-- Cierra los dos avisos `function_search_path_mutable` del linter de Supabase.
ALTER FUNCTION public.handle_updated_at()          SET search_path = public, pg_temp;
ALTER FUNCTION public.preserve_first_timeline_ts() SET search_path = public, pg_temp;

COMMIT;

-- ════════════════════════════════════════════════════════════════════════════
--  VERIFICACIÓN — correr después de aplicar
--
--  a) Ninguna policy de lectura debe quedar sobre datos de participante.
--     Esperado: solo questionnaire_items.
--
--     SELECT tablename, policyname FROM pg_policies
--      WHERE schemaname='public' AND cmd='SELECT';
--
--  b) Las cuatro funciones existen, son SECURITY DEFINER y tienen search_path.
--     Esperado: 4 filas, security_definer = true, config no nulo.
--
--     SELECT p.proname, p.prosecdef, p.proconfig
--       FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
--      WHERE n.nspname='public'
--        AND p.proname IN ('save_questionnaire_response','mark_intervention_milestone',
--                          'end_session','complete_lesson_attempt');
--
--  c) PRUEBA DE HUMO tras desplegar el frontend — que la telemetría siga viva.
--     Abrir la app, terminar una lección, y confirmar que sube el conteo:
--
--     SELECT count(*) FROM lesson_attempts WHERE completed_at > now() - interval '10 minutes';
--     SELECT count(*) FROM questionnaire_responses WHERE answered_at > now() - interval '10 minutes';
--
--     Si sale 0 después de haber jugado, REVERTIR el frontend de inmediato: es
--     el mismo modo de fallo silencioso de junio.
-- ════════════════════════════════════════════════════════════════════════════
