-- ════════════════════════════════════════════════════════════════
--  Registro de entrada: edad y lugar de residencia del participante.
--
--  CONTEXTO
--  Hasta ahora `participants` solo guardaba nombre y cohorte, y en modo
--  libre (aprendenawat.com) la fila nacía anónima. La telemetría contaba
--  CUÁNTO se usa la app pero no QUIÉN la usa. Estas dos columnas viven en
--  `participants` justamente porque esa tabla es la raíz de todo:
--  sessions, lesson_attempts y exercise_responses cuelgan de participant_id,
--  así que cualquier métrica se puede abrir por edad o por departamento con
--  un solo JOIN.
--
--  La app escribe estos campos en el MISMO INSERT que crea al participante
--  (services/analytics.js → createParticipant). No hace falta —ni se debe—
--  conceder UPDATE a la clave anónima: va pública en el bundle y permitiría
--  reescribir filas ajenas.
--
--  Migración idempotente: segura de re-ejecutar.
-- ════════════════════════════════════════════════════════════════

BEGIN;

-- ── 1. Columnas del registro ────────────────────────────────────
ALTER TABLE public.participants
  ADD COLUMN IF NOT EXISTS age       int,
  ADD COLUMN IF NOT EXISTS residence text;

-- Rango defensivo: la UI ya valida 5–99, pero el check protege el dataset
-- de cualquier cliente viejo, script o error de tipeo.
DO $$
BEGIN
  ALTER TABLE public.participants
    ADD CONSTRAINT participants_age_check CHECK (age IS NULL OR age BETWEEN 5 AND 99);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- `residence` guarda el CÓDIGO estable de src/data/registro.js
-- ('sonsonate', 'san_salvador', …, 'fuera_de_el_salvador'), nunca la etiqueta
-- visible. A propósito NO lleva CHECK con la lista cerrada: agregar una opción
-- en la app no debe exigir una migración. La validación vive en el cliente y
-- el bloque 4 de abajo detecta cualquier valor inesperado.
COMMENT ON COLUMN public.participants.age IS
  'Edad declarada en el registro de entrada (5–99). NULL = registro omitido o participante previo a esta migración.';
COMMENT ON COLUMN public.participants.residence IS
  'Código del departamento de residencia, o fuera_de_el_salvador. Catálogo en src/data/registro.js — no renombrar códigos publicados.';

-- ── 2. Índices para los cortes habituales del análisis ──────────
CREATE INDEX IF NOT EXISTS idx_participants_residence
  ON public.participants (residence);
CREATE INDEX IF NOT EXISTS idx_participants_age
  ON public.participants (age);

-- ── 3. Vista de export: un participante por fila, con su actividad ──
-- Pensada para `read.csv` en R: mezcla el registro con los agregados de uso,
-- de modo que un análisis por edad o departamento no necesite JOINs a mano.
-- `grupo_edad` se calcula aquí (no se guarda) para que recortar los rangos
-- después no obligue a tocar los datos ya recolectados.
CREATE OR REPLACE VIEW public.v_participantes_registro AS
SELECT
  p.id                                   AS participant_id,
  p.cohort,
  p.created_at,
  p.first_name                           AS nombre,
  p.age                                  AS edad,
  CASE
    WHEN p.age IS NULL      THEN 'sin_dato'
    WHEN p.age < 13         THEN 'menor_13'
    WHEN p.age <= 17        THEN '13_17'
    WHEN p.age <= 24        THEN '18_24'
    WHEN p.age <= 34        THEN '25_34'
    WHEN p.age <= 49        THEN '35_49'
    ELSE                         '50_mas'
  END                                    AS grupo_edad,
  COALESCE(p.residence, 'sin_dato')      AS residencia,
  -- Un registro se considera omitido cuando no quedó ninguno de los tres datos.
  (p.first_name IS NULL AND p.age IS NULL AND p.residence IS NULL) AS registro_omitido,
  COALESCE(s.sesiones, 0)                AS sesiones,
  COALESCE(s.segundos_totales, 0)        AS segundos_totales,
  COALESCE(l.lecciones_iniciadas, 0)     AS lecciones_iniciadas,
  COALESCE(l.lecciones_aprobadas, 0)     AS lecciones_aprobadas,
  COALESCE(e.ejercicios, 0)              AS ejercicios,
  COALESCE(e.aciertos, 0)                AS aciertos,
  s.ultima_sesion
FROM public.participants p
LEFT JOIN (
  SELECT participant_id,
         COUNT(*)                            AS sesiones,
         SUM(COALESCE(duration_seconds, 0))  AS segundos_totales,
         MAX(started_at)                     AS ultima_sesion
  FROM public.sessions GROUP BY participant_id
) s ON s.participant_id = p.id
LEFT JOIN (
  SELECT participant_id,
         COUNT(*)                                       AS lecciones_iniciadas,
         COUNT(*) FILTER (WHERE passed)                 AS lecciones_aprobadas
  FROM public.lesson_attempts GROUP BY participant_id
) l ON l.participant_id = p.id
LEFT JOIN (
  SELECT participant_id,
         COUNT(*)                                       AS ejercicios,
         COUNT(*) FILTER (WHERE is_correct)             AS aciertos
  FROM public.exercise_responses GROUP BY participant_id
) e ON e.participant_id = p.id;

COMMENT ON VIEW public.v_participantes_registro IS
  'Un participante por fila: registro de entrada + agregados de uso. Exportar con la service_role key, nunca con la anon.';

-- ── 4. Cerrar la vista ──────────────────────────────────────────
-- CRÍTICO, no opcional: una vista nace con SELECT para anon y ejecutándose con
-- los permisos de su DUEÑO, así que saltaría el RLS de `participants` y dejaría
-- leer nombre, edad y residencia de todo el mundo con la clave que va pública
-- en el bundle. Es exactamente la fuga que cerró 20260604_harden_rls_policies.
--   • security_invoker → la vista respeta el RLS de quien consulta.
--   • REVOKE           → solo la exportación server-side (service_role) la lee.
ALTER VIEW public.v_participantes_registro SET (security_invoker = on);
REVOKE ALL ON public.v_participantes_registro FROM anon, authenticated;

COMMIT;

-- ════════════════════════════════════════════════════════════════
--  VERIFICACIÓN (correr a mano después de la migración)
-- ════════════════════════════════════════════════════════════════

-- 1. ¿Está llegando el registro? Cuántos participantes traen los tres datos.
-- SELECT COUNT(*) FILTER (WHERE age IS NOT NULL AND residence IS NOT NULL) AS con_registro,
--        COUNT(*) FILTER (WHERE age IS NULL AND residence IS NULL)         AS sin_registro,
--        COUNT(*)                                                          AS total
-- FROM participants WHERE cohort = 'free';

-- 2. Distribución por departamento y grupo de edad.
-- SELECT residencia, grupo_edad, COUNT(*) FROM v_participantes_registro
-- WHERE cohort = 'free' GROUP BY 1, 2 ORDER BY 1, 2;

-- 3. Trazabilidad: ¿la actividad queda ligada a un registro?
--    Esperado: 0 filas con actividad y sin participante.
-- SELECT COUNT(*) FROM exercise_responses e
-- WHERE NOT EXISTS (SELECT 1 FROM participants p WHERE p.id = e.participant_id);

-- 4. Códigos de residencia inesperados (cliente viejo o dato sucio).
--    Esperado: 0 filas.
-- SELECT residence, COUNT(*) FROM participants
-- WHERE residence IS NOT NULL AND residence NOT IN (
--   'ahuachapan','santa_ana','sonsonate','chalatenango','la_libertad',
--   'san_salvador','cuscatlan','la_paz','cabanas','san_vicente',
--   'usulutan','san_miguel','morazan','la_union','fuera_de_el_salvador')
-- GROUP BY 1;
