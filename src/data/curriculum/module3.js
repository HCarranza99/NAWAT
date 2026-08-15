/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  MÓDULO 3 — Ka peyna, ka tiutak  ·  Lo que hacés en el día
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  POR QUÉ ESTE MÓDULO ES EL MÁS SEGURO DE TODO EL CURSO
 *
 *  Todos sus verbos son INTRANSITIVOS: kuchi, tekiti, nejnemi, takwa, kisa,
 *  kalaki, paki, isa, mayana, ajsi. Solo piden prefijo de sujeto (ni-, ti-).
 *  Ninguno exige marcador de objeto, que es donde se equivocó la app cuatro
 *  veces seguidas. Es el bloque que más rinde por menos riesgo, y por eso va
 *  temprano.
 *
 *  EL TÍTULO NO ES "NUTUNAL"
 *
 *  El paquete de validación proponía «Nutunal — Mi día». Se cambió: el
 *  diccionario registra "Nutunal: Mi vida, mi espíritu, mi energía, mi fuerza"
 *  (p.223). Morfológicamente «nutunal» es "mi día", pero el significado
 *  lexicalizado es otro, y un título no es lugar para una ambigüedad así.
 *  «Ka peyna» y «ka tiutak» están los dos atestiguados (l.7054, l.20392) y no
 *  se prestan a confusión. Queda la pregunta abierta para el hablante.
 *
 *  PROCEDENCIA
 *
 *  Nueve de las trece frases son ATESTIGUADAS, verificadas una por una contra
 *  `docs/YULTAJTAKETZALIS.md`. Las compuestas siguen el molde "Naja ni-VERBO"
 *  (l.31123) o "¿Ti-VERBO?" (l.24722), los dos atestiguados.
 */

const M = 'Diccionario YULTAJTAKETZALIS (Pérez & Martínez, 2023)'

const module3 = {
  id: 'm3',
  order: 3,
  title: { nawat: 'Ka peyna, ka tiutak', es: 'Lo que hacés en el día' },
  titleSource: `${M}, l.7054 ("Ka peyna: En la mañana") y l.20392 ("Niu-nikisa ka tiutak: Saldré en la tarde")`,
  description: 'Contar lo que hacés en un día común: despertarte, salir, trabajar, comer, dormir.',
  icon: '🌅',
  color: '#B5651D',

  lessons: [
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'm3-l1',
      order: 1,
      type: 'dialogo',
      title: { nawat: 'Ka peyna', es: 'Empezar el día' },
      situation:
        'Alguien te pregunta cómo son tus mañanas. Es la conversación más común que existe y casi nadie la puede tener en náhuat.',
      objective: 'Contar a qué hora te despertás y cuándo salís.',

      dialogue: [
        { speaker: 'a', nawat: '¿Tiisa peyna?', es: '¿Te despertás en la mañana?', evidence: 'compuesta', source: `${M}. Molde "¿Ti-VERBO?" de "¿Kanka tiwitz?" (l.24722) sobre el verbo Isa (p.92).` },
        { speaker: 'b', nawat: 'Naja niisa peyna.', es: 'Yo me despierto en la mañana.', evidence: 'compuesta', source: `${M}. Molde "Naja ni-VERBO" (l.31123) con "peyna" (p.164). PENDIENTE: confirmar el encuentro de vocales ni + isa.` },
        { speaker: 'b', nawat: 'Niu-nikisa ka peyna.', es: 'Saldré en la mañana.', evidence: 'directa', source: `${M}, l.36785` },
        { speaker: 'a', nawat: 'Naja nikisa.', es: 'Yo salgo.', evidence: 'directa', source: `${M}, l.42312` },
      ],

      vocabulary: [
        { nawat: 'Isa', es: 'Despertarse', pron: 'i-sa', pronText: 'i sa', evidence: 'directa', source: `${M}, p.92` },
        { nawat: 'Kisa', es: 'Salir', pron: 'ki-sa', pronText: 'ki sa', evidence: 'directa', source: `${M}, p.111` },
        { nawat: 'An', es: 'Hoy', pron: 'an', pronText: 'an', evidence: 'directa', source: `${M}, p.25` },
      ],

      note: {
        title: '"Niu-" es lo que todavía no pasó',
        body:
          'Compará las dos:\n\n  ni-kisa       →  yo salgo\n  niu-ni-kisa   →  yo saldré\n\nEse «niu-» adelante marca que la acción viene, que aún no ocurrió. El diccionario está lleno de frases así: «Niu-nikisa ka peyna» — saldré en la mañana.\n\nNo hace falta que lo produzcas todavía. Alcanza con que, cuando veas «niu-» al principio, sepas que te están hablando de después.\n\nY «ka» quiere decir «en»: ka peyna (en la mañana), ka tiutak (en la tarde), ka tayua (en la noche).',
        examples: [
          { nawat: 'Niu-nikisa ka peyna', es: 'Saldré en la mañana', source: `${M}, l.36785` },
          { nawat: 'Naja nikisa', es: 'Yo salgo', source: `${M}, l.42312` },
        ],
      },

      task:
        'Mañana, apenas abras los ojos, decí «niisa». Una palabra. Es el experimento más barato que existe para saber si algo se te quedó.',

      speakerAsk:
        '¿«Naja niisa» se dice así, con las dos vocales juntas, o se contrae al hablar? ¿Y a qué hora empieza «peyna» de verdad?',
    },

    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'm3-l2',
      order: 2,
      type: 'dialogo',
      title: { nawat: 'Nitekiti', es: 'Hablar del trabajo' },
      situation:
        'Después de preguntar de dónde venís, lo siguiente que pregunta cualquiera es en qué trabajás.',
      objective: 'Decir que trabajás y contar dónde trabaja alguien.',

      dialogue: [
        { speaker: 'a', nawat: '¿Titekiti mujmusta?', es: '¿Trabajás todos los días?', evidence: 'compuesta', source: `${M}. Molde "¿Ti-VERBO?" (l.24722) sobre Tekiti (p.209), con "mujmusta" (l.44742).` },
        { speaker: 'b', nawat: 'Naja nitekiti.', es: 'Yo trabajo.', evidence: 'directa', source: `${M}, l.18872` },
        { speaker: 'a', nawat: 'Juana tekiti tik se kalkukumutzin.', es: 'Juana trabaja en una pupusería.', evidence: 'directa', source: `${M}, l.7276` },
        { speaker: 'b', nawat: 'Naja nikalaki.', es: 'Yo entro.', evidence: 'directa', source: `${M}, l.32011` },
      ],

      vocabulary: [
        { nawat: 'Tekiti', es: 'Trabajar', pron: 'te-ki-ti', pronText: 'te ki ti', evidence: 'directa', source: `${M}, p.209` },
        { nawat: 'Kalaki', es: 'Entrar', pron: 'ka-la-ki', pronText: 'ka la ki', evidence: 'directa', source: `${M}, p.106` },
        { nawat: 'Tik', es: 'En, dentro de', pron: 'tik', pronText: 'tik', evidence: 'directa', source: `${M}, p.19` },
      ],

      note: {
        title: 'Una palabra que te dice cómo funciona el náhuat entero',
        body:
          'Mirá «kalkukumutzin» — pupusería. Está hecha de dos palabras pegadas:\n\n  kal        →  casa\n  kukumutzin →  pupusa\n\nCasa-de-pupusas. Así se arman las palabras nuevas en náhuat: pegando las que ya existen, no tomándolas prestadas de otro idioma.\n\nEs lo mismo que hace «kalaki» (entrar): kal + aki, «meterse a la casa».\n\nCuando te topés con una palabra larga que no conocés, probá partirla. Muchas veces adentro están dos que ya sabés.',
        examples: [
          { nawat: 'Juana tekiti tik se kalkukumutzin', es: 'Juana trabaja en una pupusería', source: `${M}, l.7276` },
          { nawat: 'Naja nitekiti', es: 'Yo trabajo', source: `${M}, l.18872` },
        ],
      },

      task:
        'Buscá cómo se llama tu oficio en náhuat. Puede que no exista la palabra — eso también es un dato, y es de los que más dicen sobre una lengua que dejó de usarse en ciertos ámbitos.',

      speakerAsk:
        '¿Cómo se dice «trabajo en una oficina» o «soy estudiante»? Son los dos oficios que más va a necesitar quien use esta app.',
    },

    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'm3-l3',
      order: 3,
      type: 'dialogo',
      title: { nawat: 'Ninejnemi', es: 'Caminar y comer' },
      situation:
        'Van caminando juntos por el pueblo. Uno va apurado, el otro no.',
      objective: 'Decir cómo hacés algo —rápido o despacio— y hablar de la comida del día.',

      dialogue: [
        { speaker: 'a', nawat: 'Ninejnemi talul.', es: 'Camino rápido.', evidence: 'directa', source: `${M}, l.41288` },
        { speaker: 'b', nawat: 'Ninejnemi nejmachchin.', es: 'Camino despacio.', evidence: 'directa', source: `${M}, l.30671` },
        { speaker: 'a', nawat: 'Anhan nitakwa.', es: 'Ahorita estoy comiendo.', evidence: 'directa', source: `${M}, l.25044` },
        { speaker: 'b', nawat: 'Naja nitakwa peyna.', es: 'Yo como en la mañana.', evidence: 'compuesta', source: `${M}. Molde "Naja ni-VERBO" (l.31123) con Takwa (p.194) y "peyna" (p.164).` },
        { speaker: 'a', nawat: 'Naja nimayana.', es: 'Yo tengo hambre.', evidence: 'compuesta', source: `${M}. Molde "Naja ni-VERBO" (l.31123) sobre Mayana (p.132). El diccionario no trae este verbo conjugado en ninguna frase.` },
      ],

      vocabulary: [
        { nawat: 'Nejnemi', es: 'Caminar', pron: 'nej-ne-mi', pronText: 'nej ne mi', evidence: 'directa', source: `${M}, p.152` },
        { nawat: 'Takwa', es: 'Comer', pron: 'tak-wa', pronText: 'tak ua', evidence: 'directa', source: `${M}, p.194` },
        { nawat: 'Mayana', es: 'Tener hambre', pron: 'ma-ya-na', pronText: 'ma ya na', evidence: 'directa', source: `${M}, p.132` },
        { nawat: 'Talul', es: 'Rápido', pron: 'ta-lul', pronText: 'ta lul', evidence: 'directa', source: `${M}, l.41288 — en "Ninejnemi talul"` },
      ],

      note: {
        title: 'El cómo va detrás',
        body:
          'Ya viste dónde va el quién: adelante, pegado al verbo. El cómo va al otro lado, detrás y suelto:\n\n  Ninejnemi talul        →  camino rápido\n  Ninejnemi nejmachchin  →  camino despacio\n\nEl verbo queda en medio, con su prefijo adelante y su manera atrás.\n\nOtra cosa: «takwa» es comer sin decir qué. Si querés decir qué comés, el verbo cambia de forma — porque aparece un objeto, y el náhuat marca los objetos dentro del verbo. Eso llega en el módulo 5.\n\nY «mayana» no es «tener hambre» con un verbo tener: es un verbo entero que significa «estar con hambre». El náhuat no necesita el «tener» del español.',
        examples: [
          { nawat: 'Ninejnemi talul', es: 'Camino rápido', source: `${M}, l.41288` },
          { nawat: 'Ninejnemi nejmachchin', es: 'Camino despacio', source: `${M}, l.30671` },
          { nawat: 'Anhan nitakwa', es: 'Ahorita estoy comiendo', source: `${M}, l.25044` },
        ],
      },

      task:
        'Hoy, cuando vayas caminando a algún lado, decidí en náhuat si vas talul o nejmachchin. Nada más eso. La lengua se agarra en los momentos muertos, no en la mesa de estudio.',

      speakerAsk:
        '¿«Naja nimayana» es como se dice que uno tiene hambre? El diccionario trae el verbo pero ninguna frase con él conjugado.',
    },

    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'm3-l4',
      order: 4,
      type: 'dialogo',
      title: { nawat: 'Nipaki', es: 'Cerrar el día' },
      situation:
        'Se acabó el día. Cada quien vuelve a su casa y se despiden hasta mañana.',
      objective: 'Decir que llegaste, que estás contento y que te vas a dormir.',

      dialogue: [
        { speaker: 'a', nawat: 'Naja niajsi.', es: 'Yo llego.', evidence: 'compuesta', source: `${M}. Molde "Naja ni-VERBO" (l.31123) sobre Ajsi (p.54). El diccionario no trae este verbo conjugado en ninguna frase.` },
        { speaker: 'b', nawat: 'Naja nipaki.', es: 'Yo estoy contento, me río.', evidence: 'directa', source: `${M}, l.43412 — "Naja nipaki: Yo estoy riéndome, estoy feliz"` },
        { speaker: 'a', nawat: 'Naja nipaki nusan.', es: 'Yo también estoy contento.', evidence: 'compuesta', source: `${M}. La frase atestiguada de l.43412 con "nusan" (p.155).` },
        { speaker: 'b', nawat: '¿Tikuchi?', es: '¿Dormís?', evidence: 'compuesta', source: `${M}. Molde "¿Ti-VERBO?" (l.24722) sobre Kuchi (p.112).` },
        { speaker: 'a', nawat: 'Naja nikuchi.', es: 'Yo duermo.', evidence: 'directa', source: `${M}, l.31123` },
      ],

      vocabulary: [
        { nawat: 'Paki', es: 'Estar contento, reírse', pron: 'pa-ki', pronText: 'pa ki', evidence: 'directa', source: `${M}, p.160 — "Paki: Sonreír; estar feliz"` },
        { nawat: 'Kuchi', es: 'Dormir', pron: 'ku-chi', pronText: 'ku chi', evidence: 'directa', source: `${M}, p.112` },
        { nawat: 'Ajsi', es: 'Llegar', pron: 'aj-si', pronText: 'aj si', evidence: 'directa', source: `${M}, p.54` },
        { nawat: 'Musta', es: 'Mañana (el día siguiente)', pron: 'mus-ta', pronText: 'mus ta', evidence: 'directa', source: `${M}, p.142` },
      ],

      note: {
        title: 'Dos mañanas que no son la misma',
        body:
          'El español usa una sola palabra para dos cosas distintas, y el náhuat no:\n\n  peyna  →  la mañana, el rato de temprano\n  musta  →  mañana, el día que viene\n\n«Niu-nikisa ka peyna» es saldré en la mañana (hoy, temprano). Para el día siguiente la palabra es otra: musta.\n\nCuando dos idiomas parten el mundo distinto, ahí es donde de verdad se aprende. No es vocabulario: es otra manera de mirar el día.',
        examples: [
          { nawat: 'Naja nikuchi', es: 'Yo duermo', source: `${M}, l.31123` },
          { nawat: 'Naja nipaki', es: 'Yo estoy contento', source: `${M}, l.43412` },
        ],
      },

      task:
        'Antes de dormir hoy, repasá el día en náhuat con los verbos que ya tenés: niisa, nikisa, nitekiti, nitakwa, nikuchi. Cinco palabras y ya contaste un día entero.',

      speakerAsk:
        '¿«Paki» se usa más para reírse o para estar contento? ¿Y «Naja niajsi» se dice así, o lleva el lugar adonde uno llega?',
    },
  ],
}

export default module3
