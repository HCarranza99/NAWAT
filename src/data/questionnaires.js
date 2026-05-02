/**
 * questionnaires.js
 *
 * Fuente de verdad para render UI de pretest y postest.
 * Los `code` y `options.value` deben coincidir exactamente con el seed en
 * supabase/migrations/001_questionnaires.sql para que la exportación
 * (vista v_dataset_wide) cuadre columna por columna.
 *
 * Tipos de item:
 *   - 'single_choice' → opción única (renderiza stack vertical de botones)
 *   - 'likert_5'      → escala 1-5 (renderiza fila segmentada de 5 botones)
 *   - 'short_text'    → input de una línea
 *   - 'long_text'     → textarea multilínea
 */

export const CONSENT_VERSION = '1.0.0'

export const CONSENT_TEXT = `
Al continuar, declaras que participas voluntariamente en este estudio académico sobre herramientas TIC interactivas y aprendizaje del náhuat.

Se recolectarán:
• Tu nombre y apellido, únicamente para identificar tus respuestas dentro del estudio.
• Tus respuestas al cuestionario inicial y final.
• Datos anónimos sobre tu interacción con la aplicación (ejercicios respondidos, tiempo, aciertos).

Los datos se usarán con fines estrictamente académicos. No se compartirán con terceros ni se usarán con fines comerciales. Puedes retirar tu participación solicitándolo al equipo de investigación.
`.trim()

const likert = (code, section, question_text, order_index, polarity = 'positive', phase = 'pretest') => ({
  code,
  phase,
  section,
  item_type: 'likert_5',
  question_text,
  polarity,
  is_required: true,
  order_index,
})

// ── PRETEST ─────────────────────────────────────────────────────────────────

export const PRETEST_ITEMS = [
  // Sección A — Datos generales
  {
    code: 'A1', phase: 'pretest', section: 'A', item_type: 'single_choice',
    question_text: 'Institución de educación superior',
    options: [
      { value: 'andres_bello', label: 'Andrés Bello Regional Chalatenango' },
      { value: 'itcha', label: 'ITCHA' },
      { value: 'umoar', label: 'UMOAR' },
      { value: 'otra', label: 'Otra', allow_custom: true },
    ],
    is_required: true, order_index: 1,
  },
  {
    code: 'A2', phase: 'pretest', section: 'A', item_type: 'single_choice',
    question_text: 'Edad',
    options: [
      { value: '18-20', label: '18–20' },
      { value: '21-25', label: '21–25' },
      { value: '26-30', label: '26–30' },
      { value: '31-35', label: '31–35' },
      { value: '36+', label: '36 o más' },
      { value: 'no_responde', label: 'Prefiere no decir' },
    ],
    is_required: true, order_index: 2,
  },
  {
    code: 'A3', phase: 'pretest', section: 'A', item_type: 'single_choice',
    question_text: 'Sexo',
    options: [
      { value: 'masculino', label: 'Masculino' },
      { value: 'femenino', label: 'Femenino' },
      { value: 'no_responde', label: 'Prefiere no decir' },
    ],
    is_required: true, order_index: 3,
  },
  {
    code: 'A4', phase: 'pretest', section: 'A', item_type: 'single_choice',
    question_text: 'Año/ciclo de estudio',
    options: [
      { value: '1', label: '1.º año' },
      { value: '2', label: '2.º año' },
      { value: '3', label: '3.º año' },
      { value: '4plus', label: '4.º año o superior' },
      { value: 'tecnico', label: 'Técnico/tecnólogo' },
      { value: 'otro', label: 'Otro', allow_custom: true },
    ],
    is_required: true, order_index: 4,
  },
  {
    code: 'A5', phase: 'pretest', section: 'A', item_type: 'short_text',
    question_text: 'Carrera o área de estudio',
    placeholder: 'Ej. Ingeniería en sistemas',
    is_required: true, order_index: 5,
  },

  // Sección B — Conocimiento previo y hábitos
  {
    code: 'B1', phase: 'pretest', section: 'B', item_type: 'single_choice',
    question_text: 'Antes de esta encuesta, había escuchado sobre el náhuat.',
    options: [
      { value: 'si', label: 'Sí' },
      { value: 'no', label: 'No' },
      { value: 'no_seguro', label: 'No estoy seguro/a' },
    ],
    is_required: true, order_index: 6,
  },
  {
    code: 'B2', phase: 'pretest', section: 'B', item_type: 'single_choice',
    question_text: 'Mi nivel de conocimiento previo sobre el náhuat es.',
    options: [
      { value: 'ninguno', label: 'Ninguno' },
      { value: 'bajo', label: 'Bajo' },
      { value: 'medio', label: 'Medio' },
      { value: 'alto', label: 'Alto' },
    ],
    is_required: true, order_index: 7,
  },
  likert('B3', 'B', 'Me interesa aprender otros idiomas además del español.', 8),
  {
    code: 'B4', phase: 'pretest', section: 'B', item_type: 'single_choice',
    question_text: 'He utilizado aplicaciones o plataformas digitales para aprender (idiomas u otros temas).',
    options: [
      { value: 'si', label: 'Sí' },
      { value: 'no', label: 'No' },
    ],
    is_required: true, order_index: 9,
  },
  {
    code: 'B5', phase: 'pretest', section: 'B', item_type: 'single_choice',
    question_text: 'Frecuencia de uso de aplicaciones/plataformas para aprender.',
    options: [
      { value: 'nunca', label: 'Nunca' },
      { value: 'rara_vez', label: 'Rara vez (1–2 veces al mes)' },
      { value: 'a_veces', label: 'A veces (1–2 veces por semana)' },
      { value: 'frecuente', label: 'Frecuente (3–5 veces por semana)' },
      { value: 'muy_frecuente', label: 'Muy frecuente (casi todos los días)' },
    ],
    is_required: true, order_index: 10,
  },

  // Sección C — Percepción TIC (Likert)
  likert('C1',  'C', 'Considero que las herramientas TIC interactivas pueden apoyar el aprendizaje de un idioma.', 11),
  likert('C2',  'C', 'Una herramienta interactiva me ayudaría a mantenerme motivado/a en el aprendizaje.', 12),
  likert('C3',  'C', 'La retroalimentación inmediata (aciertos/errores) mejora mi experiencia de aprendizaje.', 13),
  likert('C4',  'C', 'Me resulta fácil adaptarme al uso de nuevas herramientas digitales para aprender.', 14),
  likert('C5',  'C', 'Considero que podría usar una herramienta interactiva sin ayuda constante de un docente.', 15),
  likert('C6',  'C', 'La navegación simple y clara en una plataforma de aprendizaje influye en que yo use una herramienta de aprendizaje.', 16),
  likert('C7',  'C', 'Prefiero actividades donde pueda practicar y recibir corrección inmediata.', 17),
  likert('C8',  'C', 'Las dinámicas tipo juego (puntos, niveles, logros) aumentan mi disposición a aprender.', 18),
  likert('C9',  'C', 'Interactuar (responder, seleccionar, completar) me ayuda más que solo leer o ver contenido.', 19),
  likert('C10', 'C', 'Tengo acceso suficiente (dispositivo e internet) para usar herramientas digitales de aprendizaje.', 20),
  likert('C11', 'C', 'Dispongo de tiempo semanal para usar una herramienta digital de aprendizaje.', 21),
  likert('C12', 'C', 'Usaría más una herramienta de aprendizaje si está disponible desde el teléfono.', 22),

  // Sección D — Interés por aprender náhuat (Likert)
  likert('D1', 'D', 'Me interesa aprender nociones básicas de náhuat.', 23),
  likert('D2', 'D', 'Si existiera un recurso digital interactivo para aprender náhuat, lo usaría.', 24),
  likert('D3', 'D', 'Estaría dispuesto/a a dedicar tiempo semanal para aprender náhuat si el recurso es práctico y atractivo.', 25),
  likert('D4', 'D', 'Considero valioso que en educación superior se promueva el aprendizaje del náhuat.', 26),
  likert('D5', 'D', 'Me gustaría participar en actividades (curso, taller o app) relacionadas con el aprendizaje del náhuat.', 27),
  likert('D6', 'D', 'Aprender náhuat me parecería útil o significativo a nivel cultural/personal.', 28),

  // Sección E — Preferencias y barreras
  {
    code: 'E1', phase: 'pretest', section: 'E', item_type: 'single_choice',
    question_text: '¿Qué tipo de herramienta te motivaría más para aprender (cualquier tema o idioma)?',
    options: [
      { value: 'app_movil', label: 'Aplicación móvil tipo lecciones cortas' },
      { value: 'web', label: 'Plataforma web interactiva' },
      { value: 'video', label: 'Videos interactivos con preguntas' },
      { value: 'juegos', label: 'Juegos educativos (gamificación fuerte tipo Duolingo)' },
      { value: 'quizzes', label: 'Quizzes / preguntas rápidas (tipo Kahoot/Quizizz)' },
      { value: 'otro', label: 'Otro', allow_custom: true },
    ],
    is_required: true, order_index: 29,
  },
  {
    code: 'E2', phase: 'pretest', section: 'E', item_type: 'single_choice',
    question_text: 'Principal barrera para aprender náhuat (si te interesara).',
    options: [
      { value: 'no_interes', label: 'No me interesa aprender idiomas' },
      { value: 'no_utilidad', label: 'No le veo utilidad práctica' },
      { value: 'tiempo', label: 'Falta de tiempo' },
      { value: 'recursos', label: 'Falta de recursos adecuados' },
      { value: 'docente', label: 'Falta de acompañamiento docente' },
      { value: 'dificultad', label: 'Dificultad percibida (me parece difícil)' },
      { value: 'otra', label: 'Otra', allow_custom: true },
    ],
    is_required: true, order_index: 30,
  },
  {
    code: 'E3', phase: 'pretest', section: 'E', item_type: 'single_choice',
    question_text: '¿Cuánto tiempo estarías dispuesto/a a dedicar por semana para aprender náhuat si el recurso fuera atractivo?',
    options: [
      { value: '0', label: '0 minutos' },
      { value: '10-20', label: '10–20 minutos' },
      { value: '21-40', label: '21–40 minutos' },
      { value: '41-60', label: '41–60 minutos' },
      { value: '60+', label: 'Más de 60 minutos' },
    ],
    is_required: true, order_index: 31,
  },
]

// ── POSTEST ─────────────────────────────────────────────────────────────────

export const POSTTEST_ITEMS = [
  // Sección B — SUS (10 items alternados positivo/negativo)
  likert('sus_b1',  'B', 'Creo que me gustaría utilizar esta aplicación con frecuencia.',                                     32, 'positive', 'posttest'),
  likert('sus_b2',  'B', 'Encontré la aplicación innecesariamente compleja.',                                                  33, 'negative', 'posttest'),
  likert('sus_b3',  'B', 'Pensé que la aplicación era fácil de usar.',                                                         34, 'positive', 'posttest'),
  likert('sus_b4',  'B', 'Creo que necesitaría el apoyo de una persona técnica para poder usar esta aplicación.',              35, 'negative', 'posttest'),
  likert('sus_b5',  'B', 'Encontré que las diversas funciones de esta aplicación estaban bien integradas.',                    36, 'positive', 'posttest'),
  likert('sus_b6',  'B', 'Pensé que había demasiada inconsistencia en esta aplicación.',                                       37, 'negative', 'posttest'),
  likert('sus_b7',  'B', 'Imagino que la mayoría de las personas aprenderían a usar esta aplicación muy rápidamente.',         38, 'positive', 'posttest'),
  likert('sus_b8',  'B', 'Encontré la aplicación muy engorrosa (difícil) de usar.',                                            39, 'negative', 'posttest'),
  likert('sus_b9',  'B', 'Me sentí muy seguro/a usando la aplicación.',                                                        40, 'positive', 'posttest'),
  likert('sus_b10', 'B', 'Necesitaba aprender muchas cosas antes de poder empezar a usar la aplicación.',                      41, 'negative', 'posttest'),

  // Sección C — Impacto (simetría con pretest)
  likert('post_c1', 'C', 'Después de usar NAWAT, mi interés por aprender nociones básicas de náhuat ha aumentado.',            42, 'positive', 'posttest'),
  likert('post_c2', 'C', 'Las dinámicas de juego (gamificación) en la aplicación me motivaron a seguir intentando aprender las palabras.', 43, 'positive', 'posttest'),
  likert('post_c3', 'C', 'Considero que el tiempo pasó rápido mientras usaba la aplicación (experimenté inmersión/flujo).',    44, 'positive', 'posttest'),
  likert('post_c4', 'C', 'Me gustaría tener acceso continuo a esta aplicación para seguir aprendiendo náhuat por mi cuenta.',  45, 'positive', 'posttest'),
  {
    code: 'post_c5', phase: 'posttest', section: 'C', item_type: 'single_choice',
    question_text: 'Tras conocer la herramienta, ¿cuánto tiempo estarías dispuesto/a a dedicar por semana para seguir aprendiendo náhuat?',
    options: [
      { value: '0', label: '0 minutos' },
      { value: '10-20', label: '10–20 minutos' },
      { value: '21-40', label: '21–40 minutos' },
      { value: '41-60', label: '41–60 minutos' },
      { value: '60+', label: 'Más de 60 minutos' },
    ],
    is_required: true, order_index: 46,
  },

  // Sección D — Retroalimentación abierta (opcional)
  {
    code: 'post_d1', phase: 'posttest', section: 'D', item_type: 'long_text',
    question_text: '¿Qué fue lo que más te gustó de la aplicación NAWAT?',
    placeholder: 'Escribe aquí tu respuesta (opcional)',
    is_required: false, order_index: 47,
  },
  {
    code: 'post_d2', phase: 'posttest', section: 'D', item_type: 'long_text',
    question_text: '¿Qué aspecto mejorarías o qué dificultad encontraste?',
    placeholder: 'Escribe aquí tu respuesta (opcional)',
    is_required: false, order_index: 48,
  },
]

// ── Labels estándar para Likert 5 (coherente en toda la app) ────────────────
// Versión larga: para aria-label (lectores de pantalla)
export const LIKERT_5_LABELS = {
  1: 'Totalmente en desacuerdo',
  2: 'En desacuerdo',
  3: 'Ni de acuerdo ni en desacuerdo',
  4: 'De acuerdo',
  5: 'Totalmente de acuerdo',
}

// Versión corta: se muestra bajo cada número del botón Likert
export const LIKERT_5_SHORT_LABELS = {
  1: 'Muy en\ndesacuerdo',
  2: 'En\ndesacuerdo',
  3: 'Neutral',
  4: 'De\nacuerdo',
  5: 'Muy de\nacuerdo',
}

// Ítem de práctica — NO se guarda en la base de datos.
// Su único propósito es familiarizar al usuario con la escala Likert
// antes de responder el pretest real.
export const PRACTICE_ITEM = {
  code: 'practice_example',
  phase: 'practice',
  section: 'P',
  item_type: 'likert_5',
  question_text: 'Me gusta aprender cosas nuevas.',
  polarity: 'positive',
  is_required: true,
  order_index: 0,
}

// ── Duración de la intervención ─────────────────────────────────────────────
export const INTERVENTION_MINUTES = 15
export const INTERVENTION_MS = INTERVENTION_MINUTES * 60 * 1000
