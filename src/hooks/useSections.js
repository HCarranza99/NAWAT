import secciones from '../data/curriculum/asSections'

/**
 * La ruta de aprendizaje que ve el usuario.
 *
 * Desde el 14-ago-2026 devuelve el CURRÍCULO v2 (src/data/curriculum), que es
 * ya el único contenido de la app. Antes servía las secciones 1–5 artesanales
 * más una capa generada que se cargaba aparte y estaba apagada por bandera.
 *
 * Ese registro con carga diferida ya no hace falta: el currículo entero son 22
 * lecciones de datos, pesa poco y entra en el bundle principal. Se borró junto
 * con las secciones viejas.
 *
 * Se conservan las dos funciones y sus nombres porque las usan siete pantallas.
 * `ready` queda siempre en true: no hay nada que esperar, y las pantallas que lo
 * miraban para no quedarse en un loader siguen funcionando sin tocarlas.
 */
export function useSections() {
  return secciones
}

export function useSectionsReady() {
  return { sections: secciones, ready: true }
}
