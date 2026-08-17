-- ════════════════════════════════════════════════════════════════════════════
--  error_log — que los fallos dejen de ser invisibles (2026-08-17)
--
--  EL PROBLEMA QUE RESUELVE
--  Cada función de services/analytics.js y services/auth.js atrapa su error y
--  sigue de largo, y `logError` no hacía nada en producción. Resultado: del 4 al
--  27 de junio la app no guardó ni una respuesta de cuestionario y nadie se
--  enteró en 23 días. 70 participantes, datos irrecuperables.
--
--  Lo que falló ahí NO fue una caída de Supabase: fue una policy de RLS
--  devolviendo 42501 en UNA ruta mientras el resto seguía funcionando. Una fila
--  en esta tabla con code='42501' y scope='saveQuestionnaireResponse' lo habría
--  delatado el primer día.
--
--  DECISIONES QUE IMPORTAN
--
--  1. `participant_id` NO tiene foreign key. A propósito. Si la FK fallara —
--     participante inexistente, o justo el caso en que createParticipant ya
--     falló — el registro del error fallaría también y volveríamos al silencio.
--     El log tiene que poder escribirse SIEMPRE, aunque el resto esté roto.
--
--  2. Sin policy de SELECT, igual que el resto de las tablas. La lectura es
--     server-side (dashboard de Supabase o service_role). Ver la migración
--     20260817_cierra_lectura_anonima.sql.
--
--  3. Todas las columnas de contexto son nullable. Un log a medias sirve; un
--     log que no se escribe por un NOT NULL, no.
--
--  4. Lo que NO se guarda: nada que el usuario haya escrito. Ni respuestas, ni
--     nombre, ni el texto de los cuestionarios. Solo el ámbito, el código de
--     error y qué versión de la app lo produjo. Esta tabla es para diagnosticar
--     el sistema, no para observar personas — y lo prometido en
--     src/data/privacidad.js tiene que seguir siendo cierto.
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

CREATE TABLE IF NOT EXISTS public.error_log (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at    timestamptz NOT NULL DEFAULT now(),

  -- El nombre de la función que falló: 'saveQuestionnaireResponse',
  -- 'createParticipant', etc. Es el primer argumento de logError.
  scope          text NOT NULL,

  -- Código de error de Postgres/PostgREST cuando lo hay. Es el dato más útil
  -- de toda la tabla: 42501 = RLS, 23503 = foreign key, 23505 = duplicado.
  code           text,
  message        text,
  details        text,

  -- Contexto para poder reproducirlo. Sin FK (ver arriba).
  participant_id uuid,
  app_version    text,
  user_agent     text,
  url            text
);

COMMENT ON TABLE public.error_log IS
  'Errores atrapados en el cliente. Solo INSERT desde la app; sin SELECT anonimo. No guarda texto escrito por el usuario.';
COMMENT ON COLUMN public.error_log.participant_id IS
  'Sin foreign key a proposito: si la FK fallara, el error no se registraria y volveriamos al silencio.';

-- Los dos ejes por los que se lee esto: "qué está fallando ahora" y
-- "desde cuándo". Van con la tabla y no después, porque una tabla de errores
-- sin índice de fecha se vuelve inútil justo cuando más se necesita.
CREATE INDEX IF NOT EXISTS idx_error_log_occurred_at ON public.error_log (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_log_scope_code  ON public.error_log (scope, code);

ALTER TABLE public.error_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "app_insert_errors" ON public.error_log;
CREATE POLICY "app_insert_errors" ON public.error_log
  FOR INSERT TO anon, authenticated WITH CHECK (true);
-- Sin SELECT, sin UPDATE, sin DELETE.

COMMIT;

-- ════════════════════════════════════════════════════════════════════════════
--  CÓMO SE LEE ESTO
--
--  La consulta de todos los días — qué se rompió en la última semana, agrupado
--  para que sea legible de un vistazo:
--
--    SELECT scope, code, count(*) AS veces,
--           min(occurred_at) AS desde, max(occurred_at) AS hasta,
--           min(message) AS ejemplo
--      FROM error_log
--     WHERE occurred_at > now() - interval '7 days'
--     GROUP BY scope, code
--     ORDER BY veces DESC;
--
--  Lo que hay que mirar:
--    • code = '42501'  → RLS rechazando algo. Es el fallo de junio otra vez.
--    • code = '23503'  → foreign key: participante huérfano.
--    • scope nuevo que nunca había aparecido → algo cambió en el último deploy.
--    • CERO filas y CERO actividad → ojo: puede ser que todo ande bien, o que
--      la app entera no esté llegando a la base. Contrastar con:
--
--    SELECT count(*) FROM lesson_attempts WHERE completed_at > now() - interval '24 hours';
--
--  Esa segunda consulta es el canario de verdad. Una tabla de errores vacía
--  tranquiliza; una tabla de errores vacía CON telemetría en cero es la señal
--  de que se repitió lo de junio.
-- ════════════════════════════════════════════════════════════════════════════
