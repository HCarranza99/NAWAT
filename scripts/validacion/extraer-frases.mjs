/**
 * Busca en el diccionario frases REALES para una lista de palabras.
 *
 * `docs/YULTAJTAKETZALIS.md` trae los ejemplos de uso en líneas con la forma
 *   Náhuat: Español.
 * Esa es la materia prima buena: oraciones que alguien escribió como ejemplo de
 * uso, no fragmentos ni definiciones.
 *
 * Existe porque escribir las frases a mano salió mal: al cotejar el primer
 * intento contra el corpus aparecieron 34 errores, casi todos páginas inferidas
 * en lugar de leídas, y varias "frases atestiguadas" que en realidad eran
 * pedazos de otra frase más larga ("Ne mistun" es fragmento de "Ne mistun nemi
 * kalijtik"). La forma de no volver a equivocarse es no escribirlas: buscarlas.
 *
 *   node scripts/validacion/extraer-frases.mjs kuchi tekiti nunan
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

/** Todas las líneas «Náhuat: Español.» del diccionario, con su número de línea. */
export function frasesDelDiccionario() {
  const texto = fs.readFileSync(path.join(ROOT, 'docs/YULTAJTAKETZALIS.md'), 'utf8')
  const salida = []
  texto.split(/\r?\n/).forEach((linea, i) => {
    const l = linea.trim()
    // Formato: algo en náhuat, dos puntos, algo en español.
    const m = /^([A-ZÁÉÍÓÚÑa-záéíóúñüwjkstz¿?¡!'’ -]{3,60}):\s+(.{3,90})$/.exec(l)
    if (!m) return
    const nawat = m[1].trim()
    const es = m[2].trim()
    // Descartar encabezados y definiciones: una frase de uso tiene 2+ palabras
    // en náhuat y no empieza con marcas de sección.
    if (nawat.split(/\s+/).length < 2) return
    if (/^(Sust|Adj|Verbo|Adv|Bot|Zool|Ej|Nota)\b/i.test(nawat)) return
    salida.push({ nawat, es, linea: i + 1 })
  })
  return salida
}

/** ¿Es una frase usable en una conversación? (1ª/2ª persona o pregunta) */
export function esConversacional(f) {
  const n = f.nawat
  return (
    /\?/.test(n) || /\?/.test(f.es) ||
    /^(naja|taja|tejemet|anmejemet)\b/i.test(n) ||
    /^(ni|ti|an|nik|tik|shi|mu)/i.test(n.split(/\s+/)[0]) ||
    /^(yo|tú|tu|usted|ustedes|nosotros|me |te )/i.test(f.es)
  )
}

/** Frases que contienen la palabra dada como token entero. */
export function frasesCon(palabra, todas) {
  const re = new RegExp(`(^|\\s)${palabra}(\\s|$|[.,:?!])`, 'i')
  return todas.filter((f) => re.test(f.nawat))
}

// ── uso desde la terminal ────────────────────────────────────────────────────
if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  const todas = frasesDelDiccionario()
  const buscadas = process.argv.slice(2)
  console.log(`frases de uso encontradas en el diccionario: ${todas.length}`)
  console.log(`de esas, conversacionales: ${todas.filter(esConversacional).length}\n`)
  for (const p of buscadas) {
    const hits = frasesCon(p, todas)
    const conv = hits.filter(esConversacional)
    console.log(`\n████ ${p} — ${hits.length} frases (${conv.length} conversacionales)`)
    for (const f of (conv.length ? conv : hits).slice(0, 6)) {
      console.log(`   l.${String(f.linea).padStart(6)}  ${f.nawat}`)
      console.log(`             ${f.es}`)
    }
  }
}
