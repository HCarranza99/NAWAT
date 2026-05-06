/**
 * ═══════════════════════════════════════════════════════════
 *  SECCIÓN 1 — Gancho de la App
 * ═══════════════════════════════════════════════════════════
 *
 *  REGLAS DE PRONUNCIACIÓN (Witzapan / Santo Domingo de Guzmán)
 *  Fuente: YULTAJTAKETZALIS — Sixta Pérez & Héctor Martínez, 2023
 *
 *  K  → G al inicio de palabra, tras N, entre vocales  |  K al final de sílaba
 *  KW → "CUU" (como en "cual" pero alargada)
 *  SH → sonido "sh" inglés (aproximado en TTS como "s" + vocal)
 *  TZ → "TS" (como en "tsunami")
 *  W  → mezcla "GU"/"HU" → en TTS se transcribe como vocal "u"
 *  Y  → "I" alargada o "HI" → en TTS: "i"
 *
 *  pronunciationText = cadena optimizada para TTS en español (no para el estudiante)
 *  pronunciation     = guía silábica visible al estudiante
 *
 *  Nota sobre "Padiush": el diccionario registra tanto "Padiush" como "Payush"
 *  con idéntico significado y ejemplo. Se usa "Padiush" para mantener consistencia
 *  con el resto de la app.
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
          // KW = "CUU" (c seguida de U alargada). TTS: "kua" ≈ "cua" en español.
          {
            id: "s1-l1-1",
            type: "flashcard",
            nahuat_word: "Kw",
            spanish_translation: "Sonido \"kw\" — como en \"cual\"",
            pronunciation: "kwa",
            pronunciationText: "kua",
            example_sentence: "Kwawit",
            example_translation: "Árbol / leña (ejemplo del sonido Kw)",
          },
          // 2. Flashcard — sonido Tz
          // TZ = conjunción de T+S, como en "tsunami". TTS: "tsa".
          {
            id: "s1-l1-2",
            type: "flashcard",
            nahuat_word: "Tz",
            spanish_translation: "Sonido \"tz\" — como en \"tsunami\"",
            pronunciation: "tza",
            pronunciationText: "tsa",
            example_sentence: "Tzaput",
            example_translation: "Zapote (fruta)",
          },
          // 3. Flashcard — sonido Sh
          // SH = "sh" inglesa (como "shhh" para pedir silencio).
          // Los TTS en español no tienen este sonido nativo; "sh" se aproxima con "s".
          {
            id: "s1-l1-3",
            type: "flashcard",
            nahuat_word: "Sh",
            spanish_translation: "Sonido \"sh\" — como en \"shhh\" (silencio)",
            pronunciation: "sha",
            pronunciationText: "sha",
            example_sentence: "Shiwit",
            example_translation: "Hierba / Año",
          },
          // 4. Multiple choice — ¿Cuál palabra tiene el sonido Kw?
          {
            id: "s1-l1-4",
            type: "multiple_choice_text",
            nahuat_word: "Kwawit",
            spanish_translation: "Contiene el sonido Kw",
            pronunciation: "kwa-wit",
            pronunciationText: "kua uit",
            instruction: "¿Cuál palabra tiene el sonido Kw?",
            options: [
              { id: "a", text: "Kwawit", correct: true },
              { id: "b", text: "Tzaput", correct: false },
              { id: "c", text: "Shiwit", correct: false },
              { id: "d", text: "Tamal", correct: false },
            ],
          },
          // 5. Matching — unir sonido con ejemplo
          {
            id: "s1-l1-5",
            type: "matching",
            instruction: "Une cada sonido con su palabra ejemplo",
            pairs: [
              { nahuat: "Kw", spanish: "Kwawit" },
              { nahuat: "Tz", spanish: "Tzaput" },
              { nahuat: "Sh", spanish: "Shiwit" },
            ],
          },
          // 6. Multiple choice — Tzaput
          // TZ → "tsa" en TTS.
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
          // 7. Multiple choice — Shiwit
          // SH → "sh" / W entre vocales → "u". TTS: "shi-u-it" = "shi uit".
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
      //  LECCIÓN 2 — Niawa y Shiawa: La despedida
      // ──────────────────────────────────────────────────────
      //  Fuente diccionario:
      //  Niawa (Interj.) — Adiós, dicho por quien SE VA.   Ejemplo: ¡Niawa! - ¡Shiawa!
      //  Shiawa (Interj.) — Adiós, dicho por quien SE QUEDA. Ejemplo: ¡Niawa! - ¡Shiawa!
      //
      //  Pronunciación:
      //  Niawa  → N-i-a-W-a  → W = "u/hu" → TTS: "nia ua"
      //  Shiawa → SH-i-a-W-a → SH ≈ "s" en TTS español, W = "u" → TTS: "sia ua"
      // ──────────────────────────────────────────────────────
      {
        id: "s1-l2",
        title: "Niawa y Shiawa",
        icon: "👋",
        description: "La despedida tiene dos palabras según tu rol",
        color: "#2D6A4F",
        xpReward: 50,
        items: [
          // 1. Flashcard — Niawa (quien se va)
          {
            id: "s1-l2-1",
            type: "flashcard",
            nahuat_word: "Niawa",
            spanish_translation: "Adiós — lo dice quien se va",
            pronunciation: "nia-wa",
            pronunciationText: "nia ua",
            example_sentence: "¡Niawa! — ¡Shiawa!",
            example_translation: "¡Adiós! — ¡Adiós! (el que parte / el que queda)",
          },
          // 2. Flashcard — Shiawa (quien se queda)
          {
            id: "s1-l2-2",
            type: "flashcard",
            nahuat_word: "Shiawa",
            spanish_translation: "Adiós — lo dice quien se queda",
            pronunciation: "shia-wa",
            pronunciationText: "sia ua",
            example_sentence: "¡Niawa! — ¡Shiawa!",
            example_translation: "¡Adiós! — ¡Adiós! (el que parte / el que queda)",
          },
          // 3. Multiple choice (audio) — Niawa
          {
            id: "s1-l2-3",
            type: "multiple_choice_text",
            nahuat_word: "Niawa",
            spanish_translation: "Adiós (me voy)",
            pronunciation: "nia-wa",
            pronunciationText: "nia ua",
            instruction: "Escucha. ¿Qué significa?",
            options: [
              { id: "a", text: "Adiós (me voy)", correct: true },
              { id: "b", text: "Adiós (me quedo)", correct: false },
              { id: "c", text: "Hola", correct: false },
              { id: "d", text: "Gracias", correct: false },
            ],
          },
          // 4. Multiple choice (audio) — Shiawa
          {
            id: "s1-l2-4",
            type: "multiple_choice_text",
            nahuat_word: "Shiawa",
            spanish_translation: "Adiós (me quedo)",
            pronunciation: "shia-wa",
            pronunciationText: "sia ua",
            instruction: "Escucha. ¿Qué significa?",
            options: [
              { id: "a", text: "Adiós (me voy)", correct: false },
              { id: "b", text: "Adiós (me quedo)", correct: true },
              { id: "c", text: "Por favor", correct: false },
              { id: "d", text: "Hasta luego", correct: false },
            ],
          },
          // 5. Multiple choice (contexto) — situación: quien parte
          {
            id: "s1-l2-5",
            type: "multiple_choice_text",
            nahuat_word: "Niawa",
            spanish_translation: "Adiós (me voy)",
            pronunciation: "nia-wa",
            pronunciationText: "nia ua",
            instruction: "Ana sale de la tienda. ¿Qué dice?",
            options: [
              { id: "a", text: "Shiawa", correct: false },
              { id: "b", text: "Niawa", correct: true },
              { id: "c", text: "Padiush", correct: false },
              { id: "d", text: "Eje", correct: false },
            ],
          },
          // 6. Multiple choice (contexto) — situación: quien queda
          {
            id: "s1-l2-6",
            type: "multiple_choice_text",
            nahuat_word: "Shiawa",
            spanish_translation: "Adiós (me quedo)",
            pronunciation: "shia-wa",
            pronunciationText: "sia ua",
            instruction: "Juan se queda. Su amigo se va. ¿Qué dice Juan?",
            options: [
              { id: "a", text: "Niawa", correct: false },
              { id: "b", text: "Shiawa", correct: true },
              { id: "c", text: "Tesu", correct: false },
              { id: "d", text: "Yek", correct: false },
            ],
          },
          // 7. Matching — rol en la despedida
          {
            id: "s1-l2-7",
            type: "matching",
            instruction: "Une cada palabra con quien la dice",
            pairs: [
              { nahuat: "Niawa", spanish: "Lo dice quien se va" },
              { nahuat: "Shiawa", spanish: "Lo dice quien se queda" },
            ],
          },
          // 8. Build sentence — ordenar el diálogo completo
          // El que parte habla primero (Niawa), el que queda responde (Shiawa).
          {
            id: "s1-l2-8",
            type: "build_sentence",
            instruction: "Ordena el diálogo de despedida",
            spanish_translation: "¡Adiós! — ¡Adiós!",
            word_bank: ["¡Shiawa!", "¡Niawa!"],
            correct_order: ["¡Niawa!", "¡Shiawa!"],
          },
        ],
      },

      // ──────────────────────────────────────────────────────
      //  LECCIÓN 3 — Sí, No, Gracias y De nada
      // ──────────────────────────────────────────────────────
      //  Fuente diccionario:
      //  Eje    (Adv.)   — Sí.         Ejemplo: Eje, nikneki. (Sí, quiero.)
      //  Tesu   (Adv.)   — No.         Ejemplo: Tesu nikneki. (No lo quiero.)
      //  Padiush (Interj.) — Gracias.  Ejemplo: ¡Padiush! - ¡Tesu datka!
      //  Tesu datka       — De nada.   Ejemplo: ¡Padiush! - ¡Tesu datka!
      //  Nota: "Payush" es variante válida de "Padiush" (ambas en el diccionario).
      //
      //  Pronunciación:
      //  Eje     → E-j-e     → J = j español → TTS: "e je"
      //  Tesu    → T-e-s-u   → TTS: "te su"
      //  Padiush → P-a-d-i-u-SH → SH ≈ "s" en TTS → TTS: "pa diush"
      //  Tesu datka → T-e-s-u d-a-t-K-a → K entre consonante y vocal → K (no G) → TTS: "te su dat ka"
      // ──────────────────────────────────────────────────────
      {
        id: "s1-l3",
        title: "Sí, No y Gracias",
        icon: "✋",
        description: "Cuatro palabras que siempre necesitarás",
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
            example_sentence: "Eje, nikneki.",
            example_translation: "Sí, quiero.",
          },
          // 2. Flashcard — Tesu (no)
          {
            id: "s1-l3-2",
            type: "flashcard",
            nahuat_word: "Tesu",
            spanish_translation: "No",
            pronunciation: "te-su",
            pronunciationText: "te su",
            example_sentence: "Tesu nikneki.",
            example_translation: "No lo quiero.",
          },
          // 3. Flashcard — Padiush (gracias)
          {
            id: "s1-l3-3",
            type: "flashcard",
            nahuat_word: "Padiush",
            spanish_translation: "Gracias",
            pronunciation: "pa-diush",
            pronunciationText: "pa diush",
            example_sentence: "¡Padiush! — ¡Tesu datka!",
            example_translation: "¡Gracias! — ¡De nada!",
          },
          // 4. Flashcard — Tesu datka (de nada)
          // "Tesu datka" = literalmente "no es nada" (Tesu = no, datka = cosa/nada).
          // K en "datka" va entre consonante T y vocal A → K no se convierte en G.
          {
            id: "s1-l3-4",
            type: "flashcard",
            nahuat_word: "Tesu datka",
            spanish_translation: "De nada",
            pronunciation: "te-su dat-ka",
            pronunciationText: "te su dat ka",
            example_sentence: "¡Padiush! — ¡Tesu datka!",
            example_translation: "¡Gracias! — ¡De nada!",
          },
          // 5. Multiple choice — Eje
          {
            id: "s1-l3-5",
            type: "multiple_choice_text",
            nahuat_word: "Eje",
            spanish_translation: "Sí",
            pronunciation: "e-je",
            pronunciationText: "e je",
            options: [
              { id: "a", text: "No", correct: false },
              { id: "b", text: "Sí", correct: true },
              { id: "c", text: "Gracias", correct: false },
              { id: "d", text: "De nada", correct: false },
            ],
          },
          // 6. Multiple choice (contexto) — Padiush
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
              { id: "d", text: "Niawa", correct: false },
            ],
          },
          // 7. Multiple choice (contexto) — Tesu datka
          {
            id: "s1-l3-7",
            type: "multiple_choice_text",
            nahuat_word: "Tesu datka",
            spanish_translation: "De nada",
            pronunciation: "te-su dat-ka",
            pronunciationText: "te su dat ka",
            instruction: "Tu amigo dice \"Padiush\". ¿Qué respondes?",
            options: [
              { id: "a", text: "Padiush", correct: false },
              { id: "b", text: "Niawa", correct: false },
              { id: "c", text: "Tesu datka", correct: true },
              { id: "d", text: "Eje", correct: false },
            ],
          },
          // 8. Matching — las 4 palabras
          {
            id: "s1-l3-8",
            type: "matching",
            instruction: "Une cada palabra con su significado",
            pairs: [
              { nahuat: "Eje", spanish: "Sí" },
              { nahuat: "Tesu", spanish: "No" },
              { nahuat: "Padiush", spanish: "Gracias" },
              { nahuat: "Tesu datka", spanish: "De nada" },
            ],
          },
          // 9. Build sentence — Tesu datka
          {
            id: "s1-l3-9",
            type: "build_sentence",
            instruction: "Ordena para decir \"de nada\"",
            spanish_translation: "De nada",
            word_bank: ["datka", "Tesu"],
            correct_order: ["Tesu", "datka"],
          },
        ],
      },

      // ──────────────────────────────────────────────────────
      //  LECCIÓN 4 — ¿Ken tinemi?: El estado
      // ──────────────────────────────────────────────────────
      //  Fuente diccionario:
      //  Ken  (Adv.) — Cómo.          Ejemplo: ¿Ken tinemi? (¿Cómo estás?)
      //  Nemi (V.I.) — Estar/haber.   Ejemplo: Ninemi yek. (Estoy bien.)
      //  Yek  — Bien / Bueno.         (Aparece en Sección 5 como entrada completa)
      //  tinemi  = conjugación de nemi para Taja (tú)  → prefijo ti-
      //  ninemi  = conjugación de nemi para Naja (yo)  → prefijo ni-
      //
      //  Pronunciación:
      //  Ken      → K al inicio de palabra → G en Witzapan → TTS: "gen"
      //  tinemi   → T-i-n-e-m-i → TTS: "ti ne mi"
      //  ninemi   → N-i-n-e-m-i → TTS: "ni ne mi"
      //  yek      → Y-e-K → Y = "i" alargada, K al final de sílaba = K → TTS: "iek"
      //  tesu ninemi yek → TTS: "te su ni ne mi iek"
      // ──────────────────────────────────────────────────────
      {
        id: "s1-l4",
        title: "¿Ken tinemi?",
        icon: "💬",
        description: "Pregunta y responde cómo estás",
        color: "#6A1B9A",
        xpReward: 50,
        items: [
          // 1. Flashcard — Ken tinemi? (la pregunta completa)
          {
            id: "s1-l4-1",
            type: "flashcard",
            nahuat_word: "Ken tinemi?",
            spanish_translation: "¿Cómo estás?",
            pronunciation: "ken ti-ne-mi",
            pronunciationText: "gen ti ne mi",
            example_sentence: "—¿Ken tinemi? —Ninemi yek.",
            example_translation: "—¿Cómo estás? —Estoy bien.",
          },
          // 2. Flashcard — Yek (bien)
          // Y consonántica → "i" alargada. K al final de sílaba → K. TTS: "iek".
          {
            id: "s1-l4-2",
            type: "flashcard",
            nahuat_word: "Yek",
            spanish_translation: "Bien / Bueno",
            pronunciation: "yek",
            pronunciationText: "iek",
            example_sentence: "Ninemi yek.",
            example_translation: "Estoy bien.",
          },
          // 3. Flashcard — Tesu ninemi yek (no estoy bien)
          // Tesu = no. Ninemi = estoy. Yek = bien.
          {
            id: "s1-l4-3",
            type: "flashcard",
            nahuat_word: "Tesu ninemi yek",
            spanish_translation: "No estoy bien",
            pronunciation: "te-su ni-ne-mi yek",
            pronunciationText: "te su ni ne mi iek",
            example_sentence: "Tesu ninemi yek.",
            example_translation: "No estoy bien.",
          },
          // 4. Multiple choice (audio) — Ken tinemi?
          {
            id: "s1-l4-4",
            type: "multiple_choice_text",
            nahuat_word: "Ken tinemi?",
            spanish_translation: "¿Cómo estás?",
            pronunciation: "ken ti-ne-mi",
            pronunciationText: "gen ti ne mi",
            instruction: "Escucha. ¿Qué significa?",
            options: [
              { id: "a", text: "¿Cómo estás?", correct: true },
              { id: "b", text: "¿Quién eres?", correct: false },
              { id: "c", text: "¿Dónde estás?", correct: false },
              { id: "d", text: "¿Cuál es tu nombre?", correct: false },
            ],
          },
          // 5. Multiple choice — respuesta positiva
          {
            id: "s1-l4-5",
            type: "multiple_choice_text",
            nahuat_word: "Ninemi yek",
            spanish_translation: "Estoy bien",
            pronunciation: "ni-ne-mi yek",
            pronunciationText: "ni ne mi iek",
            instruction: "Alguien pregunta \"¿Ken tinemi?\". ¿Cómo respondes que estás bien?",
            options: [
              { id: "a", text: "Niawa", correct: false },
              { id: "b", text: "Ninemi yek", correct: true },
              { id: "c", text: "Padiush", correct: false },
              { id: "d", text: "Tesu", correct: false },
            ],
          },
          // 6. Multiple choice (contexto) — respuesta negativa
          {
            id: "s1-l4-6",
            type: "multiple_choice_text",
            nahuat_word: "Tesu ninemi yek",
            spanish_translation: "No estoy bien",
            pronunciation: "te-su ni-ne-mi yek",
            pronunciationText: "te su ni ne mi iek",
            instruction: "María está enferma. ¿Cómo responde a \"¿Ken tinemi?\"?",
            options: [
              { id: "a", text: "Ninemi yek", correct: false },
              { id: "b", text: "Tesu ninemi yek", correct: true },
              { id: "c", text: "Shiawa", correct: false },
              { id: "d", text: "Eje", correct: false },
            ],
          },
          // 7. Matching — pregunta y respuestas
          {
            id: "s1-l4-7",
            type: "matching",
            instruction: "Une cada expresión con su significado",
            pairs: [
              { nahuat: "Ken tinemi?", spanish: "¿Cómo estás?" },
              { nahuat: "Ninemi yek", spanish: "Estoy bien" },
              { nahuat: "Tesu ninemi yek", spanish: "No estoy bien" },
              { nahuat: "Yek", spanish: "Bien / Bueno" },
            ],
          },
          // 8. Build sentence — la pregunta
          {
            id: "s1-l4-8",
            type: "build_sentence",
            instruction: "Ordena para preguntar cómo está alguien",
            spanish_translation: "¿Cómo estás?",
            word_bank: ["tinemi?", "Ken"],
            correct_order: ["Ken", "tinemi?"],
          },
          // 9. Build sentence — respuesta positiva completa
          // Naja = yo (se enseña formalmente en Sección 2, aquí aparece en contexto).
          // ninemi = ni- (prefijo yo) + nemi (estar). yek = bien.
          {
            id: "s1-l4-9",
            type: "build_sentence",
            instruction: "Ordena para responder que estás bien",
            spanish_translation: "Yo estoy bien",
            word_bank: ["yek", "Naja", "ninemi"],
            correct_order: ["Naja", "ninemi", "yek"],
          },
        ],
      },
    ],

    // ──────────────────────────────────────────────────────
    //  BOSS DE SECCIÓN 1 — Repaso completo
    //  Cubre: sonidos, Niawa/Shiawa, Eje/Tesu/Padiush/Tesu datka, Ken tinemi?/yek
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
        // 1. MC — sonido (L1)
        {
          id: "s1-b-1",
          type: "multiple_choice_text",
          nahuat_word: "Kwawit",
          spanish_translation: "Contiene el sonido Kw",
          pronunciation: "kwa-wit",
          pronunciationText: "kua uit",
          instruction: "¿Qué sonido especial tiene esta palabra?",
          options: [
            { id: "a", text: "Sh", correct: false },
            { id: "b", text: "Kw", correct: true },
            { id: "c", text: "Tz", correct: false },
            { id: "d", text: "Tl", correct: false },
          ],
        },
        // 2. MC — Niawa (L2)
        {
          id: "s1-b-2",
          type: "multiple_choice_text",
          nahuat_word: "Niawa",
          spanish_translation: "Adiós (me voy)",
          pronunciation: "nia-wa",
          pronunciationText: "nia ua",
          options: [
            { id: "a", text: "Adiós (me quedo)", correct: false },
            { id: "b", text: "Adiós (me voy)", correct: true },
            { id: "c", text: "Hola", correct: false },
            { id: "d", text: "Gracias", correct: false },
          ],
        },
        // 3. MC — Shiawa (L2)
        {
          id: "s1-b-3",
          type: "multiple_choice_text",
          nahuat_word: "Shiawa",
          spanish_translation: "Adiós (me quedo)",
          pronunciation: "shia-wa",
          pronunciationText: "sia ua",
          options: [
            { id: "a", text: "Adiós (me voy)", correct: false },
            { id: "b", text: "Adiós (me quedo)", correct: true },
            { id: "c", text: "Gracias", correct: false },
            { id: "d", text: "De nada", correct: false },
          ],
        },
        // 4. MC (contexto) — rol en la despedida (L2)
        {
          id: "s1-b-4",
          type: "multiple_choice_text",
          nahuat_word: "Niawa",
          spanish_translation: "Adiós (me voy)",
          pronunciation: "nia-wa",
          pronunciationText: "nia ua",
          instruction: "Pedro sale de la casa. ¿Qué dice?",
          options: [
            { id: "a", text: "Shiawa", correct: false },
            { id: "b", text: "Niawa", correct: true },
            { id: "c", text: "Padiush", correct: false },
            { id: "d", text: "Tesu datka", correct: false },
          ],
        },
        // 5. MC — Padiush (L3)
        {
          id: "s1-b-5",
          type: "multiple_choice_text",
          nahuat_word: "Padiush",
          spanish_translation: "Gracias",
          pronunciation: "pa-diush",
          pronunciationText: "pa diush",
          options: [
            { id: "a", text: "De nada", correct: false },
            { id: "b", text: "Sí", correct: false },
            { id: "c", text: "Gracias", correct: true },
            { id: "d", text: "No", correct: false },
          ],
        },
        // 6. MC — Ken tinemi? (L4)
        {
          id: "s1-b-6",
          type: "multiple_choice_text",
          nahuat_word: "Ken tinemi?",
          spanish_translation: "¿Cómo estás?",
          pronunciation: "ken ti-ne-mi",
          pronunciationText: "gen ti ne mi",
          options: [
            { id: "a", text: "¿Cómo te llamas?", correct: false },
            { id: "b", text: "¿Cómo estás?", correct: true },
            { id: "c", text: "¿Dónde vives?", correct: false },
            { id: "d", text: "¿Cuántos años tienes?", correct: false },
          ],
        },
        // 7. MC — Yek (L4)
        {
          id: "s1-b-7",
          type: "multiple_choice_text",
          nahuat_word: "Yek",
          spanish_translation: "Bien / Bueno",
          pronunciation: "yek",
          pronunciationText: "iek",
          options: [
            { id: "a", text: "Mal", correct: false },
            { id: "b", text: "Adiós", correct: false },
            { id: "c", text: "Bien / Bueno", correct: true },
            { id: "d", text: "No", correct: false },
          ],
        },
        // 8. Matching — Niawa/Shiawa/Eje/Tesu (L2 + L3)
        {
          id: "s1-b-8",
          type: "matching",
          instruction: "Une cada palabra con su significado",
          pairs: [
            { nahuat: "Niawa", spanish: "Adiós (me voy)" },
            { nahuat: "Shiawa", spanish: "Adiós (me quedo)" },
            { nahuat: "Eje", spanish: "Sí" },
            { nahuat: "Tesu", spanish: "No" },
          ],
        },
        // 9. Matching — Padiush/Tesu datka/Ken tinemi?/Yek (L3 + L4)
        {
          id: "s1-b-9",
          type: "matching",
          instruction: "Une cada expresión con su significado",
          pairs: [
            { nahuat: "Padiush", spanish: "Gracias" },
            { nahuat: "Tesu datka", spanish: "De nada" },
            { nahuat: "Ken tinemi?", spanish: "¿Cómo estás?" },
            { nahuat: "Ninemi yek", spanish: "Estoy bien" },
          ],
        },
        // 10. Build sentence — diálogo de despedida (L2)
        {
          id: "s1-b-10",
          type: "build_sentence",
          instruction: "Ordena el diálogo: el que se va habla primero",
          spanish_translation: "¡Adiós! — ¡Adiós!",
          word_bank: ["¡Shiawa!", "¡Niawa!"],
          correct_order: ["¡Niawa!", "¡Shiawa!"],
        },
        // 11. Build sentence — la pregunta (L4)
        {
          id: "s1-b-11",
          type: "build_sentence",
          instruction: "Ordena para preguntar cómo está alguien",
          spanish_translation: "¿Cómo estás?",
          word_bank: ["tinemi?", "Ken"],
          correct_order: ["Ken", "tinemi?"],
        },
        // 12. Build sentence — respuesta completa (L4)
        {
          id: "s1-b-12",
          type: "build_sentence",
          instruction: "Ordena para responder que estás bien",
          spanish_translation: "Yo estoy bien",
          word_bank: ["yek", "Naja", "ninemi"],
          correct_order: ["Naja", "ninemi", "yek"],
        },
      ],
    },
  };

export default section1;
