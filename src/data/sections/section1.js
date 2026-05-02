/**
 * ═══════════════════════════════════════════════════════════
 *  SECCIÓN 1 — Gancho de la App
 * ═══════════════════════════════════════════════════════════
 */

const section1 = {
    id: 1,
    title: "Primeros Pasos",
    description: "Descubre los sonidos y las palabras más útiles del náhuat",
    icon: "🌱",
    color: "#2D6A4F",

    lessons: [

      // ──────────────────────────────────────────────────────
      //  LECCIÓN 1 — Primer contacto con el sonido
      // ──────────────────────────────────────────────────────
      {
        id: "s1-l1",
        title: "Los sonidos del Náhuat",
        icon: "🔤",
        description: "Escucha y reconoce 3 sonidos únicos",
        color: "#E65100",
        xpReward: 50,
        items: [
          // 1. Flashcard — sonido Kw
          {
            id: "s1-l1-1",
            type: "flashcard",
            nahuat_word: "Kw",
            spanish_translation: "Sonido \"kw\" — como en \"cuál\"",
            pronunciation: "kwa",
            pronunciationText: "kua",
            example_sentence: "Kwitawal",
            example_translation: "Nombre propio (ejemplo del sonido Kw)",
          },
          // 2. Flashcard — sonido Tz
          {
            id: "s1-l1-2",
            type: "flashcard",
            nahuat_word: "Tz",
            spanish_translation: "Sonido \"tz\" — como en \"pizza\"",
            pronunciation: "tsa",
            pronunciationText: "tsa",
            example_sentence: "Tzaput",
            example_translation: "Zapote (fruta)",
          },
          // 3. Flashcard — sonido Sh
          {
            id: "s1-l1-3",
            type: "flashcard",
            nahuat_word: "Sh",
            spanish_translation: "Sonido \"sh\" — como en \"shh\" (silencio)",
            pronunciation: "shi",
            pronunciationText: "shi",
            example_sentence: "Shiwit",
            example_translation: "Hierba / Año",
          },
          // 4. Multiple choice — ¿Cuál palabra tiene el sonido Kw?
          {
            id: "s1-l1-4",
            type: "multiple_choice_text",
            nahuat_word: "Kwitawal",
            spanish_translation: "Contiene el sonido Kw",
            pronunciation: "kwi-ta-wal",
            pronunciationText: "kui ta ual",
            options: [
              { id: "a", text: "Kwitawal", correct: true },
              { id: "b", text: "Tzaput", correct: false },
              { id: "c", text: "Shiwit", correct: false },
              { id: "d", text: "Tamal", correct: false },
            ],
            instruction: "¿Cuál palabra tiene el sonido Kw?",
          },
          // 5. Matching — unir sonido con ejemplo
          {
            id: "s1-l1-5",
            type: "matching",
            instruction: "Une cada sonido con su palabra ejemplo",
            pairs: [
              { nahuat: "Kw", spanish: "Kwitawal" },
              { nahuat: "Tz", spanish: "Tzaput" },
              { nahuat: "Sh", spanish: "Shiwit" },
            ],
          },
          // 6. Multiple choice — reconocimiento auditivo
          {
            id: "s1-l1-6",
            type: "multiple_choice_text",
            nahuat_word: "Tzaput",
            spanish_translation: "Zapote",
            pronunciation: "tza-put",
            pronunciationText: "tsa put",
            options: [
              { id: "a", text: "Hierba", correct: false },
              { id: "b", text: "Zapote", correct: true },
              { id: "c", text: "Tortilla", correct: false },
              { id: "d", text: "Agua", correct: false },
            ],
          },
          // 7. Multiple choice — cierre
          {
            id: "s1-l1-7",
            type: "multiple_choice_text",
            nahuat_word: "Shiwit",
            spanish_translation: "Hierba / Año",
            pronunciation: "shi-wit",
            pronunciationText: "shi uit",
            options: [
              { id: "a", text: "Zapote", correct: false },
              { id: "b", text: "Tortilla", correct: false },
              { id: "c", text: "Hierba / Año", correct: true },
              { id: "d", text: "Agua caliente", correct: false },
            ],
          },
        ],
      },

      // ──────────────────────────────────────────────────────
      //  LECCIÓN 2 — Saludo básico
      // ──────────────────────────────────────────────────────
      {
        id: "s1-l2",
        title: "Saludos del Día",
        icon: "☀️",
        description: "Aprende a saludar en náhuat",
        color: "#F4A261",
        xpReward: 50,
        items: [
          // 1. Flashcard — Yek tunal
          {
            id: "s1-l2-1",
            type: "flashcard",
            nahuat_word: "Yek tunal",
            spanish_translation: "Buenos días",
            pronunciation: "yek tu-nal",
            pronunciationText: "yek tu nal",
          },
          // 2. Flashcard — Yek peyna
          {
            id: "s1-l2-2",
            type: "flashcard",
            nahuat_word: "Yek peyna",
            spanish_translation: "Buenas tardes / Buenas (temprano)",
            pronunciation: "yek pei-na",
            pronunciationText: "yek peina",
          },
          // 3. Multiple choice — audio + elección
          {
            id: "s1-l2-3",
            type: "multiple_choice_text",
            nahuat_word: "Yek tunal",
            spanish_translation: "Buenos días",
            pronunciation: "yek tu-nal",
            pronunciationText: "yek tu nal",
            options: [
              { id: "a", text: "Buenos días", correct: true },
              { id: "b", text: "Buenas noches", correct: false },
              { id: "c", text: "Gracias", correct: false },
              { id: "d", text: "Adiós", correct: false },
            ],
          },
          // 4. Multiple choice — Yek peyna
          {
            id: "s1-l2-4",
            type: "multiple_choice_text",
            nahuat_word: "Yek peyna",
            spanish_translation: "Buenas tardes",
            pronunciation: "yek pei-na",
            pronunciationText: "yek peina",
            options: [
              { id: "a", text: "Buenos días", correct: false },
              { id: "b", text: "Buenas tardes", correct: true },
              { id: "c", text: "¿Cómo estás?", correct: false },
              { id: "d", text: "De nada", correct: false },
            ],
          },
          // 5. Matching — saludo ↔ momento del día
          {
            id: "s1-l2-5",
            type: "matching",
            instruction: "Une cada saludo con su momento del día",
            pairs: [
              { nahuat: "Yek tunal", spanish: "Buenos días" },
              { nahuat: "Yek peyna", spanish: "Buenas tardes" },
            ],
          },
          // 6. Build sentence — completar saludo
          {
            id: "s1-l2-6",
            type: "build_sentence",
            instruction: "Ordena las palabras para saludar",
            spanish_translation: "Buenos días",
            word_bank: ["tunal", "Yek"],
            correct_order: ["Yek", "tunal"],
          },
        ],
      },

      // ──────────────────────────────────────────────────────
      //  LECCIÓN 3 — Sí, No y Gracias
      // ──────────────────────────────────────────────────────
      {
        id: "s1-l3",
        title: "Sí, No y Gracias",
        icon: "✋",
        description: "Tres palabras que siempre necesitarás",
        color: "#1565C0",
        xpReward: 50,
        items: [
          // 1. Flashcard — Eje (sí)
          {
            id: "s1-l3-1",
            type: "flashcard",
            nahuat_word: "Eje",
            spanish_translation: "Sí",
            pronunciation: "e-je",
            pronunciationText: "e je",
          },
          // 2. Flashcard — Tesu (no)
          {
            id: "s1-l3-2",
            type: "flashcard",
            nahuat_word: "Tesu",
            spanish_translation: "No",
            pronunciation: "te-su",
            pronunciationText: "te su",
          },
          // 3. Flashcard — Padiush (gracias)
          {
            id: "s1-l3-3",
            type: "flashcard",
            nahuat_word: "Padiush",
            spanish_translation: "Gracias",
            pronunciation: "pa-diush",
            pronunciationText: "pa diush",
          },
          // 4. Multiple choice — Eje
          {
            id: "s1-l3-4",
            type: "multiple_choice_text",
            nahuat_word: "Eje",
            spanish_translation: "Sí",
            pronunciation: "e-je",
            pronunciationText: "e je",
            options: [
              { id: "a", text: "No", correct: false },
              { id: "b", text: "Sí", correct: true },
              { id: "c", text: "Gracias", correct: false },
              { id: "d", text: "Adiós", correct: false },
            ],
          },
          // 5. Matching — las 3 palabras
          {
            id: "s1-l3-5",
            type: "matching",
            instruction: "Une cada palabra con su significado",
            pairs: [
              { nahuat: "Eje", spanish: "Sí" },
              { nahuat: "Tesu", spanish: "No" },
              { nahuat: "Padiush", spanish: "Gracias" },
            ],
          },
          // 6. Multiple choice — contexto: alguien te da algo
          {
            id: "s1-l3-6",
            type: "multiple_choice_text",
            nahuat_word: "Padiush",
            spanish_translation: "Gracias",
            pronunciation: "pa-diush",
            pronunciationText: "pa diush",
            instruction: "Alguien te da un regalo. ¿Qué dices?",
            options: [
              { id: "a", text: "Tesu", correct: false },
              { id: "b", text: "Eje", correct: false },
              { id: "c", text: "Padiush", correct: true },
              { id: "d", text: "Yek tunal", correct: false },
            ],
          },
          // 7. Multiple choice — repaso rápido
          {
            id: "s1-l3-7",
            type: "multiple_choice_text",
            nahuat_word: "Tesu",
            spanish_translation: "No",
            pronunciation: "te-su",
            pronunciationText: "te su",
            options: [
              { id: "a", text: "Sí", correct: false },
              { id: "b", text: "Gracias", correct: false },
              { id: "c", text: "Buenos días", correct: false },
              { id: "d", text: "No", correct: true },
            ],
          },
        ],
      },

      // ──────────────────────────────────────────────────────
      //  LECCIÓN 4 — Mi nombre
      // ──────────────────────────────────────────────────────
      {
        id: "s1-l4",
        title: "Mi Nombre",
        icon: "🙋",
        description: "Preséntate en náhuat",
        color: "#6A1B9A",
        xpReward: 50,
        items: [
          // 1. Flashcard — Naja (yo)
          {
            id: "s1-l4-1",
            type: "flashcard",
            nahuat_word: "Naja",
            spanish_translation: "Yo",
            pronunciation: "na-ja",
            pronunciationText: "na ja",
          },
          // 2. Flashcard — Tukay (nombre / se llama)
          {
            id: "s1-l4-2",
            type: "flashcard",
            nahuat_word: "Tukay",
            spanish_translation: "Nombre / Se llama",
            pronunciation: "tu-kai",
            pronunciationText: "tu kai",
            example_sentence: "Naja nutukay...",
            example_translation: "Yo me llamo...",
          },
          // 3. Multiple choice — Naja
          {
            id: "s1-l4-3",
            type: "multiple_choice_text",
            nahuat_word: "Naja",
            spanish_translation: "Yo",
            pronunciation: "na-ja",
            pronunciationText: "na ja",
            options: [
              { id: "a", text: "Tú", correct: false },
              { id: "b", text: "Él", correct: false },
              { id: "c", text: "Yo", correct: true },
              { id: "d", text: "Nosotros", correct: false },
            ],
          },
          // 4. Multiple choice — Tukay
          {
            id: "s1-l4-4",
            type: "multiple_choice_text",
            nahuat_word: "Tukay",
            spanish_translation: "Nombre / Se llama",
            pronunciation: "tu-kai",
            pronunciationText: "tu kai",
            options: [
              { id: "a", text: "Casa", correct: false },
              { id: "b", text: "Nombre", correct: true },
              { id: "c", text: "Agua", correct: false },
              { id: "d", text: "Comida", correct: false },
            ],
          },
          // 5. Build sentence — "Yo me llamo..."
          {
            id: "s1-l4-5",
            type: "build_sentence",
            instruction: "Ordena las palabras para presentarte",
            spanish_translation: "Yo me llamo (mi nombre es)...",
            word_bank: ["nutukay", "Naja"],
            correct_order: ["Naja", "nutukay"],
          },
          // 6. Matching
          {
            id: "s1-l4-6",
            type: "matching",
            instruction: "Une cada palabra con su significado",
            pairs: [
              { nahuat: "Naja", spanish: "Yo" },
              { nahuat: "Tukay", spanish: "Nombre" },
            ],
          },
        ],
      },
    ],

    // ──────────────────────────────────────────────────────
    //  BOSS DE SECCIÓN 1 — Repaso completo
    // ──────────────────────────────────────────────────────
    boss: {
      id: "s1-boss",
      title: "Boss: Repaso General",
      icon: "👑",
      description: "Demuestra todo lo que aprendiste",
      color: "#C62828",
      xpReward: 100,
      isBoss: true,
      items: [
        // 1. MC — sonido Kw
        {
          id: "s1-b-1",
          type: "multiple_choice_text",
          nahuat_word: "Kwitawal",
          spanish_translation: "Contiene el sonido Kw",
          pronunciation: "kwi-ta-wal",
          pronunciationText: "kui ta ual",
          instruction: "¿Qué sonido especial tiene esta palabra?",
          options: [
            { id: "a", text: "Sh", correct: false },
            { id: "b", text: "Kw", correct: true },
            { id: "c", text: "Tz", correct: false },
            { id: "d", text: "Tl", correct: false },
          ],
        },
        // 2. MC — saludo
        {
          id: "s1-b-2",
          type: "multiple_choice_text",
          nahuat_word: "Yek tunal",
          spanish_translation: "Buenos días",
          pronunciation: "yek tu-nal",
          pronunciationText: "yek tu nal",
          options: [
            { id: "a", text: "Buenas noches", correct: false },
            { id: "b", text: "Buenos días", correct: true },
            { id: "c", text: "Gracias", correct: false },
            { id: "d", text: "Adiós", correct: false },
          ],
        },
        // 3. MC — Eje
        {
          id: "s1-b-3",
          type: "multiple_choice_text",
          nahuat_word: "Eje",
          spanish_translation: "Sí",
          pronunciation: "e-je",
          pronunciationText: "e je",
          options: [
            { id: "a", text: "No", correct: false },
            { id: "b", text: "Gracias", correct: false },
            { id: "c", text: "Sí", correct: true },
            { id: "d", text: "Nombre", correct: false },
          ],
        },
        // 4. MC — Padiush
        {
          id: "s1-b-4",
          type: "multiple_choice_text",
          nahuat_word: "Padiush",
          spanish_translation: "Gracias",
          pronunciation: "pa-diush",
          pronunciationText: "pa diush",
          options: [
            { id: "a", text: "Buenos días", correct: false },
            { id: "b", text: "Sí", correct: false },
            { id: "c", text: "No", correct: false },
            { id: "d", text: "Gracias", correct: true },
          ],
        },
        // 5. Matching — mezcla de todo
        {
          id: "s1-b-5",
          type: "matching",
          instruction: "Une cada palabra con su significado",
          pairs: [
            { nahuat: "Eje", spanish: "Sí" },
            { nahuat: "Tesu", spanish: "No" },
            { nahuat: "Padiush", spanish: "Gracias" },
            { nahuat: "Naja", spanish: "Yo" },
          ],
        },
        // 6. Matching — sonidos y saludos
        {
          id: "s1-b-6",
          type: "matching",
          instruction: "Une cada expresión con su traducción",
          pairs: [
            { nahuat: "Yek tunal", spanish: "Buenos días" },
            { nahuat: "Yek peyna", spanish: "Buenas tardes" },
            { nahuat: "Tukay", spanish: "Nombre" },
          ],
        },
        // 7. Build sentence — saludo
        {
          id: "s1-b-7",
          type: "build_sentence",
          instruction: "Ordena las palabras para saludar correctamente",
          spanish_translation: "Buenos días",
          word_bank: ["tunal", "Yek"],
          correct_order: ["Yek", "tunal"],
        },
        // 8. Build sentence — presentación
        {
          id: "s1-b-8",
          type: "build_sentence",
          instruction: "Ordena las palabras para presentarte",
          spanish_translation: "Yo me llamo...",
          word_bank: ["nutukay", "Naja"],
          correct_order: ["Naja", "nutukay"],
        },
        // 9. MC — Naja
        {
          id: "s1-b-9",
          type: "multiple_choice_text",
          nahuat_word: "Naja",
          spanish_translation: "Yo",
          pronunciation: "na-ja",
          pronunciationText: "na ja",
          options: [
            { id: "a", text: "Tú", correct: false },
            { id: "b", text: "Nosotros", correct: false },
            { id: "c", text: "Yo", correct: true },
            { id: "d", text: "Él", correct: false },
          ],
        },
        // 10. MC — Shiwit (repaso sonidos)
        {
          id: "s1-b-10",
          type: "multiple_choice_text",
          nahuat_word: "Shiwit",
          spanish_translation: "Hierba / Año",
          pronunciation: "shi-wit",
          pronunciationText: "shi uit",
          options: [
            { id: "a", text: "Zapote", correct: false },
            { id: "b", text: "Hierba / Año", correct: true },
            { id: "c", text: "Agua", correct: false },
            { id: "d", text: "Nombre", correct: false },
          ],
        },
      ],
    },
  };

export default section1;
