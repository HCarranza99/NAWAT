import { describe, expect, it } from 'vitest'
import secciones from '../data/curriculum/asSections'
import modules, { cadenasConFuente, unidadesDeVocabulario } from '../data/curriculum'

/**
 * Regresión — correcciones de un hablante.
 *
 * El 14 de agosto de 2026 Héctor Martínez, hablante de Witzapan y coautor del
 * diccionario YULTAJTAKETZALIS, revisó el contenido y corrigió dos cosas. Las
 * dos son el MISMO hallazgo: la app estaba enseñando formas de otra variante
 * del náhuat.
 *
 *   1. −tukay → −tukey. Escribió de su puño «Ken mutukey?» y «Ne takat itukey».
 *   2. Yek tunal → Yek peyna. «Yek tunal» venía del curso de King, que documenta
 *      otra variante; por lo mismo «teutak» pasó a «tiutak» (diccionario p.220).
 *
 * POR QUÉ ESTA PRUEBA EXISTE. Las dos formas viejas están en fuentes escritas
 * que el proyecto usa a diario: «tukay» es una entrada del propio diccionario
 * (p.222, etiquetada «forma actual») y «Yek tunal» está en King p.19. O sea que
 * cualquiera que agregue contenido buscando de buena fe en las fuentes va a
 * volver a encontrarlas y a meterlas. Sin esta prueba, la corrección de un
 * hablante se pierde en la siguiente tanda de contenido.
 *
 * Es la misma lógica de formasLigadas.test.js: lo que ya costó caro una vez, se
 * vigila con código, no con memoria.
 */

/** Toda cadena en náhuat que la app puede poner en pantalla, venga de donde venga. */
function todoElNahuatEnPantalla() {
  const salida = []
  const anotar = (texto, donde) => {
    if (typeof texto === 'string' && texto.trim()) salida.push({ texto, donde })
  }

  // Los ejercicios ya compilados: lo que el estudiante ve en pantalla.
  for (const seccion of secciones) {
    for (const leccion of [...seccion.lessons, ...(seccion.boss ? [seccion.boss] : [])]) {
      for (const item of leccion.items || []) {
        const donde = `${item.id} (${item.type})`
        anotar(item.nahuat_word, donde)
        anotar(item.example_sentence, `${donde} · ejemplo`)
        for (const par of item.pairs || []) anotar(par.nahuat, donde)
        for (const palabra of [...(item.word_bank || []), ...(item.correct_order || [])]) {
          anotar(palabra, donde)
        }
      }
    }
  }

  // Currículo v2. `cadenasConFuente` es la proyección uniforme del contrato:
  // sirve para cualquier tipo de lección, presente o futuro.
  for (const leccion of modules.flatMap((m) => m.lessons)) {
    for (const c of cadenasConFuente(leccion)) anotar(c.nawat, `${c.id} (${c.donde})`)
    for (const v of unidadesDeVocabulario(leccion)) anotar(v.nawat, `${leccion.id} (vocabulario)`)
    anotar(leccion.title?.nawat, `${leccion.id} (título)`)
  }

  return salida
}

/**
 * Formas de otra variante que ya se corrigieron. La clave es la forma prohibida;
 * el valor explica qué poner en su lugar y por qué, para que el mensaje de error
 * baste sin tener que venir a leer este archivo.
 */
const FORMAS_DE_OTRA_VARIANTE = [
  {
    patron: /tukay/i,
    correcta: 'tukey',
    porque:
      'Héctor Martínez (14-ago-2026): en Witzapan se usa con e. El diccionario trae las dos entradas en la p.222 y etiqueta −Tukay «forma actual», pero esa etiqueta describe el náhuat en general, no esta variante.',
  },
  {
    patron: /\bteutak\b/i,
    correcta: 'tiutak',
    porque:
      '«teutak» es del curso de King (p.19), que documenta otra variante. El diccionario registra «tiutak» = tarde (p.220).',
  },
  {
    patron: /yek\s+tunal/i,
    correcta: 'Yek peyna',
    porque:
      'Héctor Martínez (14-ago-2026): «Yek tunal» es el saludo de otra variante. En Witzapan es «Yek peyna» (peyna = mañana, diccionario p.164). Ojo: la palabra «Tunal» sola SÍ es correcta — el problema es el saludo.',
  },
]

describe('correcciones de Héctor Martínez (14-ago-2026)', () => {
  const cadenas = todoElNahuatEnPantalla()

  it('la prueba está mirando contenido de verdad', () => {
    // Si el recolector se rompe y devuelve poco, lo de abajo pasaría sin comprobar nada.
    expect(cadenas.length).toBeGreaterThan(150)
  })

  for (const { patron, correcta, porque } of FORMAS_DE_OTRA_VARIANTE) {
    it(`ninguna cadena usa la forma de otra variante en lugar de «${correcta}»`, () => {
      const infractoras = cadenas
        .filter(({ texto }) => patron.test(texto))
        .map(({ texto, donde }) => `${donde}: "${texto}" → debe ser «${correcta}». ${porque}`)
      expect(infractoras).toEqual([])
    })
  }

  it('«Ne takat itukey» quedó como la escribió él: con artículo', () => {
    // Corrigió DOS cosas de una: la vocal y el artículo que faltaba. Si alguien
    // arregla solo la vocal y deja "Takat itukey", esto avisa.
    const conItukey = cadenas.filter(({ texto }) => /itukey/i.test(texto))
    expect(conItukey.length).toBeGreaterThan(0)

    const sinArticulo = []
    for (const seccion of secciones) {
      for (const leccion of [...seccion.lessons, ...(seccion.boss ? [seccion.boss] : [])]) {
        for (const item of leccion.items || []) {
          if (item.type !== 'build_sentence') continue
          const frase = (item.correct_order || []).join(' ')
          if (!/itukey/i.test(frase)) continue
          if (!/^ne\s/i.test(frase)) sinArticulo.push(`${item.id}: "${frase}"`)
        }
      }
    }
    expect(sinArticulo).toEqual([])
  })

  it('lo que corrigió un hablante dice que fue él y cuándo', () => {
    // Sin fecha y sin nombre no se puede volver a preguntar, y una corrección
    // que no se puede rastrear vale lo mismo que una inventada.
    const deHector = modules
      .flatMap((m) => m.lessons)
      .flatMap((l) => cadenasConFuente(l))
      .filter((c) => /Héctor/i.test(c.source || ''))

    expect(deHector.length).toBeGreaterThan(0)
    for (const c of deHector) {
      expect(c.source, `${c.id}: "${c.nawat}"`).toMatch(/Héctor Martínez/)
      expect(c.source, `${c.id}: "${c.nawat}"`).toMatch(/\d{1,2}-[a-z]{3}-\d{4}/)
    }
  })
})
