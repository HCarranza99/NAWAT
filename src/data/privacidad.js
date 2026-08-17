/**
 * privacidad.js
 *
 * El aviso de privacidad como dato, no como JSX suelto. Está acá por dos
 * razones: la cláusula corta del registro y la pantalla completa /privacidad
 * tienen que decir lo MISMO — si se escriben por separado se separan —, y
 * porque los plazos deben poder cambiarse en un solo lugar.
 *
 * Qué se recoge hoy (17-ago-2026), para que esta lista no se desactualice sin
 * que nadie lo note: nombre, edad, departamento, distrito o país (tabla
 * `participants`), y el uso de la app — sesiones, intentos de lección y
 * respuestas a ejercicios. Todo cuelga de un identificador aleatorio: no se
 * pide correo ni teléfono, y la cuenta es opcional.
 *
 * ⚠️ Si cambia lo que se recoge, cambiar TAMBIÉN este archivo. Es lo que se le
 * promete a la persona, y es lo único que ella llega a leer.
 */

/** A dónde escribe quien quiere que borren sus datos. */
export const CONTACTO_DATOS = 'chugo9974@gmail.com'

/**
 * Meses de inactividad tras los cuales se borra todo lo de una persona.
 *
 * PENDIENTE DE CONFIRMAR — 24 meses es un plazo razonable y defendible, pero
 * lo eligió el desarrollo, no el responsable del proyecto. Cambiar acá si se
 * decide otro; el texto de la pantalla se ajusta solo.
 *
 * Y ojo: hoy este borrado NO está automatizado. Mientras no exista la tarea
 * que lo ejecute, esto es una promesa a mano. No prometer plazos más cortos
 * de los que se puedan cumplir.
 */
export const MESES_INACTIVIDAD_PARA_BORRADO = 24

/** Versión del aviso. Subirla cuando cambie algo de fondo, no una coma. */
export const VERSION_AVISO = '2026-08-17'

/**
 * La cláusula corta: lo que se muestra DENTRO del registro, junto a los campos.
 * Tiene que caber en pantalla sin hacer scroll y decir la verdad completa.
 */
export const CLAUSULA_CORTA =
  'Guardamos tu nombre, tu edad y dónde vives para saber quién está aprendiendo ' +
  'náhuat, junto con tu avance en la app. No pedimos correo ni teléfono, no ' +
  'compartimos ni vendemos nada, y podés pedir que borremos todo cuando querás.'

/** Las secciones de la pantalla completa. */
export const SECCIONES = [
  {
    id: 'que',
    titulo: 'Qué guardamos',
    parrafos: [
      'Lo que nos das en el registro: tu nombre (o como quieras que te llamemos), tu edad y dónde vivís — departamento y distrito, o el país si estás fuera de El Salvador.',
      'Lo que hacés en la app: cuándo entrás, qué lecciones completás, cuánto tardás y qué respondés en los ejercicios. Eso es lo que nos deja ver qué partes del curso funcionan y cuáles hay que arreglar.',
      'Si contestás alguna encuesta dentro de la app, también se guarda lo que respondas.',
    ],
  },
  {
    id: 'que_no',
    titulo: 'Qué NO guardamos',
    parrafos: [
      'No pedimos correo ni teléfono. No usamos rastreadores de publicidad ni vendemos datos a nadie.',
      'Si donás, el pago lo maneja PayPal en su propia página: nosotros nunca vemos tu tarjeta ni tus datos bancarios.',
      'Si le escribís al tutor de IA, tu mensaje se manda a Anthropic para poder responderte, pero no lo guardamos junto a tu nombre.',
    ],
  },
  {
    id: 'para_que',
    titulo: 'Para qué lo usamos',
    parrafos: [
      'Para mejorar el curso y para poder responder una pregunta sencilla: quién está aprendiendo náhuat en El Salvador. Esa respuesta es parte del sentido del proyecto.',
      'Cuando se publican resultados, se publican siempre agrupados — «tantas personas de tal departamento» —, nunca de forma que se pueda saber quién sos.',
    ],
  },
  {
    id: 'cuanto',
    titulo: 'Cuánto tiempo',
    parrafos: [
      `Mientras sigas usando la app, tus datos se conservan sin fecha de vencimiento: son los que sostienen tu avance y tu racha.`,
      `Si dejás de entrar durante ${MESES_INACTIVIDAD_PARA_BORRADO} meses seguidos, borramos todo lo tuyo.`,
      'Y si querés que lo borremos antes, no hace falta explicar por qué: se borra y ya.',
    ],
  },
  {
    id: 'derechos',
    titulo: 'Cómo pedir que borremos tus datos',
    parrafos: [
      `Escribí a ${CONTACTO_DATOS} y decinos el nombre con el que te registraste. Te confirmamos cuando esté hecho.`,
      'También podés pedir una copia de lo que tenemos tuyo, o corregir algo que esté mal — el nombre y el lugar los podés cambiar vos desde Perfil.',
    ],
  },
  {
    id: 'menores',
    titulo: 'Si tenés menos de 18',
    parrafos: [
      'La app pide 10 años como mínimo para registrarse.',
      'Si tenés entre 10 y 17, contale a tu mamá, papá o a quien te cuide que estás usando la app y qué datos diste. Si esa persona prefiere que borremos todo, que nos escriba y lo hacemos sin preguntar nada más.',
    ],
  },
]
