/**
 * funciones.js
 *
 * Interruptores de funciones que se apagaron sin borrar su código.
 *
 * Minimización de datos (nov-2026): la tesis que motivó el registro terminó,
 * así que la app dejó de pedir nombre, edad y lugar, y esos datos se borraron
 * de Supabase. Con el registro apagado:
 *   - no se muestra el formulario de entrada ni el de Perfil;
 *   - lo que quedaba guardado en el dispositivo se borra al abrir la app
 *     (ver onRehydrateStorage en useGameStore) para que no vuelva a subirse;
 *   - ni `participants` ni `user_profiles` reciben esos campos.
 *
 * La tabla de clasificación mostraba el nombre de pila. Sin nombres queda
 * vacía, así que se oculta hasta que tenga alias (ver Leaderboard.jsx).
 */

/** Formulario de registro (nombre, edad, departamento/distrito/país). */
export const REGISTRO_ACTIVO = false

/** Tabla de clasificación en Logros y su interruptor en Perfil. */
export const CLASIFICACION_VISIBLE = false
