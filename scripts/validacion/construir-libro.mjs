/**
 * Genera docs/validacion-lecciones-artesanales.xlsx — el libro que un hablante
 * de náhuat usa para validar, ítem por ítem, TODO lo que la app enseña hoy.
 *
 * Se construye desde los archivos de datos reales (src/data/sections/section*.js)
 * y desde el corpus extraído (docs/catalogo_extraido.json), así que no puede
 * desincronizarse del contenido: si cambia una lección, se regenera y listo.
 *
 *   node scripts/validacion/construir-libro.mjs
 *
 * El empaquetado ZIP lo hace PowerShell (ver el final del archivo): Node no trae
 * compresión de archivos en su librería estándar y no se quiso añadir una
 * dependencia solo para esto.
 */
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { buildXlsx, S } from './xlsx.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const SALIDA = path.join(ROOT, 'docs', 'validacion-lecciones-artesanales.xlsx')

const secciones = await Promise.all(
  [1, 2, 3, 4, 5].map((n) =>
    import(new URL(`../../src/data/sections/section${n}.js`, import.meta.url).href).then((m) => m.default),
  ),
)
const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'catalogo_extraido.json'), 'utf8'))
const moduloNuevo = (await import(new URL('../../src/data/curriculum/module1.js', import.meta.url).href)).default

// ── utilidades ───────────────────────────────────────────────────────────────
const clave = (s = '') =>
  String(s).toLowerCase().normalize('NFC').replace(/[−–—-]/g, '').replace(/[¡!¿?.,]/g, '').trim()
const lecciones = (s) => [...s.lessons, ...(s.boss ? [{ ...s.boss, title: s.boss.title || 'Jefe final' }] : [])]

const indiceCorpus = new Map()
for (const it of corpus.items) {
  const k = clave(it.text_nawat)
  if (!k) continue
  if (!indiceCorpus.has(k)) indiceCorpus.set(k, [])
  indiceCorpus.get(k).push(it)
}

/**
 * Procedencia de las formas que el índice automático NO encuentra. Cada una se
 * cotejó a mano contra el PDF del diccionario; las que siguen sin localizarse se
 * marcan como tales a propósito — son justamente las preguntas para el hablante.
 * El corpus extraído cubre pp.25–256 pero NO el aparato gramatical inicial
 * (pp.26–51), que es donde viven varias de estas.
 */
const PROCEDENCIA_MANUAL = {
  kw: ['Directa', 'Alfabeto del diccionario, grafía #10, pp.48–49 (no es una palabra: es un sonido)'],
  tz: ['Directa', 'Alfabeto del diccionario, grafía #21, pp.48–49 (no es una palabra: es un sonido)'],
  sh: ['Directa', 'Alfabeto del diccionario, grafía #19, pp.48–49 (no es una palabra: es un sonido)'],
  eje: ['Sin localizar', 'No se localizó en el corpus extraído ni como entrada del diccionario. CONFIRMAR'],
  'tesu datka': ['Derivada', 'Compuesta: Tesu "no" (p.216) + datka. No localizada como unidad. CONFIRMAR'],
  'tesu ninemi yek': ['Derivada', 'Compuesta: Tesu "no" (p.216) + Ninemi yek "estoy bien". CONFIRMAR'],
  takat: ['Directa', 'Tabla gramatical del diccionario, p.29 (no figura como entrada alfabética)'],
  siwat: ['Directa', 'Tabla gramatical del diccionario, p.29 (no figura como entrada alfabética)'],
  nunan: ['Derivada', 'Poseída de −Nan "madre". OJO: el corpus solo trae "Nan" = negación (p.150). CONFIRMAR'],
  nuteku: ['Derivada', 'Poseída de Teku "Papá" (p.210) con prefijo nu- "mi"'],
  nutatanoy: ['Derivada', 'Poseída de −Tatanoy "Abuelo" (p.204) con prefijo nu- "mi"'],
  nikuni: [
    'Directa',
    'Prefijada de −Uni "beber"; el diccionario la usa literal: "Nikuni atutun: Tomo café". OJO: el corpus registra otro "Uni" = "Ese, esa, eso" (p.242): son homónimos. CONFIRMAR',
  ],
  nikpia: ['Directa', 'Prefijada de −Pia "Tener" (p.164); el diccionario la usa literal: "Naja nikpia ume shiwit"'],
  metzti: [
    'Directa',
    'Verificada en el PDF (los meses: "Metzti chiknawi" = septiembre). NO aparece en el corpus extraído. CONFIRMAR',
  ],
}

function procedencia(forma) {
  const k = clave(forma)
  if (PROCEDENCIA_MANUAL[k]) return PROCEDENCIA_MANUAL[k]
  const m = indiceCorpus.get(k)
  if (!m) return ['Sin localizar', 'No se encontró en el corpus extraído. CONFIRMAR']
  const e = m[0]
  const nota = e.notes && e.notes.includes('Forma de cita') ? ' — el diccionario la marca CON GUION (exige prefijo)' : ''
  return ['Directa', `${e.source} — "${e.text_nawat}" = "${e.text_es}"${nota}`]
}

// ── recolección ──────────────────────────────────────────────────────────────
const formas = new Map() // clave → { forma, sec, glosa, pron, ej, ejTrad, lecciones:Set }
const ejercicios = []
const frases = new Map() // clave → { frase, trad, sec, origen, fuente }

for (const s of secciones) {
  for (const l of lecciones(s)) {
    for (const it of l.items || []) {
      // 1) vocabulario
      if (it.type === 'flashcard' && it.nahuat_word && it.spanish_translation) {
        const k = clave(it.nahuat_word)
        if (!formas.has(k)) {
          formas.set(k, {
            forma: it.nahuat_word,
            sec: s.id,
            glosa: it.spanish_translation,
            pron: it.pronunciation || '',
            ej: it.example_sentence || '',
            ejTrad: it.example_translation || '',
            lecciones: new Set(),
          })
        }
        formas.get(k).lecciones.add(l.title)
      }

      // 2) frases completas
      if (it.example_sentence && /\s/.test(it.example_sentence.trim())) {
        const k = clave(it.example_sentence)
        if (!frases.has(k)) {
          frases.set(k, {
            frase: it.example_sentence,
            trad: it.example_translation || '',
            sec: s.id,
            origen: 'Ejemplo tomado de una fuente',
            fuente: procedencia(it.nahuat_word)[1],
          })
        }
      }
      if (it.type === 'build_sentence' && it.correct_order?.length) {
        const frase = it.correct_order.join(' ')
        const k = clave(frase)
        if (!frases.has(k)) {
          frases.set(k, {
            frase,
            trad: it.spanish_translation || '',
            sec: s.id,
            origen: 'ARMADA para el ejercicio (no copiada de una fuente)',
            fuente: '— revisar la gramática, no la cita',
          })
        }
      }

      // 3) ejercicios
      let muestra = ''
      let correcta = ''
      let falsas = ''
      switch (it.type) {
        case 'flashcard':
          muestra = `${it.nahuat_word}${it.pronunciation ? `  /${it.pronunciation}/` : ''}`
          correcta = it.spanish_translation
          break
        case 'multiple_choice_text':
        case 'multiple_choice_image':
          muestra = `${it.instruction || '¿Qué significa esta palabra?'}\n${it.nahuat_word}`
          correcta = it.options?.find((o) => o.correct)?.text || ''
          falsas = (it.options || []).filter((o) => !o.correct).map((o) => o.text).join(' · ')
          break
        case 'matching':
          muestra = it.instruction || 'Une cada par'
          correcta = (it.pairs || []).map((p) => `${p.nahuat} = ${p.spanish}`).join('\n')
          break
        case 'build_sentence':
          muestra = `${it.instruction || ''}\nFichas: ${(it.word_bank || []).join(' · ')}`
          correcta = (it.correct_order || []).join(' ')
          break
        case 'active_recall':
          muestra = it.instruction || it.spanish_translation
          correcta = it.nahuat_word
          break
        default:
          muestra = it.instruction || ''
          correcta = it.spanish_translation || ''
      }
      ejercicios.push({ sec: s.id, leccion: l.title, id: it.id, tipo: it.type, muestra, correcta, falsas })
    }
  }
}

// ── pares que el motor puede enfrentar (ver hoja "4. Cómo arma los ejercicios")
const glosa = (s = '') =>
  s.toLowerCase().trim().replace(/\([^)]*\)/g, ' ').replace(/[.,;:!?¡¿"]/g, ' ').replace(/\s+/g, ' ').trim()
const pares = []
for (const s of secciones) {
  const ws = [...formas.values()].filter((f) => f.sec === s.id)
  for (let i = 0; i < ws.length; i++) {
    for (let j = i + 1; j < ws.length; j++) {
      const A = ws[i]
      const B = ws[j]
      const ta = new Set(glosa(A.glosa).split(' ').filter((t) => t.length > 2))
      const tb = new Set(glosa(B.glosa).split(' ').filter((t) => t.length > 2))
      const inter = [...ta].filter((t) => tb.has(t))
      if (inter.length) pares.push({ sec: s.id, A, B, comun: inter.join(', ') })
    }
  }
}

// ── construcción de las hojas ────────────────────────────────────────────────
const H = (t) => ({ v: t, s: S.HEAD })
const C = (t) => ({ v: t, s: S.CELL })
const I = (t = '') => ({ v: t, s: S.INPUT })
const T = (t) => ({ v: t, s: S.TITLE })
const N = (t) => ({ v: t, s: S.NOTE })
const SI_NO = ['Está bien', 'Hay que cambiarlo', 'Tengo dudas']

const totalEj = ejercicios.length
const hoy = new Date().toLocaleDateString('es-SV', { day: '2-digit', month: 'long', year: 'numeric' })

// Hoja 0 — Léeme
const leeme = {
  name: '0. Léeme',
  widths: [3, 30, 95],
  rows: [
    [null, T('Aprende Nawat — validación del contenido')],
    [null, null, N(`Generado el ${hoy} directamente desde el código de la app. Contacto: Lic. Hugo Arnoldo Carranza Alvarado.`)],
    [],
    [null, C('Qué es esto'), C('La app enseña hoy 5 secciones hechas a mano: ' + formas.size + ' formas náhuat, ' + frases.size + ' frases y ' + totalEj + ' ejercicios. Este libro los saca TODOS del código y los pone en una tabla para revisarlos uno por uno.')],
    [null, C('Qué NO es'), C('No es el vocabulario ampliado. Hay otras 281 palabras generadas automáticamente desde el diccionario que están APAGADAS en la app justamente porque nadie las ha revisado. Se hablan en la hoja "5. Corpus".')],
    [],
    [null, T('Cómo llenarlo')],
    [null, C('1'), C('Las columnas con fondo amarillo son para escribir. Las demás salen del código: no hace falta tocarlas.')],
    [null, C('2'), C('En la columna "¿Está bien?" se elige de una lista: ' + SI_NO.join(' / ') + '.')],
    [null, C('3'), C('Si algo hay que cambiarlo, se escribe la forma correcta en "Corrección propuesta". Con eso basta: el cambio se aplica y se regenera este libro.')],
    [null, C('4'), C('Si no da tiempo de todo: la hoja 1 (vocabulario) y la hoja 2 (frases) son las importantes. La hoja 3 es el detalle ejercicio por ejercicio.')],
    [],
    [null, T('EMPIECE POR ACÁ — el módulo nuevo (hojas N1, N2, N3)')],
    [null, null, N('Es contenido reescrito desde cero con otra estructura: cada lección es una situación con un diálogo, y el vocabulario sale del diálogo en vez de ir suelto. Es lo que se quiere publicar validado. Son pocas líneas y es donde su tiempo rinde más.')],
    [null, C('N1. Diálogos'), C(`Las ${moduloNuevo.lessons.reduce((n, l) => n + l.dialogue.length, 0)} líneas de conversación del módulo 1. Ninguna se inventó: todas son frases atestiguadas, solo se ordenaron. Lo que hay que juzgar es si suenan naturales en ese orden.`)],
    [null, C('N2. Vocabulario'), C(`Las ${moduloNuevo.lessons.reduce((n, l) => n + l.vocabulary.length, 0)} palabras del módulo, con su fuente.`)],
    [null, C('N3. Notas y preguntas'), C('Las explicaciones gramaticales, las tareas, y las preguntas que quedaron abiertas a propósito. La nota cultural de cada lección está VACÍA esperando su respuesta.')],
    [null, C('N4. Lo que falta'), C('LA HOJA MÁS ÚTIL SI HAY POCO TIEMPO. Las palabras que la app ya enseña pero que no se pueden pasar al modelo nuevo porque no existe ninguna frase donde se usen en conversación. Una frase corta por palabra desbloquea cada una.')],
    [],
    [null, T('El contenido que ya está publicado (hojas 1 a 6)')],
    [null, C('1. Vocabulario'), C(`Las ${formas.size} palabras y expresiones que la app enseña hoy, con la página del diccionario donde se verificó cada una.`)],
    [null, C('2. Frases'), C(`Las ${frases.size} frases completas que aparecen en pantalla. Se distingue entre las copiadas de una fuente y las ARMADAS para un ejercicio: estas últimas son las que más riesgo tienen.`)],
    [null, C('3. Ejercicios'), C(`Los ${totalEj} ejercicios tal como los ve el estudiante, con su respuesta correcta y sus opciones falsas.`)],
    [null, C('4. Cómo arma los ejercicios'), C('La app no guarda los ejercicios ya hechos: los arma en el momento. Aquí se explica qué decide la máquina y qué no, y se listan los pares de palabras que podrían confundirse.')],
    [null, C('5. Corpus'), C('Qué se extrajo del diccionario, cuánto es, y una tabla para estimar qué costaría revisarlo.')],
    [null, C('6. Preguntas'), C('Las preguntas concretas que quedaron abiertas.')],
    [],
    [null, T('Sobre la columna "Evidencia"')],
    [null, C('Directa'), C('La forma aparece tal cual en una fuente, con su página.')],
    [null, C('Derivada'), C('La forma se construyó aplicando una regla (por ejemplo, ponerle el prefijo "nu-" a una raíz). La regla está atestiguada; esa forma exacta no se encontró escrita. Son las que más necesitan confirmación.')],
    [null, C('Sin localizar'), C('No se pudo rastrear. Se enseña igual porque venía del material de origen, pero está sin respaldo documentado.')],
  ],
}

// Hoja 1 — Vocabulario
const filasVocab = [...formas.values()].sort((a, b) => a.sec - b.sec || a.forma.localeCompare(b.forma))
const vocab = {
  name: '1. Vocabulario',
  widths: [5, 6, 18, 30, 16, 24, 26, 13, 52, 18, 26, 30],
  freeze: 2,
  autofilter: `A2:L${filasVocab.length + 2}`,
  tallRows: [2],
  validations: [{ ref: `J3:J${filasVocab.length + 2}`, values: SI_NO }],
  rows: [
    [T(`Vocabulario que la app enseña hoy — ${filasVocab.length} formas`)],
    [
      H('N°'), H('Sec.'), H('Náhuat'), H('Significado en la app'), H('Pronunciación'),
      H('Frase de ejemplo'), H('Traducción'), H('Evidencia'), H('Dónde se verificó'),
      H('¿Está bien?'), H('Corrección propuesta'), H('Comentario'),
    ],
    ...filasVocab.map((f, i) => {
      const [ev, donde] = procedencia(f.forma)
      return [
        C(i + 1), C(f.sec), C(f.forma), C(f.glosa), C(f.pron),
        C(f.ej || '—'), C(f.ejTrad || '—'), C(ev), C(donde),
        I(), I(), I(),
      ]
    }),
  ],
}

// Hoja 2 — Frases
const filasFrases = [...frases.values()].sort((a, b) => a.sec - b.sec || a.frase.localeCompare(b.frase))
const hojaFrases = {
  name: '2. Frases',
  widths: [5, 6, 34, 34, 40, 50, 18, 30, 30],
  freeze: 2,
  autofilter: `A2:I${filasFrases.length + 2}`,
  tallRows: [2],
  validations: [{ ref: `G3:G${filasFrases.length + 2}`, values: SI_NO }],
  rows: [
    [T(`Frases completas que aparecen en pantalla — ${filasFrases.length}`)],
    [
      H('N°'), H('Sec.'), H('Frase en náhuat'), H('Como se traduce en la app'),
      H('De dónde sale'), H('Fuente de la palabra principal'),
      H('¿Está bien?'), H('Corrección propuesta'), H('Comentario'),
    ],
    ...filasFrases.map((f, i) => [
      C(i + 1), C(f.sec), C(f.frase), C(f.trad), C(f.origen), C(f.fuente), I(), I(), I(),
    ]),
  ],
}

// Hoja 3 — Ejercicios
const TIPOS = {
  flashcard: 'Tarjeta (se muestra y se escucha)',
  multiple_choice_text: 'Opción múltiple',
  multiple_choice_image: 'Opción múltiple con imagen',
  matching: 'Emparejar',
  build_sentence: 'Ordenar la frase',
  active_recall: 'Escribir de memoria',
}
const hojaEj = {
  name: '3. Ejercicios',
  widths: [5, 6, 24, 14, 26, 46, 34, 34, 18, 30],
  freeze: 2,
  autofilter: `A2:J${ejercicios.length + 2}`,
  tallRows: [2],
  validations: [{ ref: `I3:I${ejercicios.length + 2}`, values: SI_NO }],
  rows: [
    [T(`Todos los ejercicios, uno por uno — ${ejercicios.length}`)],
    [
      H('N°'), H('Sec.'), H('Lección'), H('ID'), H('Tipo'),
      H('Lo que ve el estudiante'), H('Respuesta correcta'), H('Opciones falsas'),
      H('¿Está bien?'), H('Comentario'),
    ],
    ...ejercicios.map((e, i) => [
      C(i + 1), C(e.sec), C(e.leccion), C(e.id), C(TIPOS[e.tipo] || e.tipo),
      C(e.muestra), C(e.correcta), C(e.falsas || '—'), I(), I(),
    ]),
  ],
}

// Hoja 4 — Cómo arma los ejercicios (la pregunta de las semillas)
const filasMotor = [
    [null, T('Qué decide la máquina y qué no')],
    [null, null, N('La app no guarda una lista fija de preguntas: cada vez que alguien abre una lección, arma los ejercicios en ese momento a partir del vocabulario. Esto explica qué parte de lo que se ve en pantalla es contenido y qué parte es barajado.')],
    [],
    [null, null, H('La máquina SÍ decide'), H('La máquina NUNCA decide')],
    [
      null,
      null,
      C('· El orden en que salen los ejercicios.\n· Si una palabra toca como "verdadero/falso" o como "opción múltiple".\n· Cuáles otras palabras de la misma sección se usan como opciones falsas.\n· Si un enunciado verdadero/falso se muestra como verdadero o como falso.\n· Cuántos ejercicios entran (tope de 12 por intento).'),
      C('· Cómo se escribe una palabra en náhuat.\n· Qué significa.\n· Cómo se pronuncia.\n· Las frases de ejemplo.\n· Los ejercicios hechos a mano (ordenar la frase, escribir de memoria, imagen).\n\nTodo eso se lee literal de los archivos de contenido. La máquina los baraja; no los escribe.'),
    ],
    [],
    [null, T('Dónde sí puede equivocarse')],
    [null, C('El riesgo'), { v: 'Para armar un enunciado FALSO, la app toma el significado de OTRA palabra de la misma sección. Si dos palabras significan casi lo mismo, podría mostrar un enunciado "falso" que en realidad es verdadero, y marcar mal a quien acierte.', s: S.CELL }],
    [null, C('El filtro que ya existe'), C('Antes de usar un significado como falso, la app comprueba que no sea idéntico al correcto (ignorando paréntesis y puntuación).')],
    [null, C('Lo que el filtro no ve'), C('Sinónimos escritos distinto. Por eso abajo están TODOS los pares de la app cuyos significados comparten alguna palabra: son los únicos casos donde esto podría pasar.')],
    [],
    [null, T(`Los ${pares.length} pares que comparten alguna palabra`)],
    [null, null, N('La pregunta para cada uno: ¿se pueden usar el uno en lugar del otro? Si en todos la respuesta es NO, la máquina no puede fabricar un enunciado falso que sea verdadero, y el riesgo queda cerrado.')],
    [null, H('Sec.'), H('Palabra A y su significado'), H('Palabra B y su significado'), H('¿Significan lo mismo?'), H('Comentario')],
    ...pares.map((p) => [
      null,
      C(p.sec),
      C(`${p.A.forma} = "${p.A.glosa}"`),
      C(`${p.B.forma} = "${p.B.glosa}"`),
      I(),
      I(),
    ]),
    [],
    [null, C('El par más delicado'), { v: 'Niawa / Shiawa: los dos se traducen "Adiós", y la app los separa por quién lo dice — Niawa el que se va, Shiawa el que se queda. Si esa distinción no es exacta, hay que reescribir las dos glosas.', s: S.CELL }],
]

// La lista desplegable se ancla a las filas reales de la tabla de pares: se
// localiza su encabezado en lugar de contar filas a mano.
const filaEncabezadoPares = filasMotor.findIndex((r) => r[1]?.v === 'Sec.') + 1
const hojaMotor = {
  name: '4. Cómo arma los ejercicios',
  widths: [3, 30, 52, 52, 22, 30],
  validations: [
    {
      ref: `E${filaEncabezadoPares + 1}:E${filaEncabezadoPares + pares.length}`,
      values: ['Sí, se confunden', 'No, son distintos'],
    },
  ],
  rows: filasMotor,
}

// Hoja 5 — Corpus
const palabras = corpus.items.filter((i) => i.kind === 'word')
const frasesCorpus = corpus.items.filter((i) => i.kind === 'phrase')
const ligadas = palabras.filter((i) => i.notes && i.notes.includes('Forma de cita')).length
const paginas = new Set()
for (const i of corpus.items) {
  const m = /YULTA.*p\.(\d+)/.exec(i.source || '')
  if (m) paginas.add(+m[1])
}
const porPos = {}
for (const i of palabras) porPos[i.part_of_speech] = (porPos[i.part_of_speech] || 0) + 1

const CATEGORIAS = { verb: 'Verbos', noun: 'Sustantivos', particle: 'Partículas', adj: 'Adjetivos', greeting: 'Saludos', number: 'Números' }
const hojaCorpus = {
  name: '5. Corpus',
  widths: [3, 46, 14, 66, 16, 16, 28],
  rows: [
    [null, T('El corpus extraído del diccionario')],
    [null, null, null, N('Es una base de datos armada a partir del YULTAJTAKETZALIS. De ella salen las lecciones generadas automáticamente, que hoy están APAGADAS en la app porque nadie las ha revisado.')],
    [],
    [null, H('Qué contiene'), H('Cuánto'), H('Detalle')],
    [null, C('Palabras'), C(palabras.length), C('Cada una con su traducción, categoría gramatical, tema y la página de donde salió.')],
    [null, C('Frases'), C(frasesCorpus.length), C('Oraciones de ejemplo, la mayoría del propio diccionario.')],
    [null, C('Descomposiciones morfológicas'), C(corpus.phrase_words.length), C('Cada frase partida en sus piezas (prefijos de sujeto, objeto, posesivos). Se hicieron POR ALINEACIÓN AUTOMÁTICA: son lo menos confiable de todo el corpus.')],
    [null, C('Formas marcadas con guion'), C(ligadas), C('El diccionario las escribe con guion inicial (−Pia, −Tukay): no van sueltas, exigen prefijo. La app ya las excluye de las lecciones generadas.')],
    [null, C('Páginas del diccionario tocadas'), C(paginas.size), C('Rango 25–256. NO cubre las pp.26–51 (la parte gramatical inicial), y por eso algunas palabras de las lecciones no se pueden rastrear ahí.')],
    [],
    [null, H('Palabras por categoría'), H('Cuántas'), H('')],
    ...Object.entries(porPos)
      .sort((a, b) => b[1] - a[1])
      .map(([k, v]) => [null, C(CATEGORIAS[k] || k), C(v), C('')]),
    [],
    [null, T('Para estimar el costo de validar')],
    [null, null, null, N('Los bloques van del más útil y barato al más caro. La idea es poder empezar por uno solo, no por todo.')],
    [null, H('Bloque'), H('Ítems'), H('Qué habría que revisar'), H('Horas'), H('Costo'), H('Comentario')],
    [null, C('A · Lo que la app ya enseña'), C(formas.size + frases.size), C('Las hojas 1 y 2 de este libro: ortografía, significado y naturalidad de las frases.'), I(), I(), I()],
    [null, C('B · Palabras del corpus (forma y significado)'), C(palabras.length), C('¿Está bien escrita? ¿Significa eso? Sin ejemplos ni gramática.'), I(), I(), I()],
    [null, C('C · Solo las formas con guion'), C(ligadas), C('Confirmar cuáles exigen prefijo y con cuál se enseñan. Es el error que más se repitió en la app.'), I(), I(), I()],
    [null, C('D · Frases del corpus'), C(frasesCorpus.length), C('¿Se dicen así? ¿La traducción es fiel?'), I(), I(), I()],
    [null, C('E · Descomposiciones morfológicas'), C(corpus.phrase_words.length), C('Lo más caro y lo más delicado: verificar el análisis morfológico automático.'), I(), I(), I()],
    [],
    [null, C('Honorario por hora'), I(), C('← a llenar en la reunión')],
    [null, C('Modalidad que le acomoda'), I(), C('por hora / por ítem / por bloque cerrado')],
    [null, C('Cuánto podría avanzar por semana'), I(), C('')],
  ],
}

// Hoja 6 — Preguntas
const PREGUNTAS = [
  ['Ortografía', '¿La ortografía que usa la app (IRIN: kw, tz, sh, ch) es la que conviene enseñar hoy, o hay otra más aceptada por los hablantes?'],
  ['Variante', 'La app enseña la variante de Witzapan / Santo Domingo de Guzmán, con la regla K→G. ¿Es la decisión correcta para alguien que empieza desde cero?'],
  ['Formas con guion', 'El diccionario marca con guion las formas que exigen prefijo. La app las enseña ya prefijadas: Nikpia "yo tengo", Nikuni "yo bebo", Nutukay "mi nombre". ¿Es la manera correcta de presentárselas a un principiante, o conviene enseñar la raíz y el prefijo por separado?'],
  ['Itukay', 'La app usa "Itukay" para "su nombre", derivada por analogía con "Inan: su madre". Esa forma exacta no se encontró escrita. ¿Existe? ¿Se dice así?'],
  ['Niawa / Shiawa', 'La app enseña Niawa como el adiós del que se va y Shiawa como el del que se queda. ¿Es exacto?'],
  ['Eje', 'La app enseña "Eje" para "sí" y no se pudo localizar en el diccionario. ¿De dónde viene? ¿Es correcta?'],
  ['Tesu datka', '"Tesu datka" se enseña como "de nada". No se localizó como unidad. ¿Se usa así?'],
  ['Nunan', 'La app enseña "Nunan" = mi mamá. En el corpus, "Nan" aparece como partícula de negación. ¿Son dos palabras distintas? ¿Nunan está bien?'],
  ['Metzti', '"Metzti" = luna se verificó en el PDF pero no está en el corpus extraído. ¿Es la forma correcta? ¿Y "Metzi" existe?'],
  ['Frases armadas', 'La hoja 2 marca cuáles frases se ARMARON para los ejercicios de ordenar palabras en lugar de copiarse de una fuente. ¿Están bien construidas gramaticalmente?'],
  ['Audio', 'No hay grabaciones: la app usa una voz sintética en español como aproximación, y silencia las palabras con tz, tl y sh porque el sintetizador las deforma. ¿Vale la pena así, o es mejor quitar el audio hasta tener voz de hablante?'],
  ['Orden', '¿El orden de las secciones (sonidos → familia → comida → entorno → acciones) tiene sentido pedagógico, o hay una secuencia mejor?'],
  ['Qué falta', 'Para que alguien pueda sostener una conversación mínima, ¿qué falta que hoy no está?'],
  ['Validación', '¿Qué bloque de la hoja 5 recomendaría hacer primero, y qué costaría?'],
  ['Autoría', 'Si el contenido se revisa y se corrige, ¿cómo quiere aparecer acreditado en la app?'],
]
const hojaPreguntas = {
  name: '6. Preguntas',
  widths: [5, 22, 78, 55],
  freeze: 2,
  tallRows: [2],
  rows: [
    [T('Preguntas abiertas')],
    [H('N°'), H('Tema'), H('Pregunta'), H('Respuesta')],
    ...PREGUNTAS.map((p, i) => [C(i + 1), C(p[0]), C(p[1]), I()]),
  ],
}

// ── MÓDULO NUEVO (currículo v2) ──────────────────────────────────────────────
// Va primero en el libro: es lo que se le pide validar a un hablante AHORA.
const lecsM1 = moduloNuevo.lessons

const filasDialogo = []
for (const l of lecsM1) {
  for (const [i, d] of l.dialogue.entries()) {
    filasDialogo.push({ lec: l, turno: i + 1, ...d })
  }
}
const hojaDialogos = {
  name: 'N1. Diálogos (módulo nuevo)',
  widths: [5, 26, 8, 8, 30, 30, 13, 46, 18, 28, 28],
  freeze: 2,
  tallRows: [2],
  autofilter: `A2:K${filasDialogo.length + 2}`,
  validations: [{ ref: `I3:I${filasDialogo.length + 2}`, values: SI_NO }],
  rows: [
    [T(`Módulo 1 "${moduloNuevo.title.nawat}" — las ${filasDialogo.length} líneas de los diálogos`)],
    [
      H('N°'), H('Lección'), H('Turno'), H('Quién'), H('Náhuat'), H('Traducción'),
      H('Evidencia'), H('Fuente'), H('¿Está bien?'), H('Corrección propuesta'), H('Comentario'),
    ],
    ...filasDialogo.map((f, i) => [
      C(i + 1), C(f.lec.title.es), C(f.turno), C(f.speaker === 'a' ? 'A' : 'B'),
      C(f.nawat), C(f.es), C(f.evidence), C(f.source), I(), I(), I(),
    ]),
  ],
}

const filasVocM1 = lecsM1.flatMap((l) => l.vocabulary.map((v) => ({ lec: l, ...v })))
const hojaVocM1 = {
  name: 'N2. Vocabulario (módulo nuevo)',
  widths: [5, 26, 18, 32, 16, 13, 46, 18, 28, 28],
  freeze: 2,
  tallRows: [2],
  autofilter: `A2:J${filasVocM1.length + 2}`,
  validations: [{ ref: `H3:H${filasVocM1.length + 2}`, values: SI_NO }],
  rows: [
    [T(`Módulo 1 — las ${filasVocM1.length} palabras que se enseñan`)],
    [
      H('N°'), H('Lección'), H('Náhuat'), H('Significado'), H('Pronunciación'),
      H('Evidencia'), H('Fuente'), H('¿Está bien?'), H('Corrección propuesta'), H('Comentario'),
    ],
    ...filasVocM1.map((v, i) => [
      C(i + 1), C(v.lec.title.es), C(v.nawat), C(v.es), C(v.pron),
      C(v.evidence), C(v.source), I(), I(), I(),
    ]),
  ],
}

const hojaNotasM1 = {
  name: 'N3. Notas, tareas y preguntas',
  widths: [3, 26, 78, 30, 30],
  rows: [
    [null, T('Lo que la app EXPLICA y lo que PIDE hacer')],
    [null, null, N('Las notas gramaticales y las tareas no se pueden verificar contra un diccionario: o son ciertas y útiles, o no lo son. Esta hoja existe para eso.')],
    [],
    [null, H('Lección'), H('Nota teórica'), H('¿Es correcta?'), H('Corrección')],
    ...lecsM1.map((l) => [
      null, C(l.title.es), C(`${l.note.title}\n\n${l.note.body}`), I(), I(),
    ]),
    [],
    [null, H('Lección'), H('Tarea que se le pide al estudiante'), H('¿Tiene sentido?'), H('Comentario')],
    ...lecsM1.map((l) => [null, C(l.title.es), C(l.task), I(), I()]),
    [],
    [null, T('LAS PREGUNTAS — esto es lo que solo usted puede contestar')],
    [null, null, N('Cada lección quedó con un hueco a propósito: la nota cultural la escribe quien pertenece a la comunidad. Inventarla sería el error que este módulo existe para no repetir.')],
    [null, H('Lección'), H('Pregunta'), H('Respuesta'), H('')],
    ...lecsM1.map((l) => [null, C(l.title.es), C(l.speakerAsk), I(), C('')]),
  ],
}

// ── QUÉ FALTA PARA JUBILAR LAS SECCIONES VIEJAS ──────────────────────────────
// El módulo nuevo se arma con frases atestiguadas, y ahí está el cuello de
// botella: de las 248 frases del corpus, la mayoría son descripciones en tercera
// persona ("El canasto grande") que no sirven como turno de diálogo. Esta hoja
// calcula, palabra por palabra, cuáles se quedaron sin una sola frase usable.
const GRAFIAS = new Set(['kw', 'tz', 'sh'])
const enModuloNuevo = new Set()
for (const l of moduloNuevo.lessons) {
  for (const v of l.vocabulary) enModuloNuevo.add(clave(v.nawat))
  for (const d of l.dialogue) {
    enModuloNuevo.add(clave(d.nawat))
    for (const p of d.nawat.split(/\s+/)) enModuloNuevo.add(clave(p))
  }
}
const frasesCorpusTodas = corpus.items.filter((i) => i.kind === 'phrase')
const esConversacional = (f) => {
  const n = f.text_nawat
  const es = f.text_es || ''
  return (
    /\?/.test(n) || /\?/.test(es) ||
    /^(naja|taja|tejemet|anmejemet)\b/i.test(n) ||
    /^(ni|ti|an|nik|tik|shi|mu)/i.test(n.split(/\s+/)[0]) ||
    /^(yo|tú|tu|usted|ustedes|nosotros)\b/i.test(es)
  )
}
const pendientes = []
for (const f of filasVocab) {
  const key = clave(f.forma)
  if (enModuloNuevo.has(key)) continue
  if (GRAFIAS.has(key)) continue // no son palabras: van en una lección de sonidos
  const conLaPalabra = frasesCorpusTodas.filter((p) =>
    new RegExp(`(^|\\s)${key}(\\s|$)`, 'i').test(p.text_nawat),
  )
  const usables = conLaPalabra.filter(esConversacional)
  pendientes.push({
    forma: f.forma,
    es: f.glosa,
    sec: f.sec,
    total: conLaPalabra.length,
    usables: usables.length,
    ejemplo: usables[0] ? `${usables[0].text_nawat} = ${usables[0].text_es}` : '',
  })
}
const sinMaterial = pendientes.filter((p) => p.usables === 0)

const hojaFalta = {
  name: 'N4. Lo que falta',
  widths: [5, 18, 30, 7, 11, 11, 44, 40, 26],
  freeze: 3,
  tallRows: [3],
  rows: [
    [T(`Las ${sinMaterial.length} palabras que bloquean el reemplazo`)],
    [
      null,
      N('Para pasar una palabra al modelo nuevo hace falta una frase donde se use de verdad, en primera o segunda persona. El diccionario da muchas frases, pero casi todas son descripciones ("El canasto grande") que no sirven como turno de conversación. Estas se quedaron sin ninguna. Una frase corta y natural por palabra alcanza para desbloquearla.'),
    ],
    [
      H('N°'), H('Náhuat'), H('Significado en la app'), H('Sec.'),
      H('Frases en el corpus'), H('Usables'), H('La única usable, si la hay'),
      H('UNA FRASE NATURAL CON ESTA PALABRA'), H('Traducción'),
    ],
    ...pendientes
      .sort((a, b) => a.usables - b.usables || a.sec - b.sec)
      .map((p, i) => [
        C(i + 1), C(p.forma), C(p.es), C(p.sec),
        C(p.total), C(p.usables), C(p.ejemplo || '—'), I(), I(),
      ]),
  ],
}

// ── empaquetado ──────────────────────────────────────────────────────────────
const partes = buildXlsx([
  leeme,
  hojaDialogos,
  hojaVocM1,
  hojaNotasM1,
  hojaFalta,
  vocab,
  hojaFrases,
  hojaEj,
  hojaMotor,
  hojaCorpus,
  hojaPreguntas,
])

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'xlsx-'))
const manifiesto = []
for (const f of partes) {
  const destino = path.join(tmp, f.name.replace(/\//g, path.sep))
  fs.mkdirSync(path.dirname(destino), { recursive: true })
  fs.writeFileSync(destino, f.content, 'utf8')
  manifiesto.push({ zip: f.name, disco: destino })
}

// ZIP con nombres de entrada explícitos (barra normal): Excel rechaza las
// contrabarras que mete Compress-Archive en Windows. El script y el manifiesto
// van a disco en lugar de a -Command: el escapado de comillas anidadas entre
// Node y PowerShell es una fuente segura de problemas.
const rutaManifiesto = path.join(tmp, '_manifiesto.json')
const rutaPs = path.join(tmp, '_empaquetar.ps1')
fs.writeFileSync(rutaManifiesto, JSON.stringify(manifiesto), 'utf8')
fs.writeFileSync(
  rutaPs,
  `$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem
$salida = [System.IO.File]::ReadAllText($args[1])
$manifiesto = Get-Content -Raw -Encoding UTF8 $args[0] | ConvertFrom-Json
if (Test-Path $salida) { Remove-Item $salida -Force }
$fs = [System.IO.File]::Open($salida, 'Create')
$zip = New-Object System.IO.Compression.ZipArchive($fs, [System.IO.Compression.ZipArchiveMode]::Create)
foreach ($m in $manifiesto) {
  $entrada = $zip.CreateEntry($m.zip, [System.IO.Compression.CompressionLevel]::Optimal)
  $flujo = $entrada.Open()
  $bytes = [System.IO.File]::ReadAllBytes($m.disco)
  $flujo.Write($bytes, 0, $bytes.Length)
  $flujo.Dispose()
}
$zip.Dispose()
$fs.Dispose()
`,
  'utf8',
)
const rutaSalida = path.join(tmp, '_salida.txt')
fs.writeFileSync(rutaSalida, SALIDA, 'utf8')
execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-File', rutaPs, rutaManifiesto, rutaSalida], {
  stdio: 'inherit',
})
fs.rmSync(tmp, { recursive: true, force: true })

console.log(`✓ ${path.relative(ROOT, SALIDA)}`)
console.log(`  ${formas.size} formas · ${frases.size} frases · ${ejercicios.length} ejercicios · ${pares.length} pares a revisar`)
