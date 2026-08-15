-- ════════════════════════════════════════════════════════════════
--  Encuesta de entrada: cuatro preguntas al terminar la primera lección.
--
--  QUÉ RESPONDE QUE LA TELEMETRÍA NO PUEDE
--  Cuántas lecciones hace alguien se mide solo; por qué llegó, si el náhuat
--  se hablaba en su casa o si ya lo entendía, no. Esa diferencia —hablante de
--  herencia frente a aprendiz desde cero— son dos públicos con necesidades
--  distintas que hoy se ven idénticos en los datos.
--
--  POR QUÉ REUTILIZA EL ESQUEMA DEL ESTUDIO
--  questionnaire_items + questionnaire_responses ya son long-format, ya tienen
--  RLS, tiempos de respuesta y deduplicación por (participante, fase, ítem).
--  Basta con admitir una fase más. Una tabla nueva habría duplicado todo eso.
--
--  Migración idempotente: segura de re-ejecutar.
-- ════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. Admitir la fase 'entrada' ────────────────────────────────
-- Los CHECK existentes solo permiten pretest/posttest. Se reemplazan en vez de
-- agregar otro, porque dos CHECK sobre la misma columna se aplican en AND.
ALTER TABLE public.questionnaire_items
  DROP CONSTRAINT IF EXISTS questionnaire_items_phase_check;
ALTER TABLE public.questionnaire_items
  ADD CONSTRAINT questionnaire_items_phase_check
  CHECK (phase IN ('pretest', 'posttest', 'entrada'));

ALTER TABLE public.questionnaire_responses
  DROP CONSTRAINT IF EXISTS questionnaire_responses_phase_check;
ALTER TABLE public.questionnaire_responses
  ADD CONSTRAINT questionnaire_responses_phase_check
  CHECK (phase IN ('pretest', 'posttest', 'entrada'));

-- ── 2. Codebook ─────────────────────────────────────────────────
-- Los códigos y valores deben coincidir con ENTRY_SURVEY_ITEMS en
-- src/data/questionnaires.js. ON CONFLICT actualiza el texto sin tocar las
-- respuestas ya recolectadas.
INSERT INTO public.questionnaire_items
  (code, phase, section, item_type, question_text, options, polarity, is_required, order_index)
VALUES
('ent_1', 'entrada', 'A', 'single_choice', '¿Cuánto náhuat sabías antes de abrir esta app?',
  '[{"value":"nada","label":"Nada"},{"value":"palabras","label":"Algunas palabras sueltas"},{"value":"frases","label":"Frases sencillas"},{"value":"entiendo","label":"Lo entiendo, pero no lo hablo"},{"value":"hablo","label":"Lo hablo"}]'::jsonb,
  NULL, FALSE, 1),
('ent_2', 'entrada', 'A', 'single_choice', '¿Alguien de tu familia habla o hablaba náhuat?',
  '[{"value":"si_vive","label":"Sí, y todavía lo habla"},{"value":"si_antes","label":"Sí, pero ya no o falleció"},{"value":"no","label":"No"},{"value":"no_se","label":"No lo sé"}]'::jsonb,
  NULL, FALSE, 2),
('ent_3', 'entrada', 'B', 'single_choice', '¿Por qué quieres aprender náhuat?',
  '[{"value":"raices","label":"Por mis raíces y mi identidad"},{"value":"curiosidad","label":"Por curiosidad"},{"value":"estudio_trabajo","label":"Por estudio o trabajo"},{"value":"ensenar","label":"Para enseñárselo a alguien"},{"value":"otra","label":"Otra razón","allow_custom":true}]'::jsonb,
  NULL, FALSE, 3),
('ent_4', 'entrada', 'B', 'single_choice', '¿Cómo llegaste a esta app?',
  '[{"value":"redes","label":"Por redes sociales"},{"value":"recomendacion","label":"Alguien me la recomendó"},{"value":"buscando","label":"Buscando en internet"},{"value":"clase","label":"En una clase o institución"},{"value":"otra","label":"De otra forma","allow_custom":true}]'::jsonb,
  NULL, FALSE, 4)
ON CONFLICT (code) DO UPDATE SET
  phase         = EXCLUDED.phase,
  section       = EXCLUDED.section,
  item_type     = EXCLUDED.item_type,
  question_text = EXCLUDED.question_text,
  options       = EXCLUDED.options,
  is_required   = EXCLUDED.is_required,
  order_index   = EXCLUDED.order_index;

-- ── 3. Vista de export: una fila por participante ───────────────
-- Wide-format, como las vistas del estudio, para leerla directo en R.
CREATE OR REPLACE VIEW public.v_encuesta_entrada AS
SELECT
  r.participant_id,
  MAX(r.value_text)    FILTER (WHERE r.item_code = 'ent_1') AS nivel_previo,
  MAX(r.value_text)    FILTER (WHERE r.item_code = 'ent_2') AS nahuat_en_familia,
  MAX(r.value_text)    FILTER (WHERE r.item_code = 'ent_3') AS motivo,
  MAX(r.value_other)   FILTER (WHERE r.item_code = 'ent_3') AS motivo_otro,
  MAX(r.value_text)    FILTER (WHERE r.item_code = 'ent_4') AS como_llego,
  MAX(r.value_other)   FILTER (WHERE r.item_code = 'ent_4') AS como_llego_otro,
  COUNT(*)                                                  AS preguntas_respondidas,
  MIN(r.answered_at)                                        AS respondida_en
FROM public.questionnaire_responses r
WHERE r.phase = 'entrada'
GROUP BY r.participant_id;

COMMENT ON VIEW public.v_encuesta_entrada IS
  'Una fila por participante con la encuesta de entrada. Exportar con la service_role key, nunca con la anon.';

-- Misma regla que la vista del registro: nunca legible desde el cliente. Las
-- respuestas son de personas identificables por participant_id.
ALTER VIEW public.v_encuesta_entrada SET (security_invoker = on);
REVOKE ALL ON public.v_encuesta_entrada FROM anon, authenticated;

COMMIT;

-- ════════════════════════════════════════════════════════════════
--  VERIFICACIÓN
-- ════════════════════════════════════════════════════════════════

-- 1. Los 4 ítems quedaron en el codebook.
-- SELECT code, question_text, is_required FROM questionnaire_items
-- WHERE phase = 'entrada' ORDER BY order_index;

-- 2. La pregunta que motivó la encuesta: ¿quién llega con el náhuat en casa?
-- SELECT nahuat_en_familia, nivel_previo, COUNT(*) FROM v_encuesta_entrada
-- GROUP BY 1, 2 ORDER BY 3 DESC;

-- 3. De dónde viene la gente (sirve para saber qué difusión funciona).
-- SELECT como_llego, COUNT(*) FROM v_encuesta_entrada GROUP BY 1 ORDER BY 2 DESC;

-- 4. Cruce con el registro: ¿los de la zona pipil traen el idioma en familia?
-- SELECT p.zona_pipil, e.nahuat_en_familia, COUNT(*)
-- FROM v_participantes_registro p
-- JOIN v_encuesta_entrada e ON e.participant_id = p.participant_id
-- GROUP BY 1, 2 ORDER BY 1 DESC, 3 DESC;
