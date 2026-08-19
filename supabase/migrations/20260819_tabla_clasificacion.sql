-- ════════════════════════════════════════════════════════════════════════════
--  Tabla de clasificación — top 10 por XP (2026-08-19)
--
--  Expone lo MÍNIMO para pintar un top 10: nombre de pila y XP. Nada más sale
--  de la base — ni id, ni edad, ni distrito, ni apellido.
--
--  ── POR QUÉ ES UNA FUNCIÓN Y NO UNA POLICY DE SELECT ───────────────────────
--  El 17-ago se cerró la lectura anónima de todas las tablas de participantes
--  (ver 20260817_cierra_lectura_anonima.sql), justamente porque la clave del
--  bundle es pública. Abrir un SELECT sobre `participants` para pintar esto
--  desharía ese trabajo y expondría edad, distrito y cohorte de 505 personas.
--  Una función SECURITY DEFINER devuelve solo las 10 filas y solo dos columnas.
--
--  ── QUIÉN APARECE ─────────────────────────────────────────────────────────
--  Solo la cohorte 'free'. Los 84 participantes del ESTUDIO quedan fuera por
--  diseño: dieron su nombre bajo un consentimiento de investigación que promete
--  confidencialidad, y ese consentimiento no cubre publicarlos en una tabla.
--  Filtrarlos acá, en la base, y no en el cliente, es lo que garantiza que no
--  se escapen por una pantalla nueva que alguien escriba después.
--
--  Además tiene que tener nombre, XP > 0, y no haberse salido.
--
--  ── EL XP VIENE DEL SERVIDOR ──────────────────────────────────────────────
--  Se suma `lesson_attempts.xp_earned`, no el XP que reporta el cliente. El
--  del store vive en localStorage y cualquiera lo edita con la consola; este
--  exige haber completado lecciones de verdad. No es infalsificable —la app
--  puede llamar a las RPC de telemetría— pero sube el costo de hacer trampa
--  de "editar un número" a "simular lecciones".
--
--  OJO: este número NO coincide con el XP que la persona ve en su perfil. El
--  local incluye XP de las secciones jubiladas y de antes de que se arreglara
--  el registro de intentos (15-18 ago). Por eso la pantalla lo rotula como
--  "XP de lecciones" y no como "tu XP".
-- ════════════════════════════════════════════════════════════════════════════

BEGIN;

-- ── Salirse de la tabla ─────────────────────────────────────────────────────
-- Nadie eligió aparecer: la tabla se puebla con los nombres que ya estaban.
-- Esto es lo que hace que esa decisión sea reversible por la persona.
ALTER TABLE public.participants
  ADD COLUMN IF NOT EXISTS leaderboard_opt_out boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.participants.leaderboard_opt_out IS
  'true = la persona pidio no aparecer en la tabla de clasificacion. Ver leaderboard_top10().';

-- Índice parcial: la consulta siempre filtra por cohorte y por esto.
CREATE INDEX IF NOT EXISTS idx_participants_leaderboard
  ON public.participants (cohort)
  WHERE leaderboard_opt_out = false AND first_name IS NOT NULL;

-- ── El top 10 ───────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.leaderboard_top10()
RETURNS TABLE (posicion int, nombre text, xp int)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH puntajes AS (
    SELECT
      p.id,
      btrim(p.first_name)               AS nombre,
      sum(a.xp_earned)::int             AS xp,
      min(a.completed_at)               AS primera_leccion
    FROM public.participants p
    JOIN public.lesson_attempts a
      ON a.participant_id = p.id
     AND a.completed_at IS NOT NULL
    WHERE p.cohort = 'free'
      AND p.leaderboard_opt_out = false
      AND p.first_name IS NOT NULL
      AND btrim(p.first_name) <> ''
    GROUP BY p.id, p.first_name
    HAVING sum(a.xp_earned) > 0
  )
  SELECT
    row_number() OVER (ORDER BY xp DESC, primera_leccion ASC, id ASC)::int,
    -- Solo el nombre de pila, recortado. `last_name` NUNCA sale de acá.
    left(nombre, 20),
    xp
  FROM puntajes
  ORDER BY xp DESC, primera_leccion ASC, id ASC
  LIMIT 10;
$$;

-- ── Mi posición, para quien no entra en el top 10 ───────────────────────────
-- Recibe el id del propio dispositivo. Devuelve una fila o ninguna.
CREATE OR REPLACE FUNCTION public.leaderboard_mi_posicion(p_participant_id uuid)
RETURNS TABLE (posicion int, xp int, total int)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  WITH puntajes AS (
    SELECT
      p.id,
      sum(a.xp_earned)::int AS xp,
      min(a.completed_at)   AS primera_leccion
    FROM public.participants p
    JOIN public.lesson_attempts a
      ON a.participant_id = p.id
     AND a.completed_at IS NOT NULL
    WHERE p.cohort = 'free'
      AND p.leaderboard_opt_out = false
      AND p.first_name IS NOT NULL
      AND btrim(p.first_name) <> ''
    GROUP BY p.id
    HAVING sum(a.xp_earned) > 0
  ), ranking AS (
    SELECT id, xp,
           row_number() OVER (ORDER BY xp DESC, primera_leccion ASC, id ASC)::int AS posicion,
           count(*) OVER ()::int AS total
    FROM puntajes
  )
  SELECT posicion, xp, total FROM ranking WHERE id = p_participant_id;
$$;

-- ── Salirse (o volver a entrar) ─────────────────────────────────────────────
-- `participants` no concede UPDATE a la app a propósito, así que el cambio
-- pasa por acá. El "permiso" es conocer el uuid del participante, que es
-- aleatorio y solo vive en el dispositivo de esa persona — el mismo criterio
-- que ya usa toda la telemetría. Y el peor abuso posible es sacar a alguien de
-- una lista, nunca meterlo ni leer sus datos.
CREATE OR REPLACE FUNCTION public.set_leaderboard_opt_out(
  p_participant_id uuid,
  p_opt_out        boolean
)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  UPDATE public.participants
     SET leaderboard_opt_out = p_opt_out
   WHERE id = p_participant_id;
$$;

DO $do$
DECLARE fn text;
BEGIN
  FOREACH fn IN ARRAY ARRAY[
    'public.leaderboard_top10()',
    'public.leaderboard_mi_posicion(uuid)',
    'public.set_leaderboard_opt_out(uuid,boolean)'
  ] LOOP
    EXECUTE format('REVOKE ALL ON FUNCTION %s FROM PUBLIC', fn);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO anon, authenticated', fn);
  END LOOP;
END;
$do$;

COMMIT;
