-- NAWAT — Actualización de cuestionario postest para comparación directa
--
-- IMPORTANTE:
-- Esta migración reemplaza el postest anterior por el instrumento nuevo.
-- Borra respuestas postest guardadas con los códigos antiguos para poder
-- dejar el codebook exactamente en el nuevo orden. Ejecútala antes de la
-- recolección final o después de respaldar datos de prueba.

BEGIN;

-- Ajuste menor para que el pretest coincida con el documento final.
UPDATE questionnaire_items
SET question_text = 'Usaría más una herramienta de aprendizaje si está disponible desde el teléfono celular.'
WHERE code = 'C12';

-- El postest se reemplaza por:
--   B1-B10: comparación directa con pretest
--   C1-C10: SUS con redacción accesible
--   D1-D2: preguntas abiertas
DELETE FROM questionnaire_responses
WHERE phase = 'posttest';

DELETE FROM questionnaire_items
WHERE phase = 'posttest';

INSERT INTO questionnaire_items
  (code, phase, section, item_type, question_text, options, polarity, is_required, order_index)
VALUES
-- Sección B — Comparación directa con el pretest
('post_b1', 'posttest', 'B', 'likert_5', 'Me interesa aprender nociones básicas de náhuat.', NULL, 'positive', TRUE, 37),
('post_b2', 'posttest', 'B', 'likert_5', 'Usaría un recurso digital interactivo para seguir aprendiendo náhuat.', NULL, 'positive', TRUE, 38),
('post_b3', 'posttest', 'B', 'likert_5', 'Estoy dispuesto/a a dedicar tiempo semanal para aprender náhuat si el recurso es práctico y atractivo.', NULL, 'positive', TRUE, 39),
('post_b4', 'posttest', 'B', 'likert_5', 'Considero valioso que en educación superior se promueva el aprendizaje del náhuat.', NULL, 'positive', TRUE, 40),
('post_b5', 'posttest', 'B', 'likert_5', 'Me gustaría participar en actividades (curso, taller o app) relacionadas con el aprendizaje del náhuat.', NULL, 'positive', TRUE, 41),
('post_b6', 'posttest', 'B', 'likert_5', 'Aprender náhuat me parece útil o significativo a nivel cultural/personal.', NULL, 'positive', TRUE, 42),
('post_b7', 'posttest', 'B', 'likert_5', 'Las dinámicas tipo juego (puntos, niveles, logros) aumentan mi disposición a aprender.', NULL, 'positive', TRUE, 43),
('post_b8', 'posttest', 'B', 'likert_5', 'La retroalimentación inmediata (aciertos/errores) mejora mi experiencia de aprendizaje.', NULL, 'positive', TRUE, 44),
('post_b9', 'posttest', 'B', 'likert_5', 'Interactuar (responder, seleccionar, completar) me ayuda más que solo leer o ver contenido.', NULL, 'positive', TRUE, 45),
('post_b10', 'posttest', 'B', 'single_choice', '¿Cuánto tiempo estarías dispuesto/a a dedicar por semana para aprender náhuat si el recurso fuera atractivo?',
  '[{"value":"0","label":"0 minutos"},{"value":"10-20","label":"10–20 minutos"},{"value":"21-40","label":"21–40 minutos"},{"value":"41-60","label":"41–60 minutos"},{"value":"60+","label":"Más de 60 minutos"}]'::jsonb,
  NULL, TRUE, 46),

-- Sección C — Evaluación de Usabilidad (SUS)
('sus_c1',  'posttest', 'C', 'likert_5', 'Me gustaría usar esta aplicación con frecuencia.', NULL, 'positive', TRUE, 47),
('sus_c2',  'posttest', 'C', 'likert_5', 'Sentí que la aplicación era más complicada de lo necesario.', NULL, 'negative', TRUE, 48),
('sus_c3',  'posttest', 'C', 'likert_5', 'Me pareció fácil usar la aplicación.', NULL, 'positive', TRUE, 49),
('sus_c4',  'posttest', 'C', 'likert_5', 'Creo que necesitaría ayuda de una persona con más experiencia en tecnología para poder usar esta aplicación.', NULL, 'negative', TRUE, 50),
('sus_c5',  'posttest', 'C', 'likert_5', 'Sentí que las partes de la aplicación (lecciones, audios, ejercicios y botones) funcionaban bien juntas.', NULL, 'positive', TRUE, 51),
('sus_c6',  'posttest', 'C', 'likert_5', 'Sentí que algunas partes de la aplicación no funcionaban de la misma manera o podían confundir.', NULL, 'negative', TRUE, 52),
('sus_c7',  'posttest', 'C', 'likert_5', 'Creo que la mayoría de las personas aprenderían rápido a usar esta aplicación.', NULL, 'positive', TRUE, 53),
('sus_c8',  'posttest', 'C', 'likert_5', 'Sentí que la aplicación era incómoda o pesada de usar.', NULL, 'negative', TRUE, 54),
('sus_c9',  'posttest', 'C', 'likert_5', 'Me sentí seguro/a al usar la aplicación.', NULL, 'positive', TRUE, 55),
('sus_c10', 'posttest', 'C', 'likert_5', 'Sentí que tenía que aprender demasiadas cosas antes de poder empezar a usar la aplicación.', NULL, 'negative', TRUE, 56),

-- Sección D — Retroalimentación abierta
('post_d1', 'posttest', 'D', 'long_text', '¿Qué fue lo que más te gustó de la aplicación NAWAT?', NULL, NULL, FALSE, 57),
('post_d2', 'posttest', 'D', 'long_text', '¿Qué aspecto mejorarías o qué dificultad encontraste?', NULL, NULL, FALSE, 58);

CREATE OR REPLACE VIEW v_sus_scores AS
SELECT
  r.participant_id,
  ROUND(
    (SUM(
      CASE
        WHEN i.polarity = 'positive' THEN r.value_numeric - 1
        WHEN i.polarity = 'negative' THEN 5 - r.value_numeric
      END
    ) * 2.5)::numeric,
    2
  ) AS sus_score,
  COUNT(*) AS items_answered
FROM questionnaire_responses r
JOIN questionnaire_items i ON i.code = r.item_code
WHERE r.phase = 'posttest' AND i.code LIKE 'sus_c%'
GROUP BY r.participant_id;

DROP VIEW IF EXISTS v_dataset_wide;
CREATE VIEW v_dataset_wide AS
WITH q AS (
  SELECT
    participant_id,
    MAX(CASE WHEN phase='pretest' AND item_code='A1' THEN COALESCE(value_other, value_text) END) AS pre_a1_institucion,
    MAX(CASE WHEN phase='pretest' AND item_code='A2' THEN value_text END) AS pre_a2_edad,
    MAX(CASE WHEN phase='pretest' AND item_code='A3' THEN value_text END) AS pre_a3_sexo,
    MAX(CASE WHEN phase='pretest' AND item_code='A4' THEN COALESCE(value_other, value_text) END) AS pre_a4_ciclo,
    MAX(CASE WHEN phase='pretest' AND item_code='A5' THEN value_text END) AS pre_a5_carrera,
    MAX(CASE WHEN phase='pretest' AND item_code='B1' THEN value_text END) AS pre_b1_habia_escuchado,
    MAX(CASE WHEN phase='pretest' AND item_code='B2' THEN value_text END) AS pre_b2_nivel_previo,
    MAX(CASE WHEN phase='pretest' AND item_code='B3' THEN value_numeric END) AS pre_b3_interes_idiomas,
    MAX(CASE WHEN phase='pretest' AND item_code='B4' THEN value_text END) AS pre_b4_usa_apps,
    MAX(CASE WHEN phase='pretest' AND item_code='B5' THEN value_text END) AS pre_b5_frecuencia,
    MAX(CASE WHEN phase='pretest' AND item_code='C1'  THEN value_numeric END) AS pre_c1,
    MAX(CASE WHEN phase='pretest' AND item_code='C2'  THEN value_numeric END) AS pre_c2,
    MAX(CASE WHEN phase='pretest' AND item_code='C3'  THEN value_numeric END) AS pre_c3,
    MAX(CASE WHEN phase='pretest' AND item_code='C4'  THEN value_numeric END) AS pre_c4,
    MAX(CASE WHEN phase='pretest' AND item_code='C5'  THEN value_numeric END) AS pre_c5,
    MAX(CASE WHEN phase='pretest' AND item_code='C6'  THEN value_numeric END) AS pre_c6,
    MAX(CASE WHEN phase='pretest' AND item_code='C7'  THEN value_numeric END) AS pre_c7,
    MAX(CASE WHEN phase='pretest' AND item_code='C8'  THEN value_numeric END) AS pre_c8,
    MAX(CASE WHEN phase='pretest' AND item_code='C9'  THEN value_numeric END) AS pre_c9,
    MAX(CASE WHEN phase='pretest' AND item_code='C10' THEN value_numeric END) AS pre_c10,
    MAX(CASE WHEN phase='pretest' AND item_code='C11' THEN value_numeric END) AS pre_c11,
    MAX(CASE WHEN phase='pretest' AND item_code='C12' THEN value_numeric END) AS pre_c12,
    MAX(CASE WHEN phase='pretest' AND item_code='D1' THEN value_numeric END) AS pre_d1,
    MAX(CASE WHEN phase='pretest' AND item_code='D2' THEN value_numeric END) AS pre_d2,
    MAX(CASE WHEN phase='pretest' AND item_code='D3' THEN value_numeric END) AS pre_d3,
    MAX(CASE WHEN phase='pretest' AND item_code='D4' THEN value_numeric END) AS pre_d4,
    MAX(CASE WHEN phase='pretest' AND item_code='D5' THEN value_numeric END) AS pre_d5,
    MAX(CASE WHEN phase='pretest' AND item_code='D6' THEN value_numeric END) AS pre_d6,
    MAX(CASE WHEN phase='pretest' AND item_code='E1' THEN COALESCE(value_other, value_text) END) AS pre_e1_herramienta_preferida,
    MAX(CASE WHEN phase='pretest' AND item_code='E2' THEN COALESCE(value_other, value_text) END) AS pre_e2_barrera,
    MAX(CASE WHEN phase='pretest' AND item_code='E3' THEN value_text END) AS pre_e3_tiempo_dispuesto,
    MAX(CASE WHEN phase='pretest' AND item_code='G1' THEN value_numeric END) AS pre_g1_herencia_pipil_nahuat,
    MAX(CASE WHEN phase='pretest' AND item_code='G2' THEN value_numeric END) AS pre_g2_orgullo_raices,
    MAX(CASE WHEN phase='pretest' AND item_code='G3' THEN value_numeric END) AS pre_g3_conexion_cultural,
    MAX(CASE WHEN phase='pretest' AND item_code='G4' THEN value_numeric END) AS pre_g4_preservar_identidad,
    MAX(CASE WHEN phase='posttest' AND item_code='post_b1' THEN value_numeric END) AS post_b1_interes_nahuat,
    MAX(CASE WHEN phase='posttest' AND item_code='post_b2' THEN value_numeric END) AS post_b2_recurso_digital,
    MAX(CASE WHEN phase='posttest' AND item_code='post_b3' THEN value_numeric END) AS post_b3_dedicar_tiempo,
    MAX(CASE WHEN phase='posttest' AND item_code='post_b4' THEN value_numeric END) AS post_b4_valor_educacion,
    MAX(CASE WHEN phase='posttest' AND item_code='post_b5' THEN value_numeric END) AS post_b5_participacion,
    MAX(CASE WHEN phase='posttest' AND item_code='post_b6' THEN value_numeric END) AS post_b6_utilidad_cultural,
    MAX(CASE WHEN phase='posttest' AND item_code='post_b7' THEN value_numeric END) AS post_b7_gamificacion,
    MAX(CASE WHEN phase='posttest' AND item_code='post_b8' THEN value_numeric END) AS post_b8_retroalimentacion,
    MAX(CASE WHEN phase='posttest' AND item_code='post_b9' THEN value_numeric END) AS post_b9_interaccion,
    MAX(CASE WHEN phase='posttest' AND item_code='post_b10' THEN value_text END) AS post_b10_tiempo_dispuesto,
    MAX(CASE WHEN phase='posttest' AND item_code='sus_c1'  THEN value_numeric END) AS post_sus_c1,
    MAX(CASE WHEN phase='posttest' AND item_code='sus_c2'  THEN value_numeric END) AS post_sus_c2,
    MAX(CASE WHEN phase='posttest' AND item_code='sus_c3'  THEN value_numeric END) AS post_sus_c3,
    MAX(CASE WHEN phase='posttest' AND item_code='sus_c4'  THEN value_numeric END) AS post_sus_c4,
    MAX(CASE WHEN phase='posttest' AND item_code='sus_c5'  THEN value_numeric END) AS post_sus_c5,
    MAX(CASE WHEN phase='posttest' AND item_code='sus_c6'  THEN value_numeric END) AS post_sus_c6,
    MAX(CASE WHEN phase='posttest' AND item_code='sus_c7'  THEN value_numeric END) AS post_sus_c7,
    MAX(CASE WHEN phase='posttest' AND item_code='sus_c8'  THEN value_numeric END) AS post_sus_c8,
    MAX(CASE WHEN phase='posttest' AND item_code='sus_c9'  THEN value_numeric END) AS post_sus_c9,
    MAX(CASE WHEN phase='posttest' AND item_code='sus_c10' THEN value_numeric END) AS post_sus_c10,
    MAX(CASE WHEN phase='posttest' AND item_code='post_d1' THEN value_text END) AS post_d1_gustado,
    MAX(CASE WHEN phase='posttest' AND item_code='post_d2' THEN value_text END) AS post_d2_mejorar
  FROM questionnaire_responses
  GROUP BY participant_id
),
sess AS (
  SELECT participant_id, COUNT(*) AS tel_sessions_count, COALESCE(SUM(duration_seconds), 0) AS tel_total_seconds
  FROM sessions
  GROUP BY participant_id
),
la AS (
  SELECT
    participant_id,
    COUNT(*) AS tel_lessons_started,
    COUNT(*) FILTER (WHERE completed_at IS NOT NULL) AS tel_lessons_completed,
    COUNT(*) FILTER (WHERE passed = TRUE) AS tel_lessons_passed,
    COALESCE(SUM(xp_earned), 0) AS tel_total_xp,
    COALESCE(MAX(stars), 0) AS tel_max_stars,
    COALESCE(ROUND(AVG(score)::numeric, 3), 0) AS tel_avg_score
  FROM lesson_attempts
  GROUP BY participant_id
),
er AS (
  SELECT
    participant_id,
    COUNT(*) AS tel_exercises_total,
    COUNT(*) FILTER (WHERE is_correct = TRUE) AS tel_exercises_correct,
    ROUND(AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END)::numeric, 3) AS tel_accuracy,
    ROUND(AVG(response_time_sec)::numeric, 2) AS tel_avg_response_time_sec
  FROM exercise_responses
  GROUP BY participant_id
)
SELECT
  p.id AS participant_id,
  p.first_name,
  p.last_name,
  p.created_at AS participant_created_at,
  c.accepted_at AS consent_accepted_at,
  c.consent_version,
  it.pretest_completed_at,
  it.posttest_unlocked_at,
  it.posttest_completed_at,
  EXTRACT(EPOCH FROM (it.posttest_unlocked_at - it.pretest_completed_at))::int AS intervention_seconds,
  sus.sus_score,
  q.pre_a1_institucion, q.pre_a2_edad, q.pre_a3_sexo, q.pre_a4_ciclo, q.pre_a5_carrera,
  q.pre_b1_habia_escuchado, q.pre_b2_nivel_previo, q.pre_b3_interes_idiomas, q.pre_b4_usa_apps, q.pre_b5_frecuencia,
  q.pre_c1, q.pre_c2, q.pre_c3, q.pre_c4, q.pre_c5, q.pre_c6, q.pre_c7, q.pre_c8, q.pre_c9, q.pre_c10, q.pre_c11, q.pre_c12,
  q.pre_d1, q.pre_d2, q.pre_d3, q.pre_d4, q.pre_d5, q.pre_d6,
  q.pre_e1_herramienta_preferida, q.pre_e2_barrera, q.pre_e3_tiempo_dispuesto,
  q.pre_g1_herencia_pipil_nahuat, q.pre_g2_orgullo_raices, q.pre_g3_conexion_cultural, q.pre_g4_preservar_identidad,
  q.post_b1_interes_nahuat, q.post_b2_recurso_digital, q.post_b3_dedicar_tiempo, q.post_b4_valor_educacion,
  q.post_b5_participacion, q.post_b6_utilidad_cultural, q.post_b7_gamificacion, q.post_b8_retroalimentacion,
  q.post_b9_interaccion, q.post_b10_tiempo_dispuesto,
  q.post_b1_interes_nahuat - q.pre_d1 AS delta_interes_nahuat,
  q.post_b2_recurso_digital - q.pre_d2 AS delta_recurso_digital,
  q.post_b3_dedicar_tiempo - q.pre_d3 AS delta_dedicar_tiempo,
  q.post_b4_valor_educacion - q.pre_d4 AS delta_valor_educacion,
  q.post_b5_participacion - q.pre_d5 AS delta_participacion,
  q.post_b6_utilidad_cultural - q.pre_d6 AS delta_utilidad_cultural,
  q.post_b7_gamificacion - q.pre_c8 AS delta_gamificacion,
  q.post_b8_retroalimentacion - q.pre_c3 AS delta_retroalimentacion,
  q.post_b9_interaccion - q.pre_c9 AS delta_interaccion,
  q.post_sus_c1, q.post_sus_c2, q.post_sus_c3, q.post_sus_c4, q.post_sus_c5,
  q.post_sus_c6, q.post_sus_c7, q.post_sus_c8, q.post_sus_c9, q.post_sus_c10,
  q.post_d1_gustado, q.post_d2_mejorar,
  COALESCE(sess.tel_sessions_count, 0) AS tel_sessions_count,
  COALESCE(sess.tel_total_seconds, 0) AS tel_total_seconds,
  COALESCE(la.tel_lessons_started, 0) AS tel_lessons_started,
  COALESCE(la.tel_lessons_completed, 0) AS tel_lessons_completed,
  COALESCE(la.tel_lessons_passed, 0) AS tel_lessons_passed,
  COALESCE(la.tel_avg_score, 0) AS tel_avg_score,
  COALESCE(la.tel_total_xp, 0) AS tel_total_xp,
  COALESCE(la.tel_max_stars, 0) AS tel_max_stars,
  COALESCE(er.tel_exercises_total, 0) AS tel_exercises_total,
  COALESCE(er.tel_exercises_correct, 0) AS tel_exercises_correct,
  COALESCE(er.tel_accuracy, 0) AS tel_accuracy,
  COALESCE(er.tel_avg_response_time_sec, 0) AS tel_avg_response_time_sec
FROM participants p
LEFT JOIN consent_records c ON c.participant_id = p.id
LEFT JOIN intervention_timeline it ON it.participant_id = p.id
LEFT JOIN q ON q.participant_id = p.id
LEFT JOIN v_sus_scores sus ON sus.participant_id = p.id
LEFT JOIN sess ON sess.participant_id = p.id
LEFT JOIN la ON la.participant_id = p.id
LEFT JOIN er ON er.participant_id = p.id;

COMMIT;
