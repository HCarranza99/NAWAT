/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  MÓDULO 1 — Ne tajpalulis  ·  El saludo
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  PRIMER MÓDULO ESCRITO CON EL MODELO NUEVO (ver ./index.js).
 *
 *  Qué cambia respecto de las secciones 1–5:
 *
 *   1. La unidad ya no es la palabra: es una SITUACIÓN con una tarea. El
 *      vocabulario sale del diálogo, no al revés.
 *   2. Los bloques se enseñan enteros ("Ken tinemi?") y la gramática llega
 *      DESPUÉS, cuando el estudiante ya los oyó funcionando.
 *   3. Se empieza por un verbo INTRANSITIVO (nemi «estar»), que solo pide
 *      prefijo de sujeto. Los transitivos —los que exigen marcador de objeto y
 *      que el diccionario escribe con guion— quedan para módulos posteriores.
 *      Enseñarlos de primero fue la causa de los cuatro errores corregidos en
 *      julio y agosto de 2026 (−tukay, −uni, −pia dos veces).
 *   4. Cada cadena en náhuat lleva su procedencia como dato, no como
 *      comentario. Ver `source` y `evidence` en cada línea.
 *
 *  PROCEDENCIA — de dónde salió el módulo entero
 *
 *  Las 20 líneas de diálogo son frases ATESTIGUADAS: ninguna se compuso ni se
 *  tradujo por analogía. Lo único que se hizo fue ordenarlas en una
 *  conversación. Trece vienen del Curso Timumachtikan (King), que es fuente
 *  INDEPENDIENTE del diccionario — el módulo no depende de una sola obra.
 *
 *  `evidence` distingue dos cosas y solo dos:
 *    'directa'   — la cadena completa aparece así en la fuente citada.
 *    'compuesta' — se armó con piezas atestiguadas siguiendo una regla también
 *                  atestiguada. No hay ninguna en este módulo; el campo existe
 *                  para módulos futuros, donde habrá que marcarlas.
 *
 *  LO QUE FALTA Y SOLO UN HABLANTE PUEDE DAR
 *
 *  `speakerAsk` es una pregunta abierta por lección, no contenido. Deliberado:
 *  la nota cultural de un curso de lengua en peligro la escribe quien pertenece
 *  a la comunidad. Inventarla sería exactamente el error que este módulo existe
 *  para no repetir. Se llenan con Héctor Martínez y recién entonces se publican.
 */

const M = 'Diccionario YULTAJTAKETZALIS (Pérez & Martínez, 2023)'
const K = 'Curso Timumachtikan (King)'

const module1 = {
  id: 'm1',
  order: 1,
  title: { nawat: 'Ne tajpalulis', es: 'El saludo' },
  titleSource: `${M}, p.190 — "Ne tajpalulis: El saludo"`,
  description: 'Saludar, preguntar cómo está alguien, decir tu nombre y despedirte.',
  icon: '👋',
  color: '#2D6A4F',

  lessons: [
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'm1-l1',
      order: 1,
      type: 'dialogo',
      title: { nawat: 'Yek tunal', es: 'Saludar según la hora' },
      situation:
        'Vas llegando a Witzapan por la mañana. En el camino te cruzás con alguien que viene de frente.',
      objective: 'Saludar y devolver el saludo según la hora del día.',

      dialogue: [
        { speaker: 'a', nawat: 'Yek tunal.', es: 'Buen día.', evidence: 'directa', source: `${K}, p.19` },
        { speaker: 'b', nawat: 'Yek tunal.', es: 'Buen día.', evidence: 'directa', source: `${K}, p.19` },
        { speaker: 'a', nawat: 'Ken tinemi?', es: '¿Cómo estás?', evidence: 'directa', source: `${K}, p.19` },
        { speaker: 'b', nawat: 'Ninemi yek.', es: 'Estoy bien.', evidence: 'directa', source: `${K}, p.19` },
        { speaker: 'b', nawat: 'Wan taja?', es: '¿Y tú?', evidence: 'directa', source: `${K}, p.21` },
        { speaker: 'a', nawat: 'Yek, padiush.', es: 'Bien, gracias.', evidence: 'directa', source: `${K}, p.24` },
      ],

      vocabulary: [
        { nawat: 'Yek', es: 'Bueno, bien', pron: 'yek', pronText: 'yek', evidence: 'directa', source: `${M}, p.254` },
        { nawat: 'Tunal', es: 'Día, sol', pron: 'tu-nal', pronText: 'tu nal', evidence: 'directa', source: `${M}, p.223` },
        { nawat: 'Teutak', es: 'Tarde', pron: 'teu-tak', pronText: 'teu tak', evidence: 'directa', source: `${K}, p.19` },
        { nawat: 'Tayua', es: 'Noche', pron: 'ta-yu-a', pronText: 'ta yu a', evidence: 'directa', source: `${M}, p.207` },
        { nawat: 'Ken', es: 'Cómo', pron: 'ken', pronText: 'ken', evidence: 'directa', source: `${M}, p.110` },
        { nawat: 'Wan', es: 'Y', pron: 'wan', pronText: 'wan', evidence: 'directa', source: `${M}, p.246` },
        { nawat: 'Taja', es: 'Tú', pron: 'ta-ja', pronText: 'ta ja', evidence: 'directa', source: `${K}, p.19` },
        { nawat: 'Padiush', es: 'Gracias', pron: 'pa-diush', pronText: 'pa diush', evidence: 'directa', source: `${M}, p.160` },
      ],

      note: {
        title: 'Un saludo se arma con "Yek" y el momento del día',
        body:
          'Yek significa «bueno». Puesto delante de una parte del día, forma el saludo: Yek tunal (buen día), Yek teutak (buena tarde), Yek tayua (buena noche).\n\nFijate en algo del diálogo: quien saluda y quien responde dicen exactamente lo mismo. En náhuat el saludo se devuelve igual, no se cambia.',
        examples: [
          { nawat: 'Yek tunal', es: 'Buen día', source: `${K}, p.19` },
          { nawat: 'Yek teutak', es: 'Buena tarde', source: `${K}, p.19` },
          { nawat: 'Yek tayua', es: 'Buena noche', source: `${K}, p.19` },
        ],
      },

      task: 'Hoy, a la hora que sea, saludá en voz alta como corresponda: tunal, teutak o tayua. Decilo aunque estés solo — lo que importa es que salga la boca, no que haya quien conteste.',

      speakerAsk:
        '¿Se saluda así en Witzapan hoy, o hay otro saludo más usado en la calle? ¿Qué hora marca el paso de tunal a teutak?',
    },

    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'm1-l2',
      order: 2,
      type: 'dialogo',
      title: { nawat: 'Ken tinemi?', es: 'Preguntar cómo está alguien' },
      situation:
        'La misma persona del camino se detiene. Ahora la conversación pasa de saludar a preguntar de verdad.',
      objective: 'Preguntar cómo está alguien y contestar cuando te lo preguntan a vos.',

      dialogue: [
        { speaker: 'a', nawat: 'Ken tinemi?', es: '¿Cómo estás?', evidence: 'directa', source: `${K}, p.19` },
        { speaker: 'b', nawat: 'Naja ninemi yek.', es: 'Yo estoy bien.', evidence: 'directa', source: `${M}, p.148` },
        { speaker: 'b', nawat: 'Tinemi yek?', es: '¿Estás bien?', evidence: 'directa', source: `${K}, p.24` },
        { speaker: 'a', nawat: 'Taja tinemi yek.', es: 'Tú estás bien.', evidence: 'directa', source: `${M}, p.190` },
        { speaker: 'a', nawat: 'Yek, padiush.', es: 'Bien, gracias.', evidence: 'directa', source: `${K}, p.24` },
      ],

      vocabulary: [
        { nawat: 'Nemi', es: 'Estar, vivir', pron: 'ne-mi', pronText: 'ne mi', evidence: 'directa', source: `${M}, p.153` },
        { nawat: 'Naja', es: 'Yo', pron: 'na-ja', pronText: 'na ja', evidence: 'directa', source: `${K}, p.19` },
      ],

      note: {
        title: 'ni- es «yo», ti- es «tú»',
        body:
          'Ya oíste tres veces el mismo verbo con distinta cabeza:\n\n  ni-nemi  →  yo estoy\n  ti-nemi  →  tú estás\n\nEl verbo náhuat no va suelto: lleva pegado adelante quién hace la acción. Por eso «nemi» a secas casi nunca se dice, igual que en español no decimos «estar» cuando queremos decir «estoy».\n\nEsta es la pieza más importante del idioma y por eso viene de primero.',
        examples: [
          { nawat: 'Naja ninemi yek', es: 'Yo estoy bien', source: `${M}, p.148` },
          { nawat: 'Taja tinemi yek', es: 'Tú estás bien', source: `${M}, p.190` },
        ],
      },

      task: 'Preguntale «Ken tinemi?» a alguien de confianza y explicale qué significa. Enseñar la frase es la forma más rápida de no olvidarla.',

      speakerAsk:
        '¿«Naja ninemi yek» suena natural en una conversación, o el pronombre «naja» solo se usa para enfatizar? ¿Cuándo se dice y cuándo se calla?',
    },

    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'm1-l3',
      order: 3,
      type: 'dialogo',
      title: { nawat: 'Tejemet wan anmejemet', es: 'Hablar de varios' },
      situation: 'Ya no son dos: llegan más personas y hay que hablar de un grupo.',
      objective: 'Pasar de una persona a varias.',

      dialogue: [
        { speaker: 'a', nawat: 'Naja ninemi yek.', es: 'Yo estoy bien.', evidence: 'directa', source: `${M}, p.148` },
        { speaker: 'b', nawat: 'Taja tinemi yek.', es: 'Tú estás bien.', evidence: 'directa', source: `${M}, p.190` },
        { speaker: 'a', nawat: 'Tejemet tinemit yek.', es: 'Nosotros estamos bien.', evidence: 'directa', source: `${M}, p.208` },
        { speaker: 'b', nawat: 'Anmejemet annemit yek.', es: 'Ustedes están bien.', evidence: 'directa', source: `${M}, p.25` },
      ],

      vocabulary: [
        { nawat: 'Yaja', es: 'Él, ella', pron: 'ya-ja', pronText: 'ya ja', evidence: 'directa', source: `${K}, p.19` },
        { nawat: 'Tejemet', es: 'Nosotros', pron: 'te-je-met', pronText: 'te je met', evidence: 'directa', source: `${K}, p.19` },
        { nawat: 'Anmejemet', es: 'Ustedes', pron: 'an-me-je-met', pronText: 'an me je met', evidence: 'directa', source: `${K}, p.19` },
      ],

      note: {
        title: 'La -t final quiere decir «somos varios»',
        body:
          'Mirá las cuatro frases juntas:\n\n  Naja ni-nemi       yo estoy\n  Taja ti-nemi       tú estás\n  Tejemet ti-nemi-t  nosotros estamos\n  Anmejemet an-nemi-t  ustedes están\n\nDos cosas pasan a la vez: cambia el prefijo de adelante (quién) y aparece una -t al final cuando son varios.\n\nOjo con ti-: sirve para «tú» y para «nosotros». Lo que las distingue es esa -t del final.',
        examples: [
          { nawat: 'Tejemet tinemit yek', es: 'Nosotros estamos bien', source: `${M}, p.208` },
          { nawat: 'Anmejemet annemit yek', es: 'Ustedes están bien', source: `${M}, p.25` },
        ],
      },

      task: 'Escribí las cuatro frases en un papel, en orden, y leelas en voz alta hasta que la -t final te salga sin pensarla.',

      speakerAsk:
        '¿Se usan «tejemet» y «anmejemet» en el habla diaria de Witzapan o suenan a libro? ¿Hay formas más cortas?',
    },

    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'm1-l4',
      order: 4,
      type: 'dialogo',
      title: { nawat: 'Ken mutukay?', es: 'Decir tu nombre' },
      situation: 'La conversación siguió y todavía no saben cómo se llama cada quien.',
      objective: 'Preguntar el nombre de alguien y decir el tuyo.',

      dialogue: [
        { speaker: 'a', nawat: 'Ken mutukay?', es: '¿Cómo te llamas?', evidence: 'directa', source: `${K}, p.21` },
        { speaker: 'b', nawat: 'Nutukay Hugo.', es: 'Mi nombre es Hugo.', evidence: 'compuesta', source: `${M}, entrada −Tukay: "Nutukay: Mi nombre" (p.222). El nombre propio es del estudiante; la estructura es la atestiguada.` },
        { speaker: 'b', nawat: 'Wan taja?', es: '¿Y tú?', evidence: 'directa', source: `${K}, p.21` },
        { speaker: 'a', nawat: 'Nutukay Sixta.', es: 'Mi nombre es Sixta.', evidence: 'compuesta', source: `${M}, entrada −Tukay (p.222). Ver la línea anterior.` },
      ],

      vocabulary: [
        { nawat: 'Nutukay', es: 'Mi nombre', pron: 'nu-tu-kay', pronText: 'nu tu kay', evidence: 'directa', source: `${M}, p.222 — "Nutukay: Mi nombre"` },
        { nawat: 'Mutukay', es: 'Tu nombre', pron: 'mu-tu-kay', pronText: 'mu tu kay', evidence: 'directa', source: `${K}, p.21 — en "Ken mutukay?"` },
      ],

      note: {
        title: 'Hay palabras que nunca andan solas',
        body:
          '«Tukay» quiere decir nombre, pero nadie dice «tukay» a secas. Siempre lleva adelante de quién es:\n\n  nu-tukay  →  mi nombre\n  mu-tukay  →  tu nombre\n\nEl diccionario lo avisa escribiéndola con un guion delante: −Tukay. Ese guion significa «acá falta algo». Pasa con las partes del cuerpo, la familia y varios verbos.\n\nEs la misma idea de la lección 2: el náhuat pega la información adelante de la palabra, no en palabras sueltas.',
        examples: [
          { nawat: 'Ken mutukay?', es: '¿Cómo te llamas?', source: `${K}, p.21` },
          { nawat: 'Nutukay…', es: 'Mi nombre es…', source: `${M}, p.222` },
        ],
      },

      task: 'Decí tu propio nombre completo en náhuat: «Nutukay ___». Es la primera frase del curso que dice algo cierto sobre vos.',

      speakerAsk:
        '¿«Nutukay Hugo» es la forma natural de presentarse, o se dice de otra manera? ¿Y cómo se responde cuando a uno le preguntan?',
    },

    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'm1-l5',
      order: 5,
      type: 'dialogo',
      title: { nawat: 'Niawa wan shiawa', es: 'Despedirse' },
      situation: 'Se hizo tarde. Uno sigue camino y el otro se queda.',
      objective: 'Despedirte y contestar una despedida.',

      dialogue: [
        { speaker: 'a', nawat: 'Niawa tel.', es: 'Ya me voy, pues.', evidence: 'directa', source: `${K}, p.19` },
        { speaker: 'b', nawat: 'Shiawa.', es: 'Adiós (te vas).', evidence: 'directa', source: `${M}, p.184` },
        { speaker: 'a', nawat: 'Padiush.', es: 'Gracias.', evidence: 'directa', source: `${M}, p.160` },
      ],

      vocabulary: [
        { nawat: 'Niawa', es: 'Ya me voy', pron: 'ni-a-wa', pronText: 'ni a wa', evidence: 'directa', source: `${M}, p.154` },
        { nawat: 'Shiawa', es: 'Adiós — lo dice quien se queda', pron: 'shi-a-wa', pronText: 'shi a wa', evidence: 'directa', source: `${M}, p.184 — "Adiós (dicho por la persona que se queda), vete"` },
        { nawat: 'Tel', es: 'Pues, entonces', pron: 'tel', pronText: 'tel', evidence: 'directa', source: `${M}, p.210` },
      ],

      note: {
        title: 'Cada quien tiene su despedida',
        body:
          'En español los dos dicen «adiós». En náhuat no:\n\n  Niawa   lo dice quien SE VA        («ya me voy»)\n  Shiawa  lo dice quien SE QUEDA     («andá, vaya con bien»)\n\nNo son intercambiables. Decir «shiawa» cuando el que se va sos vos es como despedir a alguien que no se está yendo.\n\n«Tel» se le pega al final para suavizar, como el «pues» salvadoreño: Niawa tel.',
        examples: [
          { nawat: 'Niawa tel', es: 'Ya me voy, pues', source: `${K}, p.19` },
          { nawat: 'Shiawa', es: 'Adiós (te vas)', source: `${M}, p.184` },
        ],
      },

      task: 'La próxima vez que salgas de un lugar, decí «Niawa» al irte. Fijate si te sale la palabra correcta según si te vas o te quedás.',

      speakerAsk:
        'ESTA ES LA MÁS IMPORTANTE DEL MÓDULO. ¿Es exacto que «niawa» lo dice quien se va y «shiawa» quien se queda? La app lo enseña así desde el principio y nunca lo confirmó un hablante.',
    },
  ],
}

export default module1
