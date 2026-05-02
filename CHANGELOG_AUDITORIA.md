# Changelog de Auditoría

Este archivo registra las correcciones aplicadas según el `REPORTE_AUDITORIA.md`.

## FASE 1 — Correcciones HIGH

[Severidad HIGH] Archivo: src/data/questionnaires.js, src/test/questionnaires.test.js
Hallazgo: Valor de debug en producción (INTERVENTION_MINUTES = 1)
Cambio aplicado: Cambiado a 15 y quitado .skip del test.
Tests afectados: pasan
Notas: Riesgo: revisar manualmente la tabla intervention_timeline de Supabase para identificar sesiones con duración menor a 10 min y marcarlas como inválidas.

[Severidad HIGH] Archivo: eslint.config.js
Hallazgo: Faltan globales de Vitest y ecmaVersion duplicado
Cambio aplicado: Añadido override para tests, ecmaVersion consolidado y cambiado argsIgnorePattern.
Tests afectados: pasan
Notas: Ninguna

[Severidad HIGH] Archivo: src/services/auth.js, src/App.jsx, src/hooks/useAuth.js, src/screens/AccountPromptScreen.jsx
Hallazgo: IDOR en saveProgressToCloud y catch mudos en todo el servicio.
Cambio aplicado: Se quitó authUserId de saveProgressToCloud y ahora lee desde Supabase directo. Se reemplazaron catches por logError. Se filtraron los eventos en onAuthStateChange.
Tests afectados: pendientes
Notas: Se creó src/lib/logger.js

[Severidad HIGH] Archivo: src/services/analytics.js
Hallazgo: hashText débil (SHA-256 faltante) y catch mudos.
Cambio aplicado: hashText es ahora async con crypto.subtle.digest y saveConsent es async. Reemplazados todos los catches por logError.
Tests afectados: pendientes
Notas: Ninguna

[Severidad HIGH] Archivo: src/hooks/useAuth.js
Hallazgo: Race conditions (unmount, storeRef, store mutation).
Cambio aplicado: Eliminado storeRef, se usa getState() en snapshot, y flag de cancelled. Lógica de merge reescrita.
Tests afectados: pendientes
Notas: Ninguna

[Severidad HIGH] Archivo: src/store/useGameStore.js
Hallazgo: Faltaba validación al rehidratar persist state (Zod).
Cambio aplicado: Se instaló Zod, se definió GameStateSchema, se implementó onRehydrateStorage para limpiar el estado corrupto. Se refactorizó la racha de días con números absolutos (dayNumber) y se extrajo el cálculo de estrellas. Se movieron strings mágicos a PHASES.
Tests afectados: app.test.jsx, storeStreak.test.js
Notas: Ninguna

[Severidad HIGH] Archivo: src/screens/LessonScreen.jsx, src/screens/SectionLessonScreen.jsx, src/components/ui/LessonRunner.jsx
Hallazgo: Vulnerabilidad de validación de router (NaN / Undefined).
Cambio aplicado: Se creó un componente LessonRunner común. Se convirtieron las validaciones para parsear el ID y redirigir al inicio en lugar de romper con errores inesperados.
Tests afectados: pendientes
Notas: Ninguna

[Severidad HIGH] Archivo: supabase/migrations/AUDIT_RLS_PENDIENTE.sql
Hallazgo: RLS faltante en Supabase.
Cambio aplicado: Creado script SQL documentado con políticas de inserción abierta para recolección de datos y protección al perfil.
Tests afectados: N/A
Notas: Esto debe ejecutarse manualmente en la base de datos de Supabase.
