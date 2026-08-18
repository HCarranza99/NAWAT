-- ════════════════════════════════════════════════════════════════════════════
--  monitoreo_salud.sql — ¿está pasando algo malo ahora mismo?
--
--  Una sola consulta que devuelve un veredicto. Pensada para pegarse en el SQL
--  Editor de Supabase. La rutina diaria «Chequeo diario de salud - NAWAT» corre
--  esta misma lógica y avisa al teléfono solo cuando hay algo que decir.
--
--  POR QUÉ NO ALCANZA CON MIRAR error_log
--  Una tabla de errores vacía tranquiliza, y por eso engaña: puede significar
--  que todo anda bien, o que la app entera no está llegando a la base y por eso
--  no hay ni errores que contar. Eso último fue junio de 2026 — 23 días sin
--  guardar nada. Por eso el veredicto mira las dos cosas.
--
--  ── LAS DOS CALIBRACIONES QUE COSTARON APRENDER ────────────────────────────
--
--  1. LA SEÑAL DE VIDA ES `exercise_responses`, NO `lesson_attempts`.
--     Es la más sensible: suma cada respuesta, no solo las lecciones
--     terminadas. Y no depende de que la persona apruebe.
--
--  2. LA VENTANA DE SILENCIO ES DE 7 DÍAS, NO DE 24 HORAS.
--     La primera versión alertaba con «cero en 24 h» y era inservible: el
--     tráfico es esporádico y habría sonado casi a diario hasta volverse ruido.
--     Una alerta que se ignora es lo mismo que no tenerla. Con más tráfico esta
--     ventana se puede acortar; revisar con:
--
--       SELECT (answered_at AT TIME ZONE 'America/El_Salvador')::date AS dia,
--              count(*) FROM exercise_responses
--        WHERE answered_at > now() - interval '21 days'
--        GROUP BY 1 ORDER BY 1 DESC;
--
--  ── LOS CUATRO VEREDICTOS ──────────────────────────────────────────────────
--
--   ERRORES        → fallos registrados en las últimas 24 h. Mirar `detalle`.
--                    42501 = RLS rechazando escrituras (el fallo de junio)
--                    23503 = llave foránea · 23505 = duplicado
--   SILENCIO       → 7 días sin una sola respuesta, habiendo actividad antes.
--   SIN_LECCIONES  → hay ejercicios pero CERO lecciones terminadas. Es el bug
--                    del 15 al 18 de agosto de 2026: CurriculumLessonScreen
--                    dejó de pasarle `onStart` a LessonRunner y durante tres
--                    días se perdieron puntaje, estrellas, XP y duración
--                    mientras la app parecía estar midiendo. Si reaparece,
--                    empezar por src/screens/CurriculumLessonScreen.jsx.
--   OK             → nada que hacer.
-- ════════════════════════════════════════════════════════════════════════════

WITH errores AS (
  SELECT scope, code, count(*) AS n
  FROM error_log
  WHERE occurred_at > now() - interval '24 hours'
  GROUP BY 1, 2
),
actividad AS (
  SELECT
    count(*) FILTER (WHERE answered_at > now() - interval '7 days')  AS ejercicios_7d,
    count(*) FILTER (WHERE answered_at > now() - interval '28 days'
                       AND answered_at <= now() - interval '7 days') AS ejercicios_previos
  FROM exercise_responses
),
lecciones AS (
  SELECT count(*) FILTER (WHERE completed_at > now() - interval '7 days') AS lecciones_7d
  FROM lesson_attempts
),
registros AS (
  SELECT count(*) FILTER (WHERE created_at > now() - interval '7 days') AS nuevos_7d
  FROM participants
)
SELECT
  CASE
    WHEN (SELECT count(*) FROM errores) > 0                  THEN 'ERRORES'
    WHEN a.ejercicios_7d = 0 AND a.ejercicios_previos > 0    THEN 'SILENCIO'
    WHEN a.ejercicios_7d > 20 AND l.lecciones_7d = 0         THEN 'SIN_LECCIONES'
    ELSE 'OK'
  END                                             AS veredicto,
  (SELECT coalesce(sum(n), 0) FROM errores)       AS errores_24h,
  a.ejercicios_7d,
  a.ejercicios_previos,
  l.lecciones_7d,
  r.nuevos_7d,
  (SELECT coalesce(
     string_agg(scope || '/' || coalesce(code, '-') || ' x' || n, ', '
                ORDER BY n DESC), '(ninguno)')
   FROM errores)                                  AS detalle
FROM actividad a, lecciones l, registros r;

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
