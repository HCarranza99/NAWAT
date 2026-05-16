-- ═══════════════════════════════════════════════════════════════════════════
-- NAWAT — Queries de verificación de trazabilidad
-- ═══════════════════════════════════════════════════════════════════════════
-- Copia y pega cada bloque en el SQL Editor de Supabase tras correr varias
-- pruebas. Cada bloque responde una pregunta específica del tipo:
-- "¿quedaron los datos ligados al mismo participant_id en todas las tablas?"
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 1. Resumen global: ¿hay datos? ──────────────────────────────────────────
SELECT 'participants'             AS tabla, COUNT(*) AS filas FROM participants
UNION ALL SELECT 'consent_records',         COUNT(*) FROM consent_records
UNION ALL SELECT 'questionnaire_items',     COUNT(*) FROM questionnaire_items   -- esperado: 52
UNION ALL SELECT 'questionnaire_responses', COUNT(*) FROM questionnaire_responses
UNION ALL SELECT 'intervention_timeline',   COUNT(*) FROM intervention_timeline
UNION ALL SELECT 'sessions',                COUNT(*) FROM sessions
UNION ALL SELECT 'lesson_attempts',         COUNT(*) FROM lesson_attempts
UNION ALL SELECT 'exercise_responses',      COUNT(*) FROM exercise_responses;

-- ── 1.1. Verificación de ítems obsoletos ───────────────────────────────────
-- Esperado: 0. La trazabilidad del postest no debe existir como pregunta post_a1.
SELECT COUNT(*) AS post_a1_obsoleto
FROM questionnaire_items
WHERE code = 'post_a1';

-- ── 2. Lista todos los participantes con un contador por tabla ──────────────
-- Cada participante debería tener:
--   • 1 consent_record
--   • 35 respuestas en pretest
--   • 15–17 respuestas en postest (post_d1/post_d2 son opcionales)
--   • 1 intervention_timeline con los 3 timestamps si completó
SELECT
  p.id AS participant_id,
  p.first_name || ' ' || p.last_name AS nombre,
  p.created_at,
  (SELECT COUNT(*) FROM consent_records        c WHERE c.participant_id = p.id) AS tiene_consent,
  (SELECT COUNT(*) FROM questionnaire_responses q WHERE q.participant_id = p.id AND q.phase='pretest')  AS resp_pretest,
  (SELECT COUNT(*) FROM questionnaire_responses q WHERE q.participant_id = p.id AND q.phase='posttest') AS resp_posttest,
  (SELECT COUNT(*) FROM sessions                s WHERE s.participant_id = p.id) AS sesiones,
  (SELECT COUNT(*) FROM lesson_attempts         l WHERE l.participant_id = p.id) AS lecciones,
  (SELECT COUNT(*) FROM exercise_responses      e WHERE e.participant_id = p.id) AS ejercicios,
  it.pretest_completed_at,
  it.posttest_unlocked_at,
  it.posttest_completed_at
FROM participants p
LEFT JOIN intervention_timeline it ON it.participant_id = p.id
ORDER BY p.created_at DESC;

-- ── 3. Trazabilidad cruzada: ¿todas las FK apuntan a participants reales? ──
-- Esperado: 0 filas en cada subquery (no debería haber huérfanos)
SELECT 'huérfanos en consent_records' AS check_name, COUNT(*) AS filas
FROM consent_records WHERE participant_id NOT IN (SELECT id FROM participants)
UNION ALL SELECT 'huérfanos en questionnaire_responses',
  COUNT(*) FROM questionnaire_responses WHERE participant_id NOT IN (SELECT id FROM participants)
UNION ALL SELECT 'huérfanos en intervention_timeline',
  COUNT(*) FROM intervention_timeline WHERE participant_id NOT IN (SELECT id FROM participants)
UNION ALL SELECT 'huérfanos en sessions',
  COUNT(*) FROM sessions WHERE participant_id NOT IN (SELECT id FROM participants)
UNION ALL SELECT 'huérfanos en lesson_attempts',
  COUNT(*) FROM lesson_attempts WHERE participant_id NOT IN (SELECT id FROM participants)
UNION ALL SELECT 'huérfanos en exercise_responses',
  COUNT(*) FROM exercise_responses WHERE participant_id NOT IN (SELECT id FROM participants);

-- ── 4. Detalle de respuestas de UN participante (reemplaza el UUID) ────────
-- Muestra cada respuesta en orden, uniendo con el codebook para ver texto.
-- Útil para verificar que las opciones seleccionadas fueron lo que el usuario marcó.
SELECT
  i.order_index,
  r.phase,
  i.section,
  r.item_code,
  i.item_type,
  LEFT(i.question_text, 60) AS pregunta,
  r.value_numeric,
  r.value_text,
  r.value_other,
  r.response_time_ms,
  r.answered_at
FROM questionnaire_responses r
JOIN questionnaire_items i ON i.code = r.item_code
WHERE r.participant_id = '<REEMPLAZAR_CON_UUID_DEL_PARTICIPANTE>'
ORDER BY r.phase, i.order_index;

-- ── 5. ¿Hay respuestas duplicadas por item? (no debería) ────────────────────
-- Gracias al UNIQUE (participant_id, phase, item_code) esto debe regresar 0.
SELECT participant_id, phase, item_code, COUNT(*) AS copias
FROM questionnaire_responses
GROUP BY participant_id, phase, item_code
HAVING COUNT(*) > 1;

-- ── 6. Puntajes SUS por participante ───────────────────────────────────────
SELECT p.first_name || ' ' || p.last_name AS nombre, s.sus_score, s.items_answered
FROM v_sus_scores s
JOIN participants p ON p.id = s.participant_id
ORDER BY s.sus_score DESC NULLS LAST;

-- ── 7. Dataset ancho completo (UN row por participante, listo para exportar)
-- En el SQL Editor → "Download as CSV" con este resultado.
SELECT * FROM v_dataset_wide ORDER BY participant_created_at DESC;

-- ── 8. Verificación de simetría pretest↔postest (para análisis) ────────────
-- Compara interés declarado pre vs post para cada participante.
SELECT
  p.first_name || ' ' || p.last_name AS nombre,
  w.pre_d1 AS pre_interes_nahuat,
  w.post_c1_interes,
  w.post_c1_interes - w.pre_d1 AS delta_interes,
  w.pre_c8 AS pre_gamificacion,
  w.post_c2_gamificacion,
  w.pre_e3_tiempo_dispuesto,
  w.post_c5_tiempo_dispuesto,
  w.sus_score
FROM v_dataset_wide w
JOIN participants p ON p.id = w.participant_id
WHERE w.posttest_completed_at IS NOT NULL
ORDER BY delta_interes DESC NULLS LAST;
