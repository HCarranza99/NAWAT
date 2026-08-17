-- ════════════════════════════════════════════════════════════════════════════
--  La edad mínima sube de 5 a 10 (2026-08-17)
--
--  POR QUÉ
--  Con el consentimiento informado del estudio, pedirle nombre, edad y distrito
--  a un niño de 5 años estaba cubierto. Abriendo la app al público general, no:
--  la cohorte `free` no pasa por ningún consentimiento. Diez años es el piso
--  donde la persona llena el formulario por su cuenta y entiende la cláusula
--  que lo acompaña.
--
--  Decisión del responsable del proyecto, 17-ago-2026.
--
--  SIN RIESGO PARA LOS DATOS EXISTENTES
--  Al aplicarse, las 467 filas de `participants` tienen `age` NULL — la columna
--  se agregó el 15-ago y todavía no se despliega el registro que la llena. El
--  CHECK admite NULL, así que ninguna fila viola la restricción nueva.
--
--  Debe ir junto al cambio de EDAD_MIN en src/data/registro.js. Si la base
--  quedara en 10 y el cliente en 5, un menor llenaría el formulario completo
--  para que el insert lo rechace al final — y como analytics.js atrapa el error
--  en silencio, entraría a la app sin participante y sin telemetría.
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

ALTER TABLE public.participants
  DROP CONSTRAINT IF EXISTS participants_age_check,
  ADD  CONSTRAINT participants_age_check
       CHECK (age IS NULL OR (age >= 10 AND age <= 99));

ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_age_check,
  ADD  CONSTRAINT user_profiles_age_check
       CHECK (age IS NULL OR (age >= 10 AND age <= 99));

ALTER TABLE public.participant_registration_updates
  DROP CONSTRAINT IF EXISTS participant_registration_updates_age_check,
  ADD  CONSTRAINT participant_registration_updates_age_check
       CHECK (age IS NULL OR (age >= 10 AND age <= 99));

COMMENT ON COLUMN public.participants.age IS
  'Edad declarada en el registro de entrada (10-99). Minimo subido de 5 a 10 el 17-ago-2026 al abrir al publico. NULL = registro omitido o participante previo.';

COMMIT;

-- Verificación (esperado: las tres con age >= 10):
--   SELECT conrelid::regclass, pg_get_constraintdef(oid) FROM pg_constraint
--    WHERE connamespace='public'::regnamespace AND contype='c'
--      AND pg_get_constraintdef(oid) ILIKE '%age%';
