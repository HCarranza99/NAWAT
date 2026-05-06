/**
 * ═══════════════════════════════════════════════════════════
 *  SECCIÓN 5 — Acciones diarias
 * ═══════════════════════════════════════════════════════════
 */

const section5 = {
    id: 5,
    title: "Acciones Diarias",
    description: "Verbos para hablar de tu día a día",
    icon: "🏃",
    color: "#6A1B9A",

    lessons: [
      // ── L1 — Estar y tener ──
      {
        id: "s5-l1", title: "Estar y Tener", icon: "📍", description: "Dos verbos fundamentales",
        color: "#4A148C", xpReward: 50,
        items: [
          { id: "s5-l1-1", type: "flashcard", nahuat_word: "Nemi", spanish_translation: "Estar / Vivir", pronunciation: "ne-mi", pronunciationText: "ne mi" },
          { id: "s5-l1-2", type: "flashcard", nahuat_word: "Pia", spanish_translation: "Tener", pronunciation: "pi-a", pronunciationText: "pi a" },
          { id: "s5-l1-3", type: "multiple_choice_text", nahuat_word: "Nemi", spanish_translation: "Estar / Vivir", pronunciationText: "ne mi",
            options: [{ id: "a", text: "Comer", correct: false },{ id: "b", text: "Estar / Vivir", correct: true },{ id: "c", text: "Ir", correct: false },{ id: "d", text: "Tener", correct: false }] },
          { id: "s5-l1-4", type: "multiple_choice_text", nahuat_word: "Pia", spanish_translation: "Tener", pronunciationText: "pi a",
            options: [{ id: "a", text: "Estar", correct: false },{ id: "b", text: "Ir", correct: false },{ id: "c", text: "Tener", correct: true },{ id: "d", text: "Dormir", correct: false }] },
          { id: "s5-l1-5", type: "matching", instruction: "Une cada verbo con su significado",
            pairs: [{ nahuat: "Nemi", spanish: "Estar" },{ nahuat: "Pia", spanish: "Tener" }] },
          { id: "s5-l1-6", type: "build_sentence", instruction: "Ordena: 'Yo estoy'", spanish_translation: "Yo estoy",
            word_bank: ["ninemi", "Naja"], correct_order: ["Naja", "ninemi"] },
        ],
      },
      // ── L2 — Ir ──
      {
        id: "s5-l2", title: "Ir", icon: "🚶", description: "La acción de moverse",
        color: "#6A1B9A", xpReward: 50,
        items: [
          { id: "s5-l2-1", type: "flashcard", nahuat_word: "Yawi", spanish_translation: "Ir", pronunciation: "ya-wi", pronunciationText: "ya ui" },
          { id: "s5-l2-2", type: "multiple_choice_text", nahuat_word: "Yawi", spanish_translation: "Ir", pronunciationText: "ya ui",
            options: [{ id: "a", text: "Comer", correct: false },{ id: "b", text: "Dormir", correct: false },{ id: "c", text: "Ir", correct: true },{ id: "d", text: "Estar", correct: false }] },
          { id: "s5-l2-3", type: "build_sentence", instruction: "Ordena: 'Yo voy'", spanish_translation: "Yo voy",
            word_bank: ["niaw", "Naja"], correct_order: ["Naja", "niaw"] },
          { id: "s5-l2-4", type: "matching", instruction: "Une cada verbo",
            pairs: [{ nahuat: "Yawi", spanish: "Ir" },{ nahuat: "Nemi", spanish: "Estar" },{ nahuat: "Pia", spanish: "Tener" }] },
          { id: "s5-l2-5", type: "multiple_choice_text", nahuat_word: "Yawi", spanish_translation: "Ir", pronunciationText: "ya ui",
            instruction: "¿Cómo dices 'ir' en náhuat?",
            options: [{ id: "a", text: "Nemi", correct: false },{ id: "b", text: "Yawi", correct: true },{ id: "c", text: "Takwa", correct: false },{ id: "d", text: "Pia", correct: false }] },
        ],
      },
      // ── L3 — Comer, beber y dormir ──
      {
        id: "s5-l3", title: "Comer, Beber y Dormir", icon: "😴", description: "Las acciones del día",
        color: "#7B1FA2", xpReward: 50,
        items: [
          { id: "s5-l3-1", type: "flashcard", nahuat_word: "Kuchi", spanish_translation: "Dormir", pronunciation: "ku-chi", pronunciationText: "ku chi" },
          { id: "s5-l3-2", type: "multiple_choice_text", nahuat_word: "Kuchi", spanish_translation: "Dormir", pronunciationText: "ku chi",
            options: [{ id: "a", text: "Comer", correct: false },{ id: "b", text: "Beber", correct: false },{ id: "c", text: "Dormir", correct: true },{ id: "d", text: "Ir", correct: false }] },
          { id: "s5-l3-3", type: "matching", instruction: "Une cada acción con su verbo",
            pairs: [{ nahuat: "Takwa", spanish: "Comer" },{ nahuat: "Uni", spanish: "Beber" },{ nahuat: "Kuchi", spanish: "Dormir" }] },
          { id: "s5-l3-4", type: "build_sentence", instruction: "Ordena: 'Yo duermo'", spanish_translation: "Yo duermo",
            word_bank: ["nikuchi", "Naja"], correct_order: ["Naja", "nikuchi"] },
          { id: "s5-l3-5", type: "multiple_choice_text", nahuat_word: "Takwa", spanish_translation: "Comer", pronunciationText: "tak ua",
            instruction: "¿Cuál es el verbo para comer?",
            options: [{ id: "a", text: "Kuchi", correct: false },{ id: "b", text: "Uni", correct: false },{ id: "c", text: "Takwa", correct: true },{ id: "d", text: "Yawi", correct: false }] },
          { id: "s5-l3-6", type: "build_sentence", instruction: "Ordena: 'Yo como frijol'", spanish_translation: "Yo como frijol",
            word_bank: ["et", "Naja", "nikwa"], correct_order: ["Naja", "nikwa", "et"] },
        ],
      },
      // ── L4 — Reír y sentirse bien ──
      {
        id: "s5-l4", title: "Reír y Bienestar", icon: "😄", description: "Emociones positivas",
        color: "#9C27B0", xpReward: 50,
        items: [
          { id: "s5-l4-1", type: "flashcard", nahuat_word: "Paki", spanish_translation: "Reír / Estar feliz", pronunciation: "pa-ki", pronunciationText: "pa ki" },
          { id: "s5-l4-2", type: "flashcard", nahuat_word: "Yek", spanish_translation: "Bueno / Bien", pronunciation: "yek", pronunciationText: "iek" },
          { id: "s5-l4-3", type: "multiple_choice_text", nahuat_word: "Paki", spanish_translation: "Reír / Estar feliz", pronunciationText: "pa ki",
            options: [{ id: "a", text: "Dormir", correct: false },{ id: "b", text: "Reír / Estar feliz", correct: true },{ id: "c", text: "Comer", correct: false },{ id: "d", text: "Ir", correct: false }] },
          { id: "s5-l4-4", type: "multiple_choice_text", nahuat_word: "Yek", spanish_translation: "Bueno / Bien", pronunciationText: "iek",
            options: [{ id: "a", text: "Malo", correct: false },{ id: "b", text: "Bueno / Bien", correct: true },{ id: "c", text: "Grande", correct: false },{ id: "d", text: "Pequeño", correct: false }] },
          { id: "s5-l4-5", type: "matching", instruction: "Une cada palabra con su significado",
            pairs: [{ nahuat: "Paki", spanish: "Reír / Feliz" },{ nahuat: "Yek", spanish: "Bueno / Bien" }] },
          { id: "s5-l4-6", type: "build_sentence", instruction: "Ordena: 'Yo estoy feliz'", spanish_translation: "Yo estoy feliz",
            word_bank: ["nipaki", "Naja"], correct_order: ["Naja", "nipaki"] },
        ],
      },
    ],

    boss: {
      id: "s5-boss", title: "Boss: Acciones Diarias", icon: "👑", description: "Repaso de todos los verbos",
      color: "#C62828", xpReward: 100, isBoss: true,
      items: [
        { id: "s5-b-1", type: "multiple_choice_text", nahuat_word: "Nemi", spanish_translation: "Estar / Vivir", pronunciationText: "ne mi",
          options: [{ id: "a", text: "Ir", correct: false },{ id: "b", text: "Estar / Vivir", correct: true },{ id: "c", text: "Tener", correct: false },{ id: "d", text: "Comer", correct: false }] },
        { id: "s5-b-2", type: "multiple_choice_text", nahuat_word: "Yawi", spanish_translation: "Ir", pronunciationText: "ya ui",
          options: [{ id: "a", text: "Estar", correct: false },{ id: "b", text: "Dormir", correct: false },{ id: "c", text: "Ir", correct: true },{ id: "d", text: "Reír", correct: false }] },
        { id: "s5-b-3", type: "multiple_choice_text", nahuat_word: "Kuchi", spanish_translation: "Dormir", pronunciationText: "ku chi",
          options: [{ id: "a", text: "Comer", correct: false },{ id: "b", text: "Beber", correct: false },{ id: "c", text: "Ir", correct: false },{ id: "d", text: "Dormir", correct: true }] },
        { id: "s5-b-4", type: "matching", instruction: "Une cada verbo con su significado",
          pairs: [{ nahuat: "Nemi", spanish: "Estar" },{ nahuat: "Yawi", spanish: "Ir" },{ nahuat: "Kuchi", spanish: "Dormir" },{ nahuat: "Paki", spanish: "Reír" }] },
        { id: "s5-b-5", type: "matching", instruction: "Une más verbos",
          pairs: [{ nahuat: "Takwa", spanish: "Comer" },{ nahuat: "Uni", spanish: "Beber" },{ nahuat: "Pia", spanish: "Tener" }] },
        { id: "s5-b-6", type: "build_sentence", instruction: "Ordena: 'Yo voy'", spanish_translation: "Yo voy",
          word_bank: ["Naja", "niaw"], correct_order: ["Naja", "niaw"] },
        { id: "s5-b-7", type: "build_sentence", instruction: "Ordena: 'Yo duermo'", spanish_translation: "Yo duermo",
          word_bank: ["nikuchi", "Naja"], correct_order: ["Naja", "nikuchi"] },
        { id: "s5-b-8", type: "multiple_choice_text", nahuat_word: "Paki", spanish_translation: "Reír / Estar feliz", pronunciationText: "pa ki",
          options: [{ id: "a", text: "Dormir", correct: false },{ id: "b", text: "Reír / Estar feliz", correct: true },{ id: "c", text: "Ir", correct: false },{ id: "d", text: "Comer", correct: false }] },
        { id: "s5-b-9", type: "multiple_choice_text", nahuat_word: "Yek", spanish_translation: "Bueno / Bien", pronunciationText: "iek",
          options: [{ id: "a", text: "Malo", correct: false },{ id: "b", text: "Grande", correct: false },{ id: "c", text: "Bueno / Bien", correct: true },{ id: "d", text: "Pequeño", correct: false }] },
        { id: "s5-b-10", type: "build_sentence", instruction: "Ordena: 'Yo estoy feliz'", spanish_translation: "Yo estoy feliz",
          word_bank: ["Naja", "nipaki"], correct_order: ["Naja", "nipaki"] },
      ],
    },
  };

export default section5;
