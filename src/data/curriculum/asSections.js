import modules, { toRunnerItems, TIPOS_QUE_MIDEN } from './index'

/**
 * ═══════════════════════════════════════════════════════════════════════════
 *  El currículo v2, con la forma que esperan las pantallas
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *  Las pantallas (SectionsScreen, HomeMobile, ReviewScreen, LogrosScreen…)
 *  consumen una lista de "secciones". Este archivo proyecta los módulos a esa
 *  forma, y es lo ÚNICO que hubo que escribir para que el currículo pasara de
 *  estar escondido tras una URL a ser el contenido de la app.
 *
 *  Se eligió adaptar en vez de reescribir las pantallas: la ruta de aprendizaje
 *  ya tenía progreso, bloqueo por avance, estrellas y su diseño resuelto. Tirar
 *  todo eso para volver a hacerlo habría sido cambiar la app de forma sin
 *  ninguna ganancia — justo lo que el contrato del currículo existe para evitar.
 *
 *  DOS DIFERENCIAS QUE HAY QUE CONOCER
 *
 *  1. NO HAY BOSS. Las secciones viejas cerraban con un examen final. El
 *     currículo v2 no tiene ese tipo de lección, así que un módulo se da por
 *     terminado cuando se terminan sus lecciones. La regla vive en
 *     `seccionCompleta()` (src/lib/lessonPath.js) y sirve para las dos formas,
 *     por si algún día vuelve el boss.
 *
 *  2. LOS IDS SON 'm0'…'m5', NO 1…5. A propósito. El progreso se guarda en
 *     `sectionProgress[section.id]`, y quien ya jugó las secciones viejas tiene
 *     ahí sus claves numéricas. Con ids distintos, ese progreso viejo queda
 *     guardado pero inerte: nadie aparece con lecciones nuevas ya aprobadas
 *     porque sí, y si alguna vez se quiere leer o migrar, sigue estando.
 */

/**
 * XP de una lección: 10 por cada ejercicio que MIDE de verdad.
 *
 * No se cuentan diálogo, nota, tarea ni tarjetas de memoria. Las tarjetas se
 * autoevalúan —"lo sabía" / "no lo sabía"— así que pagar XP por ellas sería
 * pagar por decir que uno sabe. Da entre 40 y 50 por lección, que es lo mismo
 * que daban las secciones viejas.
 */
function xpDeLaLeccion(items) {
  const miden = items.filter((i) => TIPOS_QUE_MIDEN.includes(i.type)).length
  return Math.max(30, miden * 10)
}

/**
 * Las ilustraciones son cinco y los módulos seis. Se reparten en orden y la
 * última se repite; es decoración de la tarjeta, no información.
 */
function imagenDelModulo(indice) {
  return `/assets/images/section${(indice % 5) + 1}.png`
}

/** Los módulos del currículo con la forma de "sección" que leen las pantallas. */
export function curriculumAsSections() {
  return modules.map((modulo, indice) => ({
    id: modulo.id,
    title: modulo.title.es,
    nawatTitle: modulo.title.nawat,
    description: modulo.description,
    color: modulo.color,
    icon: modulo.icon,
    image: imagenDelModulo(indice),

    lessons: modulo.lessons.map((leccion) => {
      const items = toRunnerItems(leccion)
      return {
        id: leccion.id,
        title: leccion.title.es,
        nawatTitle: leccion.title.nawat,
        // El objetivo dice qué vas a PODER hacer. Es mejor subtítulo que una
        // descripción escrita aparte, y no se puede desincronizar del contenido.
        description: leccion.objective,
        xpReward: xpDeLaLeccion(items),
        // `items` ya viene compilado: lo necesitan el repaso y las frases de uso.
        items,
        // Adónde navega la tarjeta. Las pantallas lo usan tal cual en vez de
        // armar la URL a mano, así la ruta se cambia en un solo lugar.
        route: `/curriculo/${leccion.id}`,
      }
    }),

    // Sin boss, a propósito. Ver la cabecera.
    boss: null,
  }))
}

/** Instancia única: compilar los ejercicios de 22 lecciones no se repite en cada render. */
const secciones = curriculumAsSections()

export default secciones
