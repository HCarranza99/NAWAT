-- =============================================================================
-- 20260604_harden_rls_policies.sql
--
-- Endurece las políticas RLS de las tablas que recolectan datos del estudio.
--
-- PROBLEMA QUE CORRIGE:
-- La migración 001_questionnaires.sql definió políticas `FOR ALL TO anon
-- USING (true) WITH CHECK (true)` sobre consent_records, questionnaire_responses
-- e intervention_timeline. Como la clave anónima (VITE_SUPABASE_ANON_KEY) viaja
-- embebida en el bundle JS público, `FOR ALL` permitía que CUALQUIERA pudiera:
--   • SELECT  → leer todas las respuestas del estudio (fuga de confidencialidad)
--   • DELETE  → borrar todo el dataset de investigación
--   • UPDATE  → sobrescribir respuestas
--
-- SOLUCIÓN:
-- Sustituir `FOR ALL` por políticas específicas que solo habilitan las
-- operaciones que la app realmente necesita:
--   • consent_records         → solo INSERT (analytics.saveConsent)
--   • questionnaire_responses → INSERT + UPDATE (upsert con onConflict)
--   • intervention_timeline   → INSERT + UPDATE (upsert con onConflict)
-- Sin SELECT ni DELETE: no se puede leer ni destruir el dataset desde el cliente.
--
-- Esto deja estas tablas alineadas con el patrón ya seguro de participants /
-- sessions / lesson_attempts / exercise_responses (ver 20260517).
--
-- La exportación de datos para análisis debe hacerse con la service_role key
-- (server-side), nunca con la anon key.
--
-- Idempotente: usa DROP POLICY IF EXISTS antes de crear.
-- =============================================================================

BEGIN;

-- RLS ya está habilitado por 001, pero lo reafirmamos por seguridad.
ALTER TABLE consent_records         ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE intervention_timeline   ENABLE ROW LEVEL SECURITY;

-- ── consent_records ──────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_all_consent"    ON consent_records;
DROP POLICY IF EXISTS "anon_insert_consent" ON consent_records;
CREATE POLICY "anon_insert_consent" ON consent_records
  FOR INSERT TO anon WITH CHECK (true);

-- ── questionnaire_responses ──────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_all_responses"    ON questionnaire_responses;
DROP POLICY IF EXISTS "anon_insert_responses" ON questionnaire_responses;
DROP POLICY IF EXISTS "anon_update_responses" ON questionnaire_responses;
CREATE POLICY "anon_insert_responses" ON questionnaire_responses
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_responses" ON questionnaire_responses
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

-- ── intervention_timeline ────────────────────────────────────────────────────
DROP POLICY IF EXISTS "anon_all_timeline"    ON intervention_timeline;
DROP POLICY IF EXISTS "anon_insert_timeline" ON intervention_timeline;
DROP POLICY IF EXISTS "anon_update_timeline" ON intervention_timeline;
CREATE POLICY "anon_insert_timeline" ON intervention_timeline
  FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "anon_update_timeline" ON intervention_timeline
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

COMMIT;
