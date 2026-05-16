-- ═══════════════════════════════════════════════════════════════════════════
-- NAWAT — Cuestionarios (pretest/postest) + consentimiento + timeline + vistas
-- ═══════════════════════════════════════════════════════════════════════════
-- Diseño: long-format para inserts, wide-format para exportación vía vistas.
-- Idempotente: todas las sentencias usan IF [NOT] EXISTS o CREATE OR REPLACE.
-- Tablas existentes (participants, sessions, lesson_attempts, exercise_responses)
-- NO se modifican — solo se agregan nuevas y se construyen vistas encima.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── Registro de consentimiento ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS consent_records (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id     UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  consent_version    TEXT NOT NULL,
  consent_text_hash  TEXT NOT NULL,
  accepted_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (participant_id, consent_version)
);

-- ── Codebook: cada item del pretest y postest ───────────────────────────────
CREATE TABLE IF NOT EXISTS questionnaire_items (
  code           TEXT PRIMARY KEY,
  phase          TEXT NOT NULL CHECK (phase IN ('pretest', 'posttest')),
  section        TEXT NOT NULL,
  item_type      TEXT NOT NULL CHECK (item_type IN ('single_choice', 'likert_5', 'short_text', 'long_text')),
  question_text  TEXT NOT NULL,
  options        JSONB,
  polarity       TEXT CHECK (polarity IN ('positive', 'negative')),
  is_required    BOOLEAN NOT NULL DEFAULT TRUE,
  order_index    INT NOT NULL
);

-- ── Respuestas long-format (una fila por item respondido) ───────────────────
CREATE TABLE IF NOT EXISTS questionnaire_responses (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id    UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  session_id        UUID REFERENCES sessions(id) ON DELETE SET NULL,
  phase             TEXT NOT NULL CHECK (phase IN ('pretest', 'posttest')),
  item_code         TEXT NOT NULL REFERENCES questionnaire_items(code),
  value_numeric     INT,
  value_text        TEXT,
  value_other       TEXT,
  response_time_ms  INT,
  answered_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (participant_id, phase, item_code)
);

CREATE INDEX IF NOT EXISTS idx_qr_participant ON questionnaire_responses (participant_id, phase);

-- ── Auditoría del protocolo de intervención ─────────────────────────────────
CREATE TABLE IF NOT EXISTS intervention_timeline (
  participant_id         UUID PRIMARY KEY REFERENCES participants(id) ON DELETE CASCADE,
  pretest_completed_at   TIMESTAMPTZ,
  posttest_unlocked_at   TIMESTAMPTZ,
  posttest_completed_at  TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════════════════════════════════
-- RLS — acceso desde el cliente anon (app publica con VITE_SUPABASE_ANON_KEY)
-- ═══════════════════════════════════════════════════════════════════════════

ALTER TABLE consent_records        ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_timeline  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_consent" ON consent_records;
CREATE POLICY "anon_all_consent" ON consent_records
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_read_items" ON questionnaire_items;
CREATE POLICY "anon_read_items" ON questionnaire_items
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_all_responses" ON questionnaire_responses;
CREATE POLICY "anon_all_responses" ON questionnaire_responses
  FOR ALL TO anon USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_all_timeline" ON intervention_timeline;
CREATE POLICY "anon_all_timeline" ON intervention_timeline
  FOR ALL TO anon USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- SEED — 52 items (pretest: 35, postest: 17)
-- ═══════════════════════════════════════════════════════════════════════════

-- Limpieza de ítems obsoletos: la trazabilidad del postest se maneja por
-- participant_id/participants, no como pregunta visible ni como item del codebook.
DELETE FROM questionnaire_responses WHERE item_code = 'post_a1';
DELETE FROM questionnaire_items WHERE code = 'post_a1';

INSERT INTO questionnaire_items (code, phase, section, item_type, question_text, options, polarity, is_required, order_index) VALUES

-- ─── PRETEST, Sección A (datos generales) ───
('A1', 'pretest', 'A', 'single_choice', 'Institución de educación superior',
  '[{"value":"andres_bello","label":"Andrés Bello Regional Chalatenango"},{"value":"itcha","label":"ITCHA"},{"value":"umoar","label":"UMOAR"},{"value":"otra","label":"Otra","allow_custom":true}]'::jsonb,
  NULL, TRUE, 1),
('A2', 'pretest', 'A', 'single_choice', 'Edad',
  '[{"value":"18-20","label":"18–20"},{"value":"21-25","label":"21–25"},{"value":"26-30","label":"26–30"},{"value":"31-35","label":"31–35"},{"value":"36+","label":"36 o más"},{"value":"no_responde","label":"Prefiere no decir"}]'::jsonb,
  NULL, TRUE, 2),
('A3', 'pretest', 'A', 'single_choice', 'Sexo',
  '[{"value":"masculino","label":"Masculino"},{"value":"femenino","label":"Femenino"},{"value":"no_responde","label":"Prefiere no decir"}]'::jsonb,
  NULL, TRUE, 3),
('A4', 'pretest', 'A', 'single_choice', 'Año/ciclo de estudio',
  '[{"value":"1","label":"1.º año"},{"value":"2","label":"2.º año"},{"value":"3","label":"3.º año"},{"value":"4plus","label":"4.º año o superior"},{"value":"tecnico","label":"Técnico/tecnólogo"},{"value":"otro","label":"Otro","allow_custom":true}]'::jsonb,
  NULL, TRUE, 4),
('A5', 'pretest', 'A', 'short_text', 'Carrera o área de estudio', NULL, NULL, TRUE, 5),

-- ─── PRETEST, Sección B (conocimiento previo) ───
('B1', 'pretest', 'B', 'single_choice', 'Antes de esta encuesta, había escuchado sobre el náhuat.',
  '[{"value":"si","label":"Sí"},{"value":"no","label":"No"},{"value":"no_seguro","label":"No estoy seguro/a"}]'::jsonb,
  NULL, TRUE, 6),
('B2', 'pretest', 'B', 'single_choice', 'Mi nivel de conocimiento previo sobre el náhuat es.',
  '[{"value":"ninguno","label":"Ninguno"},{"value":"bajo","label":"Bajo"},{"value":"medio","label":"Medio"},{"value":"alto","label":"Alto"}]'::jsonb,
  NULL, TRUE, 7),
('B3', 'pretest', 'B', 'likert_5', 'Me interesa aprender otros idiomas además del español.', NULL, 'positive', TRUE, 8),
('B4', 'pretest', 'B', 'single_choice', 'He utilizado aplicaciones o plataformas digitales para aprender (idiomas u otros temas).',
  '[{"value":"si","label":"Sí"},{"value":"no","label":"No"}]'::jsonb,
  NULL, TRUE, 9),
('B5', 'pretest', 'B', 'single_choice', 'Frecuencia de uso de aplicaciones/plataformas para aprender.',
  '[{"value":"nunca","label":"Nunca"},{"value":"rara_vez","label":"Rara vez (1–2 veces al mes)"},{"value":"a_veces","label":"A veces (1–2 veces por semana)"},{"value":"frecuente","label":"Frecuente (3–5 veces por semana)"},{"value":"muy_frecuente","label":"Muy frecuente (casi todos los días)"}]'::jsonb,
  NULL, TRUE, 10),

-- ─── PRETEST, Sección C (percepción TIC, Likert) ───
('C1',  'pretest', 'C', 'likert_5', 'Considero que las herramientas TIC interactivas pueden apoyar el aprendizaje de un idioma.', NULL, 'positive', TRUE, 11),
('C2',  'pretest', 'C', 'likert_5', 'Una herramienta interactiva me ayudaría a mantenerme motivado/a en el aprendizaje.', NULL, 'positive', TRUE, 12),
('C3',  'pretest', 'C', 'likert_5', 'La retroalimentación inmediata (aciertos/errores) mejora mi experiencia de aprendizaje.', NULL, 'positive', TRUE, 13),
('C4',  'pretest', 'C', 'likert_5', 'Me resulta fácil adaptarme al uso de nuevas herramientas digitales para aprender.', NULL, 'positive', TRUE, 14),
('C5',  'pretest', 'C', 'likert_5', 'Considero que podría usar una herramienta interactiva sin ayuda constante de un docente.', NULL, 'positive', TRUE, 15),
('C6',  'pretest', 'C', 'likert_5', 'La navegación simple y clara en una plataforma de aprendizaje influye en que yo use una herramienta de aprendizaje.', NULL, 'positive', TRUE, 16),
('C7',  'pretest', 'C', 'likert_5', 'Prefiero actividades donde pueda practicar y recibir corrección inmediata.', NULL, 'positive', TRUE, 17),
('C8',  'pretest', 'C', 'likert_5', 'Las dinámicas tipo juego (puntos, niveles, logros) aumentan mi disposición a aprender.', NULL, 'positive', TRUE, 18),
('C9',  'pretest', 'C', 'likert_5', 'Interactuar (responder, seleccionar, completar) me ayuda más que solo leer o ver contenido.', NULL, 'positive', TRUE, 19),
('C10', 'pretest', 'C', 'likert_5', 'Tengo acceso suficiente (dispositivo e internet) para usar herramientas digitales de aprendizaje.', NULL, 'positive', TRUE, 20),
('C11', 'pretest', 'C', 'likert_5', 'Dispongo de tiempo semanal para usar una herramienta digital de aprendizaje.', NULL, 'positive', TRUE, 21),
('C12', 'pretest', 'C', 'likert_5', 'Usaría más una herramienta de aprendizaje si está disponible desde el teléfono.', NULL, 'positive', TRUE, 22),

-- ─── PRETEST, Sección D (interés náhuat, Likert) ───
('D1', 'pretest', 'D', 'likert_5', 'Me interesa aprender nociones básicas de náhuat.', NULL, 'positive', TRUE, 23),
('D2', 'pretest', 'D', 'likert_5', 'Si existiera un recurso digital interactivo para aprender náhuat, lo usaría.', NULL, 'positive', TRUE, 24),
('D3', 'pretest', 'D', 'likert_5', 'Estaría dispuesto/a a dedicar tiempo semanal para aprender náhuat si el recurso es práctico y atractivo.', NULL, 'positive', TRUE, 25),
('D4', 'pretest', 'D', 'likert_5', 'Considero valioso que en educación superior se promueva el aprendizaje del náhuat.', NULL, 'positive', TRUE, 26),
('D5', 'pretest', 'D', 'likert_5', 'Me gustaría participar en actividades (curso, taller o app) relacionadas con el aprendizaje del náhuat.', NULL, 'positive', TRUE, 27),
('D6', 'pretest', 'D', 'likert_5', 'Aprender náhuat me parecería útil o significativo a nivel cultural/personal.', NULL, 'positive', TRUE, 28),

-- ─── PRETEST, Sección E (preferencias y barreras) ───
('E1', 'pretest', 'E', 'single_choice', '¿Qué tipo de herramienta te motivaría más para aprender (cualquier tema o idioma)?',
  '[{"value":"app_movil","label":"Aplicación móvil tipo lecciones cortas"},{"value":"web","label":"Plataforma web interactiva"},{"value":"video","label":"Videos interactivos con preguntas"},{"value":"juegos","label":"Juegos educativos (gamificación fuerte tipo Duolingo)"},{"value":"quizzes","label":"Quizzes / preguntas rápidas (tipo Kahoot/Quizizz)"},{"value":"otro","label":"Otro","allow_custom":true}]'::jsonb,
  NULL, TRUE, 29),
('E2', 'pretest', 'E', 'single_choice', 'Principal barrera para aprender náhuat (si te interesara).',
  '[{"value":"no_interes","label":"No me interesa aprender idiomas"},{"value":"no_utilidad","label":"No le veo utilidad práctica"},{"value":"tiempo","label":"Falta de tiempo"},{"value":"recursos","label":"Falta de recursos adecuados"},{"value":"docente","label":"Falta de acompañamiento docente"},{"value":"dificultad","label":"Dificultad percibida (me parece difícil)"},{"value":"otra","label":"Otra","allow_custom":true}]'::jsonb,
  NULL, TRUE, 30),
('E3', 'pretest', 'E', 'single_choice', '¿Cuánto tiempo estarías dispuesto/a a dedicar por semana para aprender náhuat si el recurso fuera atractivo?',
  '[{"value":"0","label":"0 minutos"},{"value":"10-20","label":"10–20 minutos"},{"value":"21-40","label":"21–40 minutos"},{"value":"41-60","label":"41–60 minutos"},{"value":"60+","label":"Más de 60 minutos"}]'::jsonb,
  NULL, TRUE, 31),

-- ─── PRETEST, Sección G (valor cultural e identitario, Likert) ───
('G1', 'pretest', 'G', 'likert_5', 'Me identifico como descendiente o portador de la herencia pipil/náhuat.', NULL, 'positive', TRUE, 32),
('G2', 'pretest', 'G', 'likert_5', 'Me siento orgulloso(a) de las raíces indígenas de mi país o comunidad.', NULL, 'positive', TRUE, 33),
('G3', 'pretest', 'G', 'likert_5', 'Siento una conexión emocional con la historia y la cultura del pueblo náhuat.', NULL, 'positive', TRUE, 34),
('G4', 'pretest', 'G', 'likert_5', 'Considero que aprender el náhuat contribuye a preservar nuestra identidad cultural.', NULL, 'positive', TRUE, 35),

-- ─── POSTEST, Sección B (SUS, 10 items, polaridad alternada) ───
('sus_b1',  'posttest', 'B', 'likert_5', 'Creo que me gustaría utilizar esta aplicación con frecuencia.', NULL, 'positive', TRUE, 37),
('sus_b2',  'posttest', 'B', 'likert_5', 'Encontré la aplicación innecesariamente compleja.', NULL, 'negative', TRUE, 38),
('sus_b3',  'posttest', 'B', 'likert_5', 'Pensé que la aplicación era fácil de usar.', NULL, 'positive', TRUE, 39),
('sus_b4',  'posttest', 'B', 'likert_5', 'Creo que necesitaría el apoyo de una persona técnica para poder usar esta aplicación.', NULL, 'negative', TRUE, 40),
('sus_b5',  'posttest', 'B', 'likert_5', 'Encontré que las diversas funciones de esta aplicación estaban bien integradas.', NULL, 'positive', TRUE, 41),
('sus_b6',  'posttest', 'B', 'likert_5', 'Pensé que había demasiada inconsistencia en esta aplicación.', NULL, 'negative', TRUE, 42),
('sus_b7',  'posttest', 'B', 'likert_5', 'Imagino que la mayoría de las personas aprenderían a usar esta aplicación muy rápidamente.', NULL, 'positive', TRUE, 43),
('sus_b8',  'posttest', 'B', 'likert_5', 'Encontré la aplicación muy engorrosa (difícil) de usar.', NULL, 'negative', TRUE, 44),
('sus_b9',  'posttest', 'B', 'likert_5', 'Me sentí muy seguro/a usando la aplicación.', NULL, 'positive', TRUE, 45),
('sus_b10', 'posttest', 'B', 'likert_5', 'Necesitaba aprender muchas cosas antes de poder empezar a usar la aplicación.', NULL, 'negative', TRUE, 46),

-- ─── POSTEST, Sección C (impacto, simetría con pretest) ───
('post_c1', 'posttest', 'C', 'likert_5', 'Después de usar NAWAT, mi interés por aprender nociones básicas de náhuat ha aumentado. (Compara con D1 del pretest)', NULL, 'positive', TRUE, 47),
('post_c2', 'posttest', 'C', 'likert_5', 'Las dinámicas de juego (gamificación) en la aplicación me motivaron a seguir intentando aprender las palabras. (Compara con C8 del pretest)', NULL, 'positive', TRUE, 48),
('post_c3', 'posttest', 'C', 'likert_5', 'Considero que el tiempo pasó rápido mientras usaba la aplicación (experimenté inmersión/flujo).', NULL, 'positive', TRUE, 49),
('post_c4', 'posttest', 'C', 'likert_5', 'Me gustaría tener acceso continuo a esta aplicación para seguir aprendiendo náhuat por mi cuenta. (Compara con D2 y D5 del pretest)', NULL, 'positive', TRUE, 50),
('post_c5', 'posttest', 'C', 'single_choice', 'Tras conocer la herramienta, ¿cuánto tiempo estarías dispuesto/a a dedicar por semana para seguir aprendiendo náhuat? (Compara con E3 del pretest para medir cambio de actitud real)',
  '[{"value":"0","label":"0 minutos"},{"value":"10-20","label":"10–20 minutos"},{"value":"21-40","label":"21–40 minutos"},{"value":"41-60","label":"41–60 minutos"},{"value":"60+","label":"Más de 60 minutos"}]'::jsonb,
  NULL, TRUE, 51),

-- ─── POSTEST, Sección D (retroalimentación abierta, opcional) ───
('post_d1', 'posttest', 'D', 'long_text', '¿Qué fue lo que más te gustó de la aplicación NAWAT?', NULL, NULL, FALSE, 52),
('post_d2', 'posttest', 'D', 'long_text', '¿Qué aspecto mejorarías o qué dificultad encontraste?', NULL, NULL, FALSE, 53)

ON CONFLICT (code) DO UPDATE SET
  phase         = EXCLUDED.phase,
  section       = EXCLUDED.section,
  item_type     = EXCLUDED.item_type,
  question_text = EXCLUDED.question_text,
  options       = EXCLUDED.options,
  polarity      = EXCLUDED.polarity,
  is_required   = EXCLUDED.is_required,
  order_index   = EXCLUDED.order_index;

-- ═══════════════════════════════════════════════════════════════════════════
-- VISTAS DE EXPORTACIÓN
-- ═══════════════════════════════════════════════════════════════════════════

-- ── v_exercise_log: 1 fila por respuesta a ejercicio, con metadata ──────────
CREATE OR REPLACE VIEW v_exercise_log AS
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
FROM exercise_responses er
LEFT JOIN lesson_attempts la ON la.id = er.lesson_attempt_id;

-- ── v_sus_scores: puntaje SUS 0–100 por participante ───────────────────────
-- Fórmula estándar: positivos → (valor−1); negativos → (5−valor); suma × 2.5
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
WHERE r.phase = 'posttest' AND i.code LIKE 'sus_%'
GROUP BY r.participant_id;

-- ── v_dataset_wide: 1 fila por participante, listo para SPSS/R ─────────────
-- Se elimina antes de recrearla porque PostgreSQL no permite cambiar el orden
-- o insertar columnas intermedias con CREATE OR REPLACE VIEW.
DROP VIEW IF EXISTS v_dataset_wide;
CREATE VIEW v_dataset_wide AS
WITH q AS (
  SELECT
    participant_id,
    -- Pretest A
    MAX(CASE WHEN phase='pretest' AND item_code='A1' THEN COALESCE(value_other, value_text) END) AS pre_a1_institucion,
    MAX(CASE WHEN phase='pretest' AND item_code='A2' THEN value_text END) AS pre_a2_edad,
    MAX(CASE WHEN phase='pretest' AND item_code='A3' THEN value_text END) AS pre_a3_sexo,
    MAX(CASE WHEN phase='pretest' AND item_code='A4' THEN COALESCE(value_other, value_text) END) AS pre_a4_ciclo,
    MAX(CASE WHEN phase='pretest' AND item_code='A5' THEN value_text END) AS pre_a5_carrera,
    -- Pretest B
    MAX(CASE WHEN phase='pretest' AND item_code='B1' THEN value_text END) AS pre_b1_habia_escuchado,
    MAX(CASE WHEN phase='pretest' AND item_code='B2' THEN value_text END) AS pre_b2_nivel_previo,
    MAX(CASE WHEN phase='pretest' AND item_code='B3' THEN value_numeric END) AS pre_b3_interes_idiomas,
    MAX(CASE WHEN phase='pretest' AND item_code='B4' THEN value_text END) AS pre_b4_usa_apps,
    MAX(CASE WHEN phase='pretest' AND item_code='B5' THEN value_text END) AS pre_b5_frecuencia,
    -- Pretest C (percepción TIC)
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
    -- Pretest D (interés náhuat)
    MAX(CASE WHEN phase='pretest' AND item_code='D1' THEN value_numeric END) AS pre_d1,
    MAX(CASE WHEN phase='pretest' AND item_code='D2' THEN value_numeric END) AS pre_d2,
    MAX(CASE WHEN phase='pretest' AND item_code='D3' THEN value_numeric END) AS pre_d3,
    MAX(CASE WHEN phase='pretest' AND item_code='D4' THEN value_numeric END) AS pre_d4,
    MAX(CASE WHEN phase='pretest' AND item_code='D5' THEN value_numeric END) AS pre_d5,
    MAX(CASE WHEN phase='pretest' AND item_code='D6' THEN value_numeric END) AS pre_d6,
    -- Pretest E (preferencias/barreras)
    MAX(CASE WHEN phase='pretest' AND item_code='E1' THEN COALESCE(value_other, value_text) END) AS pre_e1_herramienta_preferida,
    MAX(CASE WHEN phase='pretest' AND item_code='E2' THEN COALESCE(value_other, value_text) END) AS pre_e2_barrera,
    MAX(CASE WHEN phase='pretest' AND item_code='E3' THEN value_text END) AS pre_e3_tiempo_dispuesto,
    -- Pretest G (valor cultural e identitario)
    MAX(CASE WHEN phase='pretest' AND item_code='G1' THEN value_numeric END) AS pre_g1_herencia_pipil_nahuat,
    MAX(CASE WHEN phase='pretest' AND item_code='G2' THEN value_numeric END) AS pre_g2_orgullo_raices,
    MAX(CASE WHEN phase='pretest' AND item_code='G3' THEN value_numeric END) AS pre_g3_conexion_cultural,
    MAX(CASE WHEN phase='pretest' AND item_code='G4' THEN value_numeric END) AS pre_g4_preservar_identidad,
    -- Postest SUS (crudos)
    MAX(CASE WHEN phase='posttest' AND item_code='sus_b1'  THEN value_numeric END) AS post_sus_b1,
    MAX(CASE WHEN phase='posttest' AND item_code='sus_b2'  THEN value_numeric END) AS post_sus_b2,
    MAX(CASE WHEN phase='posttest' AND item_code='sus_b3'  THEN value_numeric END) AS post_sus_b3,
    MAX(CASE WHEN phase='posttest' AND item_code='sus_b4'  THEN value_numeric END) AS post_sus_b4,
    MAX(CASE WHEN phase='posttest' AND item_code='sus_b5'  THEN value_numeric END) AS post_sus_b5,
    MAX(CASE WHEN phase='posttest' AND item_code='sus_b6'  THEN value_numeric END) AS post_sus_b6,
    MAX(CASE WHEN phase='posttest' AND item_code='sus_b7'  THEN value_numeric END) AS post_sus_b7,
    MAX(CASE WHEN phase='posttest' AND item_code='sus_b8'  THEN value_numeric END) AS post_sus_b8,
    MAX(CASE WHEN phase='posttest' AND item_code='sus_b9'  THEN value_numeric END) AS post_sus_b9,
    MAX(CASE WHEN phase='posttest' AND item_code='sus_b10' THEN value_numeric END) AS post_sus_b10,
    -- Postest impacto
    MAX(CASE WHEN phase='posttest' AND item_code='post_c1' THEN value_numeric END) AS post_c1_interes,
    MAX(CASE WHEN phase='posttest' AND item_code='post_c2' THEN value_numeric END) AS post_c2_gamificacion,
    MAX(CASE WHEN phase='posttest' AND item_code='post_c3' THEN value_numeric END) AS post_c3_flujo,
    MAX(CASE WHEN phase='posttest' AND item_code='post_c4' THEN value_numeric END) AS post_c4_acceso_continuo,
    MAX(CASE WHEN phase='posttest' AND item_code='post_c5' THEN value_text END) AS post_c5_tiempo_dispuesto,
    MAX(CASE WHEN phase='posttest' AND item_code='post_d1' THEN value_text END) AS post_d1_gustado,
    MAX(CASE WHEN phase='posttest' AND item_code='post_d2' THEN value_text END) AS post_d2_mejorar
  FROM questionnaire_responses
  GROUP BY participant_id
),
sess AS (
  SELECT
    participant_id,
    COUNT(*)                                AS tel_sessions_count,
    COALESCE(SUM(duration_seconds), 0)      AS tel_total_seconds
  FROM sessions
  GROUP BY participant_id
),
la AS (
  SELECT
    participant_id,
    COUNT(*)                                            AS tel_lessons_started,
    COUNT(*) FILTER (WHERE completed_at IS NOT NULL)    AS tel_lessons_completed,
    COUNT(*) FILTER (WHERE passed = TRUE)               AS tel_lessons_passed,
    COALESCE(SUM(xp_earned), 0)                         AS tel_total_xp,
    COALESCE(MAX(stars), 0)                             AS tel_max_stars,
    COALESCE(ROUND(AVG(score)::numeric, 3), 0)          AS tel_avg_score
  FROM lesson_attempts
  GROUP BY participant_id
),
er AS (
  SELECT
    participant_id,
    COUNT(*)                                                                    AS tel_exercises_total,
    COUNT(*) FILTER (WHERE is_correct = TRUE)                                   AS tel_exercises_correct,
    ROUND(AVG(CASE WHEN is_correct THEN 1.0 ELSE 0.0 END)::numeric, 3)           AS tel_accuracy,
    ROUND(AVG(response_time_sec)::numeric, 2)                                   AS tel_avg_response_time_sec
  FROM exercise_responses
  GROUP BY participant_id
)
SELECT
  p.id AS participant_id,
  p.first_name,
  p.last_name,
  p.created_at                    AS participant_created_at,
  c.accepted_at                   AS consent_accepted_at,
  c.consent_version,
  it.pretest_completed_at,
  it.posttest_unlocked_at,
  it.posttest_completed_at,
  -- Duración de la ventana de uso (pretest_completed → posttest_unlocked)
  EXTRACT(EPOCH FROM (it.posttest_unlocked_at - it.pretest_completed_at))::int AS intervention_seconds,
  -- SUS calculado
  sus.sus_score,
  -- Respuestas cuestionarios (pivotadas)
  q.pre_a1_institucion, q.pre_a2_edad, q.pre_a3_sexo, q.pre_a4_ciclo, q.pre_a5_carrera,
  q.pre_b1_habia_escuchado, q.pre_b2_nivel_previo, q.pre_b3_interes_idiomas, q.pre_b4_usa_apps, q.pre_b5_frecuencia,
  q.pre_c1, q.pre_c2, q.pre_c3, q.pre_c4, q.pre_c5, q.pre_c6, q.pre_c7, q.pre_c8, q.pre_c9, q.pre_c10, q.pre_c11, q.pre_c12,
  q.pre_d1, q.pre_d2, q.pre_d3, q.pre_d4, q.pre_d5, q.pre_d6,
  q.pre_e1_herramienta_preferida, q.pre_e2_barrera, q.pre_e3_tiempo_dispuesto,
  q.pre_g1_herencia_pipil_nahuat, q.pre_g2_orgullo_raices, q.pre_g3_conexion_cultural, q.pre_g4_preservar_identidad,
  q.post_sus_b1, q.post_sus_b2, q.post_sus_b3, q.post_sus_b4, q.post_sus_b5,
  q.post_sus_b6, q.post_sus_b7, q.post_sus_b8, q.post_sus_b9, q.post_sus_b10,
  q.post_c1_interes, q.post_c2_gamificacion, q.post_c3_flujo, q.post_c4_acceso_continuo,
  q.post_c5_tiempo_dispuesto, q.post_d1_gustado, q.post_d2_mejorar,
  -- Telemetría de uso
  COALESCE(sess.tel_sessions_count, 0)         AS tel_sessions_count,
  COALESCE(sess.tel_total_seconds, 0)          AS tel_total_seconds,
  COALESCE(la.tel_lessons_started, 0)          AS tel_lessons_started,
  COALESCE(la.tel_lessons_completed, 0)        AS tel_lessons_completed,
  COALESCE(la.tel_lessons_passed, 0)           AS tel_lessons_passed,
  COALESCE(la.tel_avg_score, 0)                AS tel_avg_score,
  COALESCE(la.tel_total_xp, 0)                 AS tel_total_xp,
  COALESCE(la.tel_max_stars, 0)                AS tel_max_stars,
  COALESCE(er.tel_exercises_total, 0)          AS tel_exercises_total,
  COALESCE(er.tel_exercises_correct, 0)        AS tel_exercises_correct,
  COALESCE(er.tel_accuracy, 0)                 AS tel_accuracy,
  COALESCE(er.tel_avg_response_time_sec, 0)    AS tel_avg_response_time_sec
FROM participants p
LEFT JOIN consent_records       c   ON c.participant_id   = p.id
LEFT JOIN intervention_timeline it  ON it.participant_id  = p.id
LEFT JOIN q                         ON q.participant_id   = p.id
LEFT JOIN v_sus_scores          sus ON sus.participant_id = p.id
LEFT JOIN sess                      ON sess.participant_id = p.id
LEFT JOIN la                        ON la.participant_id  = p.id
LEFT JOIN er                        ON er.participant_id  = p.id;
