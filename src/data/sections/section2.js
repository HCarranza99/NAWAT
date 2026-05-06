/**
 * ═══════════════════════════════════════════════════════════
 *  SECCIÓN 2 — Mi mundo y mi familia
 * ═══════════════════════════════════════════════════════════
 */

const section2 = {
    id: 2,
    title: "Mi Mundo y Mi Familia",
    description: "Habla de ti mismo y de las personas cercanas",
    icon: "👨‍👩‍👧",
    color: "#1565C0",

    lessons: [
      // ── L1 — Yo y tú ──
      {
        id: "s2-l1", title: "Yo y Tú", icon: "🫵", description: "Los pronombres más básicos",
        color: "#0D47A1", xpReward: 50,
        items: [
          { id: "s2-l1-1", type: "flashcard", nahuat_word: "Naja", spanish_translation: "Yo", pronunciation: "na-ja", pronunciationText: "na ja" },
          { id: "s2-l1-2", type: "flashcard", nahuat_word: "Taja", spanish_translation: "Tú", pronunciation: "ta-ja", pronunciationText: "ta ja" },
          { id: "s2-l1-3", type: "multiple_choice_text", nahuat_word: "Naja", spanish_translation: "Yo", pronunciationText: "na ja",
            options: [{ id: "a", text: "Tú", correct: false },{ id: "b", text: "Yo", correct: true },{ id: "c", text: "Él", correct: false },{ id: "d", text: "Ella", correct: false }] },
          { id: "s2-l1-4", type: "multiple_choice_text", nahuat_word: "Taja", spanish_translation: "Tú", pronunciationText: "ta ja",
            options: [{ id: "a", text: "Yo", correct: false },{ id: "b", text: "Él", correct: false },{ id: "c", text: "Tú", correct: true },{ id: "d", text: "Nosotros", correct: false }] },
          { id: "s2-l1-5", type: "matching", instruction: "Une cada pronombre con su significado",
            pairs: [{ nahuat: "Naja", spanish: "Yo" },{ nahuat: "Taja", spanish: "Tú" }] },
          { id: "s2-l1-6", type: "build_sentence", instruction: "Ordena: 'Yo me llamo...'", spanish_translation: "Yo me llamo...",
            word_bank: ["nutukay", "Naja"], correct_order: ["Naja", "nutukay"] },
        ],
      },
      // ── L2 — Él / ella y niño / niña ──
      {
        id: "s2-l2", title: "Él, Ella y el Niño", icon: "👦", description: "Habla de otras personas",
        color: "#1976D2", xpReward: 50,
        items: [
          { id: "s2-l2-1", type: "flashcard", nahuat_word: "Yaja", spanish_translation: "Él / Ella", pronunciation: "ya-ja", pronunciationText: "ya ja" },
          { id: "s2-l2-2", type: "flashcard", nahuat_word: "Piltzin", spanish_translation: "Niño / Niña", pronunciation: "pil-tsin", pronunciationText: "pil tsin" },
          { id: "s2-l2-3", type: "multiple_choice_text", nahuat_word: "Yaja", spanish_translation: "Él / Ella", pronunciationText: "ya ja",
            options: [{ id: "a", text: "Yo", correct: false },{ id: "b", text: "Tú", correct: false },{ id: "c", text: "Él / Ella", correct: true },{ id: "d", text: "Niño", correct: false }] },
          { id: "s2-l2-4", type: "multiple_choice_text", nahuat_word: "Piltzin", spanish_translation: "Niño / Niña", pronunciationText: "pil tsin",
            options: [{ id: "a", text: "Hombre", correct: false },{ id: "b", text: "Mujer", correct: false },{ id: "c", text: "Niño / Niña", correct: true },{ id: "d", text: "Madre", correct: false }] },
          { id: "s2-l2-5", type: "matching", instruction: "Une cada palabra con su significado",
            pairs: [{ nahuat: "Naja", spanish: "Yo" },{ nahuat: "Taja", spanish: "Tú" },{ nahuat: "Yaja", spanish: "Él / Ella" },{ nahuat: "Piltzin", spanish: "Niño" }] },
          { id: "s2-l2-6", type: "multiple_choice_text", nahuat_word: "Yaja", spanish_translation: "Él / Ella", pronunciationText: "ya ja",
            instruction: "¿Cómo dices 'él' o 'ella' en náhuat?",
            options: [{ id: "a", text: "Naja", correct: false },{ id: "b", text: "Yaja", correct: true },{ id: "c", text: "Taja", correct: false },{ id: "d", text: "Piltzin", correct: false }] },
        ],
      },
      // ── L3 — Hombre, mujer y nombre ──
      {
        id: "s2-l3", title: "Hombre y Mujer", icon: "🧑", description: "Nombra personas",
        color: "#2196F3", xpReward: 50,
        items: [
          { id: "s2-l3-1", type: "flashcard", nahuat_word: "Takat", spanish_translation: "Hombre", pronunciation: "ta-kat", pronunciationText: "ta kat" },
          { id: "s2-l3-2", type: "flashcard", nahuat_word: "Siwat", spanish_translation: "Mujer", pronunciation: "si-wat", pronunciationText: "si uat" },
          { id: "s2-l3-3", type: "multiple_choice_text", nahuat_word: "Takat", spanish_translation: "Hombre", pronunciationText: "ta kat",
            options: [{ id: "a", text: "Mujer", correct: false },{ id: "b", text: "Hombre", correct: true },{ id: "c", text: "Niño", correct: false },{ id: "d", text: "Madre", correct: false }] },
          { id: "s2-l3-4", type: "multiple_choice_text", nahuat_word: "Siwat", spanish_translation: "Mujer", pronunciationText: "si uat",
            options: [{ id: "a", text: "Hombre", correct: false },{ id: "b", text: "Padre", correct: false },{ id: "c", text: "Mujer", correct: true },{ id: "d", text: "Niña", correct: false }] },
          { id: "s2-l3-5", type: "matching", instruction: "Une cada palabra con su significado",
            pairs: [{ nahuat: "Takat", spanish: "Hombre" },{ nahuat: "Siwat", spanish: "Mujer" },{ nahuat: "Tukay", spanish: "Nombre" }] },
          { id: "s2-l3-6", type: "build_sentence", instruction: "Ordena: 'El hombre se llama...'", spanish_translation: "El hombre se llama...",
            word_bank: ["tukay", "Takat"], correct_order: ["Takat", "tukay"] },
        ],
      },
      // ── L4 — Mi familia ──
      {
        id: "s2-l4", title: "Mi Familia", icon: "👪", description: "Palabras para la familia",
        color: "#42A5F5", xpReward: 50,
        items: [
          { id: "s2-l4-1", type: "flashcard", nahuat_word: "Nunan", spanish_translation: "Mi mamá", pronunciation: "nu-nan", pronunciationText: "nu nan" },
          { id: "s2-l4-2", type: "flashcard", nahuat_word: "Nuteku", spanish_translation: "Mi papá", pronunciation: "nu-te-ku", pronunciationText: "nu te ku" },
          { id: "s2-l4-3", type: "flashcard", nahuat_word: "Nutatanoy", spanish_translation: "Mi abuelo", pronunciation: "nu-ta-ta-noy", pronunciationText: "nu ta ta noi" },
          { id: "s2-l4-4", type: "multiple_choice_text", nahuat_word: "Nunan", spanish_translation: "Mi mamá", pronunciationText: "nu nan",
            options: [{ id: "a", text: "Mi papá", correct: false },{ id: "b", text: "Mi mamá", correct: true },{ id: "c", text: "Mi abuelo", correct: false },{ id: "d", text: "Niño", correct: false }] },
          { id: "s2-l4-5", type: "matching", instruction: "Une cada miembro de la familia",
            pairs: [{ nahuat: "Nunan", spanish: "Mi mamá" },{ nahuat: "Nuteku", spanish: "Mi papá" },{ nahuat: "Nutatanoy", spanish: "Mi abuelo" }] },
          { id: "s2-l4-6", type: "multiple_choice_text", nahuat_word: "Nuteku", spanish_translation: "Mi papá", pronunciationText: "nu te ku",
            options: [{ id: "a", text: "Mi mamá", correct: false },{ id: "b", text: "Mi abuelo", correct: false },{ id: "c", text: "Mi papá", correct: true },{ id: "d", text: "Hombre", correct: false }] },
        ],
      },
    ],

    boss: {
      id: "s2-boss", title: "Boss: Personas y Familia", icon: "👑", description: "Repaso de pronombres, personas y familia",
      color: "#C62828", xpReward: 100, isBoss: true,
      items: [
        { id: "s2-b-1", type: "multiple_choice_text", nahuat_word: "Taja", spanish_translation: "Tú", pronunciationText: "ta ja",
          options: [{ id: "a", text: "Yo", correct: false },{ id: "b", text: "Tú", correct: true },{ id: "c", text: "Él", correct: false },{ id: "d", text: "Niño", correct: false }] },
        { id: "s2-b-2", type: "multiple_choice_text", nahuat_word: "Yaja", spanish_translation: "Él / Ella", pronunciationText: "ya ja",
          options: [{ id: "a", text: "Él / Ella", correct: true },{ id: "b", text: "Yo", correct: false },{ id: "c", text: "Tú", correct: false },{ id: "d", text: "Mujer", correct: false }] },
        { id: "s2-b-3", type: "multiple_choice_text", nahuat_word: "Siwat", spanish_translation: "Mujer", pronunciationText: "si uat",
          options: [{ id: "a", text: "Hombre", correct: false },{ id: "b", text: "Niña", correct: false },{ id: "c", text: "Mujer", correct: true },{ id: "d", text: "Madre", correct: false }] },
        { id: "s2-b-4", type: "matching", instruction: "Une pronombres con su significado",
          pairs: [{ nahuat: "Naja", spanish: "Yo" },{ nahuat: "Taja", spanish: "Tú" },{ nahuat: "Yaja", spanish: "Él / Ella" }] },
        { id: "s2-b-5", type: "matching", instruction: "Une familia con su palabra",
          pairs: [{ nahuat: "Nunan", spanish: "Mi mamá" },{ nahuat: "Nuteku", spanish: "Mi papá" },{ nahuat: "Nutatanoy", spanish: "Mi abuelo" },{ nahuat: "Piltzin", spanish: "Niño" }] },
        { id: "s2-b-6", type: "build_sentence", instruction: "Ordena: 'Yo me llamo...'", spanish_translation: "Yo me llamo...",
          word_bank: ["nutukay", "Naja"], correct_order: ["Naja", "nutukay"] },
        { id: "s2-b-7", type: "multiple_choice_text", nahuat_word: "Nunan", spanish_translation: "Mi mamá", pronunciationText: "nu nan",
          options: [{ id: "a", text: "Mi papá", correct: false },{ id: "b", text: "Mi mamá", correct: true },{ id: "c", text: "Mi abuela", correct: false },{ id: "d", text: "Mujer", correct: false }] },
        { id: "s2-b-8", type: "multiple_choice_text", nahuat_word: "Takat", spanish_translation: "Hombre", pronunciationText: "ta kat",
          options: [{ id: "a", text: "Mujer", correct: false },{ id: "b", text: "Niño", correct: false },{ id: "c", text: "Hombre", correct: true },{ id: "d", text: "Mi papá", correct: false }] },
        { id: "s2-b-9", type: "build_sentence", instruction: "Ordena: 'El hombre se llama...'", spanish_translation: "El hombre se llama...",
          word_bank: ["tukay", "Takat"], correct_order: ["Takat", "tukay"] },
        { id: "s2-b-10", type: "multiple_choice_text", nahuat_word: "Nutatanoy", spanish_translation: "Mi abuelo", pronunciationText: "nu ta ta noi",
          options: [{ id: "a", text: "Mi abuelo", correct: true },{ id: "b", text: "Mi papá", correct: false },{ id: "c", text: "Hombre", correct: false },{ id: "d", text: "Niño", correct: false }] },
      ],
    },
  };

export default section2;
