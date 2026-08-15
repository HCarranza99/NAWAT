-- ════════════════════════════════════════════════════════════════
--  Registro tardío: los 463 participantes que ya existen también deben
--  poder dar sus datos, y cualquiera debe poder corregirlos.
--
--  POR QUÉ UNA TABLA APARTE Y NO UN UPDATE
--  `participants` concede a la app solo INSERT, nunca UPDATE, porque la
--  clave que autoriza esas escrituras viaja pública en el bundle: con
--  permiso de UPDATE, cualquiera podría reescribir o vaciar filas ajenas.
--  Conceder ese permiso para esta función sería abrir esa puerta.
--
--  En vez de eso, cada envío es una fila NUEVA aquí. La tabla es de solo
--  agregar (INSERT y nada más), así que nada se puede pisar ni borrar, y
--  como efecto secundario queda el historial: si alguien corrige su edad,
--  se conservan las dos versiones con su fecha. Para investigación eso vale
--  más que sobrescribir.
--
--  La vista v_participantes_registro resuelve el valor VIGENTE: gana el
--  envío más reciente, y si no hay ninguno, lo que traiga `participants`.
--
--  Migración idempotente: segura de re-ejecutar.
-- ════════════════════════════════════════════════════════════════

BEGIN;

CREATE TABLE IF NOT EXISTS public.participant_registration_updates (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id uuid NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
  first_name     text,
  age            int,
  residence      text,
  submitted_at   timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
  ALTER TABLE public.participant_registration_updates
    ADD CONSTRAINT participant_registration_updates_age_check
    CHECK (age IS NULL OR age BETWEEN 5 AND 99);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- El índice sirve al DISTINCT ON de la vista: el último envío por participante.
CREATE INDEX IF NOT EXISTS idx_registration_updates_participant
  ON public.participant_registration_updates (participant_id, submitted_at DESC);

COMMENT ON TABLE public.participant_registration_updates IS
  'Solo agregar: cada fila es un envío del registro (tardío o corrección). El valor vigente es el submitted_at más reciente — ver v_participantes_registro.';

-- ── RLS: solo agregar, igual que consent_records ────────────────
-- Sin SELECT no se puede leer lo de nadie más; sin UPDATE/DELETE no se puede
-- destruir lo ya enviado. Ambos roles porque la app escribe como `anon` sin
-- sesión y como `authenticated` con ella (ver 20260815_rls_authenticated_parity).
ALTER TABLE public.participant_registration_updates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "insert_registration_updates" ON public.participant_registration_updates;
CREATE POLICY "insert_registration_updates"
  ON public.participant_registration_updates
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- ── Vista de export: ahora resuelve el valor vigente ─────────────
CREATE OR REPLACE VIEW public.v_participantes_registro AS
WITH ultimo_envio AS (
  SELECT DISTINCT ON (participant_id)
         participant_id, first_name, age, residence, submitted_at
  FROM public.participant_registration_updates
  ORDER BY participant_id, submitted_at DESC
)
SELECT
  p.id                                             AS participant_id,
  p.cohort,
  p.created_at,
  COALESCE(u.first_name, p.first_name)             AS nombre,
  COALESCE(u.age, p.age)                           AS edad,
  CASE
    WHEN COALESCE(u.age, p.age) IS NULL  THEN 'sin_dato'
    WHEN COALESCE(u.age, p.age) < 13     THEN 'menor_13'
    WHEN COALESCE(u.age, p.age) <= 17    THEN '13_17'
    WHEN COALESCE(u.age, p.age) <= 24    THEN '18_24'
    WHEN COALESCE(u.age, p.age) <= 34    THEN '25_34'
    WHEN COALESCE(u.age, p.age) <= 49    THEN '35_49'
    ELSE                                      '50_mas'
  END                                              AS grupo_edad,
  COALESCE(u.residence, p.residence, 'sin_dato')   AS residencia,
  (COALESCE(u.first_name, p.first_name) IS NULL
   AND COALESCE(u.age, p.age) IS NULL
   AND COALESCE(u.residence, p.residence) IS NULL) AS registro_omitido,
  COALESCE(s.sesiones, 0)                          AS sesiones,
  COALESCE(s.segundos_totales, 0)                  AS segundos_totales,
  COALESCE(l.lecciones_iniciadas, 0)               AS lecciones_iniciadas,
  COALESCE(l.lecciones_aprobadas, 0)               AS lecciones_aprobadas,
  COALESCE(e.ejercicios, 0)                        AS ejercicios,
  COALESCE(e.aciertos, 0)                          AS aciertos,
  s.ultima_sesion,
  -- Columnas nuevas al final: CREATE OR REPLACE VIEW no admite reordenar.
  (u.participant_id IS NOT NULL)                   AS registro_tardio,
  u.submitted_at                                   AS registro_actualizado_en
FROM public.participants p
LEFT JOIN ultimo_envio u ON u.participant_id = p.id
LEFT JOIN (
  SELECT participant_id,
         COUNT(*)                            AS sesiones,
         SUM(COALESCE(duration_seconds, 0))  AS segundos_totales,
         MAX(started_at)                     AS ultima_sesion
  FROM public.sessions GROUP BY participant_id
) s ON s.participant_id = p.id
LEFT JOIN (
  SELECT participant_id,
         COUNT(*)                       AS lecciones_iniciadas,
         COUNT(*) FILTER (WHERE passed) AS lecciones_aprobadas
  FROM public.lesson_attempts GROUP BY participant_id
) l ON l.participant_id = p.id
LEFT JOIN (
  SELECT participant_id,
         COUNT(*)                           AS ejercicios,
         COUNT(*) FILTER (WHERE is_correct) AS aciertos
  FROM public.exercise_responses GROUP BY participant_id
) e ON e.participant_id = p.id;

-- Se reafirma tras el REPLACE: la vista nunca debe quedar legible desde el
-- cliente (ver la nota de seguridad en 20260815_participant_registration.sql).
ALTER VIEW public.v_participantes_registro SET (security_invoker = on);
REVOKE ALL ON public.v_participantes_registro FROM anon, authenticated;

COMMIT;

-- Verificación:
-- SELECT COUNT(*) FILTER (WHERE registro_tardio) AS tardios,
--        COUNT(*) FILTER (WHERE edad IS NOT NULL) AS con_edad
-- FROM v_participantes_registro;
