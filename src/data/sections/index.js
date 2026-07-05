import artisanalSections from './artisanal'
import generated from './generated'
import { composeCurriculum } from './curriculum'

/**
 * Lista síncrona COMPLETA del currículo: secciones artesanales con el vocabulario
 * generado fusionado por tema (ver ./curriculum.js) + las secciones nuevas.
 *
 * En la app NO se importa este módulo directamente: las pantallas usan la carga
 * diferida vía ./registry.js + el hook useSections() (así lo generado, ~1.2 MB,
 * viaja en un chunk aparte que se carga en segundo plano). Este índice se conserva
 * para pruebas y para cualquier uso que necesite todas las secciones de forma síncrona.
 */
const sections = composeCurriculum(artisanalSections, generated)

export default sections
