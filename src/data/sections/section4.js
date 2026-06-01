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
          { id: "s4-l1-2", type: "multiple_choice_image", nahuat_word: "Kal", spanish_translation: "Casa", pronunciationText: "kal",
            image_url: "/assets/images/kal_exercise.png", instruction: "Mira la imagen y elige la palabra correcta en Náhuat:",
            options: [{ id: "a", text: "At", correct: false },{ id: "b", text: "Kal", correct: true },{ id: "c", text: "Kwawit", correct: false },{ id: "d", text: "Pelu", correct: false }] },
          { id: "s4-l1-3", type: "multiple_choice_text", nahuat_word: "Pia", spanish_translation: "Tener", pronunciationText: "pi a",
            options: [{ id: "a", text: "Comer", correct: false },{ id: "b", text: "Tener", correct: true },{ id: "c", text: "Beber", correct: false },{ id: "d", text: "Ir", correct: false }] },
          { id: "s4-l1-4", type: "build_sentence", instruction: "Ordena: 'Yo tengo casa'", spanish_translation: "Yo tengo casa",
            word_bank: ["kal", "nikpia", "Naja"], correct_order: ["Naja", "nikpia", "kal"] },
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
          { id: "s4-l2-2", type: "flashcard", nahuat_word: "Kwawit", spanish_translation: "Árbol / Leña", pronunciation: "kwa-wit", pronunciationText: "kua uit" },
          { id: "s4-l2-3", type: "multiple_choice_image", nahuat_word: "Kwawit", spanish_translation: "Árbol / Leña", pronunciationText: "kua uit",
            image_url: "/assets/images/kwawit_exercise.png", instruction: "Mira la imagen y elige la palabra correcta en Náhuat:",
            options: [{ id: "a", text: "Kal", correct: false },{ id: "b", text: "At", correct: false },{ id: "c", text: "Kwawit", correct: true },{ id: "d", text: "Tunal", correct: false }] },
          { id: "s4-l2-4", type: "matching", instruction: "Une cada palabra con su significado",
            pairs: [{ nahuat: "At", spanish: "Agua" },{ nahuat: "Kwawit", spanish: "Árbol" },{ nahuat: "Kal", spanish: "Casa" }] },
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
          { id: "s4-l3-2", type: "flashcard", nahuat_word: "Mistun", spanish_translation: "Gato", pronunciation: "mis-tun", pronunciationText: "mis tun" },
          { id: "s4-l3-3", type: "multiple_choice_image", nahuat_word: "Pelu", spanish_translation: "Perro", pronunciationText: "pe lu",
            image_url: "/assets/images/pelu_exercise.png", instruction: "Mira la imagen y elige la palabra correcta en Náhuat:",
            options: [{ id: "a", text: "Mistun", correct: false },{ id: "b", text: "Pelu", correct: true },{ id: "c", text: "Kal", correct: false },{ id: "d", text: "At", correct: false }] },
          { id: "s4-l3-4", type: "multiple_choice_image", nahuat_word: "Mistun", spanish_translation: "Gato", pronunciationText: "mis tun",
            image_url: "/assets/images/mistun_exercise.png", instruction: "Mira la imagen y elige la palabra correcta en Náhuat:",
            options: [{ id: "a", text: "Pelu", correct: false },{ id: "b", text: "Kwawit", correct: false },{ id: "c", text: "Mistun", correct: true },{ id: "d", text: "Metzi", correct: false }] },
          { id: "s4-l3-5", type: "matching", instruction: "Une cada animal con su nombre",
            pairs: [{ nahuat: "Pelu", spanish: "Perro" },{ nahuat: "Mistun", spanish: "Gato" }] },
          { id: "s4-l3-6", type: "build_sentence", instruction: "Ordena: 'Yo tengo perro'", spanish_translation: "Yo tengo perro",
            word_bank: ["pelu", "nikpia", "Naja"], correct_order: ["Naja", "nikpia", "pelu"] },
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
        { id: "s4-b-1", type: "multiple_choice_image", nahuat_word: "Kal", spanish_translation: "Casa", pronunciationText: "kal",
          image_url: "/assets/images/kal_exercise.png", instruction: "Mira la imagen y elige la palabra correcta en Náhuat:",
          options: [{ id: "a", text: "Agua", correct: false },{ id: "b", text: "Kal", correct: true },{ id: "c", text: "Pelu", correct: false },{ id: "d", text: "Sol", correct: false }] },
        { id: "s4-b-2", type: "multiple_choice_image", nahuat_word: "Pelu", spanish_translation: "Perro", pronunciationText: "pe lu",
          image_url: "/assets/images/pelu_exercise.png", instruction: "Mira la imagen y elige la palabra correcta en Náhuat:",
          options: [{ id: "a", text: "Mistun", correct: false },{ id: "b", text: "Pelu", correct: true },{ id: "c", text: "Kal", correct: false },{ id: "d", text: "Árbol", correct: false }] },
        { id: "s4-b-3", type: "multiple_choice_text", nahuat_word: "Metzi", spanish_translation: "Luna", pronunciationText: "met si",
          options: [{ id: "a", text: "Sol", correct: false },{ id: "b", text: "Estrella", correct: false },{ id: "c", text: "Luna", correct: true },{ id: "d", text: "Agua", correct: false }] },
        { id: "s4-b-4", type: "matching", instruction: "Une cada palabra del entorno",
          pairs: [{ nahuat: "Kal", spanish: "Casa" },{ nahuat: "At", spanish: "Agua" },{ nahuat: "Kwawit", spanish: "Árbol" },{ nahuat: "Tunal", spanish: "Sol" }] },
        { id: "s4-b-5", type: "matching", instruction: "Une animales y cielo",
          pairs: [{ nahuat: "Pelu", spanish: "Perro" },{ nahuat: "Mistun", spanish: "Gato" },{ nahuat: "Metzi", spanish: "Luna" }] },
        { id: "s4-b-6", type: "build_sentence", instruction: "Ordena: 'Yo tengo casa'", spanish_translation: "Yo tengo casa",
          word_bank: ["kal", "Naja", "nikpia"], correct_order: ["Naja", "nikpia", "kal"] },
        { id: "s4-b-7", type: "multiple_choice_image", nahuat_word: "Kwawit", spanish_translation: "Árbol / Leña", pronunciationText: "kua uit",
          image_url: "/assets/images/kwawit_exercise.png", instruction: "Mira la imagen y elige la palabra correcta en Náhuat:",
          options: [{ id: "a", text: "Agua", correct: false },{ id: "b", text: "Kwawit", correct: true },{ id: "c", text: "Kal", correct: false },{ id: "d", text: "Perro", correct: false }] },
        { id: "s4-b-8", type: "multiple_choice_text", nahuat_word: "Tunal", spanish_translation: "Sol", pronunciationText: "tu nal",
          options: [{ id: "a", text: "Luna", correct: false },{ id: "b", text: "Sol", correct: true },{ id: "c", text: "Agua", correct: false },{ id: "d", text: "Árbol", correct: false }] },
        { id: "s4-b-9", type: "build_sentence", instruction: "Ordena: 'Yo tengo perro'", spanish_translation: "Yo tengo perro",
          word_bank: ["pelu", "Naja", "nikpia"], correct_order: ["Naja", "nikpia", "pelu"] },
        { id: "s4-b-10", type: "multiple_choice_image", nahuat_word: "Mistun", spanish_translation: "Gato", pronunciationText: "mis tun",
          image_url: "/assets/images/mistun_exercise.png", instruction: "Mira la imagen y elige la palabra correcta en Náhuat:",
          options: [{ id: "a", text: "Pelu", correct: false },{ id: "b", text: "Luna", correct: false },{ id: "c", text: "Mistun", correct: true },{ id: "d", text: "Sol", correct: false }] },
      ],
    },
  };

export default section4;
