/**
 * privacidad.js
 *
 * El aviso de privacidad como dato, no como JSX suelto. Está acá por dos
 * razones: la cláusula corta del registro y la pantalla completa /privacidad
 * tienen que decir lo MISMO — si se escriben por separado se separan —, y
 * porque los plazos deben poder cambiarse en un solo lugar.
 *
 * Qué se recoge hoy (1-nov-2026), para que esta lista no se desactualice sin
 * que nadie lo note: el avance (localStorage, y `user_profiles` si hay cuenta),
 * el correo de quien crea cuenta (Supabase Auth), el uso de la app de quien ya
 * tenía participante (sesiones, intentos de lección y respuestas a ejercicios,
 * ligados a un identificador aleatorio) y `error_log`. Nombre, edad y lugar ya
 * no se piden (ver data/funciones.js) y se borraron de Supabase.
 *
 * CLAUSULA_CORTA describe el registro, que hoy está apagado: solo se muestra si
 * se vuelve a encender REGISTRO_ACTIVO.
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
export const VERSION_AVISO = '2026-11-01'

/**
 * La cláusula corta: lo que se muestra DENTRO del registro, junto a los campos.
 * Tiene que caber en pantalla sin hacer scroll y decir la verdad completa.
 */
export const CLAUSULA_CORTA =
  'Guardamos tu nombre, tu edad y dónde vives para saber quién está aprendiendo ' +
  'náhuat, junto con tu avance en la app. No pedimos correo ni teléfono, no ' +
  'compartimos ni vendemos nada, y podés pedir que borremos todo cuando querás. '  +
  'Tu nombre de pila puede aparecer en la tabla de clasificación de la app; se '  +
  'apaga desde Perfil.'

/** Las secciones de la pantalla completa. */
export const SECCIONES = [
  {
    id: 'que',
    titulo: 'Qué guardamos',
    parrafos: [
      'Tu avance en la app —lecciones, XP, racha y repasos— se guarda en este dispositivo. Si creás una cuenta, también se guarda en la nube junto con el correo con el que entrás, para que no lo perdás al cambiar de teléfono.',
      'Si usaste la app antes de noviembre de 2026, seguimos guardando cómo la usaste —qué lecciones completaste y qué respondiste en los ejercicios— ligado a un identificador aleatorio que no dice quién sos. Quien llega ahora ya no genera estos registros.',
      'Cuando algo falla, guardamos un aviso técnico del error —qué parte de la app falló y en qué versión— para poder arreglarlo.',
    ],
  },
  {
    id: 'que_no',
    titulo: 'Qué NO guardamos',
    parrafos: [
      'Ya no pedimos tu nombre, tu edad ni dónde vivís. Los que se habían dado en el registro los borramos en noviembre de 2026, y también se borran de este dispositivo al abrir la app.',
      'No usamos rastreadores de publicidad ni vendemos datos a nadie.',
      'Si donás, el pago lo maneja PayPal en su propia página: nosotros nunca vemos tu tarjeta ni tus datos bancarios.',
      'Si le escribís al tutor de IA, tu mensaje se manda a Anthropic para poder responderte, pero no lo guardamos.',
    ],
  },
  {
    id: 'para_que',
    titulo: 'Para qué lo usamos',
    parrafos: [
      'Para que puedas seguir tu curso donde lo dejaste y para saber qué partes del curso funcionan y cuáles hay que arreglar.',
      'Cuando se publican resultados de investigación, se publican siempre agrupados y anonimizados, nunca de forma que se pueda saber quién sos.',
    ],
  },
  {
    id: 'cuanto',
    titulo: 'Cuánto tiempo',
    parrafos: [
      'Mientras sigas usando la app, tu avance se conserva sin fecha de vencimiento: es lo que sostiene tu progreso y tu racha.',
      `Si dejás de entrar durante ${MESES_INACTIVIDAD_PARA_BORRADO} meses seguidos, borramos todo lo tuyo.`,
      'Y si querés que lo borremos antes, no hace falta explicar por qué: se borra y ya.',
    ],
  },
  {
    id: 'derechos',
    titulo: 'Cómo pedir que borremos tus datos',
    parrafos: [
      `Si tenés cuenta, escribí a ${CONTACTO_DATOS} desde el correo con el que entrás y borramos la cuenta y tu avance. Te confirmamos cuando esté hecho.`,
      'Si no tenés cuenta, tu avance solo vive en este dispositivo: se borra al limpiar los datos del navegador o desinstalar la app.',
    ],
  },
  {
    id: 'menores',
    titulo: 'Si tenés menos de 18',
    parrafos: [
      'La app no te pide ningún dato personal para aprender. Si querés crear una cuenta con tu correo, contale primero a tu mamá, papá o a quien te cuide.',
      'Si esa persona prefiere que borremos tu cuenta, que nos escriba y lo hacemos sin preguntar nada más.',
    ],
  },
]
