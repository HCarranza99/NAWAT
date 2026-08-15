-- ════════════════════════════════════════════════════════════════
--  El registro de entrada viaja con la CUENTA, no solo con el dispositivo.
--
--  PROBLEMA QUE RESUELVE
--  `participants` no concede SELECT a la clave anónima (a propósito: va
--  pública en el bundle). Entonces, cuando alguien inicia sesión en un
--  teléfono nuevo, la app no puede leer de vuelta su nombre, edad ni
--  residencia — y sin eso volvería a pedirle el registro a alguien que ya
--  lo hizo, además de crearle un segundo participante y partir su
--  telemetría en dos.
--
--  `user_profiles` sí es legible por su dueño (RLS: auth.uid() = id), así
--  que la identidad se guarda ahí junto con el progreso. `participant_id`
--  ya existía en la tabla: al restaurarlo, la actividad del dispositivo
--  nuevo se acumula sobre el MISMO participante. Una persona, una fila.
--
--  Los datos siguen siendo autoritativos en `participants` para el
--  análisis; esta copia existe para que la sesión pueda reconstruirse.
--
--  Migración idempotente: segura de re-ejecutar.
-- ════════════════════════════════════════════════════════════════

BEGIN;

ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS first_name              text,
  ADD COLUMN IF NOT EXISTS age                     int,
  ADD COLUMN IF NOT EXISTS residence               text,
  ADD COLUMN IF NOT EXISTS registration_completed_at timestamptz;

DO $$
BEGIN
  ALTER TABLE public.user_profiles
    ADD CONSTRAINT user_profiles_age_check CHECK (age IS NULL OR age BETWEEN 5 AND 99);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON COLUMN public.user_profiles.registration_completed_at IS
  'Cuándo cerró el registro de entrada. No nulo = a esta cuenta ya no se le vuelve a pedir.';

-- Las cuentas que existen desde antes de esta migración ya pasaron por el
-- onboarding viejo (consentimiento del estudio): marcarlas como registradas
-- evita que al iniciar sesión les aparezca un formulario que nunca les tocó.
UPDATE public.user_profiles
   SET registration_completed_at = COALESCE(consent_accepted_at, updated_at)
 WHERE registration_completed_at IS NULL;

COMMIT;
