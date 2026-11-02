-- ════════════════════════════════════════════════════════════════════════════
--  Borrado de datos personales (primera ejecución: 2026-11-01)
--
--  La tesis terminó y la app dejó de pedir nombre, edad y lugar (ver
--  src/data/funciones.js). Antes de esto se exportó un respaldo anonimizado,
--  que no está en el repositorio.
--
--  QUÉ BORRA
--    - participants: nombre, apellido, edad, departamento, distrito y país.
--    - user_profiles: las mismas columnas. El progreso (xp, lecciones, srs,
--      racha) NO se toca.
--    - participant_registration_updates: todas las filas.
--    - questionnaire_responses: el texto libre (short_text / long_text) y el
--      campo "otra razón" (value_other). Las respuestas Likert y de opción se
--      quedan.
--
--  QUÉ NO TOCA
--    Telemetría (sessions, lesson_attempts, exercise_responses), consentimiento,
--    intervention_timeline, error_log ni las cuentas de auth.users.
--
--  SE PUEDE REPETIR
--    Es idempotente. Correrlo otra vez después de publicar la versión con el
--    registro apagado limpia lo que haya entrado mientras tanto desde la
--    versión vieja de la app.
--
--  Ojo: lo borrado sigue en los respaldos automáticos de Supabase hasta que
--  caduquen.
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

UPDATE public.participants
   SET first_name = NULL, last_name = NULL, age = NULL,
       residence = NULL, district = NULL, country = NULL
 WHERE first_name IS NOT NULL OR last_name IS NOT NULL OR age IS NOT NULL
    OR residence IS NOT NULL OR district IS NOT NULL OR country IS NOT NULL;

UPDATE public.user_profiles
   SET first_name = NULL, age = NULL, residence = NULL, district = NULL, country = NULL
 WHERE first_name IS NOT NULL OR age IS NOT NULL OR residence IS NOT NULL
    OR district IS NOT NULL OR country IS NOT NULL;

DELETE FROM public.participant_registration_updates;

UPDATE public.questionnaire_responses
   SET value_text = NULL
 WHERE value_text IS NOT NULL
   AND item_code IN (SELECT code FROM public.questionnaire_items
                      WHERE item_type IN ('short_text', 'long_text'));

UPDATE public.questionnaire_responses
   SET value_other = NULL
 WHERE value_other IS NOT NULL;

COMMIT;

-- ── Verificación: todo debe dar 0 ─────────────────────────────────────────
-- SELECT
--   (SELECT count(*) FROM participants WHERE first_name IS NOT NULL OR last_name IS NOT NULL OR age IS NOT NULL OR residence IS NOT NULL OR district IS NOT NULL OR country IS NOT NULL) AS participantes,
--   (SELECT count(*) FROM user_profiles WHERE first_name IS NOT NULL OR age IS NOT NULL OR residence IS NOT NULL OR district IS NOT NULL OR country IS NOT NULL) AS perfiles,
--   (SELECT count(*) FROM participant_registration_updates) AS correcciones,
--   (SELECT count(*) FROM questionnaire_responses r JOIN questionnaire_items i ON i.code = r.item_code WHERE i.item_type IN ('short_text','long_text') AND r.value_text IS NOT NULL) AS textos_libres,
--   (SELECT count(*) FROM questionnaire_responses WHERE value_other IS NOT NULL) AS otros;
