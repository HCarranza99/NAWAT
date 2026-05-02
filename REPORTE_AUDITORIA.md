# 🔍 Reporte de Auditoría — Sistema Náhuat

**Auditor:** Senior QA Engineer / DevSecOps / Clean Code Expert
**Fecha:** 1 de mayo de 2026
**Alcance:** Revisión exhaustiva del código fuente del proyecto Sistema Náhuat (aplicación React/Vite con backend Supabase para estudio académico de aprendizaje de náhuat).

---

# Parte 1 — Auditoría inicial

He revisado los archivos núcleo del proyecto (configuración, autenticación, store, screens, componentes de ejercicios, hooks y servicios). A continuación el reporte estructurado por archivo:

---

## 📄 Archivo Analizado: `.env.local`

### 🛑 Errores Críticos / Seguridad (Severity: HIGH)

- **Línea(s):** 4-5
- **Problema:** El archivo `.env.local` con la `VITE_SUPABASE_URL` y la `VITE_SUPABASE_ANON_KEY` está dentro del workspace en disco. Aunque la `anon key` es por diseño pública (Supabase la incrusta en el bundle del frontend), **el riesgo real es que este archivo no esté en `.gitignore`**: la `anon key` por sí sola no es secreta, pero si por accidente se commitea junto a una `service_role key` (o se confunden roles), se entregaría acceso total a la base de datos.
- **Impacto:** Si las políticas RLS (Row Level Security) en Supabase no están configuradas correctamente, la `anon key` permite leer/escribir sobre las tablas `participants`, `sessions`, `lesson_attempts`, `exercise_responses`, `consent_records`, `questionnaire_responses` e `intervention_timeline` desde cualquier cliente HTTP. Un atacante podría inyectar respuestas falsas, borrar consentimientos o exfiltrar datos del estudio.
- **Solución:**
  1. Verifica que `.env.local` esté en `.gitignore` (la convención de Vite ya lo hace, pero confírmalo).
  2. **MUY IMPORTANTE:** Activa Row Level Security en TODAS las tablas y crea políticas estrictas. Por ejemplo:
     ```sql
     ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
     CREATE POLICY "insert_only_with_anon" ON participants FOR INSERT TO anon WITH CHECK (true);
     CREATE POLICY "select_own" ON participants FOR SELECT USING (auth.uid() = id OR auth.role() = 'service_role');
     ```
  3. Para `user_profiles`, exige que `id = auth.uid()` en políticas de UPDATE/SELECT — de lo contrario un usuario autenticado podría sobrescribir el progreso de otro (IDOR — ver `auth.js`).

---

## 📄 Archivo Analizado: `src/lib/supabase.js`

### ⚠️ Advertencias / Bugs Lógicos (Severity: MEDIUM)

- **Línea(s):** 8
- **Problema:** Cuando `VITE_SUPABASE_URL` o `VITE_SUPABASE_ANON_KEY` faltan, se hace `createClient('', '')`. Esto crea un cliente que dispara errores en runtime (`Invalid URL`) en vez de fallar limpiamente o con un mensaje claro al desarrollador.
- **Solución:**
  ```js
  if (!supabaseUrl || !supabaseKey) {
    console.warn('[supabase] Variables de entorno ausentes. La app funcionará en modo offline.')
  }
  export const supabase = supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, { auth: { persistSession: true, autoRefreshToken: true } })
    : null
  ```
  Y en cada servicio: `if (!supabase) return null`.

### 💡 Mejoras de Rendimiento y Clean Code (Severity: LOW)

- **Línea(s):** 1-8
- **Sugerencia:** No se está pasando configuración explícita al cliente (`storageKey`, `flowType: 'pkce'`). Para estudios académicos donde la sesión OAuth puede colisionar con otras apps en el mismo origen, conviene definir `auth: { storageKey: 'sistema-nahuat-auth' }`.

---

## 📄 Archivo Analizado: `src/services/auth.js`

### 🛑 Errores Críticos / Seguridad (Severity: HIGH)

- **Línea(s):** 153-162 (`saveProgressToCloud`)
- **Problema:** **IDOR potencial.** La función `saveProgressToCloud(userId, gameState)` recibe `userId` como parámetro y hace `upsert` con ese `id`. Esto delega al cliente la decisión de qué fila modificar. Si un atacante autenticado interceptara una llamada a `saveProgressToCloud(otherUserId, …)` (o si las RLS de Supabase no filtran por `auth.uid()`), podría sobrescribir el perfil de cualquier otro usuario.
- **Impacto:** Robo / sabotaje de progreso, falseamiento de respuestas en el estudio académico.
- **Solución:**
  1. En Supabase, política RLS en `user_profiles`:
     ```sql
     CREATE POLICY "users_only_own_row" ON user_profiles
     FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
     ```
  2. En el cliente, dejar de pasar `userId` y leerlo de la sesión actual:
     ```js
     export async function saveProgressToCloud(gameState) {
       const { data: { user } } = await supabase.auth.getUser()
       if (!user) return
       await supabase.from('user_profiles')
         .upsert(gameStateToProfile(user.id, gameState), { onConflict: 'id' })
     }
     ```

- **Línea(s):** 22, 48, 62, 76, 88 (todos los `catch {}` mudos)
- **Problema:** **Logs y telemetría de errores ausentes.** Toda la capa de Auth y Analytics tiene `catch { /* silencioso */ }`. Esto enmascara fallos de red, errores 4xx/5xx, problemas de cuotas o rate-limiting. En producción, jamás sabrás si Supabase está caído o si un usuario está siendo rechazado por RLS.
- **Impacto:** Pérdida silenciosa de datos del estudio (¡invalidaría análisis estadísticos!), imposibilidad de debugging post-mortem.
- **Solución:** Centraliza en un helper:
  ```js
  function logError(scope, err) {
    if (import.meta.env.DEV) console.error(`[${scope}]`, err)
    // En prod: enviar a Sentry/PostHog/etc.
  }
  ```
  Y reemplaza `catch { }` por `catch (e) { logError('saveProgressToCloud', e) }`.

### ⚠️ Advertencias / Bugs Lógicos (Severity: MEDIUM)

- **Línea(s):** 17-25 (`signInWithEmail`)
- **Problema:** No se valida formato de email ni longitud mínima de password en cliente. Aunque Supabase rechaza, regresa errores genéricos en inglés.
- **Solución:** Añade validación previa con regex y `password.length >= 6`.

- **Línea(s):** 99-103 (`onAuthStateChange`)
- **Problema:** No se distingue entre eventos `SIGNED_IN`, `TOKEN_REFRESHED`, `USER_UPDATED`. Cada refresh de token (~1h) dispara el callback completo, incluyendo la lógica de `loadProgressFromCloud` + `saveProgressToCloud` que se ejecuta en `useAuth.js`. Esto provoca **escrituras duplicadas a la base de datos cada hora**.
- **Solución:**
  ```js
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
      callback(session?.user ?? null)
    }
  })
  ```

### 💡 Mejoras de Rendimiento y Clean Code (Severity: LOW)

- **Línea(s):** 110-145
- **Sugerencia:** Las funciones `gameStateToProfile` y `profileToGameState` están duplicadas conceptualmente. Considera un solo schema con `zod` (ya está como dep) que valide y transforme bidireccionalmente.

---

## 📄 Archivo Analizado: `src/hooks/useAuth.js`

### 🛑 Errores Críticos / Seguridad (Severity: HIGH)

- **Línea(s):** 32-34
- **Problema:** **Antipatrón grave de React.** `storeRef.current = useGameStore.getState()` se ejecuta en un `useEffect` SIN array de dependencias, así que corre en cada render. Esto contradice el comentario del código (que dice que es para evitar re-renders) y además puede dejar `storeRef.current` desincronizado si la suscripción a Supabase dispara antes del primer render. **El `useGameStore.getState()` ya es un acceso directo síncrono — no necesita ref.**
- **Impacto:** Race condition en login: el callback `onAuthStateChange` puede leer un `storeRef.current` undefined o stale, perdiendo XP/progreso al fusionar con la nube.
- **Solución:** Elimina el ref y llama `useGameStore.getState()` directamente dentro del callback async:
  ```js
  const cloudProgress = await loadProgressFromCloud(authUser.id)
  const localState = useGameStore.getState() // siempre actualizado
  const localXP = localState.xp ?? 0
  ```

- **Línea(s):** 36-84 (todo el `useEffect`)
- **Problema:** **Race condition de unmount.** Si el componente se desmonta entre `loadProgressFromCloud` (await) y `mergeCloudProgress`, se mutará un store cuya app está cerrándose, y peor: pueden llegar dos respuestas async distintas y ganar la lenta. No hay flag `cancelled`.
- **Solución:**
  ```js
  let cancelled = false
  const unsubscribe = onAuthStateChange(async (authUser) => {
    if (cancelled) return
    // ...
  })
  return () => { cancelled = true; unsubscribe() }
  ```

### ⚠️ Advertencias / Bugs Lógicos (Severity: MEDIUM)

- **Línea(s):** 55-65
- **Problema:** Lógica de `studyPhaseAfterMerge` confusa. Si la nube tiene MENOS XP pero `posttestCompletedAt` no es null, igual se llama a `goFree()`. El comentario dice "si el postest ya estaba completado en la nube **(o localmente)**", pero la condición evalúa ambas con OR y el valor local que se lee viene de `storeRef.current` que pudo ser sobrescrito por `mergeCloudProgress` justo antes.
- **Solución:** Lee el estado UNA sola vez al principio y razona sobre snapshots inmutables:
  ```js
  const snapshotBeforeMerge = useGameStore.getState()
  mergeCloudProgress(cloudProgress)
  const snapshotAfterMerge = useGameStore.getState()
  if (snapshotAfterMerge.posttestCompletedAt) goFree()
  ```

---

## 📄 Archivo Analizado: `src/store/useGameStore.js`

### 🛑 Errores Críticos / Seguridad (Severity: HIGH)

- **Línea(s):** 4-214 + persistencia con `name: 'nahuat-game-v1'`
- **Problema:** **El store entero se persiste en `localStorage` sin firma ni validación.** Un usuario malicioso puede abrir DevTools, modificar `xp: 999999`, `streak: 365`, `studyPhase: 'free'`, `posttestCompletedAt: '2099…'` y la app lo aceptará tal cual al recargar — y luego `saveProgressToCloud` lo subirá a Supabase como verdad.
- **Impacto:** **Invalidación científica del estudio académico**. Los datos subidos a `user_profiles` y a `intervention_timeline` son alterables; el merge con la nube depende de XP, así que basta con setear XP local altísimo para sobrescribir el estado real del participante en la nube.
- **Solución (defensa en profundidad):**
  1. Mover los **timestamps críticos** (`pretestCompletedAt`, `posttestCompletedAt`, `consentAcceptedAt`) a tablas server-side autoritativas (`intervention_timeline`) y **no confiar en el valor local** para gates de fase.
  2. Validar al rehidratar con `zod`:
     ```js
     persist(..., {
       name: 'nahuat-game-v1',
       version: 1,
       migrate: (state) => GameStateSchema.parse(state), // descarta valores fuera de rango
       onRehydrateStorage: () => (state, err) => { if (err) state.resetProgress() }
     })
     ```
  3. En el servidor, ignorar `xp` enviado por cliente y recalcularlo a partir de `lesson_attempts.xp_earned`.

### ⚠️ Advertencias / Bugs Lógicos (Severity: MEDIUM)

- **Línea(s):** 59-81 (`mergeCloudProgress`)
- **Problema:** Estrategia "gana el de más XP" ignora casos de empate y sobrescribe `studyPhase`. Si el local tiene XP igual al de la nube pero local está en `'pretest'` y la nube en `'free'`, se queda en `'pretest'` (return `{}`), lo que es aceptable, pero el inverso con XP=0 (cuenta nueva en nuevo dispositivo) trae `studyPhase: 'consent'` desde la nube y borra el progreso del consentimiento aceptado en este dispositivo.
- **Solución:** Hacer merge campo por campo con regla específica por campo (XP toma máximo, fase toma la "más avanzada", timestamps toman el más antiguo).

- **Línea(s):** 119-139 (`recordPlay`)
- **Problema:** **Bug de zona horaria.** Calcula "ayer" con `setDate(today.getDate() - 1)` después de `lastPlayedDate` formateado en local. En un cambio de horario de verano (DST) o cerca de medianoche cruzando UTC, puede romper la racha aunque el usuario sí jugó ayer.
- **Solución:** Usar fechas en UTC consistentemente, o mejor, calcular días con `Math.floor(Date.now() / 86400000)` y comparar enteros.

### 💡 Mejoras de Rendimiento y Clean Code (Severity: LOW)

- **Línea(s):** 142-153 vs 156-173 vs 175-191
- **Sugerencia:** **Violación DRY.** Las acciones `completeLesson`, `completeSectionLesson` y `completeSectionBoss` duplican el cálculo de estrellas (`score >= 0.9 ? 3 : score >= 0.7 ? 2 : ...`). Extrae a helper:
  ```js
  const computeStars = (s) => s >= 0.9 ? 3 : s >= 0.7 ? 2 : s >= 0.5 ? 1 : 0
  ```

- **Línea(s):** 27 (`studyPhase: 'consent'`)
- **Sugerencia:** Las fases del estudio son strings mágicos repartidos por toda la app. Define un enum/objeto:
  ```js
  export const PHASES = Object.freeze({ CONSENT: 'consent', ABOUT: 'about', /*…*/ })
  ```

---

## 📄 Archivo Analizado: `src/App.jsx`

### ⚠️ Advertencias / Bugs Lógicos (Severity: MEDIUM)

- **Línea(s):** 79 (`// eslint-disable-line react-hooks/exhaustive-deps`)
- **Problema:** Se desactiva la regla de exhaustive-deps. Si `setSessionId` cambia (no debería, pero zustand no lo garantiza), el efecto no se re-ejecuta.
- **Solución:** En lugar de silenciar la regla, lee `setSessionId` con `useGameStore.getState().setSessionId` dentro del efecto, o agrégalo a deps (es estable).

- **Línea(s):** 100-104
- **Problema:** **Llamada de side-effect dentro del cuerpo del efecto sin guardas.** `saveProgressToCloud(authUserId, state)` se dispara cada vez que `studyPhase` cambia, **incluso durante la rehidratación inicial**, lo que puede sobrescribir la nube con un estado parcial antes de que termine `loadProgressFromCloud` en `useAuth`.
- **Solución:** Esperar a que `useAuth.isLoading` sea `false` antes de hacer auto-save:
  ```js
  useEffect(() => {
    if (!authUserId || authLoading) return
    saveProgressToCloud(authUserId, useGameStore.getState())
  }, [authUserId, studyPhase, authLoading])
  ```

- **Línea(s):** 56-77
- **Problema:** `closeSession` puede llamarse 3 veces (`beforeunload` + `visibilitychange` + `pagehide` + cleanup). Aunque `endSession` tiene un `Set` de dedup, la llamada en el cleanup del `useEffect` (línea 77) corre cuando cambia `participantId`, lo que puede cerrar prematuramente la sesión.
- **Solución:** Eliminar `closeSession()` del cleanup y dejar que solo los listeners de unload disparen el cierre.

### 💡 Mejoras de Rendimiento y Clean Code (Severity: LOW)

- **Línea(s):** 83-95
- **Sugerencia:** El `setInterval(check, 1000)` para detectar el corte de 15 minutos es innecesariamente caro. Un `setTimeout` calculado al `INTERVENTION_MS - elapsed` es suficiente:
  ```js
  const remaining = INTERVENTION_MS - (Date.now() - start)
  const id = setTimeout(triggerPosttest, Math.max(0, remaining))
  ```

---

## 📄 Archivo Analizado: `src/services/analytics.js`

### 🛑 Errores Críticos / Seguridad (Severity: HIGH)

- **Línea(s):** 181-187 (`hashText`)
- **Problema:** **Algoritmo de hash inseguro.** `hashText` es un hash de 32-bit estilo Java `String.hashCode()`. **No es criptográfico.** Las colisiones son triviales y el comentario lo admite. Para auditoría legal de consentimiento informado en un estudio académico esto es insuficiente.
- **Impacto:** Imposibilidad de demostrar a un comité de ética que el participante aceptó esta versión exacta del texto. Cualquier modificación al `CONSENT_TEXT` que produzca el mismo hash invalidaría la cadena de auditoría.
- **Solución:** Usar `SubtleCrypto` (nativo del navegador, sin deps):
  ```js
  async function hashText(text) {
    const buf = new TextEncoder().encode(text)
    const digest = await crypto.subtle.digest('SHA-256', buf)
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0')).join('')
  }
  ```
  (Requiere convertir `saveConsent` a `await hashText(consentText)`).

- **Línea(s):** 17-31 (`createParticipant`) y 38-51 (`startSession`)
- **Problema:** Estos endpoints permiten **inserción anónima** desde cualquier visitante. Un script puede crear millones de participantes ficticios y reventar las cuotas de Supabase, falsear el N del estudio o generar costes.
- **Impacto:** Denegación de servicio económica + corrupción del dataset.
- **Solución:**
  1. Activar rate limiting en Supabase (Cloudflare Turnstile o hCaptcha en el formulario de consentimiento).
  2. RLS más estricta: insertar en `participants` solo si llega un `x-app-token` validado por Edge Function.

### ⚠️ Advertencias / Bugs Lógicos (Severity: MEDIUM)

- **Línea(s):** 59-64 (`endedSessions`)
- **Problema:** El `Set` `endedSessions` vive en módulo y nunca se purga. En SPA con sesiones largas (estudios de varias semanas) crece sin tope (memory leak menor).
- **Solución:** Usar un `Set` con TTL o limitar tamaño con LRU.

- **Línea(s):** 86-105 (`startLessonAttempt`)
- **Problema:** Si Supabase falla y retorna `null`, el resto de `logExerciseResponse` se ejecuta con `lesson_attempt_id = null`. La fila se inserta huérfana sin clave foránea, corrompiendo la integridad referencial del análisis.
- **Solución:** Si `attemptId` es null, no registrar respuestas individuales (o bufferear y reintentar).

### 💡 Mejoras de Rendimiento y Clean Code (Severity: LOW)

- **Línea(s):** 148-173
- **Sugerencia:** Cada `logExerciseResponse` es un round-trip a Supabase. En lecciones de 20 ejercicios son 20 llamadas. Usar batching: acumular respuestas y `insert([…])` al cerrar la lección, o usar Supabase Realtime channel para un endpoint único.

---

## 📄 Archivo Analizado: `src/components/exercises/Matching.jsx`

### ⚠️ Advertencias / Bugs Lógicos (Severity: MEDIUM)

- **Línea(s):** 17-33
- **Problema:** El `useEffect` que comprueba pares depende de `[selNahuat, selSpanish]` pero NO incluye `item.pairs` ni `setMatched`. ESLint con `react-hooks/exhaustive-deps` lo marcaría. Si por alguna razón `item.pairs` cambia (re-renders por padre con nueva ref), el match podría usarse contra una lista desactualizada.
- **Solución:** Añadir las deps faltantes o memoizar `item.pairs` con `useMemo`.

- **Línea(s):** 36-40
- **Problema:** `setTimeout(onComplete, 500)` no se limpia si el componente se desmonta. React lanzará warning "Can't perform a state update on an unmounted component" y `onComplete` puede ejecutarse en un componente padre ya desmontado.
- **Solución:**
  ```js
  useEffect(() => {
    if (matched.length !== item.pairs.length) return
    const t = setTimeout(onComplete, 500)
    return () => clearTimeout(t)
  }, [matched, item.pairs.length, onComplete])
  ```

- **Línea(s):** 27-32
- **Problema:** Mismo problema con el `setTimeout` del wrong-flash: no se limpia, puede dispararse después del unmount.

### 💡 Mejoras de Rendimiento y Clean Code (Severity: LOW)

- **Línea(s):** 3-5 (`shuffle`)
- **Sugerencia:** `arr.sort(() => Math.random() - 0.5)` es **un shuffle sesgado** (no produce permutaciones uniformes). Usa Fisher-Yates:
  ```js
  function shuffle(arr) {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  ```
  Mismo problema en `BuildSentence.jsx` línea 3.

- **Línea(s):** 42-45
- **Sugerencia:** `isMatchedSpanish` hace `O(n²)` por cada render: por cada palabra en `matched` busca el par en `item.pairs`. Pre-computa un `Map` con `useMemo`:
  ```js
  const nahuatToSpanish = useMemo(
    () => Object.fromEntries(item.pairs.map((p) => [p.nahuat, p.spanish])),
    [item.pairs]
  )
  ```

---

## 📄 Archivo Analizado: `src/components/exercises/BuildSentence.jsx`

### ⚠️ Advertencias / Bugs Lógicos (Severity: MEDIUM)

- **Línea(s):** 53-64 (`verify`)
- **Problema:** Comparación case-sensitive y sensitive a espacios extra: `built === target`. Si el usuario crea la oración correcta pero el dataset tiene una mayúscula distinta, falla.
- **Solución:**
  ```js
  const norm = (s) => s.trim().toLowerCase().replace(/\s+/g, ' ')
  const correct = norm(built) === norm(target)
  ```

- **Línea(s):** 34-36
- **Problema:** El estado inicial `useState(() => shuffle(...))` está bien para evitar re-shuffle, pero si `item.word_bank` cambia (ej. al cambiar de ejercicio sin remount), el bank queda obsoleto. El `key` del padre fuerza remount, así que funciona, pero es frágil.

### 💡 Mejoras de Rendimiento y Clean Code (Severity: LOW)

- **Línea(s):** 7-31 (`BankToken`)
- **Sugerencia:** El componente interno re-renderiza por cada cambio de `bank`. `React.memo(BankToken)` ahorra renders.

---

## 📄 Archivo Analizado: `src/components/exercises/MultipleChoiceText.jsx`

### 💡 Mejoras de Rendimiento y Clean Code (Severity: LOW)

- **Línea(s):** 19-25 (`getOptionClass`)
- **Sugerencia:** Función creada en cada render. Memoizable con `useCallback` o moverla fuera del componente recibiendo `selected` como argumento.

**(Resto del archivo — impecable. La validación de "no permitir doble click" en línea 10 está bien hecha, sin race condition.)**

---

## 📄 Archivo Analizado: `src/components/exercises/Flashcard.jsx`

✅ **Archivo prácticamente impecable.** Buenas prácticas aplicadas:
- `e.stopPropagation()` en `SpeakButton` para no voltear la tarjeta al hablar.
- `aria-label` y `tabIndex={0}` para accesibilidad.

### 💡 Mejoras de Rendimiento y Clean Code (Severity: LOW)

- **Línea(s):** 31-34
- **Sugerencia:** El div con `role="button"` debería responder a `onKeyDown` (Enter/Space) para ser navegable por teclado. Hoy solo voltea con click/tap.
  ```jsx
  onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !flipped) setFlipped(true) }}
  ```

---

## 📄 Archivo Analizado: `src/components/ui/WordHint.jsx`

### ⚠️ Advertencias / Bugs Lógicos (Severity: MEDIUM)

- **Línea(s):** 18-24
- **Problema:** Falta `onKeyDown` para activar con teclado a pesar de `role="button"` (igual que Flashcard).

- **Línea(s):** 16
- **Problema:** El `<span>` exterior no es semánticamente un botón. Lectores de pantalla pueden ignorar el rol button en spans no focusables. Falta `tabIndex={0}`.

---

## 📄 Archivo Analizado: `src/screens/LessonScreen.jsx` y `SectionLessonScreen.jsx`

### 🛑 Errores Críticos / Seguridad (Severity: HIGH)

- **Línea(s):** `LessonScreen.jsx` 25 — `lessons.find((l) => l.id === parseInt(id))`
- **Problema:** **No hay validación del parámetro de ruta.** Si `id` viene como `"NaN"`, `parseInt` retorna `NaN`, `.find` retorna `undefined`, y se cae al `<Navigate to="/">`, OK. Pero si `id` es `"<script>alert(1)</script>"`, `parseInt` retorna `NaN` también — sin embargo, otros lugares (ej. `state.lessonId` en `ResultScreen`) usan estos valores sin sanitizar al construir paths con template strings. Aunque React escapa al renderizar, **al construir URLs (`navigate('/section/${sectionId}/lesson/${lessonId}')`)** un id con caracteres especiales puede romper el routing o abrir vectores de open-redirect.
- **Solución:** Validar con regex/zod al entrar:
  ```js
  const id = useParams().id
  const numericId = /^\d+$/.test(id) ? parseInt(id, 10) : null
  if (numericId === null) return <Navigate to="/" replace />
  ```

### ⚠️ Advertencias / Bugs Lógicos (Severity: MEDIUM)

- **Línea(s):** `LessonScreen.jsx` 39-40
- **Problema:** `if (!lesson) return <Navigate ...>` y `if (lives === 0) return ...` están **antes** de declarar todas las refs/estados, pero después de algunos hooks. Esto **no rompe las reglas de hooks** porque los hooks ya se llamaron, pero si en el futuro alguien añade un `useEffect` después de estos returns tempranos, se viola la regla.
- **Solución:** Estructura defensiva — hacer todos los hooks primero, luego los returns condicionales.

- **Línea(s):** `LessonScreen.jsx` 162-167 (`handleContinue`)
- **Problema:** Comprueba `if (lives === 0)` después de `setFeedback(null)`. La variable `lives` viene del store; entre el render y el click puede haber cambiado. Más importante: la lectura de `lives` en el closure puede ser stale.
- **Solución:** Leer al momento: `if (useGameStore.getState().lives === 0)`.

- **Línea(s):** `SectionLessonScreen.jsx` 174-178
- **Problema:** `setFailedItems((prev) => { if (prev.find(...)) return prev; return [...prev, current] })` — usa `prev.find` con comparación de objeto referencial via `it.id === current.id`. **Si `current.id` es `undefined`** (en datos legacy o boss items sin id), `find` siempre retorna el primero con id `undefined` → false negatives.

- **Línea(s):** `LessonScreen.jsx` 50, 192 (`current.type`)
- **Problema:** Si `current` es undefined (currentIndex fuera de rango por race), se cae con TypeError.

### 💡 Mejoras de Rendimiento y Clean Code (Severity: LOW)

- **LessonScreen y SectionLessonScreen comparten ~70% del código.** Violación severa de DRY. Extrae a un componente genérico `<LessonRunner items={...} onFinish={...} />`.

- `lessonProgress` (legacy) y `sectionProgress` coexisten en el store. Si las "legacy lesson routes" ya no se usan, elimínalas para reducir superficie de bugs.

---

## 📄 Archivo Analizado: `src/screens/ConsentScreen.jsx`

### ⚠️ Advertencias / Bugs Lógicos (Severity: MEDIUM)

- **Línea(s):** 38-41 (`catch`)
- **Problema:** Si `createParticipant` lanza, se setea `setError` pero `setLoading(false)` solo en el catch, **no en el path de éxito**. Si `acceptConsent()` lanza una excepción no async (improbable pero posible), `loading` queda en `true` para siempre.
- **Solución:** Usar `finally`:
  ```js
  try { ... } catch { setError(...) } finally { setLoading(false) }
  ```

- **Línea(s):** 17-21
- **Problema:** Validación cliente-only: `firstName.trim().length >= 2`. Sin validar caracteres permitidos. Un usuario puede meter `"<script>"` que luego se renderiza en `participantName` (saneado por React, pero queda feo en logs y en `state.participantName.split(' ')[0]` en HomeScreen).
- **Solución:** Regex `/^[A-Za-zÀ-ÿ' -]{2,50}$/` o `zod`.

### 💡 Mejoras de Rendimiento y Clean Code (Severity: LOW)

- **Línea(s):** 94-96
- **Sugerencia:** El renderizado de `CONSENT_TEXT.split('\n').map(...)` con `<br/>` y `<p>` mezclados es frágil. Considera renderizar Markdown con `react-markdown`.

---

## 📄 Archivo Analizado: `src/screens/HomeScreen.jsx`

### 💡 Mejoras de Rendimiento y Clean Code (Severity: LOW)

- **Línea(s):** 49-83 (`findNextLesson`)
- **Sugerencia:** Función con O(n·m) ejecutada en CADA render porque no está memoizada. Para 5 secciones × 5 lecciones = 25 iteraciones por render — aceptable hoy, pero envuelve en `useMemo` con `[sectionProgress]` como dep para escalar.

- **Línea(s):** 88-94
- **Sugerencia:** `sections.reduce(...).reduce(...)` recorrido completo, también memoizable.

- **Línea(s):** 200, 23
- **Sugerencia:** `participantName.split(' ')[0]` falla con nombres compuestos ("María José" → "María"). Mejor usar campo dedicado `participantFirstName` en el store.

---

## 📄 Archivo Analizado: `src/components/ErrorBoundary.jsx`

### ⚠️ Advertencias / Bugs Lógicos (Severity: MEDIUM)

- **Línea(s):** 1-31
- **Problema:** **Falta `componentDidCatch`** para reportar errores a un servicio (Sentry/PostHog). Hoy se traga el error sin trace.
- **Solución:**
  ```js
  componentDidCatch(error, info) {
    if (import.meta.env.DEV) console.error('[ErrorBoundary]', error, info)
    // sendToSentry(error, info)
  }
  ```

- **Línea(s):** 22-25
- **Problema:** El botón "Recargar app" hace `window.location.reload()` sin confirmar al usuario. Si el bug está en `mergeCloudProgress`, recargar lo dispara otra vez → loop infinito de reload.
- **Solución:** Botón secundario "Resetear progreso local" que hace `localStorage.clear()` antes del reload, como vía de escape.

---

## 📄 Archivo Analizado: `src/hooks/useLivesRecharge.js`

### ⚠️ Advertencias / Bugs Lógicos (Severity: MEDIUM)

- **Línea(s):** 14
- **Problema:** `useGameStore()` SIN selector. **Esto suscribe el componente al store completo**, causando re-renders en CADA cambio de store (XP, streak, sectionProgress, etc.) — no solo cuando cambian las 3 props que usa.
- **Solución:**
  ```js
  const lives = useGameStore((s) => s.lives)
  const livesLastLostAt = useGameStore((s) => s.livesLastLostAt)
  const resetLives = useGameStore((s) => s.resetLives)
  ```
  Mismo patrón se repite en `LessonScreen` línea 27, `SectionLessonScreen` 27-30, `HomeScreen` 20, `ProfileScreen` 12-17, `SectionsScreen` 9, `ConsentScreen` 15. **Anti-patrón pervasivo en todo el proyecto.**

---

## 📄 Archivo Analizado: `src/hooks/useTextToSpeech.js`

### ⚠️ Advertencias / Bugs Lógicos (Severity: MEDIUM)

- **Línea(s):** 51-55
- **Problema:** El cleanup llama a `window.speechSynthesis.cancel()` que **cancela TODA la cola de speech del navegador**, no solo la de este hook. Si dos componentes usan el hook en paralelo, uno cancela al otro al desmontarse.
- **Solución:** Mantener referencia a la `utterance` específica y cancelar solo si está activa:
  ```js
  const utteranceRef = useRef(null)
  // en speak: utteranceRef.current = utterance
  // en cleanup: if (utteranceRef.current && isSpeaking) window.speechSynthesis.cancel()
  ```

### 💡 Mejoras de Rendimiento y Clean Code (Severity: LOW)

- **Línea(s):** 17-26 (`getSpanishVoice`)
- **Sugerencia:** Llamar 4 veces a `voices.find` recorre el array 4 veces. Un solo loop con prioridades:
  ```js
  const priorities = ['es-MX', 'es-US', 'es-ES']
  return voices.find(v => priorities.includes(v.lang)) || voices.find(v => v.lang.startsWith('es')) || null
  ```

---

## 📄 Archivo Analizado: `src/components/questionnaire/QuestionnaireRunner.jsx`

### 💡 Mejoras de Rendimiento y Clean Code (Severity: LOW)

✅ **Archivo bien estructurado.** Validación correcta con `isAnswerValid`, manejo limpio de timer con `useRef`, separación de presentación vs lógica.

- **Línea(s):** 21-41
- **Sugerencia:** `isAnswerValid` está fuera del componente (✅ bien), pero podría centralizarse aún más usando `zod` para validar cada `item_type`.

---

## 📄 Archivo Analizado: `src/components/questionnaire/ShortTextItem.jsx` y `LongTextItem.jsx`

### ⚠️ Advertencias / Bugs Lógicos (Severity: MEDIUM)

- **Problema:** Aunque hay `maxLength={200}` y `maxLength={2000}` en cliente, **el servidor (Supabase) no valida longitud**. Un atacante saltándose la UI puede enviar textos de 1MB a `value_text`. Si la columna es `text` sin restricción, se inflan facturas.
- **Solución:** En la migration de Supabase: `value_text varchar(2000)` o `CHECK (length(value_text) <= 2000)`.

---

## 📄 Archivo Analizado: `src/screens/ResultScreen.jsx`

### ⚠️ Advertencias / Bugs Lógicos (Severity: MEDIUM)

- **Línea(s):** 10-13
- **Problema:** `if (!state) { navigate('/'); return null }` — `navigate` durante render es un side-effect prohibido en React (causa warning). Debería ir en `useEffect` o usar `<Navigate to="/" replace />`.
- **Solución:**
  ```js
  if (!state) return <Navigate to="/" replace />
  ```

- **Línea(s):** 15
- **Problema:** Confía 100% en `useLocation().state`, que el usuario puede manipular vía History API en DevTools. Un participante podría reportar lecciones completadas con score artificial.
- **Impacto:** Mismo problema que el store local — falsificación de progreso.
- **Solución:** Validar el `state` con zod y, en backend, solo confiar en `lesson_attempts.score` que ya guardó el servidor antes de llegar a esta pantalla.

---

## 📄 Archivo Analizado: `src/lib/sounds.js`

✅ **Archivo limpio y eficiente.** Buen uso de Web Audio API sin archivos externos.

### 💡 Mejoras de Rendimiento y Clean Code (Severity: LOW)

- **Línea(s):** 4-7
- **Sugerencia:** `getCtx()` no maneja el caso de **`AudioContext` suspendido por autoplay policy** (Safari/iOS suspende hasta primer user gesture). Después del primer click ya está OK, pero conviene:
  ```js
  if (ctx.state === 'suspended') ctx.resume()
  ```

- **Línea(s):** 30, 39, 48
- **Sugerencia:** `catch (_) {}` silencioso. Al menos `if (import.meta.env.DEV) console.warn(...)`.

---

## 📊 Resumen Ejecutivo Parte 1

| Severidad | Cantidad | Áreas críticas |
|-----------|----------|----------------|
| 🛑 HIGH    | 7        | RLS Supabase, IDOR en `saveProgressToCloud`, store sin firma, hash de consentimiento débil, race en `useAuth`, validación de params en rutas, anti-DDoS |
| ⚠️ MEDIUM | 18       | Errores silenciosos, race conditions, fugas de timeout, validación de inputs, antipatrones de zustand |
| 💡 LOW    | ~20      | DRY, memoización, accesibilidad de teclado, shuffle sesgado, magic strings |

### Top 3 acciones inmediatas

1. **Activar RLS en TODAS las tablas de Supabase** y exigir `auth.uid() = id` en `user_profiles`. Sin esto, la base de datos completa es escribible por cualquier visitante.
2. **Reemplazar `hashText` por `crypto.subtle.digest('SHA-256', ...)`** en `analytics.js` para que el registro de consentimiento sea defendible legalmente.
3. **Normalizar todos los `useGameStore()` sin selector** a llamadas con selector específico — corrige re-renders innecesarios en TODA la app y mejora performance perceptible.

---

# Parte 2 — Auditoría de archivos restantes

---

## 📄 Archivo Analizado: `src/data/questionnaires.js`

### 🛑 Errores Críticos / Seguridad (Severity: HIGH)

- **Línea(s):** 289-290
- **Problema:** **¡VALOR DE DEBUG EN PRODUCCIÓN!** `INTERVENTION_MINUTES = 1`. El comentario en `App.jsx` línea 81-82 dice "cuando se cumplen los 15 min", el comentario en `useGameStore.js` línea 23 dice "uso libre de la app con temporizador de 15 min", y el test en `questionnaires.test.js` línea 137 declara que la duración real es 15. **Pero el código real dispara el postest después de 60 segundos.** Esto invalida científicamente todo el estudio: los participantes apenas tocan la app antes de ser empujados al cuestionario final.
- **Impacto:** Datos del estudio académico **completamente inválidos**. El N de la muestra del posttest no refleja una intervención real. Si el estudio ya se ejecutó con este valor, los resultados son inservibles para tesis/publicación.
- **Solución:**
  ```js
  export const INTERVENTION_MINUTES = 15
  export const INTERVENTION_MS = INTERVENTION_MINUTES * 60 * 1000
  ```
  Y URGENTE: revisar la base de datos de Supabase para identificar si hay sesiones de prueba o sesiones reales con esta duración acortada.

- **Línea(s):** `questionnaires.test.js` 137-139
- **Problema:** **El test que detecta exactamente este bug está deshabilitado con `.skip`**. El comentario incluso dice "Si este test falla, alguien dejó un valor de debug en el archivo". Está documentado que se conoce el riesgo y aun así se desactivó la salvaguarda.
- **Solución:** Quitar `.skip`:
  ```js
  it('intervention duration should be at least 10 minutes for a real study session', () => {
    expect(INTERVENTION_MINUTES).toBeGreaterThanOrEqual(10)
  })
  ```
  Y agregar al CI un job que falle el build si este test no pasa.

### ⚠️ Advertencias / Bugs Lógicos (Severity: MEDIUM)

- **Línea(s):** 18-27 (`CONSENT_TEXT`)
- **Problema:** El `CONSENT_TEXT` se hashea y se envía a Supabase como evidencia legal. Pero está definido con un template string que comienza/termina con `\n` y luego `.trim()`. Cualquier editor que añada/quite un espacio invisible al final cambiará el hash, **rompiendo la verificación de consentimientos previos al cambio** sin que los participantes hayan firmado realmente otra cosa. Combinado con el hash débil de `analytics.js`, la cadena de auditoría es frágil.
- **Solución:** Versionar el texto explícitamente (`CONSENT_VERSION`) y, en backend, mantener un registro inmutable de cada texto+hash. No depender solo del hash.

- **Línea(s):** 211-220 (SUS items)
- **Problema:** **Bug científico de scoring SUS.** Los ítems SUS tienen polaridad alternada `positive`/`negative`, y el test `questionnaires.test.js` línea 84-103 lo verifica. **PERO el código de la app jamás aplica la fórmula de SUS al guardar.** En `analytics.js` se persiste solo `valueNumeric` (1-5) sin invertir las preguntas negativas. El cálculo del score SUS final tendrá que hacerse en SQL/exportación; si esa lógica falla, los reportes de usabilidad estarán mal.
- **Solución:** O calcular SUS en cliente al cerrar el postest, o documentar muy claramente la fórmula en la vista SQL `v_dataset_wide` que ARCHITECTURE.md menciona.

### 💡 Mejoras de Rendimiento y Clean Code (Severity: LOW)

- **Línea(s):** 29-38 (helper `likert`)
- **Sugerencia:** El parámetro `phase` por defecto `'pretest'` produce items pretest; los del postest pasan `'posttest'` explícito. Es fácil olvidarlo y crear pretest items por accidente. Crea dos helpers separados: `likertPre()` y `likertPost()`.

---

## 📄 Archivo Analizado: `src/data/lessons.js` y `src/data/sections/section1.js` (legacy + actuales)

### ⚠️ Advertencias / Bugs Lógicos (Severity: MEDIUM)

- **Problema:** Coexisten dos sistemas: `lessons.js` (legacy con id numérico) y `sections/*` (sistema actual con id string). El store mantiene `lessonProgress` y `sectionProgress` en paralelo. Los tests cubren solo el sistema actual, así que `lessons.js` corre **sin red de seguridad**.
- **Solución:** Si la app redirige todas las rutas legacy o las rutas `/lesson/:id` ya no se llegan desde la UI (HomeScreen solo navega a `/section/...`), elimina `lessons.js` y `LessonScreen.jsx` para reducir 50% de superficie de bugs.

- **Línea(s):** `section1.js` 65 (`spanish_translation: "Contiene el sonido Kw"`)
- **Problema:** El campo `spanish_translation` se usa en `FeedbackModal` línea 25 para mostrar la respuesta correcta cuando el usuario falla. Aquí no es una traducción sino un meta-comentario. La UX se rompe ("Respuesta correcta: Contiene el sonido Kw" no es la respuesta esperada).
- **Solución:** Usar el campo `instruction` o crear un `correct_feedback` separado.

### 💡 Mejoras de Rendimiento y Clean Code (Severity: LOW)

- Los datos de lecciones son ~5 archivos × cientos de KB. Importarlos todos en `index.js` con `import` estático mete TODO en el bundle inicial. Para reducir bundle inicial:
  ```js
  // En SectionLessonScreen:
  const section = await import(`../data/sections/section${sectionId}.js`)
  ```

---

## 📄 Archivo Analizado: `src/data/gameConfig.js`

✅ **Archivo limpio.**

### 💡 Mejoras de Rendimiento y Clean Code (Severity: LOW)

- **Línea(s):** 5-36
- **Sugerencia:** El objeto está exportado mutable. Un módulo malicioso podría sobrescribir `GAME_CONFIG.lives.max = 99`. Usa `Object.freeze` recursivo (`structuredClone` + freeze) o exporta `as const` con TypeScript.

- **Línea(s):** 7-13
- **Sugerencia:** Algunos campos (`correctAnswer`, `perfectLesson`, `streakBonus`, `streakThreshold`) no se usan en el código revisado. Verifica con `grep` y elimina los muertos.

---

## 📄 Archivo Analizado: `eslint.config.js`

### 🛑 Errores Críticos / Seguridad (Severity: HIGH)

- **Línea(s):** 16-23
- **Problema:** **Faltan globales de Vitest.** Los archivos de test usan `vi`, `describe`, `it`, `expect`, `beforeEach`, `afterEach` directamente. La config solo carga `globals.browser` — al lintar tests se reportarán como `no-undef`. Peor: `setup.js` línea 4 usa `vi.fn()` sin importar — eso solo funciona si `globals: true` está en `vite.config.js` para vitest, pero ESLint nunca lo sabrá.
- **Impacto:** El linter da falsos positivos en tests (ruido) o, si `no-undef` es regla activa por `js.configs.recommended`, los tests **no pasarán el lint** y bloquearán CI.
- **Solución:** Agrega un override:
  ```js
  {
    files: ['**/*.test.{js,jsx}', '**/test/**/*.{js,jsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node, vi: 'readonly', describe: 'readonly', it: 'readonly', expect: 'readonly', beforeEach: 'readonly', afterEach: 'readonly' }
    }
  }
  ```
  O mejor: instala `eslint-plugin-vitest` y usa sus globals.

### ⚠️ Advertencias / Bugs Lógicos (Severity: MEDIUM)

- **Línea(s):** 17 (`ecmaVersion: 2020`) vs 20 (`ecmaVersion: 'latest'`)
- **Problema:** Hay **dos** `ecmaVersion` distintas en el mismo bloque. El primero está en `languageOptions.ecmaVersion`, el segundo en `parserOptions.ecmaVersion`. Es confuso y no determinista cuál gana según versión de ESLint.
- **Solución:** Consolidar en una sola: `ecmaVersion: 'latest'`.

### 💡 Mejoras de Rendimiento y Clean Code (Severity: LOW)

- **Línea(s):** 26
- **Sugerencia:** `varsIgnorePattern: '^[A-Z_]'` ignora variables que empiezan con mayúscula. Esto es laxo: tapa `import React from 'react'` no usado. Mejor `argsIgnorePattern: '^_'` para argumentos descartados.

- No hay regla `react-hooks/exhaustive-deps` declarada explícitamente. Aunque `reactHooks.configs.flat.recommended` la activa, sería más explícito declararla y elevarla a `error` (hoy es `warn`). Esto habría detectado los `// eslint-disable-line` repartidos por App.jsx, useAuth.js y Matching.jsx.

---

## 📄 Archivo Analizado: `src/components/ui/ProgressBar.jsx`

✅ **Archivo impecable.** Cumple con ARIA (`role="progressbar"`, `aria-valuenow/min/max`), clamp defensivo de valores, y es un puro componente presentacional sin estado.

---

## 📄 Archivo Analizado: `src/components/ui/LivesBar.jsx`

### 💡 Mejoras de Rendimiento y Clean Code (Severity: LOW)

- **Línea(s):** 6
- **Sugerencia:** Usar emojis literales `❤️` y `🩶` para representar estados es accesible para vista pero **mezcla semántica con presentación**. Lectores de pantalla pueden leer "corazón rojo" "corazón gris" en vez de "vida activa/perdida". Considera SVG con `<title>` o aria-hidden en los emojis y depende del `aria-label` global.
- **Línea(s):** 1
- **Sugerencia:** `max = 3` está hardcoded como default. Mejor importar `GAME_CONFIG.lives.max` para que cambien al tiempo.

---

## 📄 Archivo Analizado: `src/components/ui/Torogoz.jsx` y `TorogozBadge.jsx`

✅ **Archivos limpios.** SVG bien estructurado con `aria-hidden="true"` (correcto, pues es decorativo).

### 💡 Mejoras de Rendimiento y Clean Code (Severity: LOW)

- **`Torogoz.jsx`:** El SVG (~110 líneas inline) se duplica en bundle por cada uso. Considera definir el path como constante en módulo y usar `<symbol>` + `<use>` para reutilizar markup.
- **`TorogozBadge.jsx` línea 18:** `size * 1.4` es un magic number. Documenta por qué (cropping del viewBox) o haz una constante.

---

## 📄 Archivo Analizado: `src/components/questionnaire/LikertItem.jsx`

✅ **Excelente accesibilidad.** Usa `role="radiogroup"`, `role="radio"` con `aria-checked`, y `aria-label` descriptivo. Cumple WCAG.

### ⚠️ Advertencias / Bugs Lógicos (Severity: MEDIUM)

- **Línea(s):** 16-27
- **Problema:** Falta **navegación por teclado dentro del radiogroup**. El estándar WAI-ARIA exige que las flechas izquierda/derecha cambien de radio dentro del grupo, pero los `<button>` no implementan esto.
- **Solución:**
  ```jsx
  onKeyDown={(e) => {
    if (e.key === 'ArrowRight' && n < 5) onChange({ valueNumeric: n + 1, ... })
    if (e.key === 'ArrowLeft' && n > 1) onChange({ valueNumeric: n - 1, ... })
  }}
  ```

---

## 📄 Archivo Analizado: `src/components/questionnaire/SingleChoiceItem.jsx`

### ⚠️ Advertencias / Bugs Lógicos (Severity: MEDIUM)

- **Línea(s):** 14-20 (`handleSelect`)
- **Problema:** Cuando el usuario cambia de opción `allow_custom: true` a una opción regular, `valueOther` se borra (correcto). Pero cuando cambia de regular a `allow_custom`, `valueOther` se inicializa como `otherText` (`''`), lo que dispara la validación `valueOther.trim().length >= 2` en `QuestionnaireRunner`, así que el botón "Siguiente" queda deshabilitado sin feedback visual claro.
- **Solución:** Mostrar mensaje "Especifica tu opción para continuar" debajo del input cuando esté vacío.

- **Línea(s):** 30-55
- **Problema:** Falta `role="radiogroup"` y `role="radio"` con `aria-checked`. Se está usando `<button>` plano en lugar de un radio group, así que asistivas tech no anuncia "1 de 4".
- **Solución:** Análogo a `LikertItem`.

---

## 📄 Archivo Analizado: `src/screens/AboutScreen.jsx`

✅ **Archivo limpio y sencillo.**

### 💡 Mejoras de Rendimiento y Clean Code (Severity: LOW)

- **Línea(s):** 4-20
- **Sugerencia:** El array `SLIDES` es estático fuera del componente (✅ bien). Sin embargo, no hay forma de saltarse hacia atrás (no hay botón "Anterior"). Para un onboarding de 3 slides es aceptable.

- **Falta:** Indicador "1 / 3" textual además de los dots — los dots son visuales pero no descriptivos para screen readers.

---

## 📄 Archivo Analizado: `src/screens/PracticeScreen.jsx`

✅ **Archivo correcto** — útil para familiarizar al usuario con la escala Likert antes del pretest real.

### 💡 Mejoras de Rendimiento y Clean Code (Severity: LOW)

- **Línea(s):** 38
- **Sugerencia:** El `disabled={!answered}` es poco accesible. Un usuario con teclado/screen reader no sabe **por qué** está deshabilitado. Mejor habilitar y mostrar `<p>Selecciona una respuesta para continuar</p>` cuando no se ha respondido.

---

## 📄 Archivo Analizado: `src/test/setup.js`

### ⚠️ Advertencias / Bugs Lógicos (Severity: MEDIUM)

- **Línea(s):** 4-22
- **Problema:** El mock de `SpeechSynthesisUtterance` no implementa `onstart`, `onend`, `onerror` — son `null` por defecto. En `useTextToSpeech.js` línea 43-45, si `onstart` se asigna pero nunca dispara, `setIsSpeaking(true)` jamás se ejecuta en tests. Los tests que dependan de esa señal (no hay actuales, pero los habrá) fallarán silenciosamente.
- **Solución:** Mock más realista:
  ```js
  globalThis.SpeechSynthesisUtterance = vi.fn().mockImplementation((text) => {
    const utt = { text, lang: '', rate: 1, pitch: 1, volume: 1, onstart: null, onend: null, onerror: null }
    queueMicrotask(() => utt.onstart?.())
    return utt
  })
  ```

- **No mock de `crypto.randomUUID()`** — `analytics.js` lo usa como fallback. En jsdom moderno existe, pero versiones viejas de jsdom no. Para reproducibilidad, mock con valor determinista.

---

## 📄 Archivo Analizado: `src/test/store.test.js`

### ⚠️ Advertencias / Bugs Lógicos (Severity: MEDIUM)

- **Línea(s):** 11-21
- **Problema:** El `beforeEach` resetea SOLO algunos campos del store. **No resetea `participantId`, `participantName`, `studyPhase`, `consentAcceptedAt`, `pretestCompletedAt`, `posttestCompletedAt`, `currentSessionId`, `authUserId`, `isGuestMode`.** Si un test contamina alguno (ej. línea 132 setea `setParticipant('test-id', 'Test User')`), el siguiente test empieza con datos sucios.
- **Impacto:** Tests no aislados → test order dependency → bugs intermitentes en CI.
- **Solución:**
  ```js
  beforeEach(() => {
    useGameStore.setState(useGameStore.getInitialState ? useGameStore.getInitialState() : {/* objeto explícito completo */})
  })
  ```
  O mejor: usar `useGameStore.persist.clearStorage()` + recargar.

### 💡 Mejoras de Rendimiento y Clean Code (Severity: LOW)

- **Línea(s):** 100-101
- **Sugerencia:** `loseLife(); loseLife(); loseLife(); loseLife()` en una línea es difícil de leer. Mejor un `for` loop.

- **Línea(s):** Todo el archivo. **No hay test para `mergeCloudProgress`** en `store.test.js` — está en `storeStreak.test.js`. Confuso por nomenclatura. Renombra archivos por feature, no por mezclas.

---

## 📄 Archivo Analizado: `src/test/app.test.jsx`

### ⚠️ Advertencias / Bugs Lógicos (Severity: MEDIUM)

- **Línea(s):** 36-46 (mock de `questionnaires`)
- **Problema:** El mock fija `INTERVENTION_MS: 999999999`, lo que **enmascara el bug de los 60 segundos** en los tests E2E. Los tests jamás detectan que el postest se dispara antes de tiempo.
- **Solución:** Tener UN test que use el valor real de `INTERVENTION_MS` y avance el reloj con `vi.useFakeTimers()` para verificar el comportamiento exacto.

- **Línea(s):** 48 (`const { default: App } = await import('../App')`)
- **Problema:** Top-level `await` dentro de un test file es válido en ESM pero requiere que vitest esté configurado para ello. Frágil entre versiones.
- **Solución:** Usar `vi.doMock(...)` + `import.meta.glob` o factorizar el mock antes de un `import` síncrono.

- **Línea(s):** 22-26
- **Problema:** El mock de `onAuthStateChange` siempre retorna `null` user. Los tests **NO cubren el flujo de usuario autenticado**, que es justamente donde están las race conditions y los IDOR del reporte original.

### 💡 Mejoras de Rendimiento y Clean Code (Severity: LOW)

- Los tests usan selectores por classname (`document.querySelector('.bottom-nav')`) en lugar de por rol/label. Esto es frágil ante refactors de CSS. Prefiere `screen.getByRole('navigation')` + `getByRole('button', { name: /Inicio/ })`.

---

## 📄 Archivo Analizado: `src/test/sections.test.js`

✅ **Excelente test de integridad de datos.** Cubre IDs únicos, schemas, polaridad, etc.

### ⚠️ Advertencias / Bugs Lógicos (Severity: MEDIUM)

- **Línea(s):** 138-142 (`build_sentence` test)
- **Problema:** `expect(sorted1).toEqual(sorted2)` valida que `word_bank` y `correct_order` tengan los mismos elementos. **Pero no detecta duplicados**: si `correct_order = ['naha', 'naha', 'siwat']` y `word_bank = ['naha', 'naha', 'siwat']`, el test pasa. Sin embargo, en el componente `BuildSentence.jsx` cada token tiene `key: 'bank-${i}'` único, así que dos `naha` se distinguen por key — pero el `verify` compara strings con `.join(' ')`, así que `naha naha siwat` vs `naha siwat naha` se considera distinto. La validación está bien, pero el test no detecta otra clase de bugs (palabras vacías, espacios extra).
- **Solución:** Validar también que ningún elemento sea string vacío y que no haya whitespace inesperado.

- **Línea(s):** 28
- **Problema:** El test exige `expect(s).toHaveProperty('boss')`. Si en el futuro una sección **legítimamente** no tiene boss (sección extra, contenido bonus), este test bloquea el merge. Demasiado estricto.

---

## 📄 Archivo Analizado: `src/test/useLivesRecharge.test.js`

✅ **Tests sólidos.** Buen uso de `vi.useFakeTimers()` y `vi.setSystemTime()`.

### 💡 Mejoras de Rendimiento y Clean Code (Severity: LOW)

- **Línea(s):** 86
- **Sugerencia:** `expect(result.current.timeLeftStr).not.toBe(initial)` es un test débil — pasa con cualquier cambio. Mejor: `expect(result.current.timeLeftStr).toBe('29:00')` exactamente, para detectar bugs de off-by-one en el cálculo.

---

## 📄 Archivo Analizado: `src/test/storeStreak.test.js`

### ⚠️ Advertencias / Bugs Lógicos (Severity: MEDIUM)

- **Línea(s):** 74-79 (`uses local date — not UTC — at midnight boundary`)
- **Problema:** El test usa `new Date(2026, 3, 28, 23, 30, 0)` (local). En CI corriendo en UTC (la mayoría de runners de GitHub Actions están en UTC), `getFullYear() / getMonth() / getDate()` retorna las fechas tal cual el constructor — el test pasa. Pero si CI corre en otra zona, **el test podría dar falsos positivos**. La función `recordPlay` tiene el bug DST/UTC que mencioné en la parte 1, y este test no lo detecta.
- **Solución:** Forzar `process.env.TZ = 'UTC'` antes de cada test, y test específicos con zona `'America/El_Salvador'` (relevante para el público objetivo).

- **Línea(s):** 82-104 (`mergeCloudProgress`)
- **Problema:** El test pasa `xp: 200` cuando local tenía `xp: 50`, lo que pasa el gate. **Pero el test no incluye `lessonProgress: {}`** explícitamente — asume que si `mergeCloudProgress` recibe `cloud.lessonProgress = {}`, lo aplica. Mira el código del store línea 71: `lessonProgress: cloudState.lessonProgress ?? state.lessonProgress`. Si la nube envía `{}` (objeto vacío), el `??` no se dispara (`{}` no es null/undefined), y se sobrescribe el estado local con vacío. **Esto borra el progreso legacy.**
- **Solución:** Cambiar el operador `??` por una verificación explícita de "no vacío" o, mejor, no incluir `lessonProgress` en el merge si no hay datos.

---

## 📄 Archivo Analizado: `src/test/questionnaires.test.js`

### 🛑 Errores Críticos / Seguridad (Severity: HIGH)

- **Línea(s):** 137-139
- **Problema:** **Test crítico deshabilitado con `.skip`** — ya cubierto en el reporte de `questionnaires.js`. Lo repito aquí porque es un fallo del **proceso de QA**, no solo de los datos.
- **Solución:** Quitar `.skip` y agregar pre-commit hook (`husky` + `lint-staged`) que corra los tests antes de permitir commit.

### 💡 Mejoras de Rendimiento y Clean Code (Severity: LOW)

- **Línea(s):** 92-99
- **Sugerencia:** El test ordena `SUS` in-place con `.sort()` mutando el array. Si otro test posterior asume orden de declaración, se contaminan. Usar `[...SUS].sort(...)`.

---

## 📄 Archivo Analizado: `src/test/exercises.test.jsx`

✅ **Buena cobertura básica.** Renderiza componentes con props y verifica callbacks.

### ⚠️ Advertencias / Bugs Lógicos (Severity: MEDIUM)

- **Línea(s):** 200-215 (`Matching` complete)
- **Problema:** El test de matching completo asume que `Matching` shufflea las palabras pero al hacer `getByText(p.nahuat)` siempre encuentra el botón porque la palabra es la misma. **Pero no testea la mecánica de wrong-flash**: si el usuario hace click rápido en dos pares incorrectos consecutivos, ¿el `wrongFlash` se cancela bien? Hay un `setTimeout(750)` no cubierto.
- **Solución:** Agregar test:
  ```js
  it('clears wrong-flash after 750ms', () => {
    fireEvent.click(screen.getByText('kal'))
    fireEvent.click(screen.getByText('agua'))
    act(() => vi.advanceTimersByTime(800))
    expect(screen.getByText('kal').className).not.toContain('match-wrong')
  })
  ```

- **Falta cobertura:** `BuildSentence` con `hints` (BankToken hint bubble). El tooltip de WordHint nunca se prueba.
- **Falta cobertura:** Componentes que dependen de `useGameStore` directamente (HomeScreen, ProfileScreen, SectionsScreen).
- **Falta cobertura:** ErrorBoundary — no hay tests que verifiquen que captura errores y muestra fallback.
- **Falta cobertura:** TODO el flujo de **autenticación** (login, signup, OAuth, signOut, merge de progreso). Crítico dado los bugs HIGH del reporte original.

---

## 📊 Resumen Ejecutivo Consolidado (Parte 1 + Parte 2)

| Categoría | Hallazgos críticos |
|-----------|--------------------|
| 🛑 HIGH | RLS Supabase, IDOR en `saveProgressToCloud`, store sin firma, hash de consentimiento débil, race en `useAuth`, validación de params en rutas, anti-DDoS, **`INTERVENTION_MINUTES = 1`** (debug en producción), test de salvaguarda con `.skip`, `eslint.config.js` sin globals de Vitest |
| ⚠️ MEDIUM | Errores silenciosos, race conditions, fugas de timeout, validación de inputs, antipatrones de zustand, tests no aislados (store contaminado entre tests), mocks de auth que esconden bugs de auth, scoring SUS no calculado, accesibilidad de teclado en radiogroups, `mergeCloudProgress` borra progreso legacy con `{}` |
| 💡 LOW | DRY, memoización, accesibilidad de teclado, shuffle sesgado, magic strings, coexistencia de sistemas legacy + actuales, falta test de keyboard nav, magic numbers en Torogoz |

### 🚨 Top 5 acciones URGENTES (revisar HOY)

1. **`INTERVENTION_MINUTES`: cambiar 1 → 15** en `src/data/questionnaires.js` línea 289. Verificar en Supabase si hay datos de participantes reales con sesiones de 60 segundos: probablemente el dataset del estudio NAWAT está corrompido y se necesita re-correr el experimento.

2. **Quitar `.skip`** del test de duración mínima (`questionnaires.test.js` línea 137). Configurar CI para que el build falle si los tests no pasan (GitHub Actions con `npm test`).

3. **Activar RLS en TODAS las tablas de Supabase** y exigir `auth.uid() = id` en `user_profiles`. Sin esto, la base de datos completa es escribible por cualquier visitante.

4. **Reemplazar `hashText` por `crypto.subtle.digest('SHA-256', ...)`** en `analytics.js` para que el registro de consentimiento sea defendible legalmente.

5. **Tests no aislados** en `store.test.js`: añadir reset completo del store en `beforeEach`. Sin esto, los reportes de cobertura mienten.

### Métrica de salud del proyecto

- ✅ **Bueno:** Estructura modular, ARIA en componentes principales, tests de integridad de datos sólidos, ErrorBoundary presente.
- ⚠️ **Mejorable:** Cobertura de tests sesgada (mucho data integrity, poco flujo real), accesibilidad por teclado parcial, manejo de errores silencioso en toda la capa Supabase.
- 🛑 **Riesgoso:** Validez científica del estudio (INTERVENTION_MS), seguridad de Supabase (depende 100% de RLS que no se ve en el repo), trampas de IDOR latentes.

---

**Fin del reporte.**
