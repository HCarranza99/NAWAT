/**
 * Base de datos de lecciones - Sistema de Aprendizaje Náhuat
 *
 * Tipos de items disponibles:
 * - flashcard: Muestra palabra + traducción, el usuario la memoriza
 * - multiple_choice_text: Elige la traducción correcta entre opciones de texto
 * - matching: Une pares de palabras Náhuat ↔ Español
 * - build_sentence: Ordena palabras para formar una oración
 *
 * ============================================================
 *  NAWAT — Nivel 1: Lecciones 1–5
 *
 *  Notas lingüísticas:
 *  - "ni-" es el prefijo de 1.ª persona singular (yo).
 *    nikuchi → yo duermo | kuchi → él/ella duerme
 *  - "nu-" es el prefijo posesivo (mi).
 *    nuteku → mi papá | nupelu → mi perro
 *  - "ne" es el artículo determinado (el/la).
 *  - "wan" es la conjunción copulativa (y).
 *  - "tik" es la preposición de lugar (en / dentro de).
 *  - "ajwiak" y "nitakwa/takwa" aparecen en L2 y L4 de forma
 *    intuitiva (estilo Duolingo) antes de ser enseñados
 *    formalmente en L5.
 * ============================================================
 */

const lessons = [

  // ============================================================
  //  LECCIÓN 1 — Cortesía y Saludos
  // ============================================================
  {
    id: 1,
    title: "Cortesía y Saludos",
    icon: "👋",
    description: "Saluda y agradece desde el primer minuto",
    color: "#E65100",
    xpReward: 100,
    items: [

      // ── FLASHCARDS ─────────────────────────────────────────
      {
        id: "1-1",
        type: "flashcard",
        nahuat_word: "Ken tinemi?",
        spanish_translation: "¿Cómo estás?",
        pronunciation: "ken ti-NE-mi",
        example_sentence: "Ken tinemi, taja?",
        example_translation: "¿Cómo estás, tú?",
      },
      {
        id: "1-2",
        type: "flashcard",
        nahuat_word: "Naja ninemi yek",
        spanish_translation: "Yo estoy bien",
        pronunciation: "NA-ja ni-NE-mi yek",
      },
      {
        id: "1-3",
        type: "flashcard",
        nahuat_word: "Padiush",
        spanish_translation: "Gracias",
        pronunciation: "pa-DIUSH",
      },
      {
        id: "1-4",
        type: "flashcard",
        nahuat_word: "Tesu datka",
        spanish_translation: "¡De nada!",
        pronunciation: "TE-su DAT-ka",
      },
      {
        id: "1-5",
        type: "flashcard",
        nahuat_word: "Niawa",
        spanish_translation: "Adiós (me voy)",
        pronunciation: "NI-a-wa",
      },
      {
        id: "1-6",
        type: "flashcard",
        nahuat_word: "Shiawa",
        spanish_translation: "Adiós (me quedo)",
        pronunciation: "SHI-a-wa",
      },

      // ── MULTIPLE CHOICE ────────────────────────────────────
      {
        id: "1-7",
        type: "multiple_choice_text",
        nahuat_word: "Ken tinemi?",
        spanish_translation: "¿Cómo estás?",
        pronunciation: "ken ti-NE-mi",
        options: [
          { id: "a", text: "¿Cómo estás?", correct: true  },
          { id: "b", text: "Adiós",         correct: false },
          { id: "c", text: "Gracias",       correct: false },
          { id: "d", text: "De nada",       correct: false },
        ],
      },
      {
        id: "1-8",
        type: "multiple_choice_text",
        nahuat_word: "Padiush",
        spanish_translation: "Gracias",
        pronunciation: "pa-DIUSH",
        options: [
          { id: "a", text: "Adiós",         correct: false },
          { id: "b", text: "Yo estoy bien", correct: false },
          { id: "c", text: "Gracias",       correct: true  },
          { id: "d", text: "De nada",       correct: false },
        ],
      },
      {
        id: "1-9",
        type: "multiple_choice_text",
        nahuat_word: "Tesu datka",
        spanish_translation: "De nada",
        pronunciation: "TE-su DAT-ka",
        options: [
          { id: "a", text: "Gracias",       correct: false },
          { id: "b", text: "De nada",       correct: true  },
          { id: "c", text: "¿Cómo estás?",  correct: false },
          { id: "d", text: "Adiós",         correct: false },
        ],
      },
      {
        id: "1-10",
        type: "multiple_choice_text",
        nahuat_word: "Niawa",
        spanish_translation: "Adiós (me voy)",
        pronunciation: "NI-a-wa",
        options: [
          { id: "a", text: "Gracias",        correct: false },
          { id: "b", text: "Yo estoy bien",  correct: false },
          { id: "c", text: "De nada",        correct: false },
          { id: "d", text: "Adiós (me voy)", correct: true  },
        ],
      },

      // ── MATCHING ───────────────────────────────────────────
      {
        id: "1-11",
        type: "matching",
        instruction: "Une cada palabra náhuat con su significado",
        pairs: [
          { nahuat: "Padiush",     spanish: "Gracias"      },
          { nahuat: "Ken tinemi?", spanish: "¿Cómo estás?" },
          { nahuat: "Naja",        spanish: "Yo"           },
          { nahuat: "Niawa",       spanish: "Me voy"       },
        ],
      },
      {
        id: "1-12",
        type: "matching",
        instruction: "Une cada expresión náhuat con su significado",
        pairs: [
          { nahuat: "Tesu datka", spanish: "De nada"    },
          { nahuat: "Shiawa",     spanish: "Adiós (me quedo)"  },
          { nahuat: "Ninemi yek", spanish: "Estoy bien" },
          { nahuat: "Padiush",    spanish: "Gracias"    },
        ],
      },

      // ── BUILD SENTENCE ─────────────────────────────────────
      {
        id: "1-13",
        type: "build_sentence",
        instruction: "Ordena las palabras para formar la frase correcta",
        spanish_translation: "Yo estoy bien",
        word_bank:     ["ninemi", "yek", "Naja"],
        correct_order: ["Naja", "ninemi", "yek"],
      },
      {
        id: "1-14",
        type: "build_sentence",
        instruction: "Ordena las palabras para formar la frase correcta",
        spanish_translation: "De nada, adiós (me voy)",
        word_bank:     ["niawa", "Tesu", "datka,"],
        correct_order: ["Tesu", "datka,", "niawa"],
      },
      {
        id: "1-15",
        type: "build_sentence",
        instruction: "Ordena las palabras para formar la frase correcta",
        spanish_translation: "Gracias, yo estoy bien",
        word_bank:     ["naja", "yek", "Padiush,", "ninemi"],
        correct_order: ["Padiush,", "naja", "ninemi", "yek"],
      },
    ],
  },

  // ============================================================
  //  LECCIÓN 2 — Ne Takwal: La Comida de Todos los Días
  // ============================================================
  {
    id: 2,
    title: "Ne Takwal — La Comida",
    icon: "🌽",
    description: "Usa nombres náhuat en la mesa familiar",
    color: "#388E3C",
    xpReward: 100,
    items: [

      // ── FLASHCARDS ─────────────────────────────────────────
      {
        id: "2-1",
        type: "flashcard",
        nahuat_word: "Atutun",
        spanish_translation: "Café / Agua caliente",
        pronunciation: "a-TU-tun",
      },
      {
        id: "2-2",
        type: "flashcard",
        nahuat_word: "Kukumutzin",
        spanish_translation: "Pupusa",
        pronunciation: "ku-ku-MU-tzin",
      },
      {
        id: "2-3",
        type: "flashcard",
        nahuat_word: "Tamal",
        spanish_translation: "Tortilla",
        pronunciation: "ta-MAL",
      },
      {
        id: "2-4",
        type: "flashcard",
        nahuat_word: "Et",
        spanish_translation: "Frijoles",
        pronunciation: "ET",
      },
      {
        id: "2-5",
        type: "flashcard",
        nahuat_word: "At",
        spanish_translation: "Agua",
        pronunciation: "AT",
      },
      {
        id: "2-6",
        type: "flashcard",
        nahuat_word: "Wan",
        spanish_translation: "Y (conjunción)",
        pronunciation: "WAN",
        example_sentence: "At wan atutun",
        example_translation: "Agua y café",
      },

      // ── MULTIPLE CHOICE ────────────────────────────────────
      {
        id: "2-7",
        type: "multiple_choice_text",
        nahuat_word: "Kukumutzin",
        spanish_translation: "Pupusa",
        pronunciation: "ku-ku-MU-tzin",
        options: [
          { id: "a", text: "Tortilla", correct: false },
          { id: "b", text: "Pupusa",   correct: true  },
          { id: "c", text: "Frijoles", correct: false },
          { id: "d", text: "Café",     correct: false },
        ],
      },
      {
        id: "2-8",
        type: "multiple_choice_text",
        nahuat_word: "Atutun",
        spanish_translation: "Café / Agua caliente",
        pronunciation: "a-TU-tun",
        options: [
          { id: "a", text: "Agua",     correct: false },
          { id: "b", text: "Frijoles", correct: false },
          { id: "c", text: "Tortilla", correct: false },
          { id: "d", text: "Café",     correct: true  },
        ],
      },
      {
        id: "2-9",
        type: "multiple_choice_text",
        nahuat_word: "Et",
        spanish_translation: "Frijoles",
        pronunciation: "ET",
        options: [
          { id: "a", text: "Frijoles", correct: true  },
          { id: "b", text: "Agua",     correct: false },
          { id: "c", text: "Pupusa",   correct: false },
          { id: "d", text: "Café",     correct: false },
        ],
      },
      {
        id: "2-10",
        type: "multiple_choice_text",
        nahuat_word: "At",
        spanish_translation: "Agua",
        pronunciation: "AT",
        options: [
          { id: "a", text: "Café",     correct: false },
          { id: "b", text: "Tortilla", correct: false },
          { id: "c", text: "Agua",     correct: true  },
          { id: "d", text: "Frijoles", correct: false },
        ],
      },

      // ── MATCHING ───────────────────────────────────────────
      {
        id: "2-11",
        type: "matching",
        instruction: "Une cada alimento con su nombre en náhuat",
        pairs: [
          { nahuat: "Atutun",     spanish: "Café"     },
          { nahuat: "Kukumutzin", spanish: "Pupusa"   },
          { nahuat: "Tamal",      spanish: "Tortilla" },
          { nahuat: "Et",         spanish: "Frijoles" },
        ],
      },
      {
        id: "2-12",
        type: "matching",
        instruction: "Une cada palabra con su significado",
        pairs: [
          { nahuat: "At",     spanish: "Agua"     },
          { nahuat: "Wan",    spanish: "Y"        },
          { nahuat: "Atutun", spanish: "Café"     },
          { nahuat: "Tamal",  spanish: "Tortilla" },
        ],
      },

      // ── BUILD SENTENCE ─────────────────────────────────────
      {
        id: "2-13",
        type: "build_sentence",
        instruction: "Ordena las palabras para formar la frase correcta",
        spanish_translation: "Agua y café",
        word_bank:     ["wan", "atutun", "At"],
        correct_order: ["At", "wan", "atutun"],
      },
      {
        id: "2-14",
        type: "build_sentence",
        // "ajwiak" (rico) aparece aquí de forma intuitiva —
        // se aprende por contexto antes de ser enseñado formalmente.
        instruction: "Ordena las palabras para formar la frase correcta",
        spanish_translation: "El café es rico",
        word_bank:     ["ne", "atutun", "Ajwiak"],
        correct_order: ["Ajwiak", "ne", "atutun"],
      },
      {
        id: "2-15",
        type: "build_sentence",
        // "nitakwa" (yo como) también aparece aquí
        // antes de su enseñanza formal en L5.
        instruction: "Ordena las palabras para formar la frase correcta",
        spanish_translation: "Yo como tortilla",
        word_bank:     ["nitakwa", "tamal", "Naja"],
        correct_order: ["Naja", "nitakwa", "tamal"],
      },
    ],
  },

  // ============================================================
  //  LECCIÓN 3 — Mi Entorno y Mi Familia
  // ============================================================
  {
    id: 3,
    title: "Mi Entorno y Mi Familia",
    icon: "🏡",
    description: "Identifica a los miembros del hogar",
    color: "#1565C0",
    xpReward: 100,
    items: [

      // ── FLASHCARDS ─────────────────────────────────────────
      {
        id: "3-1",
        type: "flashcard",
        nahuat_word: "Nukal",
        spanish_translation: "Mi casa",
        pronunciation: "nu-KAL",
        example_sentence: "Ne nukal",
        example_translation: "Mi casa (lit. la mi-casa)",
      },
      {
        id: "3-2",
        type: "flashcard",
        nahuat_word: "Nantzin",
        spanish_translation: "Señora / Madre",
        pronunciation: "NAN-tzin",
      },
      {
        id: "3-3",
        type: "flashcard",
        nahuat_word: "Nuteku",
        spanish_translation: "Mi papá",
        pronunciation: "nu-TE-ku",
      },
      {
        id: "3-4",
        type: "flashcard",
        nahuat_word: "Nunan",
        spanish_translation: "Mi mamá",
        pronunciation: "nu-NAN",
      },
      {
        id: "3-5",
        type: "flashcard",
        nahuat_word: "Kunet",
        spanish_translation: "Niño / Bebé",
        pronunciation: "ku-NET",
      },

      // ── MULTIPLE CHOICE ────────────────────────────────────
      {
        id: "3-6",
        type: "multiple_choice_text",
        nahuat_word: "Nukal",
        spanish_translation: "Mi casa",
        pronunciation: "nu-KAL",
        options: [
          { id: "a", text: "Mi mamá", correct: false },
          { id: "b", text: "Mi papá", correct: false },
          { id: "c", text: "Mi casa", correct: true  },
          { id: "d", text: "El bebé", correct: false },
        ],
      },
      {
        id: "3-7",
        type: "multiple_choice_text",
        nahuat_word: "Nuteku",
        spanish_translation: "Mi papá",
        pronunciation: "nu-TE-ku",
        options: [
          { id: "a", text: "Mi papá", correct: true  },
          { id: "b", text: "Mi casa", correct: false },
          { id: "c", text: "Mi mamá", correct: false },
          { id: "d", text: "Señora",  correct: false },
        ],
      },
      {
        id: "3-8",
        type: "multiple_choice_text",
        nahuat_word: "Nantzin",
        spanish_translation: "Señora / Madre",
        pronunciation: "NAN-tzin",
        options: [
          { id: "a", text: "Mi papá", correct: false },
          { id: "b", text: "Mi casa", correct: false },
          { id: "c", text: "Bebé",    correct: false },
          { id: "d", text: "Señora",  correct: true  },
        ],
      },
      {
        id: "3-9",
        type: "multiple_choice_text",
        nahuat_word: "Kunet",
        spanish_translation: "Niño / Bebé",
        pronunciation: "ku-NET",
        options: [
          { id: "a", text: "Bebé",    correct: true  },
          { id: "b", text: "Mi mamá", correct: false },
          { id: "c", text: "Mi papá", correct: false },
          { id: "d", text: "Mi casa", correct: false },
        ],
      },

      // ── MATCHING ───────────────────────────────────────────
      {
        id: "3-10",
        type: "matching",
        instruction: "Une cada palabra con su significado",
        pairs: [
          { nahuat: "Nunan",   spanish: "Mi mamá" },
          { nahuat: "Nukal",   spanish: "Mi casa" },
          { nahuat: "Kunet",   spanish: "Bebé"    },
          { nahuat: "Nantzin", spanish: "Señora"  },
        ],
      },
      {
        id: "3-11",
        type: "matching",
        instruction: "Une cada palabra con su significado",
        pairs: [
          { nahuat: "Nuteku", spanish: "Mi papá"     },
          { nahuat: "Kal",    spanish: "Casa"        },
          { nahuat: "Nemi",   spanish: "Está / Vive" },
          { nahuat: "Wan",    spanish: "Y"           },
        ],
      },

      // ── BUILD SENTENCE ─────────────────────────────────────
      {
        id: "3-12",
        type: "build_sentence",
        instruction: "Ordena las palabras para formar la frase correcta",
        spanish_translation: "El bebé está bien",
        word_bank:     ["nemi", "kunet", "yek", "Ne"],
        correct_order: ["Ne", "kunet", "nemi", "yek"],
      },
      {
        id: "3-13",
        type: "build_sentence",
        instruction: "Ordena las palabras para formar la frase correcta",
        spanish_translation: "Mi papá y mi mamá",
        word_bank:     ["nuteku", "ne", "nunan", "Ne", "wan"],
        correct_order: ["Ne", "nuteku", "wan", "ne", "nunan"],
      },
      {
        id: "3-14",
        type: "build_sentence",
        instruction: "Ordena las palabras para formar la frase correcta",
        spanish_translation: "Yo y mi papá",
        word_bank:     ["wan", "Naja", "nuteku"],
        correct_order: ["Naja", "wan", "nuteku"],
      },
      {
        id: "3-15",
        type: "build_sentence",
        instruction: "Ordena las palabras para formar la frase correcta",
        spanish_translation: "La señora está bien",
        word_bank:     ["nemi", "Ne", "yek", "nantzin"],
        correct_order: ["Ne", "nantzin", "nemi", "yek"],
      },
    ],
  },

  // ============================================================
  //  LECCIÓN 4 — Los Animales de la Casa
  // ============================================================
  {
    id: 4,
    title: "Los Animales de la Casa",
    icon: "🐾",
    description: "Nombra mascotas y animales de granja",
    color: "#6A1B9A",
    xpReward: 100,
    items: [

      // ── FLASHCARDS ─────────────────────────────────────────
      {
        id: "4-1",
        type: "flashcard",
        nahuat_word: "Pelu",
        spanish_translation: "Perro",
        pronunciation: "PE-lu",
      },
      {
        id: "4-2",
        type: "flashcard",
        nahuat_word: "Mistun",
        spanish_translation: "Gato",
        pronunciation: "MIS-tun",
      },
      {
        id: "4-3",
        type: "flashcard",
        nahuat_word: "Tijlan",
        spanish_translation: "Gallina",
        pronunciation: "TIJ-lan",
      },
      {
        id: "4-4",
        type: "flashcard",
        nahuat_word: "Kuyamet",
        spanish_translation: "Cerdo",
        pronunciation: "ku-YA-met",
      },
      {
        id: "4-5",
        type: "flashcard",
        nahuat_word: "Nupelu",
        spanish_translation: "Mi perro",
        pronunciation: "nu-PE-lu",
        example_sentence: "Ne nupelu nemi yek.",
        example_translation: "Mi perro está bien.",
      },

      // ── MULTIPLE CHOICE ────────────────────────────────────
      {
        id: "4-6",
        type: "multiple_choice_text",
        nahuat_word: "Pelu",
        spanish_translation: "Perro",
        pronunciation: "PE-lu",
        options: [
          { id: "a", text: "Gato",    correct: false },
          { id: "b", text: "Perro",   correct: true  },
          { id: "c", text: "Gallina", correct: false },
          { id: "d", text: "Cerdo",   correct: false },
        ],
      },
      {
        id: "4-7",
        type: "multiple_choice_text",
        nahuat_word: "Mistun",
        spanish_translation: "Gato",
        pronunciation: "MIS-tun",
        options: [
          { id: "a", text: "Perro",   correct: false },
          { id: "b", text: "Cerdo",   correct: false },
          { id: "c", text: "Gato",    correct: true  },
          { id: "d", text: "Gallina", correct: false },
        ],
      },
      {
        id: "4-8",
        type: "multiple_choice_text",
        nahuat_word: "Tijlan",
        spanish_translation: "Gallina",
        pronunciation: "TIJ-lan",
        options: [
          { id: "a", text: "Gallina", correct: true  },
          { id: "b", text: "Gato",    correct: false },
          { id: "c", text: "Cerdo",   correct: false },
          { id: "d", text: "Perro",   correct: false },
        ],
      },
      {
        id: "4-9",
        type: "multiple_choice_text",
        nahuat_word: "Kuyamet",
        spanish_translation: "Cerdo",
        pronunciation: "ku-YA-met",
        options: [
          { id: "a", text: "Gallina", correct: false },
          { id: "b", text: "Perro",   correct: false },
          { id: "c", text: "Gato",    correct: false },
          { id: "d", text: "Cerdo",   correct: true  },
        ],
      },

      // ── MATCHING ───────────────────────────────────────────
      {
        id: "4-10",
        type: "matching",
        instruction: "Une cada animal con su nombre en náhuat",
        pairs: [
          { nahuat: "Pelu",    spanish: "Perro"   },
          { nahuat: "Mistun",  spanish: "Gato"    },
          { nahuat: "Tijlan",  spanish: "Gallina" },
          { nahuat: "Kuyamet", spanish: "Cerdo"   },
        ],
      },
      {
        id: "4-11",
        type: "matching",
        instruction: "Une cada palabra con su significado",
        pairs: [
          { nahuat: "Nupelu", spanish: "Mi perro" },
          { nahuat: "Takwa",  spanish: "Come"     },
          { nahuat: "Mistun", spanish: "Gato"     },
          { nahuat: "Tijlan", spanish: "Gallina"  },
        ],
      },

      // ── BUILD SENTENCE ─────────────────────────────────────
      {
        id: "4-12",
        type: "build_sentence",
        instruction: "Ordena las palabras para formar la frase correcta",
        spanish_translation: "El perro y el gato",
        word_bank:     ["pelu", "ne", "mistun", "Ne", "wan"],
        correct_order: ["Ne", "pelu", "wan", "ne", "mistun"],
      },
      {
        id: "4-13",
        type: "build_sentence",
        instruction: "Ordena las palabras para formar la frase correcta",
        spanish_translation: "El gato come",
        word_bank:     ["takwa", "mistun", "Ne"],
        correct_order: ["Ne", "mistun", "takwa"],
      },
      {
        id: "4-14",
        type: "build_sentence",
        instruction: "Ordena las palabras para formar la frase correcta",
        spanish_translation: "La gallina y el cerdo",
        word_bank:     ["tijlan", "ne", "kuyamet", "Ne", "wan"],
        correct_order: ["Ne", "tijlan", "wan", "ne", "kuyamet"],
      },
      {
        id: "4-15",
        type: "build_sentence",
        // Combina el prefijo posesivo "nu-" aprendido en L3
        // con el animal aprendido en esta lección.
        instruction: "Ordena las palabras para formar la frase correcta",
        spanish_translation: "Mi perro está bien",
        word_bank:     ["nemi", "Ne", "nupelu", "yek"],
        correct_order: ["Ne", "nupelu", "nemi", "yek"],
      },
    ],
  },

  // ============================================================
  //  LECCIÓN 5 — Acciones Cotidianas
  // ============================================================
  {
    id: 5,
    title: "Acciones Cotidianas",
    icon: "⚡",
    description: "Primer contacto con los verbos de rutina",
    color: "#C62828",
    xpReward: 100,
    items: [

      // ── FLASHCARDS ─────────────────────────────────────────
      {
        id: "5-1",
        type: "flashcard",
        nahuat_word: "Nikuchi",
        spanish_translation: "Yo duermo",
        pronunciation: "ni-KU-chi",
      },
      {
        id: "5-2",
        type: "flashcard",
        nahuat_word: "Nisa",
        spanish_translation: "Yo me despierto",
        pronunciation: "NI-sa",
      },
      {
        id: "5-3",
        type: "flashcard",
        nahuat_word: "Nitakwa",
        spanish_translation: "Yo como",
        pronunciation: "ni-TAK-wa",
      },
      {
        id: "5-4",
        type: "flashcard",
        nahuat_word: "Nitekiti",
        spanish_translation: "Yo trabajo",
        pronunciation: "ni-te-KI-ti",
      },
      {
        id: "5-5",
        type: "flashcard",
        nahuat_word: "Tik",
        spanish_translation: "En / Dentro de",
        pronunciation: "TIK",
        example_sentence: "Tik ne kal",
        example_translation: "En la casa",
      },

      // ── MULTIPLE CHOICE ────────────────────────────────────
      {
        id: "5-6",
        type: "multiple_choice_text",
        nahuat_word: "Nikuchi",
        spanish_translation: "Yo duermo",
        pronunciation: "ni-KU-chi",
        options: [
          { id: "a", text: "Yo trabajo",      correct: false },
          { id: "b", text: "Yo como",         correct: false },
          { id: "c", text: "Yo duermo",       correct: true  },
          { id: "d", text: "Me despierto",    correct: false },
        ],
      },
      {
        id: "5-7",
        type: "multiple_choice_text",
        nahuat_word: "Nisa",
        spanish_translation: "Yo me despierto",
        pronunciation: "NI-sa",
        options: [
          { id: "a", text: "Yo duermo",       correct: false },
          { id: "b", text: "Yo me despierto", correct: true  },
          { id: "c", text: "Yo trabajo",      correct: false },
          { id: "d", text: "Yo como",         correct: false },
        ],
      },
      {
        id: "5-8",
        type: "multiple_choice_text",
        nahuat_word: "Nitakwa",
        spanish_translation: "Yo como",
        pronunciation: "ni-TAK-wa",
        options: [
          { id: "a", text: "Yo como",         correct: true  },
          { id: "b", text: "Yo duermo",       correct: false },
          { id: "c", text: "Yo trabajo",      correct: false },
          { id: "d", text: "Me despierto",    correct: false },
        ],
      },
      {
        id: "5-9",
        type: "multiple_choice_text",
        nahuat_word: "Nitekiti",
        spanish_translation: "Yo trabajo",
        pronunciation: "ni-te-KI-ti",
        options: [
          { id: "a", text: "Yo como",         correct: false },
          { id: "b", text: "Yo duermo",       correct: false },
          { id: "c", text: "Me despierto",    correct: false },
          { id: "d", text: "Yo trabajo",      correct: true  },
        ],
      },

      // ── MATCHING ───────────────────────────────────────────
      {
        id: "5-10",
        type: "matching",
        instruction: "Une cada verbo náhuat (1.ª persona) con su significado",
        pairs: [
          { nahuat: "Nikuchi",  spanish: "Yo duermo"   },
          { nahuat: "Nisa",     spanish: "Me despierto" },
          { nahuat: "Nitakwa",  spanish: "Yo como"     },
          { nahuat: "Nitekiti", spanish: "Yo trabajo"  },
        ],
      },
      {
        id: "5-11",
        type: "matching",
        // Formas de 3.ª persona: quitas el prefijo "ni-"
        instruction: "Une cada forma verbal (3.ª persona) con su significado",
        pairs: [
          { nahuat: "Kuchi",  spanish: "Duerme"  },
          { nahuat: "Tekiti", spanish: "Trabaja" },
          { nahuat: "Tik",    spanish: "En"      },
          { nahuat: "Takwa",  spanish: "Come"    },
        ],
      },

      // ── BUILD SENTENCE ─────────────────────────────────────
      {
        id: "5-12",
        type: "build_sentence",
        instruction: "Ordena las palabras para formar la frase correcta",
        spanish_translation: "Yo me despierto y yo como",
        word_bank:     ["nisa", "nitakwa", "Naja", "wan"],
        correct_order: ["Naja", "nisa", "wan", "nitakwa"],
      },
      {
        id: "5-13",
        type: "build_sentence",
        instruction: "Ordena las palabras para formar la frase correcta",
        spanish_translation: "Yo como pupusas",
        word_bank:     ["kukumutzin", "Naja", "nitakwa"],
        correct_order: ["Naja", "nitakwa", "kukumutzin"],
      },
      {
        id: "5-14",
        type: "build_sentence",
        // "nuteku" (L3) + verbo sin prefijo "ni-" → 3.ª persona
        instruction: "Ordena las palabras para formar la frase correcta",
        spanish_translation: "Mi papá trabaja",
        word_bank:     ["tekiti", "Ne", "nuteku"],
        correct_order: ["Ne", "nuteku", "tekiti"],
      },
      {
        id: "5-15",
        type: "build_sentence",
        // Gran reto final: une vocabulario de L1–L5
        instruction: "Ordena las palabras para formar la frase correcta",
        spanish_translation: "El perro duerme en la casa",
        word_bank:     ["kuchi", "ne", "kal", "Ne", "tik", "pelu"],
        correct_order: ["Ne", "pelu", "kuchi", "tik", "ne", "kal"],
      },
    ],
  },

];

export default lessons;
