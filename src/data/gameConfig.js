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

  // Sistema de vidas (corazones)
  lives: {
    max: 5,
    lostOnWrong: 1,
    rechargeMinutes: 30,
  },

  // Progreso por lección
  lesson: {
    minScoreToPass: 0.5,    // 50% correcto para pasar y desbloquear siguiente lección
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
