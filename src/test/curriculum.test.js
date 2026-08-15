import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import modules, {
  toRunnerItems,
  getLesson,
  cadenasConFuente,
  unidadesDeVocabulario,
  TIPOS_DE_LECCION,
  TIPOS_DE_ITEM,
  TIPOS_QUE_MIDEN,
} from '../data/curriculum'
import { buildResultState } from '../lib/resultState'

/**
 * El currículo v2 se sostiene sobre una promesa: toda cadena en náhuat que llega
 * a pantalla tiene una fuente citada. Estas pruebas la vuelven mecánica.
 *
 * No comprueban que el náhuat sea correcto —eso solo lo puede decir un
 * hablante— sino que NADA entre sin decir de dónde salió. Los cuatro errores de
 * julio y agosto de 2026 entraron por ese hueco.
 */

const corpus = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'docs/catalogo_extraido.json'), 'utf8'),
)
const clave = (s = '') =>
  String(s).toLowerCase().normalize('NFC').replace(/[−–—-]/g, '').replace(/[¡!¿?.,]/g, '').trim()

const enCorpus = new Set(corpus.items.map((i) => clave(i.text_nawat)))
const ligadas = new Set(
  corpus.items
    .filter((i) => i.kind === 'word' && i.notes?.includes('Forma de cita'))
    .map((i) => clave(i.text_nawat)),
)
// El corpus perdió la marca de guion en estas; verificadas a mano en el PDF.
// `tukey` es la forma de Witzapan (p.222), confirmada por Héctor el 14-ago-2026;
// `tukay` sigue vigilada porque también es ligada y aparece en otros materiales.
for (const extra of ['tukay', 'tukey', 'uni']) ligadas.add(extra)

const lecciones = modules.flatMap((m) => m.lessons)

/**
 * EL CONTRATO. Esto es lo que impide que la app cambie de forma cada vez que se
 * escribe contenido nuevo.
 *
 * Los tipos de ÍTEM son interfaz: cada uno tiene su componente en LessonRunner.
 * Si una lección nueva compilara a un tipo que nadie renderiza, el estudiante
 * vería "Tipo de ejercicio no soportado". Acá el error salta antes, al escribir
 * el contenido.
 */
/**
 * Los seis módulos existen y están completos. Es la prueba de que el contrato
 * sirvió para lo que se hizo: m2–m5 se escribieron el 14-ago-2026 agregando
 * cuatro archivos de datos, sin tocar un solo componente, ruta ni motor.
 */
describe('currículo v2 — los módulos', () => {
  it('están los seis, en orden y sin ids repetidos', () => {
    expect(modules.map((m) => m.id)).toEqual(['m0', 'm1', 'm2', 'm3', 'm4', 'm5'])
    expect(modules.map((m) => m.order)).toEqual([...modules.map((m) => m.order)].sort((a, b) => a - b))
    const ids = lecciones.map((l) => l.id)
    expect(new Set(ids).size, 'hay ids de lección repetidos').toBe(ids.length)
  })

  it('cada módulo declara lo que la pantalla necesita para dibujarlo', () => {
    for (const m of modules) {
      expect(m.title?.nawat, `${m.id} sin título náhuat`).toBeTruthy()
      expect(m.title?.es, `${m.id} sin título español`).toBeTruthy()
      expect(m.titleSource, `${m.id}: el título está en náhuat y no dice de dónde salió`).toBeTruthy()
      expect(m.description, `${m.id} sin descripción`).toBeTruthy()
      expect(m.icon, `${m.id} sin ícono`).toBeTruthy()
      expect(m.color, `${m.id} sin color`).toMatch(/^#[0-9A-Fa-f]{6}$/)
      expect(m.lessons.length, `${m.id} sin lecciones`).toBeGreaterThan(0)
    }
  })

  it('toda lección declara situación, objetivo, tarea y su pregunta al hablante', () => {
    const incompletas = []
    for (const l of lecciones) {
      for (const campo of ['situation', 'objective', 'task', 'speakerAsk']) {
        if (!l[campo]?.trim()) incompletas.push(`${l.id} sin ${campo}`)
      }
    }
    expect(incompletas).toEqual([])
  })
})

describe('currículo v2 — el contrato con la interfaz', () => {
  // Los que LessonRunner sabe dibujar hoy. Si se agrega un componente, se agrega
  // acá y en TIPOS_DE_ITEM; si no, esta prueba avisa.
  const RENDERIZABLES = new Set([
    'dialogue', 'flashcard', 'note', 'task', 'matching', 'build_sentence',
    'multiple_choice_text', 'multiple_choice_image', 'true_false', 'lightning', 'active_recall',
  ])

  it('la lista declarada de tipos de ítem es un subconjunto de lo que la app dibuja', () => {
    const huerfanos = TIPOS_DE_ITEM.filter((t) => !RENDERIZABLES.has(t))
    expect(huerfanos).toEqual([])
  })

  it('cada lección declara un tipo del conjunto cerrado', () => {
    const invalidas = []
    for (const l of lecciones) {
      if (!TIPOS_DE_LECCION.includes(l.type)) invalidas.push(`${l.id} → ${l.type}`)
    }
    expect(invalidas).toEqual([])
  })

  it('NINGUNA lección compila a un ítem que la app no sepa dibujar', () => {
    const desconocidos = []
    for (const l of lecciones) {
      for (const item of toRunnerItems(l)) {
        if (!TIPOS_DE_ITEM.includes(item.type)) desconocidos.push(`${l.id}: ${item.type}`)
      }
    }
    expect(desconocidos).toEqual([])
  })

  it('los dos tipos de lección conviven y cada uno produce una lección jugable', () => {
    for (const tipo of TIPOS_DE_LECCION) {
      const ejemplo = lecciones.find((l) => l.type === tipo)
      expect(ejemplo, `no hay ninguna lección de tipo "${tipo}"`).toBeTruthy()
      const items = toRunnerItems(ejemplo)
      expect(items.length, `${tipo} no produce ítems`).toBeGreaterThan(2)
      expect(items.at(-1).type, `${tipo} no cierra con la tarea`).toBe('task')
    }
  })
})

describe('currículo v2 — estructura', () => {
  it('hay al menos un módulo con lecciones', () => {
    expect(modules.length).toBeGreaterThan(0)
    expect(lecciones.length).toBeGreaterThan(0)
  })

  // Lo que TODA lección debe traer, sea del tipo que sea. Lo específico de cada
  // forma (diálogo, sonidos) lo comprueba el contrato, más arriba.
  it('cada lección trae situación, objetivo, nota, tarea y pregunta', () => {
    for (const l of lecciones) {
      expect(l.situation, `${l.id} sin situación`).toBeTruthy()
      expect(l.objective, `${l.id} sin objetivo`).toBeTruthy()
      expect(l.note?.title, `${l.id} sin nota`).toBeTruthy()
      expect(l.task, `${l.id} sin tarea`).toBeTruthy()
      expect(l.speakerAsk, `${l.id} sin pregunta para el hablante`).toBeTruthy()
      expect(cadenasConFuente(l).length, `${l.id} no enseña nada en náhuat`).toBeGreaterThan(0)
    }
  })

  it('los identificadores no se repiten', () => {
    const ids = lecciones.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

/**
 * Estas comprobaciones NO conocen la forma de cada tipo de lección: trabajan
 * sobre `cadenasConFuente()`, que las uniforma. Por eso un tipo nuevo no las
 * rompe — solo hay que enseñarle la forma nueva a esa única función.
 */
describe('currículo v2 — procedencia obligatoria', () => {
  const todas = lecciones.flatMap((l) => cadenasConFuente(l).map((x) => ({ ...x, id: l.id })))

  it('hay cadenas que comprobar', () => {
    expect(todas.length).toBeGreaterThan(30)
  })

  it('ninguna cadena en náhuat se queda sin fuente', () => {
    const sinFuente = todas
      .filter((x) => !x.source?.trim())
      .map((x) => `${x.id} (${x.donde}): "${x.nawat}"`)
    expect(sinFuente).toEqual([])
  })

  it('`evidence` solo admite "directa" o "compuesta"', () => {
    const invalidas = todas
      .filter((x) => !['directa', 'compuesta'].includes(x.evidence))
      .map((x) => `${x.id} (${x.donde}): "${x.nawat}" → ${x.evidence}`)
    expect(invalidas).toEqual([])
  })

  /**
   * Desde el 14-ago-2026 hay una tercera fuente admitida, y es la de más peso:
   * un HABLANTE. Las dos obras son documentación; Héctor Martínez habla la
   * variante que enseña la app y es coautor del diccionario. Cuando corrigió
   * −Tukay → −Tukey contradijo la etiqueta impresa del propio libro, y tiene
   * razón él: el libro describe el náhuat en general.
   *
   * Se exige el nombre completo a propósito. "Un hablante dijo" no es una
   * fuente; "Héctor Martínez, 14-ago-2026" sí, porque se puede volver a
   * preguntar.
   */
  const FUENTES_RECONOCIDAS = /YULTAJTAKETZALIS|Timumachtikan|Héctor Martínez/

  it('toda fuente nombra una obra reconocida o a un hablante identificado', () => {
    const desconocidas = todas
      .filter((x) => !FUENTES_RECONOCIDAS.test(x.source))
      .map((x) => `${x.id} (${x.donde}): "${x.nawat}" → ${x.source}`)
    expect(desconocidas).toEqual([])
  })

  it('lo que viene de un hablante dice quién y cuándo', () => {
    const sinFecha = todas
      .filter((x) => /Héctor Martínez/.test(x.source))
      .filter((x) => !/\d{1,2}-[a-z]{3}-\d{4}/.test(x.source))
      .map((x) => `${x.id} (${x.donde}): "${x.nawat}" → ${x.source}`)
    expect(sinFecha).toEqual([])
  })
})

describe('currículo v2 — el error que ya nos costó cuatro veces', () => {
  it('ninguna forma ligada se enseña desnuda', () => {
    const infractoras = []
    for (const l of lecciones) {
      for (const v of unidadesDeVocabulario(l)) {
        if (ligadas.has(clave(v.nawat))) {
          infractoras.push(`${l.id}: "${v.nawat}" exige prefijo`)
        }
      }
    }
    expect(infractoras).toEqual([])
  })

  /**
   * Antes acá había una lista fija de excepciones. Se cambió al escribir m2–m5:
   * una lista fija obliga a editar la prueba con cada módulo, y una prueba que
   * hay que editar para que pase deja de proteger nada.
   *
   * Lo que se comprueba ahora es la REGLA. Una palabra del vocabulario que no
   * está en el corpus extraído tiene que estar justificada de una de dos
   * maneras, las dos verificables leyendo el dato:
   *
   *   a) es una forma POSEÍDA (nu-, mu-, i-). El corpus guarda la raíz, no la
   *      forma con prefijo: «Nunan» no está, «−Nan» sí.
   *   b) su `source` cita una LÍNEA del diccionario (l.NNNN), o sea que se
   *      verificó dentro de una frase aunque no sea entrada del corpus. Es el
   *      caso de «Chujchupika» y «Talul».
   *
   * El corpus extraído solo capturó el 5% de las frases de ejemplo del
   * diccionario, así que "no está en el corpus" nunca significó "no existe".
   */
  it('toda palabra fuera del corpus está justificada: o es poseída, o cita su línea', () => {
    const POSEIDA = /^(nu|mu|i)[a-záéíóúñ]/i

    const sinJustificar = []
    for (const l of lecciones) {
      for (const v of unidadesDeVocabulario(l)) {
        if (/\s/.test(v.nawat.trim())) continue // las frases se validan por su fuente
        if (v.evidence === 'compuesta') continue // ya está declarada como derivada
        if (enCorpus.has(clave(v.nawat))) continue

        const esPoseida = POSEIDA.test(v.nawat.trim())
        const citaLinea = /\bl\.\d{3,}/.test(v.source || '')
        if (!esPoseida && !citaLinea) {
          sinJustificar.push(`${l.id}: "${v.nawat}" — no está en el corpus, no es poseída y su fuente no cita línea: ${v.source}`)
        }
      }
    }
    expect(sinJustificar).toEqual([])
  })

  it('la prueba de arriba está viendo palabras fuera del corpus de verdad', () => {
    // Si el corpus creciera y las cubriera todas, la de arriba pasaría sin
    // comprobar nada. Esto avisa para revisarla, no para fallar por gusto.
    const fuera = lecciones.flatMap((l) =>
      unidadesDeVocabulario(l)
        .filter((v) => !/\s/.test(v.nawat.trim()) && v.evidence !== 'compuesta')
        .filter((v) => !enCorpus.has(clave(v.nawat))),
    )
    expect(fuera.length).toBeGreaterThan(0)
  })
})

describe('currículo v2 — ejercicios derivados', () => {
  const lección = getLesson('m1-l1')
  const items = toRunnerItems(lección)

  it('abre con el diálogo y cierra con la tarea', () => {
    expect(items[0].type).toBe('dialogue')
    expect(items.at(-1).type).toBe('task')
  })

  it('la nota teórica va después del vocabulario, no antes', () => {
    const iNota = items.findIndex((i) => i.type === 'note')
    const iVoc = items.findIndex((i) => i.type === 'flashcard')
    expect(iVoc).toBeGreaterThan(-1)
    expect(iNota).toBeGreaterThan(iVoc)
  })

  // Antes esto exigía una tarjeta por palabra. Ya no: una palabra puede llegar
  // por el diálogo, por una tarjeta o por un ejercicio. Lo que no puede es
  // faltar — se comprueba que aparezca en ALGÚN lado.
  it('todo el vocabulario llega a pantalla, por la vía que sea', () => {
    for (const l of lecciones.filter((x) => x.type === 'dialogo')) {
      const items = toRunnerItems(l)
      const enPantalla = new Set()
      for (const it of items) {
        if (it.type === 'dialogue') {
          for (const línea of it.lines) for (const w of línea.nawat.split(/\s+/)) enPantalla.add(clave(w))
        }
        if (it.nahuat_word) enPantalla.add(clave(it.nahuat_word))
        for (const p of it.pairs || []) enPantalla.add(clave(p.nahuat))
        for (const w of it.word_bank || []) enPantalla.add(clave(w))
      }
      const faltantes = l.vocabulary
        .filter((v) => !enPantalla.has(clave(v.nawat)))
        .map((v) => `${l.id}: "${v.nawat}"`)
      expect(faltantes).toEqual([])
    }
  })

  // m1-l1 no genera este ejercicio: sus seis líneas son de dos palabras y una
  // frase de dos no se ordena, se adivina. Se comprueba en las que sí lo tienen.
  it('toda frase para ordenar sale de un diálogo, no de la nada', () => {
    let comprobadas = 0
    for (const l of lecciones) {
      const ordenar = toRunnerItems(l).find((i) => i.type === 'build_sentence')
      if (!ordenar) continue
      comprobadas++
      const frase = ordenar.correct_order.join(' ')
      const enDiálogo = l.dialogue.some((d) => d.nawat.replace(/[¿?¡!.]/g, '').trim() === frase)
      expect(enDiálogo, `${l.id}: "${frase}" no está en su diálogo`).toBe(true)
    }
    expect(comprobadas).toBeGreaterThan(0)
  })

  it('el banco de palabras no viene ya ordenado', () => {
    for (const l of lecciones) {
      const ordenar = toRunnerItems(l).find((i) => i.type === 'build_sentence')
      if (!ordenar || ordenar.correct_order.length < 2) continue
      expect(ordenar.word_bank.join(' '), `${l.id} regala la respuesta`).not.toBe(
        ordenar.correct_order.join(' '),
      )
      // El banco ya no es una permutación exacta: lleva señuelos a propósito.
      expect(ordenar.word_bank.length).toBeGreaterThan(ordenar.correct_order.length)
    }
  })

  /**
   * ResultScreen desestructura `score` y `xpEarned`. Cuando la pantalla del
   * currículo mandó `accuracy` y `xp`, el resultado salió "NaN%" y "+undefined"
   * sin que fallara ninguna prueba. Esto ancla el contrato.
   */
  it('el estado del resultado usa las claves que ResultScreen lee', () => {
    const estado = buildResultState(lección, items, 0.8, 55)
    expect(estado.score).toBe(0.8)
    expect(estado.xpEarned).toBe(55)
    expect(typeof estado.lessonTitle).toBe('string')
    expect(estado.lessonTitle.length).toBeGreaterThan(0)
    expect(Number.isFinite(Math.round(estado.score * 100))).toBe(true)
  })

  /**
   * La tarjeta de memoria se autoevalúa, así que no es medida de aprendizaje.
   * Sirve para presentar lo que el diálogo no mostró, y para nada más.
   */
  it('las tarjetas de memoria no dominan ninguna lección', () => {
    for (const l of lecciones) {
      const items = toRunnerItems(l)
      const tarjetas = items.filter((i) => i.type === 'flashcard').length
      const miden = items.filter((i) => TIPOS_QUE_MIDEN.includes(i.type)).length
      expect(miden, `${l.id}: solo ${miden} ejercicios que midan`).toBeGreaterThanOrEqual(3)
      expect(tarjetas, `${l.id}: ${tarjetas} tarjetas contra ${miden} ejercicios`).toBeLessThanOrEqual(miden)
    }
  })

  /**
   * Vale tanto para la palabra suelta como para la palabra CON PREFIJO. El
   * náhuat los pega adelante: el diálogo dice «nikuchi» y el vocabulario lista
   * «Kuchi». Es la misma palabra, y darle tarjeta es repetir lo que el
   * estudiante acaba de leer en contexto. Al escribir m2–m5 esto tenía al
   * módulo 3 con once tarjetas; con la regla arreglada quedó en dos.
   */
  it('no hay tarjeta para una palabra que el diálogo ya mostró, ni suelta ni con prefijo', () => {
    const redundantes = []
    for (const l of lecciones.filter((x) => x.type === 'dialogo')) {
      const palabras = l.dialogue.flatMap((d) => d.nawat.split(/\s+/).map((w) => clave(w)))
      for (const item of toRunnerItems(l)) {
        if (item.type !== 'flashcard') continue
        const w = clave(item.nahuat_word)
        if (palabras.includes(w)) {
          redundantes.push(`${l.id}: "${item.nahuat_word}" ya salía suelta en el diálogo`)
          continue
        }
        const conPrefijo = palabras.find(
          (p) => w.length >= 3 && p.length > w.length && p.endsWith(w) && p.length - w.length <= 4,
        )
        if (conPrefijo) {
          redundantes.push(`${l.id}: "${item.nahuat_word}" ya salía en el diálogo como "${conPrefijo}"`)
        }
      }
    }
    expect(redundantes).toEqual([])
  })

  it('las tarjetas que quedan son pocas frente a lo que sí mide', () => {
    const todos = lecciones.flatMap((l) => toRunnerItems(l))
    const tarjetas = todos.filter((i) => i.type === 'flashcard').length
    const miden = todos.filter((i) => TIPOS_QUE_MIDEN.includes(i.type)).length
    // No es un número mágico: es la proporción que el usuario pidió el
    // 6-ago-2026 —tarjetas ocasionales, no como medida de aprendizaje—.
    expect(tarjetas * 3, `${tarjetas} tarjetas contra ${miden} ejercicios que miden`).toBeLessThan(miden)
  })

  it('cada lección pide escribir al menos una palabra de memoria', () => {
    for (const l of lecciones.filter((x) => x.type === 'dialogo')) {
      const escribir = toRunnerItems(l).filter((i) => i.type === 'active_recall')
      expect(escribir.length, `${l.id} no pide escribir nada`).toBeGreaterThan(0)
    }
  })

  it('el banco de ordenar lleva señuelos que NO van en la frase', () => {
    let comprobadas = 0
    for (const l of lecciones) {
      const ordenar = toRunnerItems(l).find((i) => i.type === 'build_sentence')
      if (!ordenar) continue
      comprobadas++
      const correctas = ordenar.correct_order.map((w) => clave(w))
      const senuelos = ordenar.word_bank.filter((w) => !correctas.includes(clave(w)))
      expect(senuelos.length, `${l.id} no tiene señuelos`).toBeGreaterThanOrEqual(2)
      // Y las correctas siguen estando todas.
      for (const w of ordenar.correct_order) {
        expect(ordenar.word_bank.map(clave), `${l.id} perdió "${w}"`).toContain(clave(w))
      }
    }
    expect(comprobadas).toBeGreaterThan(0)
  })

  it('ninguna opción múltiple repite opción ni tiene dos correctas', () => {
    for (const l of lecciones) {
      for (const item of toRunnerItems(l).filter((i) => i.type === 'multiple_choice_text')) {
        const textos = item.options.map((o) => o.text.toLowerCase())
        expect(new Set(textos).size, `${item.id} repite una opción`).toBe(textos.length)
        expect(item.options.filter((o) => o.correct).length, `${item.id}`).toBe(1)
      }
    }
  })

  it('el emparejamiento nunca repite un significado', () => {
    for (const l of lecciones) {
      const unir = toRunnerItems(l).find((i) => i.type === 'matching')
      if (!unir) continue
      const es = unir.pairs.map((p) => p.spanish.toLowerCase())
      expect(new Set(es).size, `${l.id} tiene pares ambiguos`).toBe(es.length)
    }
  })
})
