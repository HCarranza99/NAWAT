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
// El corpus perdió la marca de guion en estas dos; verificadas a mano en el PDF.
for (const extra of ['tukay', 'uni']) ligadas.add(extra)

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

  it('toda fuente nombra una obra reconocida', () => {
    const desconocidas = todas
      .filter((x) => !/YULTAJTAKETZALIS|Timumachtikan/.test(x.source))
      .map((x) => `${x.id} (${x.donde}): "${x.nawat}" → ${x.source}`)
    expect(desconocidas).toEqual([])
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

  it('las palabras sueltas del vocabulario existen en el corpus o se declaran compuestas', () => {
    const huerfanas = []
    for (const l of lecciones) {
      for (const v of unidadesDeVocabulario(l)) {
        if (/\s/.test(v.nawat.trim())) continue // las frases se validan por su fuente
        if (v.evidence === 'compuesta') continue // ya está declarada como derivada
        if (!enCorpus.has(clave(v.nawat))) huerfanas.push(`${l.id}: "${v.nawat}"`)
      }
    }
    // Nutukay y Mutukay son formas poseídas: el corpus guarda la raíz, no ellas.
    expect(huerfanas).toEqual(['m1-l4: "Nutukay"', 'm1-l4: "Mutukay"'])
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

  it('todo el vocabulario llega a pantalla', () => {
    const tarjetas = items.filter((i) => i.type === 'flashcard')
    expect(tarjetas.length).toBe(lección.vocabulary.length)
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
      expect([...ordenar.word_bank].sort()).toEqual([...ordenar.correct_order].sort())
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

  it('el emparejamiento nunca repite un significado', () => {
    for (const l of lecciones) {
      const unir = toRunnerItems(l).find((i) => i.type === 'matching')
      if (!unir) continue
      const es = unir.pairs.map((p) => p.spanish.toLowerCase())
      expect(new Set(es).size, `${l.id} tiene pares ambiguos`).toBe(es.length)
    }
  })
})
