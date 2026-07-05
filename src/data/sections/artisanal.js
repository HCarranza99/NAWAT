import section1 from './section1'
import section2 from './section2'
import section3 from './section3'
import section4 from './section4'
import section5 from './section5'

/**
 * Secciones artesanales (núcleo de calidad). Se cargan de forma síncrona porque
 * son ligeras (~74 KB) y constituyen la experiencia inicial. El vocabulario
 * ampliado generado se carga aparte y bajo demanda — ver ./registry.js.
 */
const artisanalSections = [section1, section2, section3, section4, section5]

export default artisanalSections
