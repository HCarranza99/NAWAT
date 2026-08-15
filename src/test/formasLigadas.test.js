import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import seccionesEnPantalla from '../data/curriculum/asSections'

/**
 * Regresión — formas ligadas enseñadas sueltas.
 *
 * El diccionario YULTAJTAKETZALIS escribe con GUION INICIAL las formas que no
 * van solas: −Pia, −Uni, −Tukey, −Tatanoy… Son transitivas o inalienables y
 * exigen un prefijo (de objeto o posesivo). Enseñarlas desnudas es enseñar algo
 * que nadie diría.
 *
 * Ya se corrigió cuatro veces (tukay → nutukay, Uni → Nikuni, Pia → Nikpia dos
 * veces). La cuarta se coló porque las revisiones anteriores solo miraban las
 * flashcards, y `Pia` vivía en una opción múltiple y en un emparejamiento de la
 * sección 4. Esta prueba recorre TODO lo que aparece en pantalla, venga del tipo
 * de ejercicio que venga, y contrasta contra el corpus: si el diccionario marcó
 * una forma con guion, la app no puede mostrarla desnuda.
 *
 * Desde el 14-ago-2026 mira el CURRÍCULO, que es el único contenido que queda.
 * Lo hace sobre los ejercicios YA COMPILADOS —banco de palabras, pares, opciones—
 * y no sobre los datos de la lección: es la diferencia entre revisar lo que se
 * escribió y revisar lo que el estudiante ve, y esa diferencia fue exactamente
 * la que dejó pasar el cuarto error.
 */

const corpus = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'docs/catalogo_extraido.json'), 'utf8'),
)

const clave = (s = '') =>
  String(s).toLowerCase().normalize('NFC').replace(/[−–—-]/g, '').replace(/[¡!¿?.,]/g, '').trim()

/**
 * Formas ligadas que la extracción del corpus NO marcó, verificadas a mano
 * contra el PDF. El extractor guardó la nota "Forma de cita" en 297 entradas,
 * pero se le escaparon estas: `Tukay` y `Uni` quedaron con notes vacío pese a
 * llevar guion en el libro. Sin esta lista la prueba dejaría pasar justo los
 * dos errores que ya se corrigieron una vez.
 *
 * `Uni` además es un caso de homonimia: el corpus registra un `Uni` = "Ese, esa,
 * eso" (p.242) que NO lleva guion, distinto del verbo −Uni "beber".
 *
 * `tukey` se agregó el 14-ago-2026. La p.222 del diccionario trae DOS entradas
 * con guion —−Tukay «forma actual» y −Tukey «forma antigua»— y Héctor Martínez,
 * hablante de Witzapan, confirmó que la de acá es la de la e. La app pasó a
 * tukey; las dos quedan vigiladas porque las dos son ligadas y cualquiera de
 * las dos, suelta, es el mismo error.
 */
const LIGADAS_VERIFICADAS_A_MANO = {
  tukay: { text_nawat: 'tukay', source: 'YULTAJTAKETZALIS — entrada −Tukay, ej. "Nutukay: Mi nombre"' },
  tukey: { text_nawat: 'tukey', source: 'YULTAJTAKETZALIS p.222 — entrada −Tukey, ej. "Nutukey: Mi nombre". Forma de Witzapan según Héctor Martínez, 14-ago-2026' },
  uni: { text_nawat: 'uni', source: 'YULTAJTAKETZALIS — entrada −Uni, ej. "Nikuni atutun: Tomo café"' },
}

/** Formas que el diccionario registra CON guion, indexadas por su forma desnuda. */
const ligadas = new Map(Object.entries(LIGADAS_VERIFICADAS_A_MANO))
for (const item of corpus.items) {
  if (item.kind !== 'word') continue
  if (!item.notes?.includes('Forma de cita')) continue
  ligadas.set(clave(item.text_nawat), item)
}

/** Cada cadena náhuat que la app puede poner en pantalla, con dónde vive. */
function cadenasEnPantalla() {
  const salida = []
  const anotar = (texto, donde) => {
    if (typeof texto === 'string' && texto.trim()) salida.push({ texto, donde })
  }

  for (const seccion of seccionesEnPantalla) {
    for (const leccion of [...seccion.lessons, ...(seccion.boss ? [seccion.boss] : [])]) {
      for (const item of leccion.items || []) {
        const donde = `${item.id} (${item.type})`
        switch (item.type) {
          case 'flashcard':
          case 'active_recall':
          case 'multiple_choice_text':
          case 'multiple_choice_image':
            anotar(item.nahuat_word, donde)
            break
          case 'matching':
            for (const par of item.pairs || []) anotar(par.nahuat, donde)
            break
          case 'build_sentence':
            for (const palabra of [...(item.word_bank || []), ...(item.correct_order || [])]) {
              anotar(palabra, donde)
            }
            break
          default:
            break
        }
        anotar(item.example_sentence, `${donde} · ejemplo`)
      }
    }
  }
  return salida
}

describe('formas ligadas del diccionario', () => {
  it('el corpus trae formas marcadas con guion', () => {
    // Si esto baja a cero, la prueba de abajo dejó de comprobar nada.
    expect(ligadas.size).toBeGreaterThan(200)
  })

  it('ninguna se enseña desnuda en el contenido artesanal', () => {
    const infractoras = []
    for (const { texto, donde } of cadenasEnPantalla()) {
      // Solo palabras sueltas: dentro de una frase la forma ya lleva su prefijo.
      if (/\s/.test(texto.trim())) continue
      const entrada = ligadas.get(clave(texto))
      if (entrada) {
        infractoras.push(`${donde}: "${texto}" — el diccionario la registra como "−${entrada.text_nawat}" (${entrada.source})`)
      }
    }
    expect(infractoras).toEqual([])
  })
})
