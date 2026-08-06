/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  MÓDULO 0 — Tajtajkwilulchichin  ·  Los sonidos
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  EXISTE PARA PROBAR QUE EL CONTRATO AGUANTA.
 *
 *  Este módulo usa `type: 'sonidos'`, que es una forma de lección distinta a la
 *  del módulo 1: no tiene diálogo, porque no se puede conversar sobre un fonema.
 *  Trae grafías con su palabra de ejemplo.
 *
 *  Y sin embargo NO hizo falta escribir un solo componente nuevo: compila a los
 *  mismos seis tipos de ítem que ya renderiza LessonRunner (ver el contrato en
 *  ./index.js). Esa es la garantía concreta de que agregar contenido no cambia
 *  la forma de la app.
 *
 *  PROCEDENCIA
 *  Todo sale de la sección "TAJTAJKWILULCHICHIN / ALFABETO" del diccionario,
 *  pp.48–49, cotejada contra el PDF el 28-jul-2026. Las grafías citadas son la
 *  #9 (K), #10 (KW), #19 (SH) y #21 (TZ). Las palabras de ejemplo llevan su
 *  propia página.
 *
 *  Va antes que el saludo a propósito: la regla de la K cambia cómo suena todo
 *  lo demás que se enseña después (Ken, Kal, Nikpia…).
 */

const M = 'Diccionario YULTAJTAKETZALIS (Pérez & Martínez, 2023)'

const module0 = {
  id: 'm0',
  order: 0,
  title: { nawat: 'Tajtajkwilulchichin', es: 'Los sonidos' },
  titleSource: `${M}, sección "TAJTAJKWILULCHICHIN / ALFABETO", pp.48–49`,
  description: 'Tres sonidos que el español no tiene, y la regla que cambia todo lo demás.',
  icon: '🔤',
  color: '#E65100',

  lessons: [
    {
      id: 'm0-l1',
      order: 1,
      type: 'sonidos',
      title: { nawat: 'Kw, Tz, Sh', es: 'Tres sonidos que no existen en español' },
      situation:
        'Antes de decir una palabra hay que poder oírla. Estas tres combinaciones aparecen por todos lados en náhuat y ninguna suena como se leería en español.',
      objective: 'Reconocer los sonidos KW, TZ y SH, y la palabra donde vive cada uno.',

      sounds: [
        {
          grapheme: 'Kw',
          description: 'Como "cua" en "cual", con la u alargada',
          pron: 'kwa',
          pronText: 'kwa',
          example: { nawat: 'Kwawit', es: 'Árbol (no frutal), leña', source: `${M}, p.122` },
          source: `${M}, pp.48–49, grafía #10`,
        },
        {
          grapheme: 'Tz',
          description: 'Como la "ts" de "tsunami"',
          pron: 'tza',
          pronText: 'tsa',
          example: { nawat: 'Tzaput', es: 'Zapote', source: `${M}, p.228` },
          source: `${M}, pp.48–49, grafía #21`,
        },
        {
          grapheme: 'Sh',
          description: 'Como la "sh" inglesa, o el "shhh" de pedir silencio',
          pron: 'sha',
          pronText: 'sha',
          example: { nawat: 'Shiwit', es: 'Año', source: `${M}, p.185` },
          source: `${M}, pp.48–49, grafía #19`,
        },
      ],

      note: {
        title: 'Y una regla más, que cambia todo lo demás',
        body:
          'En Witzapan la K suena como la G de «gato» cuando va al principio de la palabra, después de N, o entre dos vocales.\n\nAsí que «Ken» se oye «gen», y «Takat» se oye «tagat». No es que se escriba mal: se escribe con K y se dice con G.\n\nEsto vale para casi todo lo que viene después. Cuando en el resto del curso veas una K al principio, acordate de esta regla.',
        examples: [
          { nawat: 'Ken', es: 'Cómo — se oye «gen»', source: `${M}, pp.48–49, grafía #9` },
          { nawat: 'Kwawit', es: 'Árbol — acá la KW se mantiene: «kua»', source: `${M}, p.122` },
        ],
      },

      task: 'Decí las tres palabras en voz alta, una detrás de otra: Kwawit, Tzaput, Shiwit. Si las tres te salen distintas entre sí, ya tenés los tres sonidos.',

      speakerAsk:
        '¿Las tres palabras de ejemplo son las mejores para enseñar estos sonidos, o hay otras más comunes en Witzapan? ¿Y la regla de la K se cumple siempre, o tiene excepciones que convenga avisar desde el principio?',
    },
  ],
}

export default module0
