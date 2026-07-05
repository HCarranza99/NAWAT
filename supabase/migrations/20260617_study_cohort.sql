-- ════════════════════════════════════════════════════════════════
--  Cohorte de participante: separa datos del ESTUDIO de la POBLACIÓN
--  GENERAL (modo libre).
--
--  Contexto del rediseño de entradas:
--    aprendenawat.com          → acceso libre  (cohort = 'free')
--    aprendenawat.com/estudio  → protocolo del estudio (cohort = 'study')
--
--  Ambas rutas recolectan telemetría; el campo `cohort` permite filtrar
--  en R/SQL los datos específicos del estudio frente al uso general.
--  Migración idempotente: segura de re-ejecutar.
-- ════════════════════════════════════════════════════════════════

-- 1. Columna de cohorte (por defecto 'free').
ALTER TABLE public.participants
  ADD COLUMN IF NOT EXISTS cohort text NOT NULL DEFAULT 'free';

-- 2. Los participantes del modo libre son anónimos (sin nombre).
ALTER TABLE public.participants ALTER COLUMN first_name DROP NOT NULL;
ALTER TABLE public.participants ALTER COLUMN last_name  DROP NOT NULL;

-- 3. Restringe los valores válidos de cohorte.
DO $$
BEGIN
  ALTER TABLE public.participants
    ADD CONSTRAINT participants_cohort_check CHECK (cohort IN ('study', 'free'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 4. Índice para filtrar/agrupar por cohorte en los análisis.
CREATE INDEX IF NOT EXISTS idx_participants_cohort
  ON public.participants (cohort);

-- 5. Reclasifica datos previos: quien tenga registro de consentimiento es
--    participante del estudio; el resto queda como 'free'.
UPDATE public.participants p
   SET cohort = 'study'
 WHERE p.cohort <> 'study'
   AND EXISTS (
     SELECT 1 FROM public.consent_records c WHERE c.participant_id = p.id
   );

COMMENT ON COLUMN public.participants.cohort IS
  'Origen del participante: study (entró por /estudio y consintió) o free (uso general).';
