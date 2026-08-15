/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  MÓDULO 4 — Nukal  ·  Mi casa y los míos
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  POR QUÉ ESTE MÓDULO ES EL MÁS DELICADO
 *
 *  La familia es de lo primero que se pregunta en cualquier conversación, y es
 *  justo lo que la app venía enseñando peor: los términos de parentesco NO van
 *  sueltos. El diccionario los escribe con guion (−Nan, −Teku, −Tatanoy) porque
 *  exigen prefijo posesivo. Acá van siempre poseídos, y las tres formas están
 *  atestiguadas literalmente: "Nunan: Mi mamá" (l.12370), "Nuteku: Mi papá"
 *  (l.18920), "Nutatanoy" (l.18134).
 *
 *  DOS TRAMPAS DE LA FUENTE, DOCUMENTADAS
 *
 *  1. NUTEKU. En los ejemplos del diccionario aparece casi siempre como
 *     "Nuteku Tiut" = Dios (l.9363, l.17298). La entrada suelta "Nuteku: Mi
 *     papá" sí existe (l.18920), pero el uso más frecuente en el libro es el
 *     religioso. Está en `speakerAsk`: hay que confirmar que no se confunda.
 *
 *  2. NUTATANOY. El diccionario se contradice consigo mismo. La ENTRADA dice
 *     «−Tatanoy *Sust.* Abuelo» y el ejemplo debajo dice «Nutatanoy: Mi
 *     abuela» — en las dos direcciones del libro (l.18132 y l.24516). Se enseña
 *     ABUELO, por tres razones: es lo que dice la definición, hay dos ejemplos
 *     independientes que lo confirman ("ipanpa nutatanoy: para mi abuelo"
 *     l.7454; "Ne nuipan nutatanoy: Mi bisabuelo" l.5773), y la palabra para
 *     abuela es otra: «Nunoya» (l.13038). O sea que el ejemplo tiene una errata.
 *     Queda en `speakerAsk` igual: una errata en la fuente se confirma con un
 *     hablante, no se decide sola.
 *
 *  Este módulo es la razón por la que `evidence` existe como campo obligatorio.
 */

const M = 'Diccionario YULTAJTAKETZALIS (Pérez & Martínez, 2023)'

const module4 = {
  id: 'm4',
  order: 4,
  title: { nawat: 'Nukal', es: 'Mi casa y los míos' },
  titleSource: `${M}, l.28237 — "Niu-nikulalwia nukal: Voy a cercar mi casa"`,
  description: 'Hablar de tu casa, de los animales y de quién vive con vos.',
  icon: '🏠',
  color: '#6A4C93',

  lessons: [
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'm4-l1',
      order: 1,
      type: 'dialogo',
      title: { nawat: 'Ne mistun', es: 'La casa y los animales' },
      situation:
        'Te invitaron a una casa. Adentro hay un gato echado y un perro que no para de moverse.',
      objective: 'Decir dónde está algo, usando tu casa como referencia.',

      dialogue: [
        { speaker: 'a', nawat: 'Ne mistun nemi kalijtik.', es: 'El gato está dentro de la casa.', evidence: 'directa', source: `${M}, l.7268` },
        { speaker: 'b', nawat: 'Ne mistun se kalchanej.', es: 'El gato es un animal doméstico.', evidence: 'directa', source: `${M}, l.7244` },
        { speaker: 'a', nawat: 'Ne mistun nemi ka nuikshitan.', es: 'El gato está por mis pies.', evidence: 'directa', source: `${M}, l.5478` },
        { speaker: 'b', nawat: 'Ne pelu nemi tik nukal.', es: 'El perro está en mi casa.', evidence: 'compuesta', source: `${M}. Molde "Ne + SUSTANTIVO + nemi + lugar" de l.7268, con Pelu (p.164) y "tik" (p.19).` },
      ],

      vocabulary: [
        { nawat: 'Kal', es: 'Casa', pron: 'kal', pronText: 'kal', evidence: 'directa', source: `${M}, p.105` },
        { nawat: 'Mistun', es: 'Gato', pron: 'mis-tun', pronText: 'mis tun', evidence: 'directa', source: `${M}, p.136` },
        { nawat: 'Pelu', es: 'Perro', pron: 'pe-lu', pronText: 'pe lu', evidence: 'directa', source: `${M}, p.164` },
        { nawat: 'Nemi', es: 'Estar, vivir', pron: 'ne-mi', pronText: 'ne mi', evidence: 'directa', source: `${M}, p.153` },
        { nawat: 'Tijlan', es: 'Gallina', pron: 'tij-lan', pronText: 'tij lan', evidence: 'directa', source: `${M}, p.218` },
      ],

      note: {
        title: 'De "kal" salen media docena de palabras',
        body:
          '«Kal» es casa. Pero casi nunca anda sola:\n\n  kal-ijtik    →  adentro de la casa\n  kal-chanej   →  animal de casa (doméstico)\n  kal-aki      →  entrar (meterse a la casa)\n  nu-kal       →  mi casa\n\nY ese `nu-` de «nukal» es el mismo de «nutukey» (mi nombre) y «nunan» (mi mamá). Una sola pieza, siempre adelante, siempre queriendo decir «mío».\n\nFijate en «nuikshitan» de la tercera línea: nu-ikshi-tan, «por mis pies». Ahí está otra vez.',
        examples: [
          { nawat: 'Ne mistun nemi kalijtik', es: 'El gato está dentro de la casa', source: `${M}, l.7268` },
          { nawat: 'Ne mistun se kalchanej', es: 'El gato es un animal doméstico', source: `${M}, l.7244` },
        ],
      },

      task:
        'Mirá alrededor tuyo ahora mismo. ¿Hay un gato, un perro o una gallina cerca? Decilo: «Ne mistun nemi…». Si no hay ninguno, decilo igual con lo que sí haya.',

      speakerAsk:
        '¿«Kalijtik» y «tik nukal» se usan igual, o hay una diferencia entre estar adentro y estar en la casa?',
    },

    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'm4-l2',
      order: 2,
      type: 'dialogo',
      title: { nawat: 'Nunan wan nuteku', es: 'Mi mamá y mi papá' },
      situation:
        'La persona de la casa te pregunta por los tuyos. Es la pregunta que abre cualquier conversación en un pueblo.',
      objective: 'Nombrar a tu mamá y a tu papá, y decir dónde están.',

      dialogue: [
        { speaker: 'a', nawat: 'Nunan nemi tik nukal.', es: 'Mi mamá está en mi casa.', evidence: 'compuesta', source: `${M}. Junta tres piezas atestiguadas: "Nunan" (l.12370), el molde "… nemi …" de l.7268 y "tik" (p.19). Muy cerca de la frase atestiguada "nunan nemi wejka" (l.12344).` },
        { speaker: 'b', nawat: 'Naja nikneki nunan.', es: 'Yo quiero a mi mamá.', evidence: 'directa', source: `${M}, l.41038` },
        { speaker: 'a', nawat: 'Nuteku tekiti.', es: 'Mi papá trabaja.', evidence: 'compuesta', source: `${M}. "Nuteku" (l.18920) con el verbo Tekiti atestiguado conjugado en l.18872.` },
        { speaker: 'b', nawat: 'Nunan nemi wejka.', es: 'Mi mamá está lejos.', evidence: 'compuesta', source: `${M}, l.12344 — es una parte de la frase atestiguada "Naja nikiski namej nunan nemi wejka: Como mi mamá está lejos, yo salí". La cláusula se sostiene sola, pero no está escrita suelta.` },
      ],

      vocabulary: [
        { nawat: 'Nunan', es: 'Mi mamá', pron: 'nu-nan', pronText: 'nu nan', evidence: 'directa', source: `${M}, l.12370 — "Nunan: Mi mamá"` },
        { nawat: 'Nuteku', es: 'Mi papá', pron: 'nu-te-ku', pronText: 'nu te ku', evidence: 'directa', source: `${M}, l.18920 — "Nuteku: Mi papá"` },
        { nawat: 'Wejka', es: 'Lejos', pron: 'wej-ka', pronText: 'uej ka', evidence: 'directa', source: `${M}, p.246` },
      ],

      note: {
        title: 'Nadie dice "mamá" a secas',
        body:
          'El diccionario escribe estas palabras con un guion delante: −Nan, −Teku, −Tatanoy. Ya sabés lo que significa ese guion, porque lo viste con −tukey: acá falta algo adelante.\n\n  nu-nan  →  mi mamá\n  mu-nan  →  tu mamá\n  i-nan   →  su mamá\n\nNo existe «nan» suelto queriendo decir mamá. En náhuat una madre es siempre la madre DE alguien. Lo mismo pasa con las partes del cuerpo: no hay «mano», hay «mi mano».\n\nEs otra manera de entender de quién son las cosas — y de las que mejor muestran que traducir palabra por palabra no alcanza.',
        examples: [
          { nawat: 'Nunan: Mi mamá', es: 'Mi mamá', source: `${M}, l.12370` },
          { nawat: 'Naja nikneki nunan', es: 'Yo quiero a mi mamá', source: `${M}, l.41038` },
        ],
      },

      task:
        'Decí «nunan» y «nuteku» pensando en los tuyos de verdad, no en una traducción. Si podés, decíselo a ellos y explicales qué significa.',

      speakerAsk:
        'IMPORTANTE: en los ejemplos del diccionario «Nuteku» aparece casi siempre como «Nuteku Tiut» = Dios. ¿Decir «Nuteku» solo se entiende como «mi papá», o se presta a confusión? ¿Hay otra palabra más común para el papá?',
    },

    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'm4-l3',
      order: 3,
      type: 'dialogo',
      title: { nawat: 'Kan nemi?', es: 'Preguntar dónde está alguien' },
      situation:
        'Llegaste a buscar a alguien y no está a la vista. Hay que preguntar.',
      objective: 'Preguntar dónde está una persona y contestar.',

      dialogue: [
        { speaker: 'a', nawat: '¿Kan nemi nunan?', es: '¿Dónde está mi mamá?', evidence: 'compuesta', source: `${M}. Molde "¿Kan nemi + SUSTANTIVO?" atestiguado en "¿Kan nemi ne titika?: ¿Dónde está el dolor?" (l.20368), con "Nunan" (l.12370).` },
        { speaker: 'b', nawat: 'Nunan nemi tik nukal.', es: 'Mi mamá está en mi casa.', evidence: 'compuesta', source: `${M}. Ver la lección anterior.` },
        { speaker: 'a', nawat: '¿Kan nemi nutatanoy?', es: '¿Dónde está mi abuelo?', evidence: 'compuesta', source: `${M}. Mismo molde de l.20368, con "Nutatanoy" (l.18134).` },
        { speaker: 'b', nawat: 'Nutatanoy nemi tik nukal.', es: 'Mi abuelo está en mi casa.', evidence: 'compuesta', source: `${M}. El diccionario no trae ninguna frase con Nutatanoy conjugada con nemi; se arma con el molde de l.7268.` },
      ],

      vocabulary: [
        { nawat: 'Nutatanoy', es: 'Mi abuelo', pron: 'nu-ta-ta-noy', pronText: 'nu ta ta noi', evidence: 'directa', source: `${M}, l.18134. OJO: la entrada define "−Tatanoy: Abuelo" pero el ejemplo dice "Mi abuela"; se sigue la definición, confirmada por l.7454 y l.5773. La palabra para abuela es "Nunoya" (l.13038).` },
        { nawat: 'Nunoya', es: 'Mi abuela', pron: 'nu-no-ya', pronText: 'nu no ya', evidence: 'directa', source: `${M}, l.13038 — "Nunoya: Mi abuela"` },
      ],

      note: {
        title: 'Preguntar dónde: una sola forma para todo',
        body:
          '«¿Kan nemi…?» sirve para cualquier cosa que quieras ubicar, viva o no:\n\n  ¿Kan nemi nunan?      →  ¿Dónde está mi mamá?\n  ¿Kan nemi ne mistun?  →  ¿Dónde está el gato?\n\nNo cambia según qué preguntes. Es la misma «nemi» de «Ninemi yek» del módulo 1 y de «Nemi takwal» del módulo 2: estar, existir, haber.\n\nUn verbo, tres usos que en español necesitan tres verbos distintos. Cuando lo tengas agarrado, media conversación se te abre.',
        examples: [
          { nawat: '¿Kan nemi ne titika?', es: '¿Dónde está el dolor?', source: `${M}, l.20368` },
          { nawat: '¿Kan nemi nunan?', es: '¿Dónde está mi mamá?', source: `${M}. Molde de l.20368.` },
        ],
      },

      task:
        'La próxima vez que busques algo en tu casa, preguntá en voz alta «¿Kan nemi…?». Aunque estés solo. Aunque sea por las llaves.',

      speakerAsk:
        'El diccionario se contradice: la entrada dice «−Tatanoy: Abuelo» pero el ejemplo debajo dice «Nutatanoy: Mi abuela», y trae «Nunoya» para abuela. ¿Cuál es cuál? ¿Y «Nutatanoy» se usa hoy o hay otra palabra?',
    },

    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'm4-l4',
      order: 4,
      type: 'dialogo',
      title: { nawat: 'Ne shulut', es: 'Los niños de la casa' },
      situation:
        'Hay un bebé durmiendo y dos muchachos jugando afuera. La casa está llena.',
      objective: 'Nombrar a los niños de la casa y decir qué se hace con ellos.',

      dialogue: [
        { speaker: 'a', nawat: 'Niu-nikaltia ne shulut.', es: 'Voy a bañar al bebé.', evidence: 'directa', source: `${M}, l.26711` },
        { speaker: 'b', nawat: 'Niu-nikuchteka ne shulut.', es: 'Voy a adormecer al bebé.', evidence: 'directa', source: `${M}, l.8134` },
        { speaker: 'a', nawat: 'Ne piltzín nemi tik nukal.', es: 'El niño está en mi casa.', evidence: 'compuesta', source: `${M}. Molde de l.7268 con Piltzín (p.165) y "tik" (p.19).` },
        { speaker: 'b', nawat: 'Ne siwapil nemi kalijtik.', es: 'La niña está dentro de la casa.', evidence: 'compuesta', source: `${M}. Molde de l.7268 con Siwapil (p.178) y "kalijtik" (p.106).` },
      ],

      vocabulary: [
        { nawat: 'Shulut', es: 'Bebé recién nacido', pron: 'shu-lut', pronText: 'su lut', evidence: 'directa', source: `${M}, p.186` },
        { nawat: 'Piltzín', es: 'Niño o joven', pron: 'pil-tzin', pronText: 'pil tsin', evidence: 'directa', source: `${M}, p.165` },
        { nawat: 'Siwapil', es: 'Niña o joven', pron: 'si-wa-pil', pronText: 'si ua pil', evidence: 'directa', source: `${M}, p.178` },
        { nawat: 'Kalijtik', es: 'Adentro de la casa', pron: 'ka-lij-tik', pronText: 'ka lij tik', evidence: 'directa', source: `${M}, p.106` },
      ],

      note: {
        title: 'Ese "-tzin" del final quiere decir algo',
        body:
          '«Piltzín» termina en `-tzin`. Esa terminación aparece por todo el náhuat y no es decoración: marca cariño o respeto.\n\n  pil-tzín       →  niño (el pequeño, el querido)\n  nunan-tzin     →  mi madrecita, con respeto\n  kukumu-tzin    →  pupusa\n\nEs la misma idea del «-ito» del español, pero se usa mucho más y no siempre significa que algo sea chiquito: muchas veces significa que a uno le importa.\n\nFijate también en «niu-nik-altia» y «niu-nik-uchteka»: entre el «niu-» que ya conocés y el verbo hay una `k`. Esa `k` señala a quién se le hace la cosa — al bebé. Es la marca de objeto, y ya la viste en «ni-k-mati nawat».',
        examples: [
          { nawat: 'Niu-nikaltia ne shulut', es: 'Voy a bañar al bebé', source: `${M}, l.26711` },
          { nawat: 'Niu-nikuchteka ne shulut', es: 'Voy a adormecer al bebé', source: `${M}, l.8134` },
        ],
      },

      task:
        'Si hay niños cerca tuyo, probá nombrarlos en náhuat: shulut, piltzín, siwapil. Los niños son los únicos que pueden hacer que una lengua vuelva, y son los que menos se resisten a que les hablen raro.',

      speakerAsk:
        '¿«Piltzín» y «Siwapil» se usan para niños chiquitos o también para muchachos grandes? ¿Y hasta qué edad alguien es «shulut»?',
    },
  ],
}

export default module4
