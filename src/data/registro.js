/**
 * registro.js
 *
 * Catálogo de opciones de la pantalla de registro. Vive aparte de la pantalla
 * porque el análisis (R/SQL) depende de que los valores guardados sean CÓDIGOS
 * estables, no el texto que ve el usuario: si mañana cambia una etiqueta, los
 * datos ya recolectados siguen siendo comparables.
 *
 * Regla: NUNCA reutilizar ni renombrar un `code` ya publicado. Agregar, sí.
 */

/** Los 14 departamentos de El Salvador, en el orden geográfico habitual (oeste → este). */
export const DEPARTAMENTOS = Object.freeze([
  { code: 'ahuachapan', label: 'Ahuachapán' },
  { code: 'santa_ana', label: 'Santa Ana' },
  { code: 'sonsonate', label: 'Sonsonate' },
  { code: 'chalatenango', label: 'Chalatenango' },
  { code: 'la_libertad', label: 'La Libertad' },
  { code: 'san_salvador', label: 'San Salvador' },
  { code: 'cuscatlan', label: 'Cuscatlán' },
  { code: 'la_paz', label: 'La Paz' },
  { code: 'cabanas', label: 'Cabañas' },
  { code: 'san_vicente', label: 'San Vicente' },
  { code: 'usulutan', label: 'Usulután' },
  { code: 'san_miguel', label: 'San Miguel' },
  { code: 'morazan', label: 'Morazán' },
  { code: 'la_union', label: 'La Unión' },
])

/**
 * Vive fuera del país. La diáspora salvadoreña es una parte real del público
 * de una app de náhuat, y mezclarla con un departamento arruinaría el dato.
 */
export const RESIDENCIA_EXTERIOR = 'fuera_de_el_salvador'

/** Opciones completas del selector, en el orden en que se muestran. */
export const RESIDENCIAS = Object.freeze([
  ...DEPARTAMENTOS,
  { code: RESIDENCIA_EXTERIOR, label: 'Vivo fuera de El Salvador' },
])

/**
 * Los 262 distritos, por departamento.
 *
 * Son los que hasta 2023 fueron municipios: la reestructuración municipal los
 * reagrupó en 44 municipios nuevos («Sonsonate Oeste», «Morazán Norte»…) y
 * convirtió los nombres de toda la vida en distritos. Aquí van los distritos
 * porque son los que la gente usa para decir de dónde es — nadie contesta
 * «Sonsonate Oeste», contesta «Nahuizalco».
 *
 * Para el náhuat esta es LA distinción que importa: Sonsonate mezcla a alguien
 * de Nahuizalco o Santo Domingo de Guzmán, donde el idioma todavía se oye, con
 * alguien de la cabecera que nunca lo escuchó en casa.
 *
 * Solo se escriben los nombres; el código se deriva de ellos (ver `slug`), lo
 * que evita 262 oportunidades de errata. Como los nombres se repiten entre
 * departamentos (El Rosario está en Cuscatlán, La Paz y Morazán), el código
 * lleva el departamento adelante: `cuscatlan-el_rosario`.
 */
const DISTRITOS_POR_DEPARTAMENTO = Object.freeze({
  ahuachapan: [
    'Ahuachapán', 'Apaneca', 'Atiquizaya', 'Concepción de Ataco', 'El Refugio',
    'Guaymango', 'Jujutla', 'San Francisco Menéndez', 'San Lorenzo',
    'San Pedro Puxtla', 'Tacuba', 'Turín',
  ],
  santa_ana: [
    'Candelaria de la Frontera', 'Chalchuapa', 'Coatepeque', 'El Congo',
    'El Porvenir', 'Masahuat', 'Metapán', 'San Antonio Pajonal',
    'San Sebastián Salitrillo', 'Santa Ana', 'Santa Rosa Guachipilín',
    'Santiago de la Frontera', 'Texistepeque',
  ],
  sonsonate: [
    'Acajutla', 'Armenia', 'Caluco', 'Cuisnahuat', 'Izalco', 'Juayúa',
    'Nahuizalco', 'Nahulingo', 'Salcoatitán', 'San Antonio del Monte',
    'San Julián', 'Santa Catarina Masahuat', 'Santa Isabel Ishuatán',
    'Santo Domingo de Guzmán', 'Sonsonate', 'Sonzacate',
  ],
  chalatenango: [
    'Agua Caliente', 'Arcatao', 'Azacualpa', 'Chalatenango', 'Citalá',
    'Comalapa', 'Concepción Quezaltepeque', 'Dulce Nombre de María',
    'El Carrizal', 'El Paraíso', 'La Laguna', 'La Palma', 'La Reina',
    'Las Flores', 'Las Vueltas', 'Nombre de Jesús', 'Nueva Concepción',
    'Nueva Trinidad', 'Ojos de Agua', 'Potonico', 'San Antonio de la Cruz',
    'San Antonio Los Ranchos', 'San Fernando', 'San Francisco Lempa',
    'San Francisco Morazán', 'San Ignacio', 'San Isidro Labrador',
    'San José Cancasque', 'San Luis del Carmen', 'San Miguel de Mercedes',
    'San Rafael', 'Santa Rita', 'Tejutla',
  ],
  la_libertad: [
    'Antiguo Cuscatlán', 'Chiltiupán', 'Ciudad Arce', 'Colón', 'Comasagua',
    'Huizúcar', 'Jayaque', 'Jicalapa', 'La Libertad', 'Nuevo Cuscatlán',
    'Quezaltepeque', 'Sacacoyo', 'San José Villanueva', 'San Juan Opico',
    'San Matías', 'San Pablo Tacachico', 'Santa Tecla', 'Talnique',
    'Tamanique', 'Teotepeque', 'Tepecoyo', 'Zaragoza',
  ],
  san_salvador: [
    'Aguilares', 'Apopa', 'Ayutuxtepeque', 'Cuscatancingo', 'Delgado',
    'El Paisnal', 'Guazapa', 'Ilopango', 'Mejicanos', 'Nejapa', 'Panchimalco',
    'Rosario de Mora', 'San Marcos', 'San Martín', 'San Salvador',
    'Santiago Texacuangos', 'Santo Tomás', 'Soyapango', 'Tonacatepeque',
  ],
  cuscatlan: [
    'Candelaria', 'Cojutepeque', 'El Carmen', 'El Rosario', 'Monte San Juan',
    'Oratorio de Concepción', 'San Bartolomé Perulapía', 'San Cristóbal',
    'San José Guayabal', 'San Pedro Perulapán', 'San Rafael Cedros',
    'San Ramón', 'Santa Cruz Analquito', 'Santa Cruz Michapa', 'Suchitoto',
    'Tenancingo',
  ],
  la_paz: [
    'Cuyultitán', 'El Rosario', 'Jerusalén', 'Mercedes La Ceiba', 'Olocuilta',
    'Paraíso de Osorio', 'San Antonio Masahuat', 'San Emigdio',
    'San Francisco Chinameca', 'San Juan Nonualco', 'San Juan Talpa',
    'San Juan Tepezontes', 'San Luis La Herradura', 'San Luis Talpa',
    'San Miguel Tepezontes', 'San Pedro Masahuat', 'San Pedro Nonualco',
    'San Rafael Obrajuelo', 'Santa María Ostuma', 'Santiago Nonualco',
    'Tapalhuaca', 'Zacatecoluca',
  ],
  cabanas: [
    'Cinquera', 'Dolores', 'Guacotecti', 'Ilobasco', 'Jutiapa', 'San Isidro',
    'Sensuntepeque', 'Tejutepeque', 'Victoria',
  ],
  san_vicente: [
    'Apastepeque', 'Guadalupe', 'San Cayetano Istepeque', 'San Esteban Catarina',
    'San Ildefonso', 'San Lorenzo', 'San Sebastián', 'San Vicente',
    'Santa Clara', 'Santo Domingo', 'Tecoluca', 'Tepetitán', 'Verapaz',
  ],
  usulutan: [
    'Alegría', 'Berlín', 'California', 'Concepción Batres', 'El Triunfo',
    'Ereguayquín', 'Estanzuelas', 'Jiquilisco', 'Jucuapa', 'Jucuarán',
    'Mercedes Umaña', 'Nueva Granada', 'Ozatlán', 'Puerto El Triunfo',
    'San Agustín', 'San Buenaventura', 'San Dionisio', 'San Francisco Javier',
    'Santa Elena', 'Santa María', 'Santiago de María', 'Tecapán', 'Usulután',
  ],
  san_miguel: [
    'Carolina', 'Chapeltique', 'Chinameca', 'Chirilagua', 'Ciudad Barrios',
    'Comacarán', 'El Tránsito', 'Lolotique', 'Moncagua', 'Nueva Guadalupe',
    'Nuevo Edén de San Juan', 'Quelepa', 'San Antonio', 'San Gerardo',
    'San Jorge', 'San Luis de la Reina', 'San Miguel', 'San Rafael Oriente',
    'Sesori', 'Uluazapa',
  ],
  morazan: [
    'Arambala', 'Cacaopera', 'Chilanga', 'Corinto', 'Delicias de Concepción',
    'El Divisadero', 'El Rosario', 'Gualococti', 'Guatajiagua', 'Joateca',
    'Jocoaitique', 'Jocoro', 'Lolotiquillo', 'Meanguera', 'Osicala', 'Perquín',
    'San Carlos', 'San Fernando', 'San Francisco Gotera', 'San Isidro',
    'San Simón', 'Sensembra', 'Sociedad', 'Torola', 'Yamabal', 'Yoloaiquín',
  ],
  la_union: [
    'Anamorós', 'Bolívar', 'Concepción de Oriente', 'Conchagua', 'El Carmen',
    'El Sauce', 'Intipucá', 'La Unión', 'Lislique', 'Meanguera del Golfo',
    'Nueva Esparta', 'Pasaquina', 'Polorós', 'San Alejo', 'San José',
    'Santa Rosa de Lima', 'Yayantique', 'Yucuaiquín',
  ],
})

/** Nombre → fragmento de código: sin acentos, minúsculas y con guiones bajos. */
function slug(nombre) {
  return nombre
    .normalize('NFD')
    .replace(new RegExp('[\u0300-\u036f]', 'g'), '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

/** Código estable de un distrito: `departamento-nombre_sin_acentos`. */
export function districtCode(departamento, nombre) {
  return `${departamento}-${slug(nombre)}`
}

/**
 * Distritos de un departamento, listos para el selector.
 * @returns {Array<{ code: string, label: string }>}
 */
export function distritosDe(departamento) {
  const nombres = DISTRITOS_POR_DEPARTAMENTO[departamento]
  if (!nombres) return []
  return nombres.map((label) => ({ code: districtCode(departamento, label), label }))
}

const DISTRITO_CODES = new Set(
  Object.entries(DISTRITOS_POR_DEPARTAMENTO).flatMap(([depto, nombres]) =>
    nombres.map((n) => districtCode(depto, n)),
  ),
)

/** Verdadero si el distrito existe y pertenece a ese departamento. */
export function isDistritoValido(departamento, code) {
  if (!DISTRITO_CODES.has(code)) return false
  return code.startsWith(`${departamento}-`)
}

/** Etiqueta legible de un distrito guardado. */
export function distritoLabel(code) {
  if (!code) return null
  const departamento = code.slice(0, code.indexOf('-'))
  return distritosDe(departamento).find((d) => d.code === code)?.label ?? null
}

const RESIDENCIA_CODES = new Set(RESIDENCIAS.map((r) => r.code))

/** Verdadero si el código corresponde a una opción publicada. */
export function isResidenciaValida(code) {
  return RESIDENCIA_CODES.has(code)
}

/** Etiqueta legible de un código guardado (para el perfil, no para el análisis). */
export function residenciaLabel(code) {
  return RESIDENCIAS.find((r) => r.code === code)?.label ?? null
}

/**
 * Países, para la diáspora. Se guarda el código ISO 3166-1 alfa-2 ('US',
 * 'ES', 'MX') y el nombre lo pone el navegador con Intl.DisplayNames en
 * español. Así no hay 200 nombres escritos a mano que revisar ni traducir, y
 * el valor almacenado es un estándar que R y cualquier otra herramienta ya
 * saben leer.
 *
 * El Salvador no está: quien vive aquí elige departamento y distrito.
 */
const CODIGOS_PAIS = Object.freeze([
  'AD', 'AE', 'AF', 'AG', 'AL', 'AM', 'AO', 'AR', 'AT', 'AU', 'AZ',
  'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BN', 'BO', 'BR', 'BS', 'BT', 'BW', 'BY', 'BZ',
  'CA', 'CD', 'CF', 'CG', 'CH', 'CI', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CY', 'CZ',
  'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ',
  'EC', 'EE', 'EG', 'ER', 'ES', 'ET',
  'FI', 'FJ', 'FM', 'FR',
  'GA', 'GB', 'GD', 'GE', 'GH', 'GM', 'GN', 'GQ', 'GR', 'GT', 'GW', 'GY',
  'HN', 'HR', 'HT', 'HU',
  'ID', 'IE', 'IL', 'IN', 'IQ', 'IR', 'IS', 'IT',
  'JM', 'JO', 'JP',
  'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KZ',
  'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY',
  'MA', 'MC', 'MD', 'ME', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MR', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ',
  'NA', 'NE', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NZ',
  'OM',
  'PA', 'PE', 'PG', 'PH', 'PK', 'PL', 'PR', 'PT', 'PW', 'PY',
  'QA',
  'RO', 'RS', 'RU', 'RW',
  'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SI', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SY', 'SZ',
  'TD', 'TG', 'TH', 'TJ', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ',
  'UA', 'UG', 'US', 'UY', 'UZ',
  'VA', 'VC', 'VE', 'VN', 'VU',
  'WS',
  'YE',
  'ZA', 'ZM', 'ZW',
])

const PAIS_CODES = new Set(CODIGOS_PAIS)

/** Nombre del país en español; si el entorno no trae Intl, cae al código. */
export function paisLabel(code) {
  if (!code) return null
  try {
    const nombres = new Intl.DisplayNames(['es'], { type: 'region' })
    return nombres.of(code) ?? code
  } catch {
    return code
  }
}

/**
 * Países ordenados alfabéticamente en español. Se calcula una vez: son ~190
 * entradas y el orden depende de la configuración regional del navegador.
 */
let paisesCache = null
export function paises() {
  if (paisesCache) return paisesCache
  paisesCache = CODIGOS_PAIS
    .map((code) => ({ code, label: paisLabel(code) }))
    .sort((a, b) => a.label.localeCompare(b.label, 'es'))
  return paisesCache
}

/** Verdadero si el código de país es uno de los publicados. */
export function isPaisValido(code) {
  return PAIS_CODES.has(code)
}

/**
 * Rango de edad aceptado.
 *
 * El mínimo subió de 5 a 10 el 17-ago-2026, al abrir la app al público
 * general. Con el consentimiento informado del estudio, pedirle nombre, edad y
 * distrito a un niño de 5 años estaba cubierto; abierto a cualquiera, no. Diez
 * es el piso donde la persona ya llena el formulario por su cuenta y entiende
 * la cláusula que lo acompaña (ver src/data/privacidad.js).
 *
 * El máximo evita erratas tipo 199.
 */
export const EDAD_MIN = 10
export const EDAD_MAX = 99

/** Verdadero si la edad es un entero dentro del rango aceptado. */
export function isEdadValida(edad) {
  return Number.isInteger(edad) && edad >= EDAD_MIN && edad <= EDAD_MAX
}

/** Largo mínimo del nombre. Un solo carácter casi siempre es un dedazo. */
export const NOMBRE_MIN = 2
export const NOMBRE_MAX = 40

/**
 * Verdadero si al participante le falta algún dato del registro.
 *
 * Cubre dos casos que llegan al mismo lugar: quien venía usando la app desde
 * antes de que existiera esta pantalla, y quien eligió "Prefiero no decirlo".
 * A ambos se les ofrece darlos después desde Perfil.
 */
export function faltanDatosDeRegistro({
  participantName, participantAge, participantResidence,
  participantDistrict, participantCountry,
} = {}) {
  if (!participantName || participantAge == null || !participantResidence) return true
  // El lugar quedó a medias: departamento sin distrito, o "fuera del país" sin
  // país. Le pasa a quien se registró antes de que existieran estos campos.
  if (participantResidence === RESIDENCIA_EXTERIOR) return !participantCountry
  return !participantDistrict
}
