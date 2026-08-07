/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  PAQUETE PARA VALIDAR — 4 módulos nuevos
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  NO ES CONTENIDO DE LA APP. Vive en scripts/ y no en src/data/ justamente
 *  para que no pueda llegar a un estudiante sin pasar por un hablante.
 *
 *  La idea: pedirle a un hablante que VALIDE en vez de que CREE. Confirmar una
 *  frase escrita toma segundos; redactarla desde cero, no. Por eso todo llega
 *  ya armado, en secuencia y con su procedencia.
 *
 *  CÓMO SE ARMÓ, Y POR QUÉ ASÍ
 *
 *  El primer intento lo escribí a mano y al cotejarlo salieron 34 errores:
 *  páginas inferidas en vez de leídas, y "frases atestiguadas" que eran
 *  fragmentos de otra más larga ("Ne mistun" es un pedazo de "Ne mistun nemi
 *  kalijtik"). Se rehízo con otro método: BUSCAR las frases en el diccionario
 *  en lugar de escribirlas (ver ./extraer-frases.mjs).
 *
 *  Eso destapó algo importante: `docs/YULTAJTAKETZALIS.md` tiene 4.723 frases
 *  de ejemplo, 1.332 de ellas conversacionales. El corpus extraído solo había
 *  capturado 248 — el 5%. Casi todo este paquete sale de ahí.
 *
 *  LAS DOS ETIQUETAS, Y POR QUÉ IMPORTAN
 *
 *    'atestiguada'  Está así en el diccionario, con su número de línea. Lo que
 *                   se pide confirmar es el USO: ¿se dice en la vida diaria?
 *                   ¿sirve para quien empieza?
 *
 *    'construida'   La armé aplicando un patrón atestiguado a palabras
 *                   atestiguadas. La forma exacta NO está escrita en ninguna
 *                   parte. Acá la pregunta es la básica: ¿está bien dicha?
 *
 *  Las páginas de las palabras NO se escriben acá: las resuelve el generador
 *  contra el corpus. Escribirlas a mano fue el origen de casi todos los errores.
 */

/** Patrones atestiguados usados para construir las frases que faltaban. */
export const PATRONES = [
  { id: 'P1', forma: 'Naja ni-VERBO', es: 'Yo + verbo', modelo: 'Naja nikuchi = Yo duermo', ref: 'l.31123' },
  { id: 'P2', forma: 'Ne + SUSTANTIVO + verbo', es: 'El/la + sustantivo + verbo', modelo: 'Ne mistun nemi kalijtik = El gato está dentro de la casa', ref: 'l.7268' },
  { id: 'P3', forma: 'Nu-SUSTANTIVO', es: 'Mi + sustantivo', modelo: 'Niu-nikulalwia nukal = Voy a cercar mi casa', ref: 'l.28237' },
  { id: 'P4', forma: '¿Ti-VERBO?', es: '¿Vos + verbo?', modelo: '¿Kanka tiwitz? = ¿De dónde venís?', ref: 'l.24722' },
]

export const MODULOS_PROPUESTOS = [
  // ══════════════════════════════════════════════════════════════════════
  {
    id: 'm2',
    titulo: 'Kanka tiwitz — De dónde venís',
    objetivo: 'Decir de dónde sos, que estudiás náhuat y por qué.',
    porQue:
      'Es la conversación que de verdad va a tener quien use esta app: alguien le va a preguntar por qué está aprendiendo náhuat. Casi todo el módulo está atestiguado.',
    palabras: [
      { nawat: 'Witz', es: 'Venir', rol: 'verbo intransitivo' },
      { nawat: 'Kan', es: 'Dónde', rol: 'partícula' },
      { nawat: 'Nawat', es: 'Náhuat', rol: 'sustantivo' },
      { nawat: 'Mumachtia', es: 'Aprender, estudiar', rol: 'verbo reflexivo' },
      { nawat: 'Weli', es: 'Poder', rol: 'verbo intransitivo' },
      { nawat: 'Mujmusta', es: 'Todos los días', rol: 'partícula' },
      { nawat: 'Nusan', es: 'También', rol: 'partícula' },
      { nawat: 'Ka', es: 'En, a', rol: 'partícula' },
      { nawat: 'Neman', es: 'Luego, rápido', rol: 'partícula' },
      { nawat: 'Né', es: 'Allá', rol: 'partícula' },
    ],
    frases: [
      { nawat: '¿Kanka tiwitz?', es: '¿De dónde venís?', evidencia: 'atestiguada', linea: 24722 },
      { nawat: 'Naja niwitz', es: 'Yo vengo', evidencia: 'atestiguada', linea: 45768 },
      { nawat: 'Niwitz neman', es: 'Vuelvo rápido', evidencia: 'atestiguada', linea: 36404 },
      { nawat: 'Naja nikmati nawat', es: 'Yo sé náhuat', evidencia: 'atestiguada', linea: 42196 },
      { nawat: 'Naja niweli nawat', es: 'Yo puedo (hablar) náhuat', evidencia: 'atestiguada', linea: 40284 },
      { nawat: 'Naja nitajtaketza nawat', es: 'Yo hablo náhuat', evidencia: 'atestiguada', linea: 33962 },
      { nawat: 'Naja nimumachtia nawat mujmusta', es: 'Yo estudio náhuat todos los días', evidencia: 'atestiguada', linea: 44742 },
      { nawat: 'Naja nimumachtia nawat chujchupika', es: 'Yo aprendo náhuat poco a poco', evidencia: 'atestiguada', linea: 40276 },
      { nawat: '¿Taika timumachtia nawat?', es: '¿Por qué estudiás náhuat?', evidencia: 'atestiguada', linea: 40482 },
      { nawat: 'Ika nugustuj', es: 'Porque me gusta', evidencia: 'atestiguada', linea: 40482, nota: 'Respuesta de la frase anterior, misma línea. El diccionario la trae partida por el salto de página: "nugus - tuj".' },
      { nawat: '¿Tiweli nawat?', es: '¿Podés (hablar) náhuat?', evidencia: 'construida', patron: 'P4', nota: 'Sobre "Naja niweli nawat".' },
      { nawat: 'Naja nimumachtia nawat nusan', es: 'Yo también estudio náhuat', evidencia: 'construida', patron: 'P1' },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  {
    id: 'm3',
    titulo: 'Nutunal — Mi día',
    objetivo: 'Contar lo que hacés en un día común.',
    porQue:
      'Todos los verbos son INTRANSITIVOS: solo piden prefijo de sujeto. Es el bloque más seguro de enseñar y el que más rinde. Seis de las frases están atestiguadas tal cual.',
    palabras: [
      { nawat: 'Kuchi', es: 'Dormir', rol: 'verbo intransitivo' },
      { nawat: 'Tekiti', es: 'Trabajar', rol: 'verbo intransitivo' },
      { nawat: 'Nejnemi', es: 'Caminar', rol: 'verbo intransitivo' },
      { nawat: 'Takwa', es: 'Comer (sin decir qué)', rol: 'verbo intransitivo' },
      { nawat: 'Kisa', es: 'Salir', rol: 'verbo intransitivo' },
      { nawat: 'Kalaki', es: 'Entrar', rol: 'verbo intransitivo' },
      { nawat: 'Paki', es: 'Estar contento, reírse', rol: 'verbo intransitivo' },
      { nawat: 'Isa', es: 'Despertarse', rol: 'verbo intransitivo' },
      { nawat: 'Mayana', es: 'Tener hambre', rol: 'verbo intransitivo' },
      { nawat: 'Ajsi', es: 'Llegar', rol: 'verbo intransitivo' },
      { nawat: 'Peyna', es: 'Mañana (parte del día)', rol: 'sustantivo' },
      { nawat: 'Tiutak', es: 'Tarde (parte del día)', rol: 'sustantivo' },
      { nawat: 'An', es: 'Hoy', rol: 'partícula' },
      { nawat: 'Musta', es: 'Mañana (día siguiente)', rol: 'partícula' },
    ],
    frases: [
      { nawat: 'Naja nikuchi', es: 'Yo duermo', evidencia: 'atestiguada', linea: 31123 },
      { nawat: 'Naja nitekiti', es: 'Yo trabajo', evidencia: 'atestiguada', linea: 18872 },
      { nawat: 'Naja nikisa', es: 'Yo salgo', evidencia: 'atestiguada', linea: 42312 },
      { nawat: 'Naja nikalaki', es: 'Yo entro', evidencia: 'atestiguada', linea: 32011 },
      { nawat: 'Naja nipaki', es: 'Yo estoy contento / me río', evidencia: 'atestiguada', linea: 43412 },
      { nawat: 'Anhan nitakwa', es: 'Ahorita estoy comiendo', evidencia: 'atestiguada', linea: 25044 },
      { nawat: 'Ninejnemi talul', es: 'Camino rápido', evidencia: 'atestiguada', linea: 41288 },
      { nawat: 'Ninejnemi nejmachchin', es: 'Camino despacio', evidencia: 'atestiguada', linea: 30671 },
      { nawat: 'Niu-nikisa ka peyna', es: 'Saldré en la mañana', evidencia: 'atestiguada', linea: 36785 },
      { nawat: 'Naja nitakwa peyna', es: 'Yo como en la mañana', evidencia: 'construida', patron: 'P1' },
      { nawat: 'Naja niisa peyna', es: 'Yo me despierto en la mañana', evidencia: 'construida', patron: 'P1', nota: 'CONFIRMAR el encuentro de vocales ni + isa.' },
      { nawat: 'Naja nimayana', es: 'Yo tengo hambre', evidencia: 'construida', patron: 'P1', nota: 'El diccionario no trae ninguna frase con este verbo conjugado.' },
      { nawat: 'Naja niajsi', es: 'Yo llego', evidencia: 'construida', patron: 'P1', nota: 'Tampoco tiene frase en el diccionario.' },
      { nawat: '¿Titekiti mujmusta?', es: '¿Trabajás todos los días?', evidencia: 'construida', patron: 'P4' },
      { nawat: '¿Tikuchi?', es: '¿Dormís?', evidencia: 'construida', patron: 'P4' },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  {
    id: 'm4',
    titulo: 'Nukal — Mi casa y los míos',
    objetivo: 'Hablar de tu casa y de quién vive con vos.',
    porQue:
      'La familia es de lo primero que se pregunta, y es lo que hoy la app enseña peor: los términos de parentesco no van sueltos, van poseídos. OJO con Nuteku: en los ejemplos del diccionario aparece casi siempre como "Nuteku Tiut" = Dios.',
    palabras: [
      { nawat: 'Kal', es: 'Casa', rol: 'sustantivo' },
      { nawat: 'Nunan', es: 'Mi mamá', rol: 'sustantivo poseído' },
      { nawat: 'Nuteku', es: 'Mi papá', rol: 'sustantivo poseído' },
      { nawat: 'Nutatanoy', es: 'Mi abuelo', rol: 'sustantivo poseído' },
      { nawat: 'Piltzín', es: 'Niño o joven', rol: 'sustantivo' },
      { nawat: 'Siwapil', es: 'Niña o joven', rol: 'sustantivo' },
      { nawat: 'Shulut', es: 'Bebé', rol: 'sustantivo' },
      { nawat: 'Pelu', es: 'Perro', rol: 'sustantivo' },
      { nawat: 'Mistun', es: 'Gato', rol: 'sustantivo' },
      { nawat: 'Tijlan', es: 'Gallina', rol: 'sustantivo' },
      { nawat: 'Tik', es: 'En, dentro de', rol: 'partícula' },
    ],
    frases: [
      { nawat: 'Ne mistun nemi kalijtik', es: 'El gato está dentro de la casa', evidencia: 'atestiguada', linea: 7268 },
      { nawat: 'Ne mistun se kalchanej', es: 'El gato es un animal doméstico', evidencia: 'atestiguada', linea: 7244 },
      { nawat: 'Naja nikneki nunan', es: 'Yo quiero a mi mamá', evidencia: 'atestiguada', linea: 41038 },
      { nawat: 'Niu-nikulalwia nukal', es: 'Voy a cercar mi casa', evidencia: 'atestiguada', linea: 28237 },
      { nawat: 'Niu-nikaltia ne shulut', es: 'Voy a bañar al bebé', evidencia: 'atestiguada', linea: 26711 },
      { nawat: 'Ne mistun nemi ka nuikshitan', es: 'El gato está por mis pies', evidencia: 'atestiguada', linea: 5478 },
      { nawat: 'Nunan nemi tik nukal', es: 'Mi mamá está en mi casa', evidencia: 'construida', patron: 'P2', nota: 'CLAVE DEL MÓDULO: junta posesión + nemi + tik. Si esta se valida, se desbloquea todo lo demás.' },
      { nawat: 'Nuteku tekiti', es: 'Mi papá trabaja', evidencia: 'construida', patron: 'P1', nota: 'CONFIRMAR que "Nuteku" solo significa "mi papá" y no se confunde con "Nuteku Tiut" (Dios).' },
      { nawat: 'Ne pelu nemi tik nukal', es: 'El perro está en mi casa', evidencia: 'construida', patron: 'P2' },
      { nawat: '¿Kan nemi nunan?', es: '¿Dónde está mi mamá?', evidencia: 'construida', patron: 'P4' },
      { nawat: 'Nutatanoy nemi tik nukal', es: 'Mi abuelo está en mi casa', evidencia: 'construida', patron: 'P2', nota: 'El diccionario no trae ninguna frase con Nutatanoy.' },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════
  {
    id: 'm5',
    titulo: 'Takwal — La comida',
    objetivo: 'Nombrar lo que se come y se bebe, y pedirlo.',
    porQue:
      'Cierra con lo más concreto y lo más usado. Es también donde el diccionario tiene más frases reales, casi todas de cocina.',
    palabras: [
      { nawat: 'Takwal', es: 'Comida', rol: 'sustantivo' },
      { nawat: 'At', es: 'Agua', rol: 'sustantivo' },
      { nawat: 'Et', es: 'Frijol', rol: 'sustantivo' },
      { nawat: 'Tamal', es: 'Tortilla', rol: 'sustantivo' },
      { nawat: 'Lala', es: 'Naranja', rol: 'sustantivo' },
      { nawat: 'Kumit', es: 'Olla', rol: 'sustantivo' },
      { nawat: 'Taijtik', es: 'Plato', rol: 'sustantivo' },
      { nawat: 'Atiluni', es: 'Taza', rol: 'sustantivo' },
      { nawat: 'Se', es: 'Uno, una', rol: 'número' },
      { nawat: 'Tesu', es: 'No', rol: 'partícula' },
    ],
    frases: [
      { nawat: 'Nikteka ne tamal', es: 'Echo la tortilla', evidencia: 'atestiguada', linea: 24630 },
      { nawat: 'Naja nikwepa ne tamal', es: 'Voy a voltear la tortilla', evidencia: 'atestiguada', linea: 46060 },
      { nawat: 'Nikshamantia ne tamal', es: 'Yo tuesto la tortilla', evidencia: 'atestiguada', linea: 44916 },
      { nawat: 'Niktutunia ne takwal', es: 'Caliento la comida', evidencia: 'atestiguada', linea: 27635 },
      { nawat: 'Niu-nikejekua ne takwal', es: 'Voy a probar la comida', evidencia: 'atestiguada', linea: 40644 },
      { nawat: 'Niu-nikua lala', es: 'Voy a comprar naranjas', evidencia: 'atestiguada', linea: 29259 },
      { nawat: 'Nikpatzka ne lala', es: 'Exprimo la naranja', evidencia: 'atestiguada', linea: 32923 },
      { nawat: 'Nikuni atutun', es: 'Tomo café', evidencia: 'atestiguada', linea: 26823 },
      { nawat: 'Tea nikpia lala', es: 'Ya no tengo naranjas', evidencia: 'atestiguada', linea: 18638 },
      { nawat: '¿Tikneki at?', es: '¿Querés agua?', evidencia: 'construida', patron: 'P4' },
      { nawat: 'Naja nimayana', es: 'Yo tengo hambre', evidencia: 'construida', patron: 'P1', nota: 'Se repite del módulo 3 a propósito: acá sirve para pedir comida.' },
    ],
  },
]
