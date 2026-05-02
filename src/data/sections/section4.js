/**
 * ═══════════════════════════════════════════════════════════
 *  SECCIÓN 4 — Mi entorno
 * ═══════════════════════════════════════════════════════════
 */

const section4 = {
    id: 4,
    title: "Mi Entorno",
    description: "Palabras del espacio que te rodea",
    icon: "🏡",
    color: "#388E3C",

    lessons: [
      // ── L1 — La casa ──
      {
        id: "s4-l1", title: "La Casa", icon: "🏠", description: "Tu primer espacio en náhuat",
        color: "#2E7D32", xpReward: 50,
        items: [
          { id: "s4-l1-1", type: "flashcard", nahuat_word: "Kal", spanish_translation: "Casa", pronunciation: "kal", pronunciationText: "kal" },
          { id: "s4-l1-2", type: "multiple_choice_text", nahuat_word: "Kal", spanish_translation: "Casa", pronunciationText: "kal",
            options: [{ id: "a", text: "Agua", correct: false },{ id: "b", text: "Casa", correct: true },{ id: "c", text: "Árbol", correct: false },{ id: "d", text: "Perro", correct: false }] },
          { id: "s4-l1-3", type: "multiple_choice_text", nahuat_word: "Pia", spanish_translation: "Tener", pronunciationText: "pi a",
            instruction: "¿Qué verbo usas para decir 'tengo una casa'?",
            options: [{ id: "a", text: "Takwa", correct: false },{ id: "b", text: "Pia", correct: true },{ id: "c", text: "Uni", correct: false },{ id: "d", text: "Yawi", correct: false }] },
          { id: "s4-l1-4", type: "build_sentence", instruction: "Ordena: 'Yo tengo casa'", spanish_translation: "Yo tengo casa",
            word_bank: ["kal", "pia", "Naja"], correct_order: ["Naja", "pia", "kal"] },
          { id: "s4-l1-5", type: "matching", instruction: "Une cada palabra con su significado",
            pairs: [{ nahuat: "Kal", spanish: "Casa" },{ nahuat: "Pia", spanish: "Tener" }] },
        ],
      },
      // ── L2 — Agua, árbol y naturaleza ──
      {
        id: "s4-l2", title: "La Naturaleza", icon: "🌳", description: "Agua y árboles",
        color: "#43A047", xpReward: 50,
        items: [
          { id: "s4-l2-1", type: "flashcard", nahuat_word: "At", spanish_translation: "Agua", pronunciation: "at", pronunciationText: "at" },
          { id: "s4-l2-2", type: "flashcard", nahuat_word: "Kwitawal", spanish_translation: "Árbol / Bosque", pronunciation: "kwi-ta-wal", pronunciationText: "kui ta ual" },
          { id: "s4-l2-3", type: "multiple_choice_text", nahuat_word: "Kwitawal", spanish_translation: "Árbol / Bosque", pronunciationText: "kui ta ual",
            options: [{ id: "a", text: "Casa", correct: false },{ id: "b", text: "Agua", correct: false },{ id: "c", text: "Árbol / Bosque", correct: true },{ id: "d", text: "Sol", correct: false }] },
          { id: "s4-l2-4", type: "matching", instruction: "Une cada palabra con su significado",
            pairs: [{ nahuat: "At", spanish: "Agua" },{ nahuat: "Kwitawal", spanish: "Árbol" },{ nahuat: "Kal", spanish: "Casa" }] },
          { id: "s4-l2-5", type: "multiple_choice_text", nahuat_word: "At", spanish_translation: "Agua", pronunciationText: "at",
            options: [{ id: "a", text: "Árbol", correct: false },{ id: "b", text: "Agua", correct: true },{ id: "c", text: "Casa", correct: false },{ id: "d", text: "Luna", correct: false }] },
        ],
      },
      // ── L3 — Animales de la casa ──
      {
        id: "s4-l3", title: "Animales", icon: "🐕", description: "Mascotas y animales cercanos",
        color: "#66BB6A", xpReward: 50,
        items: [
          { id: "s4-l3-1", type: "flashcard", nahuat_word: "Pelu", spanish_translation: "Perro", pronunciation: "pe-lu", pronunciationText: "pe lu" },
          { id: "s4-l3-2", type: "flashcard", nahuat_word: "Misin", spanish_translation: "Gato", pronunciation: "mi-sin", pronunciationText: "mi sin" },
          { id: "s4-l3-3", type: "multiple_choice_text", nahuat_word: "Pelu", spanish_translation: "Perro", pronunciationText: "pe lu",
            options: [{ id: "a", text: "Gato", correct: false },{ id: "b", text: "Perro", correct: true },{ id: "c", text: "Casa", correct: false },{ id: "d", text: "Agua", correct: false }] },
          { id: "s4-l3-4", type: "multiple_choice_text", nahuat_word: "Misin", spanish_translation: "Gato", pronunciationText: "mi sin",
            options: [{ id: "a", text: "Perro", correct: false },{ id: "b", text: "Árbol", correct: false },{ id: "c", text: "Gato", correct: true },{ id: "d", text: "Luna", correct: false }] },
          { id: "s4-l3-5", type: "matching", instruction: "Une cada animal con su nombre",
            pairs: [{ nahuat: "Pelu", spanish: "Perro" },{ nahuat: "Misin", spanish: "Gato" }] },
          { id: "s4-l3-6", type: "build_sentence", instruction: "Ordena: 'Yo tengo perro'", spanish_translation: "Yo tengo perro",
            word_bank: ["pelu", "pia", "Naja"], correct_order: ["Naja", "pia", "pelu"] },
        ],
      },
      // ── L4 — Sol y luna ──
      {
        id: "s4-l4", title: "Sol y Luna", icon: "🌙", description: "Elementos del cielo",
        color: "#81C784", xpReward: 50,
        items: [
          { id: "s4-l4-1", type: "flashcard", nahuat_word: "Tunal", spanish_translation: "Sol", pronunciation: "tu-nal", pronunciationText: "tu nal" },
          { id: "s4-l4-2", type: "flashcard", nahuat_word: "Metzi", spanish_translation: "Luna", pronunciation: "met-si", pronunciationText: "met si" },
          { id: "s4-l4-3", type: "multiple_choice_text", nahuat_word: "Tunal", spanish_translation: "Sol", pronunciationText: "tu nal",
            options: [{ id: "a", text: "Luna", correct: false },{ id: "b", text: "Sol", correct: true },{ id: "c", text: "Agua", correct: false },{ id: "d", text: "Estrella", correct: false }] },
          { id: "s4-l4-4", type: "multiple_choice_text", nahuat_word: "Metzi", spanish_translation: "Luna", pronunciationText: "met si",
            options: [{ id: "a", text: "Sol", correct: false },{ id: "b", text: "Agua", correct: false },{ id: "c", text: "Luna", correct: true },{ id: "d", text: "Árbol", correct: false }] },
          { id: "s4-l4-5", type: "matching", instruction: "Une cada palabra con su significado",
            pairs: [{ nahuat: "Tunal", spanish: "Sol" },{ nahuat: "Metzi", spanish: "Luna" }] },
        ],
      },
    ],

    boss: {
      id: "s4-boss", title: "Boss: Mi Entorno", icon: "👑", description: "Repaso de casa, naturaleza y cielo",
      color: "#C62828", xpReward: 100, isBoss: true,
      items: [
        { id: "s4-b-1", type: "multiple_choice_text", nahuat_word: "Kal", spanish_translation: "Casa", pronunciationText: "kal",
          options: [{ id: "a", text: "Agua", correct: false },{ id: "b", text: "Casa", correct: true },{ id: "c", text: "Perro", correct: false },{ id: "d", text: "Sol", correct: false }] },
        { id: "s4-b-2", type: "multiple_choice_text", nahuat_word: "Pelu", spanish_translation: "Perro", pronunciationText: "pe lu",
          options: [{ id: "a", text: "Gato", correct: false },{ id: "b", text: "Perro", correct: true },{ id: "c", text: "Casa", correct: false },{ id: "d", text: "Árbol", correct: false }] },
        { id: "s4-b-3", type: "multiple_choice_text", nahuat_word: "Metzi", spanish_translation: "Luna", pronunciationText: "met si",
          options: [{ id: "a", text: "Sol", correct: false },{ id: "b", text: "Estrella", correct: false },{ id: "c", text: "Luna", correct: true },{ id: "d", text: "Agua", correct: false }] },
        { id: "s4-b-4", type: "matching", instruction: "Une cada palabra del entorno",
          pairs: [{ nahuat: "Kal", spanish: "Casa" },{ nahuat: "At", spanish: "Agua" },{ nahuat: "Kwitawal", spanish: "Árbol" },{ nahuat: "Tunal", spanish: "Sol" }] },
        { id: "s4-b-5", type: "matching", instruction: "Une animales y cielo",
          pairs: [{ nahuat: "Pelu", spanish: "Perro" },{ nahuat: "Misin", spanish: "Gato" },{ nahuat: "Metzi", spanish: "Luna" }] },
        { id: "s4-b-6", type: "build_sentence", instruction: "Ordena: 'Yo tengo casa'", spanish_translation: "Yo tengo casa",
          word_bank: ["kal", "Naja", "pia"], correct_order: ["Naja", "pia", "kal"] },
        { id: "s4-b-7", type: "multiple_choice_text", nahuat_word: "Kwitawal", spanish_translation: "Árbol / Bosque", pronunciationText: "kui ta ual",
          options: [{ id: "a", text: "Agua", correct: false },{ id: "b", text: "Árbol / Bosque", correct: true },{ id: "c", text: "Casa", correct: false },{ id: "d", text: "Perro", correct: false }] },
        { id: "s4-b-8", type: "multiple_choice_text", nahuat_word: "Tunal", spanish_translation: "Sol", pronunciationText: "tu nal",
          options: [{ id: "a", text: "Luna", correct: false },{ id: "b", text: "Sol", correct: true },{ id: "c", text: "Agua", correct: false },{ id: "d", text: "Árbol", correct: false }] },
        { id: "s4-b-9", type: "build_sentence", instruction: "Ordena: 'Yo tengo perro'", spanish_translation: "Yo tengo perro",
          word_bank: ["pelu", "Naja", "pia"], correct_order: ["Naja", "pia", "pelu"] },
        { id: "s4-b-10", type: "multiple_choice_text", nahuat_word: "Misin", spanish_translation: "Gato", pronunciationText: "mi sin",
          options: [{ id: "a", text: "Perro", correct: false },{ id: "b", text: "Luna", correct: false },{ id: "c", text: "Gato", correct: true },{ id: "d", text: "Sol", correct: false }] },
      ],
    },
  };

export default section4;
