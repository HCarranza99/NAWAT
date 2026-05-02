/**
 * ═══════════════════════════════════════════════════════════
 *  SECCIÓN 3 — Comida y bebida
 * ═══════════════════════════════════════════════════════════
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
          { id: "s3-l1-1", type: "flashcard", nahuat_word: "Takwa", spanish_translation: "Comer", pronunciation: "tak-wa", pronunciationText: "tak ua" },
          { id: "s3-l1-2", type: "flashcard", nahuat_word: "Et", spanish_translation: "Frijol", pronunciation: "et", pronunciationText: "et" },
          { id: "s3-l1-3", type: "multiple_choice_text", nahuat_word: "Takwa", spanish_translation: "Comer", pronunciationText: "tak ua",
            options: [{ id: "a", text: "Beber", correct: false },{ id: "b", text: "Comer", correct: true },{ id: "c", text: "Dormir", correct: false },{ id: "d", text: "Ir", correct: false }] },
          { id: "s3-l1-4", type: "multiple_choice_text", nahuat_word: "Et", spanish_translation: "Frijol", pronunciationText: "et",
            options: [{ id: "a", text: "Agua", correct: false },{ id: "b", text: "Tortilla", correct: false },{ id: "c", text: "Frijol", correct: true },{ id: "d", text: "Maíz", correct: false }] },
          { id: "s3-l1-5", type: "matching", instruction: "Une cada palabra con su significado",
            pairs: [{ nahuat: "Takwa", spanish: "Comer" },{ nahuat: "Et", spanish: "Frijol" }] },
          { id: "s3-l1-6", type: "build_sentence", instruction: "Ordena: 'Yo como'", spanish_translation: "Yo como",
            word_bank: ["takwa", "Naja"], correct_order: ["Naja", "takwa"] },
        ],
      },
      // ── L2 — Beber ──
      {
        id: "s3-l2", title: "Beber", icon: "💧", description: "Aprende a decir que tienes sed",
        color: "#D84315", xpReward: 50,
        items: [
          { id: "s3-l2-1", type: "flashcard", nahuat_word: "Uni", spanish_translation: "Beber", pronunciation: "u-ni", pronunciationText: "u ni" },
          { id: "s3-l2-2", type: "flashcard", nahuat_word: "At", spanish_translation: "Agua", pronunciation: "at", pronunciationText: "at" },
          { id: "s3-l2-3", type: "multiple_choice_text", nahuat_word: "Uni", spanish_translation: "Beber", pronunciationText: "u ni",
            options: [{ id: "a", text: "Comer", correct: false },{ id: "b", text: "Beber", correct: true },{ id: "c", text: "Dormir", correct: false },{ id: "d", text: "Ir", correct: false }] },
          { id: "s3-l2-4", type: "multiple_choice_text", nahuat_word: "At", spanish_translation: "Agua", pronunciationText: "at",
            options: [{ id: "a", text: "Frijol", correct: false },{ id: "b", text: "Comida", correct: false },{ id: "c", text: "Agua", correct: true },{ id: "d", text: "Leche", correct: false }] },
          { id: "s3-l2-5", type: "matching", instruction: "Une cada palabra con su significado",
            pairs: [{ nahuat: "Uni", spanish: "Beber" },{ nahuat: "At", spanish: "Agua" },{ nahuat: "Takwa", spanish: "Comer" }] },
          { id: "s3-l2-6", type: "build_sentence", instruction: "Ordena: 'Yo bebo agua'", spanish_translation: "Yo bebo agua",
            word_bank: ["at", "uni", "Naja"], correct_order: ["Naja", "uni", "at"] },
        ],
      },
      // ── L3 — Agua y comida básica ──
      {
        id: "s3-l3", title: "Agua y Comida", icon: "🥘", description: "Refuerza lo aprendido",
        color: "#E64A19", xpReward: 50,
        items: [
          { id: "s3-l3-1", type: "multiple_choice_text", nahuat_word: "At", spanish_translation: "Agua", pronunciationText: "at",
            instruction: "¿Qué significa 'At'?",
            options: [{ id: "a", text: "Frijol", correct: false },{ id: "b", text: "Agua", correct: true },{ id: "c", text: "Comer", correct: false },{ id: "d", text: "Beber", correct: false }] },
          { id: "s3-l3-2", type: "multiple_choice_text", nahuat_word: "Et", spanish_translation: "Frijol", pronunciationText: "et",
            options: [{ id: "a", text: "Frijol", correct: true },{ id: "b", text: "Agua", correct: false },{ id: "c", text: "Tortilla", correct: false },{ id: "d", text: "Comer", correct: false }] },
          { id: "s3-l3-3", type: "matching", instruction: "Une alimentos con su nombre",
            pairs: [{ nahuat: "At", spanish: "Agua" },{ nahuat: "Et", spanish: "Frijol" }] },
          { id: "s3-l3-4", type: "multiple_choice_text", nahuat_word: "Takwa", spanish_translation: "Comer", pronunciationText: "tak ua",
            instruction: "¿Cuál es el verbo para comer?",
            options: [{ id: "a", text: "Uni", correct: false },{ id: "b", text: "Takwa", correct: true },{ id: "c", text: "At", correct: false },{ id: "d", text: "Et", correct: false }] },
          { id: "s3-l3-5", type: "build_sentence", instruction: "Ordena: 'Yo como frijol'", spanish_translation: "Yo como frijol",
            word_bank: ["et", "takwa", "Naja"], correct_order: ["Naja", "takwa", "et"] },
        ],
      },
      // ── L4 — Frases simples en la mesa ──
      {
        id: "s3-l4", title: "En la Mesa", icon: "🍲", description: "Forma frases sobre comida",
        color: "#F4511E", xpReward: 50,
        items: [
          { id: "s3-l4-1", type: "flashcard", nahuat_word: "Pia", spanish_translation: "Tener", pronunciation: "pi-a", pronunciationText: "pi a" },
          { id: "s3-l4-2", type: "multiple_choice_text", nahuat_word: "Pia", spanish_translation: "Tener", pronunciationText: "pi a",
            options: [{ id: "a", text: "Comer", correct: false },{ id: "b", text: "Beber", correct: false },{ id: "c", text: "Tener", correct: true },{ id: "d", text: "Ir", correct: false }] },
          { id: "s3-l4-3", type: "build_sentence", instruction: "Ordena: 'Yo tengo agua'", spanish_translation: "Yo tengo agua",
            word_bank: ["at", "pia", "Naja"], correct_order: ["Naja", "pia", "at"] },
          { id: "s3-l4-4", type: "build_sentence", instruction: "Ordena: 'Yo como frijol'", spanish_translation: "Yo como frijol",
            word_bank: ["et", "Naja", "takwa"], correct_order: ["Naja", "takwa", "et"] },
          { id: "s3-l4-5", type: "matching", instruction: "Une cada verbo con su significado",
            pairs: [{ nahuat: "Takwa", spanish: "Comer" },{ nahuat: "Uni", spanish: "Beber" },{ nahuat: "Pia", spanish: "Tener" }] },
          { id: "s3-l4-6", type: "multiple_choice_text", nahuat_word: "Uni", spanish_translation: "Beber", pronunciationText: "u ni",
            instruction: "¿Cómo dices 'beber' en náhuat?",
            options: [{ id: "a", text: "Takwa", correct: false },{ id: "b", text: "Pia", correct: false },{ id: "c", text: "Uni", correct: true },{ id: "d", text: "Et", correct: false }] },
        ],
      },
    ],

    boss: {
      id: "s3-boss", title: "Boss: Comida y Bebida", icon: "👑", description: "Repaso de todo lo de la mesa",
      color: "#C62828", xpReward: 100, isBoss: true,
      items: [
        { id: "s3-b-1", type: "multiple_choice_text", nahuat_word: "Takwa", spanish_translation: "Comer", pronunciationText: "tak ua",
          options: [{ id: "a", text: "Beber", correct: false },{ id: "b", text: "Comer", correct: true },{ id: "c", text: "Tener", correct: false },{ id: "d", text: "Ir", correct: false }] },
        { id: "s3-b-2", type: "multiple_choice_text", nahuat_word: "Uni", spanish_translation: "Beber", pronunciationText: "u ni",
          options: [{ id: "a", text: "Comer", correct: false },{ id: "b", text: "Dormir", correct: false },{ id: "c", text: "Beber", correct: true },{ id: "d", text: "Tener", correct: false }] },
        { id: "s3-b-3", type: "multiple_choice_text", nahuat_word: "At", spanish_translation: "Agua", pronunciationText: "at",
          options: [{ id: "a", text: "Agua", correct: true },{ id: "b", text: "Frijol", correct: false },{ id: "c", text: "Comida", correct: false },{ id: "d", text: "Leche", correct: false }] },
        { id: "s3-b-4", type: "matching", instruction: "Une cada palabra con su significado",
          pairs: [{ nahuat: "Takwa", spanish: "Comer" },{ nahuat: "Uni", spanish: "Beber" },{ nahuat: "Pia", spanish: "Tener" },{ nahuat: "At", spanish: "Agua" }] },
        { id: "s3-b-5", type: "matching", instruction: "Une sustantivos con su significado",
          pairs: [{ nahuat: "Et", spanish: "Frijol" },{ nahuat: "At", spanish: "Agua" }] },
        { id: "s3-b-6", type: "build_sentence", instruction: "Ordena: 'Yo bebo agua'", spanish_translation: "Yo bebo agua",
          word_bank: ["at", "Naja", "uni"], correct_order: ["Naja", "uni", "at"] },
        { id: "s3-b-7", type: "build_sentence", instruction: "Ordena: 'Yo tengo agua'", spanish_translation: "Yo tengo agua",
          word_bank: ["pia", "at", "Naja"], correct_order: ["Naja", "pia", "at"] },
        { id: "s3-b-8", type: "multiple_choice_text", nahuat_word: "Pia", spanish_translation: "Tener", pronunciationText: "pi a",
          options: [{ id: "a", text: "Comer", correct: false },{ id: "b", text: "Tener", correct: true },{ id: "c", text: "Beber", correct: false },{ id: "d", text: "Agua", correct: false }] },
        { id: "s3-b-9", type: "multiple_choice_text", nahuat_word: "Et", spanish_translation: "Frijol", pronunciationText: "et",
          options: [{ id: "a", text: "Agua", correct: false },{ id: "b", text: "Comer", correct: false },{ id: "c", text: "Frijol", correct: true },{ id: "d", text: "Beber", correct: false }] },
        { id: "s3-b-10", type: "build_sentence", instruction: "Ordena: 'Yo como frijol'", spanish_translation: "Yo como frijol",
          word_bank: ["takwa", "et", "Naja"], correct_order: ["Naja", "takwa", "et"] },
      ],
    },
  };

export default section3;
