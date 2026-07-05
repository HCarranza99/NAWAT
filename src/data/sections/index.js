import artisanalSections from './artisanal'
import generatedSections from './generated'

/**
 * Lista síncrona COMPLETA (artesanal 1–5 + generado 6–10).
 *
 * En la app NO se importa este módulo directamente: las pantallas usan la carga
 * diferida vía ./registry.js + el hook useSections() (así lo generado, ~1.2 MB,
 * viaja en un chunk aparte que se carga en segundo plano). Este índice se conserva
 * para pruebas y para cualquier uso que necesite todas las secciones de forma
 * síncrona.
 */
const sections = [...artisanalSections, ...generatedSections]

export default sections
