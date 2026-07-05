/**
 * Configuración global del sistema de gamificación
 */

export const GAME_CONFIG = {
  // XP y niveles
  xp: {
    correctAnswer: 10,
    perfectLesson: 50,      // bonus por completar sin errores
    streakBonus: 5,         // bonus por racha de respuestas correctas
    streakThreshold: 3,     // racha mínima para activar bonus
    perLevel: 500,          // XP necesaria por nivel
  },

  // Sistema de vidas (corazones) — POR INTENTO, no global.
  // Cada intento de lección arranca con `max` vidas; al agotarlas el intento
  // termina y se puede reintentar al instante con las mismas condiciones.
  // No hay recarga por tiempo ni espera.
  lives: {
    max: 3,
    lostOnWrong: 1,
  },

  // Progreso por lección
  lesson: {
    minScoreToPass: 0.75,   // 75% correcto para pasar y desbloquear la siguiente
    itemsPerSession: 10,    // items máximos por sesión (si la lección tiene más)
  },

  // Tipos de ejercicio y su peso en puntos
  itemTypes: {
    flashcard: { label: "Tarjeta", xp: 5 },
    multiple_choice_text: { label: "Opción múltiple", xp: 10 },
    multiple_choice_image: { label: "Imagen", xp: 10 },
    matching: { label: "Emparejar", xp: 15 },
    build_sentence: { label: "Construir oración", xp: 20 },
  },
};

export const LESSON_STATUS = {
  LOCKED: "locked",
  AVAILABLE: "available",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
};

/** Puntaje mínimo (0–1) para aprobar una lección y desbloquear la siguiente. */
export const MIN_SCORE_TO_PASS = GAME_CONFIG.lesson.minScoreToPass;

/**
 * Estrellas a partir del puntaje (0–1). Único origen de verdad: se usa en el
 * store, en las pantallas de lección y en el resultado para evitar divergencias.
 * 0 estrellas ⇔ no aprobado (por debajo del umbral).
 */
export function computeStars(score) {
  if (score >= 0.95) return 3;
  if (score >= 0.85) return 2;
  if (score >= MIN_SCORE_TO_PASS) return 1;
  return 0;
}
