/**
 * credits.js
 *
 * Atribución de las fuentes del contenido de la app.
 *
 * IMPORTANTE — esto es un RECONOCIMIENTO de autoría, no una declaración de
 * licencia. Mientras no haya autorización escrita de los titulares, la pantalla
 * NO debe afirmar ni insinuar que el uso está autorizado ("con permiso de",
 * "bajo licencia de"). Solo dice de dónde viene el material y a quién pertenece.
 * Si llega la autorización, agregar aquí el campo correspondiente y recién
 * entonces mostrarlo.
 *
 * El enlace de compra del diccionario se configura con VITE_DICTIONARY_URL. Sin
 * esa variable la pantalla muestra el ISBN para que la persona pueda buscarlo,
 * en vez de apuntar a una URL inventada.
 */

/** Enlace de adquisición del diccionario (opcional; ver arriba). */
export const DICTIONARY_URL = import.meta.env.VITE_DICTIONARY_URL || null

/** Fuente principal del vocabulario. */
export const PRIMARY_SOURCE = {
  title: 'YULTAJTAKETZALIS',
  subtitle: 'Diccionario náhuat / castellano',
  authors: ['Sixta Pérez García', 'Héctor Martínez'],
  year: 2023,
  isbn: '979-8-218-26213-6',
  blurb:
    'Diccionario de la variedad de Witzapan (Santo Domingo de Guzmán), elaborado por Nantzin Sixta Pérez García, hablante nativa, junto a Héctor Martínez. Es la fuente principal del vocabulario que enseña esta aplicación.',
  dedication:
    'La obra está dedicada a Witzapan y a las comunidades nahuas de El Salvador que han mantenido viva la lengua a lo largo de los siglos.',
}

/** Otras obras consultadas para el contenido. */
export const SECONDARY_SOURCES = [
  {
    title: 'Curso Timumachtikan!',
    author: 'Alan R. King',
    note: 'Material de enseñanza del náhuat; base de varias frases y expresiones de uso.',
  },
  {
    title: 'Gramática del Nawat / CGN',
    author: 'Alan R. King',
    note: 'Referencia para la estructura de la lengua y la morfología de los verbos.',
  },
]

/** Reconocimiento a la comunidad hablante. */
export const COMMUNITY_NOTE =
  'El náhuat sigue vivo porque las abuelas y abuelos nahuahablantes de El Salvador lo sostuvieron cuando nadie más lo hizo. Esta aplicación existe gracias a ellos, y cualquier mérito que tenga es primero suyo.'
