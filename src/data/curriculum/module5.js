/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  MÓDULO 5 — Takwal  ·  La comida
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  POR QUÉ CIERRA ACÁ
 *
 *  Es lo más concreto y lo más usado, y es donde el diccionario tiene más
 *  frases reales: la cocina es de lo poco que se siguió haciendo en náhuat.
 *  Trece de las catorce frases de este módulo están ATESTIGUADAS literalmente.
 *  Es el módulo con menos invención de todo el curso.
 *
 *  ES TAMBIÉN DONDE ENTRAN LOS VERBOS TRANSITIVOS
 *
 *  Hasta acá todo fue intransitivo a propósito (ver módulo 3). Cocinar, en
 *  cambio, es hacerle algo a algo: se echa LA tortilla, se exprime LA naranja.
 *  El náhuat mete ese objeto adentro del verbo, con una `k`:
 *
 *      ni-k-teka ne tamal      echo la tortilla
 *      ni-k-patzka ne lala     exprimo la naranja
 *      ni-k-uni atutun         tomo café
 *
 *  Esa `k` es la que faltaba en los cuatro errores de julio y agosto de 2026
 *  (−Pia, −Uni enseñadas desnudas). Acá llega después de cuatro módulos de
 *  verbos que no la necesitan, que era exactamente el punto de reordenar el
 *  curso: llega cuando ya se puede ver de dónde sale, no como una regla suelta.
 *
 *  El módulo cierra con «shi-», el modo de pedir. Es lo último que se enseña y
 *  lo primero que alguien va a querer usar de verdad.
 */

const M = 'Diccionario YULTAJTAKETZALIS (Pérez & Martínez, 2023)'

const module5 = {
  id: 'm5',
  order: 5,
  title: { nawat: 'Takwal', es: 'La comida' },
  titleSource: `${M}, p.194 — "Takwal: Comida (de maíz)"`,
  description: 'Nombrar lo que se come y se bebe, hablar de la cocina y pedir algo.',
  icon: '🌽',
  color: '#C1272D',

  lessons: [
    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'm5-l1',
      order: 1,
      type: 'dialogo',
      title: { nawat: 'Nemi takwal', es: 'Hay comida' },
      situation:
        'Llegaste a una casa a la hora de comer. Lo primero que te van a decir es que hay comida — y en El Salvador eso casi siempre significa una cosa.',
      objective: 'Decir que hay comida y hablar de prepararla.',

      dialogue: [
        { speaker: 'a', nawat: 'Nemi takwal.', es: 'Hay comida.', evidence: 'directa', source: `${M}, l.12830` },
        { speaker: 'b', nawat: 'Nemi kukumutzin.', es: 'Hay pupusas.', evidence: 'directa', source: `${M}, l.12830` },
        { speaker: 'a', nawat: 'Niktutunia ne takwal.', es: 'Caliento la comida.', evidence: 'directa', source: `${M}, l.27635` },
        { speaker: 'b', nawat: 'Niu-nikejekua ne takwal.', es: 'Voy a probar la comida.', evidence: 'directa', source: `${M}, l.40644` },
      ],

      vocabulary: [
        { nawat: 'Takwal', es: 'Comida', pron: 'tak-wal', pronText: 'tak ual', evidence: 'directa', source: `${M}, p.194 — "Takwal: Comida (de maíz)"` },
        { nawat: 'Kukumutzin', es: 'Pupusa', pron: 'ku-ku-mu-tzin', pronText: 'ku ku mu tsin', evidence: 'directa', source: `${M}, p.113` },
        { nawat: 'Se', es: 'Uno, una', pron: 'se', pronText: 'se', evidence: 'directa', source: `${M}, p.174` },
        { nawat: 'Kumit', es: 'Olla', pron: 'ku-mit', pronText: 'ku mit', evidence: 'directa', source: `${M}, p.114` },
      ],

      note: {
        title: 'La "k" que aparece en medio del verbo',
        body:
          'Compará estas dos, que ya conocés de módulos anteriores:\n\n  ni-takwa          →  yo como (así nomás)\n  ni-k-tutunia      →  yo lo caliento\n\nEn la segunda hay una `k` entre el «ni» y el verbo. Esa `k` quiere decir «lo»: señala que hay una cosa a la que se le hace algo.\n\nPor eso «takwal» —la comida— es «lo que se come». Y por eso el diccionario escribe algunos verbos con un guion delante, como −Uni «beber»: sin la `k` están incompletos. Nadie dice «uni», se dice «nikuni» — lo bebo.\n\nEs de las diferencias más grandes con el español, y ya la venías viendo sin que nadie la nombrara: «nikmati nawat», «nikneki nunan».',
        examples: [
          { nawat: 'Nemi takwal', es: 'Hay comida', source: `${M}, l.12830` },
          { nawat: 'Niktutunia ne takwal', es: 'Caliento la comida', source: `${M}, l.27635` },
        ],
      },

      task:
        'A la hora de comer hoy, anunciá «Nemi takwal» antes de sentarte. Es de las frases que mejor sobreviven: corta, útil y se dice todos los días.',

      speakerAsk:
        '¿«Kukumutzin» es la palabra que se usa hoy para pupusa, o la gente dice «pupusa» nomás? ¿Y «takwal» es cualquier comida o solo la de maíz, como dice el diccionario?',
    },

    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'm5-l2',
      order: 2,
      type: 'dialogo',
      title: { nawat: 'Ne tamal', es: 'La tortilla' },
      situation:
        'Están haciendo tortillas en el comal. Cada paso tiene su verbo, y todos están en el diccionario.',
      objective: 'Contar los pasos de hacer una tortilla.',

      dialogue: [
        { speaker: 'a', nawat: 'Nikteka ne tamal.', es: 'Echo la tortilla.', evidence: 'directa', source: `${M}, l.24630` },
        { speaker: 'b', nawat: 'Naja nikwepa ne tamal.', es: 'Voy a voltear la tortilla.', evidence: 'directa', source: `${M}, l.46060` },
        { speaker: 'a', nawat: 'Nikshamantia ne tamal.', es: 'Yo tuesto la tortilla.', evidence: 'directa', source: `${M}, l.44916` },
        { speaker: 'b', nawat: 'Nemi takwal.', es: 'Hay comida.', evidence: 'directa', source: `${M}, l.12830` },
      ],

      vocabulary: [
        { nawat: 'Tamal', es: 'Tortilla', pron: 'ta-mal', pronText: 'ta mal', evidence: 'directa', source: `${M}, p.198` },
        { nawat: 'Taijtik', es: 'Plato', pron: 'ta-ij-tik', pronText: 'ta ij tik', evidence: 'directa', source: `${M}, p.190` },
      ],

      note: {
        title: 'Tres verbos, una sola tortilla',
        body:
          'Fijate en lo que tienen en común:\n\n  ni-k-teka       ne tamal    →  la echo\n  ni-k-wepa       ne tamal    →  la volteo\n  ni-k-shamantia  ne tamal    →  la tuesto\n\nTodos llevan la misma `k`, y todos van seguidos de «ne tamal». La `k` adentro del verbo y la cosa afuera: el náhuat dice dos veces de qué está hablando.\n\nEso no es redundancia. La `k` puede ir sola cuando ya se sabe de qué se habla — «nikteka» basta si la tortilla ya se mencionó. Es como el «la» del español: «la echo».\n\nY ojo con «tamal»: acá no es el tamal envuelto en hoja. Es la tortilla.',
        examples: [
          { nawat: 'Nikteka ne tamal', es: 'Echo la tortilla', source: `${M}, l.24630` },
          { nawat: 'Nikshamantia ne tamal', es: 'Yo tuesto la tortilla', source: `${M}, l.44916` },
        ],
      },

      task:
        'La próxima vez que agarrés una tortilla, decí «ne tamal». Es de las palabras que más veces vas a poder usar en tu vida sin buscarte una excusa.',

      speakerAsk:
        '«Tamal» es tortilla en el diccionario, pero en el español de acá un tamal es otra cosa. ¿Cómo se le dice entonces al tamal de hoja?',
    },

    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'm5-l3',
      order: 3,
      type: 'dialogo',
      title: { nawat: 'Ne lala', es: 'La fruta y el mercado' },
      situation:
        'Están en el mercado. Uno quiere naranjas y al otro ya se le acabaron.',
      objective: 'Comprar algo, decir que se te acabó y repartir.',

      dialogue: [
        { speaker: 'a', nawat: 'Niu-nikua lala.', es: 'Voy a comprar naranjas.', evidence: 'directa', source: `${M}, l.29259` },
        { speaker: 'b', nawat: 'Tea nikpia lala.', es: 'Ya no tengo naranjas.', evidence: 'directa', source: `${M}, l.18638` },
        { speaker: 'a', nawat: 'Nikpatzka ne lala.', es: 'Exprimo la naranja.', evidence: 'directa', source: `${M}, l.32923` },
        { speaker: 'b', nawat: 'Shikwi se lala sejsika.', es: 'Agarre una naranja cada uno.', evidence: 'directa', source: `${M}, l.14908` },
      ],

      vocabulary: [
        { nawat: 'Lala', es: 'Naranja', pron: 'la-la', pronText: 'la la', evidence: 'directa', source: `${M}, p.125` },
        { nawat: 'Et', es: 'Frijol', pron: 'et', pronText: 'et', evidence: 'directa', source: `${M}, p.79` },
        { nawat: 'Tesu', es: 'No', pron: 'te-su', pronText: 'te su', evidence: 'directa', source: `${M}, p.216` },
      ],

      note: {
        title: '"Nikpia" — la palabra que esta app enseñó mal cuatro veces',
        body:
          'En la segunda línea aparece «Tea nikpia lala» — ya no tengo naranjas.\n\nEl verbo es «nikpia», tener. El diccionario lo escribe −Pia, con guion, porque nunca va solo: siempre lleva la `k` que ya conocés, la que señala lo que se tiene. Nadie dice «pia».\n\nEsta app enseñó «Pia = tener» durante meses, hasta que se corrigió en agosto de 2026. Fue el mismo error cuatro veces, con cuatro palabras distintas, y por eso todo el curso se reordenó para llegar acá recién ahora — cuando esa `k` ya la viste funcionar veinte veces.\n\nY «tea» quiere decir «ya no». Corta y utilísima.',
        examples: [
          { nawat: 'Tea nikpia lala', es: 'Ya no tengo naranjas', source: `${M}, l.18638` },
          { nawat: 'Niu-nikua lala', es: 'Voy a comprar naranjas', source: `${M}, l.29259` },
        ],
      },

      task:
        'En el mercado o en la tienda, contá en náhuat lo que vas a comprar. No hace falta que lo digas en voz alta si te da vergüenza — pero decilo.',

      speakerAsk:
        '¿«Lala» es solo la naranja o cualquier cítrico? ¿Y cómo se dicen las frutas que más se comen acá — el mango, el guineo, la papaya?',
    },

    // ─────────────────────────────────────────────────────────────────────
    {
      id: 'm5-l4',
      order: 4,
      type: 'dialogo',
      title: { nawat: 'Shinechmaka at', es: 'Pedir algo' },
      situation:
        'Estás sentado a la mesa con gente. Tenés sed y hay que pedir. Es lo primero que uno quiere poder hacer en una lengua nueva.',
      objective: 'Pedir agua o comida, y ofrecer algo a alguien.',

      dialogue: [
        { speaker: 'a', nawat: '¿Tikneki at?', es: '¿Querés agua?', evidence: 'compuesta', source: `${M}. Sobre "Naja nikneki nunan" (l.41038), cambiando ni- por ti- como en "¿Kanka tiwitz?" (l.24722), con At (p.58).` },
        { speaker: 'b', nawat: 'Shinechmaka chupichin at.', es: 'Dame un poquito de agua.', evidence: 'directa', source: `${M}, l.4536` },
        { speaker: 'a', nawat: 'Nikuni atutun.', es: 'Tomo café.', evidence: 'directa', source: `${M}, l.26823` },
        { speaker: 'b', nawat: 'Shinechmaka ukse.', es: 'Dame otro más.', evidence: 'directa', source: `${M}, l.22436` },
      ],

      vocabulary: [
        { nawat: 'At', es: 'Agua', pron: 'at', pronText: 'at', evidence: 'directa', source: `${M}, p.58` },
        { nawat: 'Atutun', es: 'Café', pron: 'a-tu-tun', pronText: 'a tu tun', evidence: 'directa', source: `${M}, p.60` },
        { nawat: 'Atiluni', es: 'Taza', pron: 'a-ti-lu-ni', pronText: 'a ti lu ni', evidence: 'directa', source: `${M}, p.60` },
      ],

      note: {
        title: 'Cómo se pide: "shi-" y "nech-"',
        body:
          'Partí la palabra y se entiende sola:\n\n  shi-nech-maka\n   │    │    └─ dar\n   │    └────── a mí\n   └─────────── vos, hacé esto\n\n«Shi-» adelante convierte cualquier verbo en un pedido. «Nech-» quiere decir «a mí». Juntos: dame.\n\nYa lo viste sin saberlo en el módulo 1, en «Shiawa» — andate. Mismo «shi-».\n\nFijate también en «atutun»: at + tutun, agua caliente. Así se dice café. Y «atiluni» es el aparato del agua — la taza. Una vez que ves «at» adentro de las palabras, aparece por todos lados.',
        examples: [
          { nawat: 'Shinechmaka chupichin at', es: 'Dame un poquito de agua', source: `${M}, l.4536` },
          { nawat: 'Shinechmaka ukse', es: 'Dame otro más', source: `${M}, l.22436` },
          { nawat: 'Nikuni atutun', es: 'Tomo café', source: `${M}, l.26823` },
        ],
      },

      task:
        'Pedí un vaso de agua en náhuat hoy. A quien sea. Después explicá qué dijiste. Terminaste el curso: ya podés saludar, decir quién sos, contar tu día, hablar de los tuyos y pedir de comer.',

      speakerAsk:
        '¿«Shinechmaka» es la manera normal de pedir o suena brusca? ¿Hay una forma más cortés, algo así como el «por favor»?',
    },
  ],
}

export default module5
