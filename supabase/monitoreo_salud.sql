-- ════════════════════════════════════════════════════════════════════════════
--  monitoreo_salud.sql — ¿está pasando algo malo ahora mismo?
--
--  Una sola consulta que devuelve un veredicto. Pensada para pegarse en el SQL
--  Editor de Supabase, o para que la corra la rutina diaria.
--
--  POR QUÉ NO ALCANZA CON MIRAR error_log
--  Una tabla de errores vacía tranquiliza, y por eso engaña: puede significar
--  que todo anda bien, o que la app entera no está llegando a la base y por eso
--  no hay ni errores que contar. Eso último fue exactamente junio de 2026 — 23
--  días sin guardar nada. Por eso el veredicto mira las dos cosas: si hay
--  errores, y si sigue entrando actividad.
--
--  ── LA CALIBRACIÓN, QUE ES LO QUE IMPORTA ──────────────────────────────────
--
--  La primera versión de esto alertaba con «cero lecciones en 24 horas». Contra
--  los datos reales resultó inservible: en las tres semanas hasta el 17-ago-2026
--  hubo actividad en 8 días de 21, con huecos normales de 2 a 5 días seguidos.
--  Esa alerta habría sonado casi todos los días hasta volverse ruido, que es la
--  peor forma de fallar — una alerta que se ignora es lo mismo que no tenerla.
--
--  Así que la ventana de silencio es de 7 DÍAS, no de 24 horas, y se compara
--  contra las 3 semanas anteriores: solo alerta si la app SOLÍA tener actividad
--  y dejó de tenerla. Con más tráfico esta ventana se puede acortar; revisar la
--  calibración con:
--
--    SELECT (completed_at AT TIME ZONE 'America/El_Salvador')::date AS dia,
--           count(*) FROM lesson_attempts
--     WHERE completed_at > now() - interval '21 days'
--     GROUP BY 1 ORDER BY 1 DESC;
--
--  ── LOS TRES VEREDICTOS ────────────────────────────────────────────────────
--
--   ERRORES  → hay fallos registrados en las últimas 24 h. Mirar `detalle`.
--              code 42501 = RLS rechazando algo (el fallo de junio otra vez)
--              code 23503 = llave foránea, participante huérfano
--              code 23505 = duplicado
--   SILENCIO → nadie completó una lección en 7 días, pero antes sí. O se cayó
--              algo, o el tráfico se murió. Las dos cosas hay que saberlas.
--   OK       → ni errores ni silencio. No hace falta hacer nada.
-- ════════════════════════════════════════════════════════════════════════════

WITH errores AS (
  SELECT scope, code, count(*) AS n, max(occurred_at) AS ultimo
  FROM error_log
  WHERE occurred_at > now() - interval '24 hours'
  GROUP BY 1, 2
),
actividad AS (
  SELECT
    count(*) FILTER (WHERE completed_at > now() - interval '7 days')  AS ult_7d,
    count(*) FILTER (WHERE completed_at > now() - interval '28 days'
                       AND completed_at <= now() - interval '7 days') AS previos_21d
  FROM lesson_attempts
),
registros AS (
  SELECT count(*) FILTER (WHERE created_at > now() - interval '7 days') AS nuevos_7d
  FROM participants
)
SELECT
  CASE
    WHEN (SELECT count(*) FROM errores) > 0        THEN 'ERRORES'
    WHEN a.ult_7d = 0 AND a.previos_21d > 0        THEN 'SILENCIO'
    ELSE 'OK'
  END                                              AS veredicto,
  (SELECT count(*) FROM errores)                   AS tipos_de_error_24h,
  (SELECT coalesce(sum(n), 0) FROM errores)        AS errores_24h,
  a.ult_7d                                         AS lecciones_ult_7d,
  a.previos_21d                                    AS lecciones_21d_previos,
  r.nuevos_7d                                      AS participantes_nuevos_7d,
  (SELECT coalesce(
     string_agg(scope || '/' || coalesce(code, '-') || ' x' || n, ', '
                ORDER BY n DESC), '(ninguno)')
   FROM errores)                                   AS detalle
FROM actividad a, registros r;

-- ────────────────────────────────────────────────────────────────────────────
-- Si el veredicto es ERRORES, el desglose completo:
--
--   SELECT scope, code, count(*) AS veces,
--          min(occurred_at) AS desde, max(occurred_at) AS hasta,
--          min(message) AS ejemplo, min(app_version) AS build
--     FROM error_log
--    WHERE occurred_at > now() - interval '7 days'
--    GROUP BY scope, code
--    ORDER BY veces DESC;
--
-- `build` contesta la primera pregunta cuando algo se rompe: ¿empezó con el
-- último deploy? Es el hash del commit que produjo esa versión de la app.
-- ────────────────────────────────────────────────────────────────────────────
