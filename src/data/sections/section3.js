/**
 * ═══════════════════════════════════════════════════════════
 *  SECCIÓN 3 — Comida y bebida
 * ═══════════════════════════════════════════════════════════
 *
 *  VERBOS TRANSITIVOS: se enseñan CON PREFIJO
 *  El diccionario registra −Uni y −Pia con guion inicial: son transitivos y
 *  exigen prefijo de objeto. Antes se enseñaban sueltos ("Uni = Beber",
 *  "Pia = Tener"), que es el mismo error que tenía −tukay. Ahora se enseñan en
 *  la forma que la propia fuente usa en sus ejemplos:
 *    Nikuni = Yo bebo   ← "Nikuni atutun: Tomo café"
 *    Nikpia = Yo tengo  ← "Naja nikpia ume shiwit: Yo tengo dos años"
 *  Ambas atestiguadas LITERALMENTE; no hay derivación de por medio.
 *
 *  PROCEDENCIA DE LAS FRASES DE EJEMPLO
 *  Todas se tomaron de fuentes reales y se verificaron en contexto. Ninguna se
 *  construyó ni se tradujo por analogía.
 *
 *    Takwa  "Nemi takwal" = Hay comida            → YULTAJTAKETZALIS l.12830
 *    Et     "Ne et" = El frijol                   → YULTAJTAKETZALIS l.4862
 *    Uni    "Nikuni atutun" = Tomo café           → YULTAJTAKETZALIS, entrada −Uni
 *    At     "Ne at" = El agua                     → YULTAJTAKETZALIS l.12716
 *    Pia    "Tea nikpia lala" = Ya no tengo naranjas → YULTAJTAKETZALIS l.18638
 *
 *  Atestiguación: una sola fuente (el diccionario). No fue posible corroborarlas
 *  en una obra independiente; ver la nota de la sección 4 sobre las que sí lo son.
 */

const section3 = {
    id: 3,
    title: "Comida y Bebida",
    description: "Vocabulario de supervivencia para la mesa",
    icon: "🍽️",
    color: "#E65100",

    lessons: [
      // ── L1 — Comer ──
      {
        id: "s3-l1", title: "Comer", icon: "🌽", description: "El verbo más importante de la mesa",
        color: "#BF360C", xpReward: 50,
        items: [
          { id: "s3-l1-1", type: "flashcard", nahuat_word: "Takwa", spanish_translation: "Comer", pronunciation: "tak-wa", pronunciationText: "tak ua", example_sentence: "Nemi takwal", example_translation: "Hay comida" },
          { id: "s3-l1-2", type: "flashcard", nahuat_word: "Et", spanish_translation: "Frijol", pronunciation: "et", pronunciationText: "et", example_sentence: "Ne et", example_translation: "El frijol" },
          { id: "s3-l1-3", type: "multiple_choice_text", nahuat_word: "Takwa", spanish_translation: "Comer", pronunciationText: "tak ua",
            options: [{ id: "a", text: "Yo bebo", correct: false },{ id: "b", text: "Comer", correct: true },{ id: "c", text: "Dormir", correct: false },{ id: "d", text: "Ir", correct: false }] },
          { id: "s3-l1-4", type: "multiple_choice_text", nahuat_word: "Et", spanish_translation: "Frijol", pronunciationText: "et",
            options: [{ id: "a", text: "Agua", correct: false },{ id: "b", text: "Tortilla", correct: false },{ id: "c", text: "Frijol", correct: true },{ id: "d", text: "Maíz", correct: false }] },
          { id: "s3-l1-5", type: "matching", instruction: "Une cada palabra con su significado",
            pairs: [{ nahuat: "Takwa", spanish: "Comer" },{ nahuat: "Et", spanish: "Frijol" }] },
          { id: "s3-l1-6", type: "build_sentence", instruction: "Ordena: 'Yo como'", spanish_translation: "Yo como",
            word_bank: ["nitakwa", "Naja"], correct_order: ["Naja", "nitakwa"] },
        ],
      },
      // ── L2 — Beber ──
      {
        id: "s3-l2", title: "Beber", icon: "💧", description: "Aprende a decir que tienes sed",
        color: "#D84315", xpReward: 50,
        items: [
          { id: "s3-l2-1", type: "flashcard", nahuat_word: "Nikuni", spanish_translation: "Yo bebo", pronunciation: "ni-ku-ni", pronunciationText: "ni ku ni", example_sentence: "Nikuni atutun", example_translation: "Tomo café" },
          { id: "s3-l2-2", type: "flashcard", nahuat_word: "At", spanish_translation: "Agua", pronunciation: "at", pronunciationText: "at", example_sentence: "Ne at", example_translation: "El agua" },
          { id: "s3-l2-3", type: "multiple_choice_text", nahuat_word: "Nikuni", spanish_translation: "Yo bebo", pronunciationText: "ni ku ni",
            options: [{ id: "a", text: "Comer", correct: false },{ id: "b", text: "Yo bebo", correct: true },{ id: "c", text: "Dormir", correct: false },{ id: "d", text: "Ir", correct: false }] },
          { id: "s3-l2-4", type: "multiple_choice_text", nahuat_word: "At", spanish_translation: "Agua", pronunciationText: "at",
            options: [{ id: "a", text: "Frijol", correct: false },{ id: "b", text: "Comida", correct: false },{ id: "c", text: "Agua", correct: true },{ id: "d", text: "Leche", correct: false }] },
          { id: "s3-l2-5", type: "matching", instruction: "Une cada palabra con su significado",
            pairs: [{ nahuat: "Nikuni", spanish: "Yo bebo" },{ nahuat: "At", spanish: "Agua" },{ nahuat: "Takwa", spanish: "Comer" }] },
          { id: "s3-l2-6", type: "build_sentence", instruction: "Ordena: 'Yo tomo agua'", spanish_translation: "Yo tomo agua",
            word_bank: ["niati", "Naja"], correct_order: ["Naja", "niati"] },
        ],
      },
      // ── L3 — Agua y comida básica ──
      {
        id: "s3-l3", title: "Agua y Comida", icon: "🥘", description: "Refuerza lo aprendido",
        color: "#E64A19", xpReward: 50,
        items: [
          { id: "s3-l3-1", type: "multiple_choice_text", nahuat_word: "At", spanish_translation: "Agua", pronunciationText: "at",
            instruction: "¿Qué significa 'At'?",
            options: [{ id: "a", text: "Frijol", correct: false },{ id: "b", text: "Agua", correct: true },{ id: "c", text: "Comer", correct: false },{ id: "d", text: "Yo bebo", correct: false }] },
          { id: "s3-l3-2", type: "multiple_choice_text", nahuat_word: "Et", spanish_translation: "Frijol", pronunciationText: "et",
            options: [{ id: "a", text: "Frijol", correct: true },{ id: "b", text: "Agua", correct: false },{ id: "c", text: "Tortilla", correct: false },{ id: "d", text: "Comer", correct: false }] },
          { id: "s3-l3-3", type: "matching", instruction: "Une alimentos con su nombre",
            pairs: [{ nahuat: "At", spanish: "Agua" },{ nahuat: "Et", spanish: "Frijol" }] },
          { id: "s3-l3-4", type: "multiple_choice_text", nahuat_word: "Takwa", spanish_translation: "Comer", pronunciationText: "tak ua",
            options: [{ id: "a", text: "Yo bebo", correct: false },{ id: "b", text: "Comer", correct: true },{ id: "c", text: "Agua", correct: false },{ id: "d", text: "Frijol", correct: false }] },
          { id: "s3-l3-5", type: "build_sentence", instruction: "Ordena: 'Yo como frijol'", spanish_translation: "Yo como frijol",
            word_bank: ["et", "nikwa", "Naja"], correct_order: ["Naja", "nikwa", "et"] },
        ],
      },
      // ── L4 — Frases simples en la mesa ──
      {
        id: "s3-l4", title: "En la Mesa", icon: "🍲", description: "Forma frases sobre comida",
        color: "#F4511E", xpReward: 50,
        items: [
          { id: "s3-l4-1", type: "flashcard", nahuat_word: "Nikpia", spanish_translation: "Yo tengo", pronunciation: "nik-pi-a", pronunciationText: "nik pi a", example_sentence: "Tea nikpia lala", example_translation: "Ya no tengo naranjas" },
          { id: "s3-l4-2", type: "multiple_choice_text", nahuat_word: "Nikpia", spanish_translation: "Yo tengo", pronunciationText: "nik pi a",
            options: [{ id: "a", text: "Comer", correct: false },{ id: "b", text: "Yo bebo", correct: false },{ id: "c", text: "Yo tengo", correct: true },{ id: "d", text: "Ir", correct: false }] },
          { id: "s3-l4-3", type: "build_sentence", instruction: "Ordena: 'Yo tengo agua'", spanish_translation: "Yo tengo agua",
            word_bank: ["at", "nikpia", "Naja"], correct_order: ["Naja", "nikpia", "at"] },
          { id: "s3-l4-4", type: "build_sentence", instruction: "Ordena: 'Yo como frijol'", spanish_translation: "Yo como frijol",
            word_bank: ["et", "Naja", "nikwa"], correct_order: ["Naja", "nikwa", "et"] },
          { id: "s3-l4-5", type: "matching", instruction: "Une cada verbo con su significado",
            pairs: [{ nahuat: "Takwa", spanish: "Comer" },{ nahuat: "Nikuni", spanish: "Yo bebo" },{ nahuat: "Nikpia", spanish: "Yo tengo" }] },
          { id: "s3-l4-6", type: "multiple_choice_text", nahuat_word: "Nikuni", spanish_translation: "Yo bebo", pronunciationText: "ni ku ni",
            options: [{ id: "a", text: "Comer", correct: false },{ id: "b", text: "Yo tengo", correct: false },{ id: "c", text: "Yo bebo", correct: true },{ id: "d", text: "Frijol", correct: false }] },
        ],
      },
    ],

    boss: {
      id: "s3-boss", title: "Boss: Comida y Bebida", icon: "👑", description: "Repaso de todo lo de la mesa",
      color: "#C62828", xpReward: 100, isBoss: true,
      items: [
        { id: "s3-b-1", type: "multiple_choice_text", nahuat_word: "Takwa", spanish_translation: "Comer", pronunciationText: "tak ua",
          options: [{ id: "a", text: "Yo bebo", correct: false },{ id: "b", text: "Comer", correct: true },{ id: "c", text: "Yo tengo", correct: false },{ id: "d", text: "Ir", correct: false }] },
        { id: "s3-b-2", type: "multiple_choice_text", nahuat_word: "Nikuni", spanish_translation: "Yo bebo", pronunciationText: "ni ku ni",
          options: [{ id: "a", text: "Comer", correct: false },{ id: "b", text: "Dormir", correct: false },{ id: "c", text: "Yo bebo", correct: true },{ id: "d", text: "Yo tengo", correct: false }] },
        { id: "s3-b-3", type: "multiple_choice_text", nahuat_word: "At", spanish_translation: "Agua", pronunciationText: "at",
          options: [{ id: "a", text: "Agua", correct: true },{ id: "b", text: "Frijol", correct: false },{ id: "c", text: "Comida", correct: false },{ id: "d", text: "Leche", correct: false }] },
        { id: "s3-b-4", type: "matching", instruction: "Une cada palabra con su significado",
          pairs: [{ nahuat: "Takwa", spanish: "Comer" },{ nahuat: "Nikuni", spanish: "Yo bebo" },{ nahuat: "Nikpia", spanish: "Yo tengo" },{ nahuat: "At", spanish: "Agua" }] },
        { id: "s3-b-5", type: "matching", instruction: "Une sustantivos con su significado",
          pairs: [{ nahuat: "Et", spanish: "Frijol" },{ nahuat: "At", spanish: "Agua" }] },
        { id: "s3-b-6", type: "build_sentence", instruction: "Ordena: 'Yo tomo agua'", spanish_translation: "Yo tomo agua",
          word_bank: ["niati", "Naja"], correct_order: ["Naja", "niati"] },
        { id: "s3-b-7", type: "build_sentence", instruction: "Ordena: 'Yo tengo agua'", spanish_translation: "Yo tengo agua",
          word_bank: ["nikpia", "at", "Naja"], correct_order: ["Naja", "nikpia", "at"] },
        { id: "s3-b-8", type: "multiple_choice_text", nahuat_word: "Nikpia", spanish_translation: "Yo tengo", pronunciationText: "nik pi a",
          options: [{ id: "a", text: "Comer", correct: false },{ id: "b", text: "Yo tengo", correct: true },{ id: "c", text: "Yo bebo", correct: false },{ id: "d", text: "Agua", correct: false }] },
        { id: "s3-b-9", type: "multiple_choice_text", nahuat_word: "Et", spanish_translation: "Frijol", pronunciationText: "et",
          options: [{ id: "a", text: "Agua", correct: false },{ id: "b", text: "Comer", correct: false },{ id: "c", text: "Frijol", correct: true },{ id: "d", text: "Yo bebo", correct: false }] },
        { id: "s3-b-10", type: "build_sentence", instruction: "Ordena: 'Yo como frijol'", spanish_translation: "Yo como frijol",
          word_bank: ["nikwa", "et", "Naja"], correct_order: ["Naja", "nikwa", "et"] },
      ],
    },
  };

export default section3;
