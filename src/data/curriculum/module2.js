/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  MÓDULO 2 — Kanka tiwitz  ·  De dónde venís
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  POR QUÉ ESTE MÓDULO VA SEGUNDO
 *
 *  Es la conversación que de verdad va a tener quien use esta app: alguien le
 *  va a preguntar por qué está aprendiendo náhuat. Y es la primera vez que el
 *  estudiante dice algo cierto y propio sobre sí mismo, no una frase de manual.
 *
 *  GRAMÁTICA QUE ENTRA ACÁ, Y POR QUÉ
 *
 *  El contraste ni- / ti- (yo / vos). El módulo 1 ya lo mostró funcionando sin
 *  nombrarlo: "Ken tinemi?" → "Ninemi yek". Acá se nombra, con verbos
 *  INTRANSITIVOS —los que solo piden prefijo de sujeto—. Los transitivos, que
 *  además exigen marcador de objeto, siguen esperando: enseñarlos de primero
 *  fue la causa de los cuatro errores de julio y agosto de 2026.
 *
 *  PROCEDENCIA
 *
 *  Diez de las doce frases están ATESTIGUADAS en el diccionario, con su línea.
 *  Se verificaron una por una contra `docs/YULTAJTAKETZALIS.md` antes de
 *  escribir el módulo, no después.
 *
 *  UN ERROR QUE SE ATAJÓ ACÁ. El paquete de validación traía
 *  "Naja nitajtaketza nawat" glosada como "Yo hablo náhuat". Es falso: la
 *  entrada del diccionario es `Tajtaketza` = "HABLAR MUCHO", y la traducción
 *  aparece partida por un salto de página ("Yo hablo mu- / cho náhuat"), que es
 *  justo lo que hace que un error así pase desapercibido. Va con su significado
 *  real. Regla: si una línea del .md termina en guion, leer la siguiente antes
 *  de dar la traducción por buena.
 */

const M = 'Diccionario YULTAJTAKETZALIS (Pérez & Martínez, 2023)'

const module2 = {
  id: 'm2',
  order: 2,
  title: { nawat: 'Kanka tiwitz', es: 'De dónde venís' },
  titleSource: `${M}, l.24722 — "¿Kanka tiwitz?: ¿De dónde vienes?"`,
  description: 'Decir de dónde sos, que estás aprendiendo náhuat y por qué.',
  icon: '🚶',
  color: '#1D3557',

  lessons: [
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'm2-l1',
      order: 1,
      type: 'dialogo',
      title: { nawat: 'Kanka tiwitz?', es: 'De dónde venís' },
      situation:
        'La misma persona del camino te oyó saludar en náhuat y se quedó con la curiosidad. Ahora quiere saber quién sos.',
      objective: 'Preguntar de dónde viene alguien y contestar.',

      dialogue: [
        { speaker: 'a', nawat: '¿Kanka tiwitz?', es: '¿De dónde venís?', evidence: 'directa', source: `${M}, l.24722` },
        { speaker: 'b', nawat: 'Naja niwitz.', es: 'Yo vengo.', evidence: 'directa', source: `${M}, l.45768` },
        { speaker: 'a', nawat: '¿Tiwitz mujmusta?', es: '¿Venís todos los días?', evidence: 'compuesta', source: `${M}. El prefijo ti- está en "¿Kanka tiwitz?" (l.24722) y "mujmusta" en "Naja nimumachtia nawat mujmusta" (l.44742).` },
        { speaker: 'b', nawat: 'Naja niwitz mujmusta.', es: 'Yo vengo todos los días.', evidence: 'compuesta', source: `${M}. Mismo molde que "Naja nimumachtia nawat mujmusta" (l.44742).` },
        { speaker: 'b', nawat: 'Niwitz neman.', es: 'Vuelvo rápido.', evidence: 'directa', source: `${M}, l.36404` },
      ],

      vocabulary: [
        { nawat: 'Witz', es: 'Venir', pron: 'witz', pronText: 'uits', evidence: 'directa', source: `${M}, p.248` },
        { nawat: 'Naja', es: 'Yo', pron: 'na-ja', pronText: 'na ja', evidence: 'directa', source: `${M}, l.45768 — en "Naja niwitz"` },
        { nawat: 'Kan', es: 'Dónde', pron: 'kan', pronText: 'kan', evidence: 'directa', source: `${M}, p.107` },
        { nawat: 'Mujmusta', es: 'Todos los días', pron: 'muj-mus-ta', pronText: 'muj mus ta', evidence: 'directa', source: `${M}, p.138` },
        { nawat: 'Neman', es: 'Luego, rápido', pron: 'ne-man', pronText: 'ne man', evidence: 'directa', source: `${M}, p.153` },
      ],

      note: {
        title: 'La pista de quién hace la acción va adelante',
        body:
          'Mirá las dos formas del mismo verbo:\n\n  ni-witz  →  yo vengo\n  ti-witz  →  vos venís\n\nLa palabra no cambia; cambia lo que lleva pegado adelante. `ni-` es yo, `ti-` es vos.\n\nYa lo viste en el módulo 1 sin que nadie te lo dijera: «Ken **ti**nemi?» (¿cómo estás vos?) y «**Ni**nemi yek» (yo estoy bien). Es el mismo mecanismo.\n\nPor eso «Naja» (yo) se puede dejar fuera: el verbo ya lo dice. Ponerlo es como decir «yo, yo vengo» — se usa para dar énfasis.',
        examples: [
          { nawat: 'Naja niwitz', es: 'Yo vengo', source: `${M}, l.45768` },
          { nawat: '¿Kanka tiwitz?', es: '¿De dónde venís?', source: `${M}, l.24722` },
        ],
      },

      task:
        'Preguntale «¿Kanka tiwitz?» a alguien de tu casa, aunque no sepa náhuat. Traducíselo después. Es la manera más rápida de que una lengua deje de vivir solo en una pantalla.',

      speakerAsk:
        '¿Cómo se completa la respuesta con el lugar? «Naja niwitz…» ¿y después qué va — el nombre del lugar solo, o lleva algo adelante?',
    },

    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'm2-l2',
      order: 2,
      type: 'dialogo',
      title: { nawat: 'Naja niweli nawat', es: 'Decir que sabés náhuat' },
      situation:
        'La conversación se puso interesante y la persona quiere saber cuánto náhuat entendés de verdad.',
      objective: 'Decir que sabés o podés hablar náhuat, y preguntárselo a otro.',

      dialogue: [
        { speaker: 'a', nawat: '¿Tiweli nawat?', es: '¿Podés hablar náhuat?', evidence: 'compuesta', source: `${M}. Sobre "Naja niweli nawat" (l.40284), cambiando ni- por ti- como en "¿Kanka tiwitz?" (l.24722).` },
        { speaker: 'b', nawat: 'Naja niweli nawat.', es: 'Yo puedo náhuat.', evidence: 'directa', source: `${M}, l.40284` },
        { speaker: 'b', nawat: 'Naja nikmati nawat.', es: 'Yo sé náhuat.', evidence: 'directa', source: `${M}, l.42196` },
        { speaker: 'a', nawat: 'Naja nitajtaketza nawat.', es: 'Yo hablo mucho náhuat.', evidence: 'directa', source: `${M}, l.33962 — la entrada es "Tajtaketza: Hablar mucho", y la traducción viene partida por el salto de página ("Yo hablo mu- / cho náhuat")` },
      ],

      vocabulary: [
        { nawat: 'Weli', es: 'Poder', pron: 'we-li', pronText: 'ue li', evidence: 'directa', source: `${M}, p.246` },
        { nawat: 'Nawat', es: 'Náhuat', pron: 'na-wat', pronText: 'na uat', evidence: 'directa', source: `${M}, p.150` },
      ],

      note: {
        title: 'Tres maneras de decirlo, y no significan lo mismo',
        body:
          'El náhuat separa cosas que en español metemos en un solo verbo:\n\n  ni-k-mati nawat     →  lo SÉ\n  ni-weli nawat       →  PUEDO con él\n  ni-tajtaketza nawat →  hablo MUCHO\n\nEsa última no es «hablo náhuat» a secas: la entrada del diccionario es «Tajtaketza: hablar mucho». Si recién empezás, la honesta es «niweli» o «nikmati».\n\nY fijate en «ni-k-mati»: entre el `ni-` y el verbo se metió una `k`. Esa `k` señala que hay algo que se sabe — el náhuat marca el objeto dentro del verbo. Es la puerta a los verbos transitivos, y se abre más adelante.',
        examples: [
          { nawat: 'Naja nikmati nawat', es: 'Yo sé náhuat', source: `${M}, l.42196` },
          { nawat: 'Naja niweli nawat', es: 'Yo puedo náhuat', source: `${M}, l.40284` },
        ],
      },

      task:
        'Decí en voz alta «Naja niweli nawat». Todavía no es del todo cierto — decilo igual. Es la frase que vas a querer poder decir sin mentir dentro de unos meses.',

      speakerAsk:
        '¿Cuál de las tres usa la gente en la calle para decir «hablo náhuat»? ¿Y hay alguna que suene presumida?',
    },

    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'm2-l3',
      order: 3,
      type: 'dialogo',
      title: { nawat: 'Taika timumachtia nawat?', es: 'Por qué lo estudiás' },
      situation:
        'Y ahí viene la pregunta que le van a hacer a cualquiera que aprenda náhuat en El Salvador: ¿para qué?',
      objective: 'Preguntar y contestar por qué estás aprendiendo náhuat.',

      dialogue: [
        { speaker: 'a', nawat: '¿Taika timumachtia nawat?', es: '¿Por qué estudiás náhuat?', evidence: 'directa', source: `${M}, l.40482` },
        { speaker: 'b', nawat: 'Ika nugustuj.', es: 'Porque me gusta.', evidence: 'directa', source: `${M}, l.40482 — la respuesta va en la misma línea, partida por el salto de página ("Ika nugus - tuj")` },
        { speaker: 'b', nawat: 'Naja nimumachtia nawat mujmusta.', es: 'Yo estudio náhuat todos los días.', evidence: 'directa', source: `${M}, l.44742` },
        { speaker: 'a', nawat: 'Naja nimumachtia nawat chujchupika.', es: 'Yo aprendo náhuat poco a poco.', evidence: 'directa', source: `${M}, l.40276` },
      ],

      vocabulary: [
        { nawat: 'Mumachtia', es: 'Aprender, estudiar', pron: 'mu-mach-ti-a', pronText: 'mu mach ti a', evidence: 'directa', source: `${M}, p.140` },
        { nawat: 'Chujchupika', es: 'Poco a poco', pron: 'chuj-chu-pi-ka', pronText: 'chuj chu pi ka', evidence: 'directa', source: `${M}, l.40276 — en "Naja nimumachtia nawat chujchupika"` },
      ],

      note: {
        title: 'Un verbo que se hace a sí mismo',
        body:
          '«Mumachtia» lleva `mu-` adelante, y ese `mu-` quiere decir «a sí mismo». Literalmente es «se enseña a sí mismo» — o sea, aprende.\n\nPor eso decís «ni-mu-machtia»: primero quién (ni- = yo), después el reflexivo (mu- = a mí mismo), y al final el verbo.\n\nOjo: este `mu-` es distinto del `mu-` de «mutukey» (tu nombre). Uno es reflexivo, el otro es posesivo. Se escriben igual y se distinguen por dónde van: adelante de un verbo, o adelante de un sustantivo.\n\n«Chujchupika» —poco a poco— es probablemente la palabra más útil de todo este curso.',
        examples: [
          { nawat: '¿Taika timumachtia nawat?', es: '¿Por qué estudiás náhuat?', source: `${M}, l.40482` },
          { nawat: 'Ika nugustuj', es: 'Porque me gusta', source: `${M}, l.40482` },
          { nawat: 'Naja nimumachtia nawat chujchupika', es: 'Yo aprendo náhuat poco a poco', source: `${M}, l.40276` },
        ],
      },

      task:
        'Contestá de verdad: ¿por qué estás aprendiendo náhuat? Escribilo en español, en una línea. Guardalo. Vas a querer leerlo el día que se te haga cuesta arriba.',

      speakerAsk:
        '«Ika nugustuj» sale del español «gustar». ¿Se usa así en Witzapan, o hay una manera más propia de decir «porque me gusta»?',
    },

    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'm2-l4',
      order: 4,
      type: 'dialogo',
      title: { nawat: 'Nusan', es: 'Decir que vos también' },
      situation:
        'Resulta que la otra persona también está aprendiendo. Se dan cuenta de que van en el mismo camino.',
      objective: 'Sumarte a lo que dijo el otro, y despedirte de la conversación.',

      dialogue: [
        { speaker: 'a', nawat: 'Naja nimumachtia nawat mujmusta.', es: 'Yo estudio náhuat todos los días.', evidence: 'directa', source: `${M}, l.44742` },
        { speaker: 'b', nawat: 'Naja nimumachtia nawat nusan.', es: 'Yo también estudio náhuat.', evidence: 'compuesta', source: `${M}. "nusan" (p.155) agregado a la frase atestiguada de l.44742.` },
        { speaker: 'a', nawat: 'Nemi pal nimumachtia.', es: 'Tengo que estudiar.', evidence: 'directa', source: `${M}, l.12838` },
        { speaker: 'b', nawat: 'Niwitz neman.', es: 'Vuelvo rápido.', evidence: 'directa', source: `${M}, l.36404` },
      ],

      vocabulary: [
        { nawat: 'Nusan', es: 'También', pron: 'nu-san', pronText: 'nu san', evidence: 'directa', source: `${M}, p.155` },
        { nawat: 'Ka', es: 'En, a', pron: 'ka', pronText: 'ka', evidence: 'directa', source: `${M}, p.104` },
        { nawat: 'Né', es: 'Allá', pron: 'né', pronText: 'ne', evidence: 'directa', source: `${M}, p.152` },
      ],

      note: {
        title: '"Nemi" otra vez, y ahora significa otra cosa',
        body:
          'En el módulo 1 aprendiste «Ninemi yek» — yo estoy bien. Acá aparece «Nemi pal nimumachtia» — tengo que estudiar.\n\nEs el mismo verbo. «Nemi» es estar, existir, haber. Solo, sin prefijo, sirve para decir que algo hay:\n\n  Nemi takwal   →  Hay comida\n  Nemi pal…     →  Hay que… / Tengo que…\n\nNo te preocupes por dominarlo hoy. Lo que importa es que lo reconozcas: «nemi» va a aparecer en casi toda conversación, y cada vez con un matiz distinto.',
        examples: [
          { nawat: 'Nemi pal nimumachtia', es: 'Tengo que estudiar', source: `${M}, l.12838` },
          { nawat: 'Nemi takwal', es: 'Hay comida', source: `${M}, l.12830` },
        ],
      },

      task:
        'La próxima vez que alguien cuente algo que vos también hacés, contestá «nusan» en tu cabeza antes de decirlo en español. Una palabra sola, usada a tiempo, vale más que una lista memorizada.',

      speakerAsk:
        '¿«Nemi pal nimumachtia» se entiende como obligación («tengo que») o más como «hay para»? ¿Y se usa en el día a día?',
    },
  ],
}

export default module2
