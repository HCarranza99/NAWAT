-- ════════════════════════════════════════════════════════════════
--  El lugar de residencia baja a distrito, y la diáspora dice su país.
--
--  POR QUÉ
--  El departamento solo no distingue lo que importa para el náhuat:
--  «Sonsonate» junta a alguien de Nahuizalco o Santo Domingo de Guzmán —donde
--  el idioma todavía se oye— con alguien de la cabecera que nunca lo escuchó
--  en casa. Y «fuera de El Salvador» dejaba a un salvadoreño en Los Ángeles
--  idéntico a uno en Madrid.
--
--  QUÉ SE GUARDA
--    district → código estable `departamento-nombre_sin_acentos`, p. ej.
--               'sonsonate-nahuizalco'. Son los 262 distritos que hasta 2023
--               fueron municipios; la reestructuración municipal los reagrupó
--               en 44 municipios nuevos, pero la gente sigue diciendo el
--               nombre de siempre. Catálogo en src/data/registro.js.
--    country  → ISO 3166-1 alfa-2 ('US', 'ES'), solo cuando vive fuera.
--
--  Los dos son excluyentes: quien vive en el país tiene distrito y no país;
--  quien vive fuera, al revés.
--
--  Sin CHECK contra una lista cerrada, a propósito: agregar o corregir una
--  entrada del catálogo no debe exigir una migración. La validación vive en el
--  cliente y el bloque de verificación del final detecta lo inesperado.
--
--  Migración idempotente: segura de re-ejecutar.
-- ════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. Columnas ─────────────────────────────────────────────────
ALTER TABLE public.participants
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS country  text;

ALTER TABLE public.participant_registration_updates
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS country  text;

-- La identidad viaja con la cuenta para poder reconstruirla al iniciar sesión
-- en otro dispositivo (ver 20260815_user_profile_registration.sql).
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS country  text;

COMMENT ON COLUMN public.participants.district IS
  'Distrito de residencia, codigo `departamento-nombre` (p. ej. sonsonate-nahuizalco). NULL si vive fuera del pais o si se registro antes de que se pidiera.';
COMMENT ON COLUMN public.participants.country IS
  'Pais de residencia en ISO 3166-1 alfa-2, solo cuando residence = fuera_de_el_salvador.';

CREATE INDEX IF NOT EXISTS idx_participants_district
  ON public.participants (district);

-- ── 2. La vista expone el lugar ya resuelto ─────────────────────
-- Mantiene la regla de siempre: gana el envío más reciente y, si no hay
-- ninguno, lo que traiga `participants`.
CREATE OR REPLACE VIEW public.v_participantes_registro AS
WITH ultimo_envio AS (
  SELECT DISTINCT ON (participant_id)
         participant_id, first_name, age, residence, district, country, submitted_at
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
  (u.participant_id IS NOT NULL)                   AS registro_tardio,
  u.submitted_at                                   AS registro_actualizado_en,
  -- Columnas nuevas al final: CREATE OR REPLACE VIEW no admite reordenar.
  COALESCE(u.district, p.district)                 AS distrito,
  COALESCE(u.country, p.country)                   AS pais,
  -- Zona pipil: los tres departamentos del occidente donde el náhuat sobrevive
  -- como lengua hablada. Es el corte que hace interesante todo lo demás.
  (COALESCE(u.residence, p.residence) IN ('sonsonate', 'ahuachapan', 'santa_ana')) AS zona_pipil
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

-- ════════════════════════════════════════════════════════════════
--  VERIFICACIÓN
-- ════════════════════════════════════════════════════════════════

-- 1. Distritos por departamento (esperado: el prefijo siempre coincide).
-- SELECT residencia, distrito, COUNT(*) FROM v_participantes_registro
-- WHERE distrito IS NOT NULL AND distrito NOT LIKE residencia || '-%'
-- GROUP BY 1, 2;

-- 2. La pregunta que motivó todo esto: ¿nos usa gente de la zona pipil?
-- SELECT zona_pipil, distrito, COUNT(*) AS personas,
--        ROUND(AVG(lecciones_aprobadas), 1) AS lecciones_prom
-- FROM v_participantes_registro WHERE cohort = 'free'
-- GROUP BY 1, 2 ORDER BY 1 DESC, 3 DESC;

-- 3. Diáspora por país.
-- SELECT pais, COUNT(*) FROM v_participantes_registro
-- WHERE pais IS NOT NULL GROUP BY 1 ORDER BY 2 DESC;
