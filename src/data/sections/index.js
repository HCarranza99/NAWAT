/**
 * Secciones del Sistema Náhuat
 *
 * Cada sección se define en su propio archivo para facilitar
 * el mantenimiento, la revisión y la adición de nuevas secciones.
 *
 * Para agregar una sección nueva:
 *  1. Crea src/data/sections/section6.js (o el número que siga)
 *  2. Exporta el objeto de sección como default
 *  3. Impórtalo aquí y agrégalo al array
 */

import section1 from './section1'
import section2 from './section2'
import section3 from './section3'
import section4 from './section4'
import section5 from './section5'

const sections = [
  section1,
  section2,
  section3,
  section4,
  section5,
]

export default sections
