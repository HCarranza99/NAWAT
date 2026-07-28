/**
 * donation.js
 *
 * Configuración de la donación directa.
 *
 * Usamos un **botón de donación alojado por PayPal** (hosted button): la app
 * solo abre la página de PayPal, así que nunca toca datos de pago, no necesita
 * backend ni secretos, y queda fuera del alcance de PCI.
 *
 * El `hosted_button_id` es público por diseño (viaja en el enlace que se
 * comparte), por eso puede vivir en el repo. La variable de entorno permite
 * apuntar a otro botón (p. ej. una cuenta sandbox) sin tocar código.
 */

export const PAYPAL_BUTTON_ID =
  import.meta.env.VITE_PAYPAL_BUTTON_ID || 'JQMYCLY64XANE'

/**
 * PayPal renderiza la página en el idioma del visitante. La app es en español,
 * así que lo forzamos (es_XC = español de Latinoamérica).
 */
const PAYPAL_LOCALE = 'es_XC'

const PAYPAL_DONATE_BASE = 'https://www.paypal.com/donate/'

/** Si no hay botón configurado, la app esconde toda la UI de donación. */
export const DONATION_ENABLED = Boolean(PAYPAL_BUTTON_ID)

/**
 * Montos que ofrece la página de PayPal. Se muestran solo como referencia:
 * la página nueva de PayPal IGNORA el parámetro `amount` de la URL, así que
 * el monto siempre lo elige la persona allá. No prometemos lo contrario.
 */
export const DONATION_AMOUNTS = [5, 10, 25]

/** A dónde va el dinero. Sin cifras inventadas: son destinos, no promesas. */
export const DONATION_USES = [
  'Mantener la app gratis y sin anuncios',
  'Seguir ampliando lecciones desde el corpus náhuat',
  'Cubrir alojamiento, dominio y herramientas del proyecto',
]

/**
 * URL de la página de donación alojada por PayPal.
 * @param {string} [buttonId] - id del botón alojado (por defecto el configurado)
 * @returns {string|null} URL lista para abrir, o null si no hay botón
 */
export function buildDonationUrl(buttonId = PAYPAL_BUTTON_ID) {
  if (!buttonId) return null
  const params = new URLSearchParams({
    hosted_button_id: buttonId,
    'locale.x': PAYPAL_LOCALE,
  })
  return `${PAYPAL_DONATE_BASE}?${params.toString()}`
}
