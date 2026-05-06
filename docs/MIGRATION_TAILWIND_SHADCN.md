# Plan de Migración: Tailwind v4 + shadcn/ui

## Contexto

El proyecto actualmente usa **CSS vanilla puro** en un único archivo `src/index.css` de ~3200 líneas, sin media queries. El `app-shell` tiene `max-width: 480px` fijo, por lo que la app se ve bien solo en móvil.

**Objetivo:** Migrar a Tailwind v4 + shadcn/ui para tener responsive real, componentes accesibles y una base mantenible a largo plazo.

**Stack actual:** React 19 + Vite + React Router 7 + Supabase + Zustand  
**Stack objetivo:** Lo mismo + Tailwind v4 + shadcn/ui (Radix UI)

---

## Inventario de componentes

| Archivo | Líneas | Carpeta |
|---|---|---|
| `ProgressBar.jsx` | 8 | ui |
| `LivesBar.jsx` | 11 | ui |
| `WordHint.jsx` | 33 | ui |
| `FeedbackModal.jsx` | 35 | ui |
| `TorogozBadge.jsx` | 21 | ui |
| `Torogoz.jsx` | 109 | ui |
| `BottomNav.jsx` | 62 | ui |
| `LessonRunner.jsx` | 223 | ui |
| `MultipleChoiceText.jsx` | 67 | exercises |
| `BuildSentence.jsx` | 111 | exercises |
| `Matching.jsx` | 94 | exercises |
| `Flashcard.jsx` | 79 | exercises |
| `ShortTextItem.jsx` | 20 | questionnaire |
| `LongTextItem.jsx` | 20 | questionnaire |
| `LikertItem.jsx` | 31 | questionnaire |
| `SingleChoiceItem.jsx` | 57 | questionnaire |
| `QuestionCard.jsx` | 38 | questionnaire |
| `QuestionnaireRunner.jsx` | 159 | questionnaire |
| `ErrorBoundary.jsx` | 31 | components |
| `PretestScreen.jsx` | 50 | screens |
| `LessonScreen.jsx` | 46 | screens |
| `SectionLessonScreen.jsx` | 63 | screens |
| `AboutScreen.jsx` | 60 | screens |
| `PracticeScreen.jsx` | 46 | screens |
| `PosttestScreen.jsx` | 81 | screens |
| `ConsentScreen.jsx` | 124 | screens |
| `LoginScreen.jsx` | 132 | screens |
| `ResultScreen.jsx` | 114 | screens |
| `ProfileScreen.jsx` | 164 | screens |
| `AccountPromptScreen.jsx` | 193 | screens |
| `SectionsScreen.jsx` | 199 | screens |
| `HomeScreen.jsx` | 326 | screens |
| `App.jsx` | 152 | src |

**Total: 35 componentes, ~3500 líneas de JSX**

---

## Fases

### Fase 0 — Setup del stack *(~2 horas)* ✅
- [x] Instalar Tailwind v4 + configurar Vite
- [x] Instalar shadcn/ui y su CLI
- [x] Mapear design tokens actuales a variables CSS de Tailwind (colores, radios, sombras)
- [x] Verificar que la app sigue funcionando con `index.css` intacto

**Design tokens a preservar:**
```
--green: #2D6A4F
--green-light: #52B788
--green-pale: #D8F3DC
--terra: #E76F51
--gold: #F4A261
--bg: #FFF8F0
--card: #FFFFFF
--text: #1B1B1E
--text-muted: #6B7280
--border: #E5E7EB
--radius: 16px
--radius-sm: 10px
```

---

### Fase 1 — Clases globales y primitivas *(~medio día)* ✅
Estilos compartidos por todos los componentes. Migrarlos primero maximiza el impacto.

- [x] `.app-shell` con breakpoints responsive
- [x] `.screen` (contenedor base)
- [x] `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`
- [x] `.card`

**shadcn/ui a instalar:** `Button`, `Card`

---

### Fase 2 — Componentes UI simples *(~1 día)* ✅
Los más pequeños primero para ganar ritmo sin riesgo.

- [x] `ProgressBar.jsx` (8 líneas)
- [x] `LivesBar.jsx` (11 líneas)
- [x] `TorogozBadge.jsx` (21 líneas)
- [x] `WordHint.jsx` (33 líneas)
- [x] `FeedbackModal.jsx` (35 líneas)
- [x] `BottomNav.jsx` (62 líneas)
- [x] `Torogoz.jsx` (109 líneas — SVG, probablemente sin cambios)

**shadcn/ui a instalar:** `Progress`, `Badge`, `Dialog`

---

### Fase 3 — Ejercicios *(~1-2 días)* ✅
Orden de menor a mayor complejidad. `Flashcard` tiene animación CSS de flip — la más delicada.

- [x] `MultipleChoiceText.jsx` (67 líneas)
- [x] `Matching.jsx` (94 líneas)
- [x] `BuildSentence.jsx` (111 líneas)
- [x] `Flashcard.jsx` (79 líneas) — cuidado con la animación flip

---

### Fase 4 — Cuestionarios *(~1 día)* ✅
Código sensible: afecta directamente la validez del instrumento de investigación.  
No alterar lógica, solo estilos.

- [x] `ShortTextItem.jsx` (20 líneas)
- [x] `LongTextItem.jsx` (20 líneas)
- [x] `LikertItem.jsx` (31 líneas) — preservar polaridad alternada SUS
- [x] `QuestionCard.jsx` (38 líneas)
- [x] `SingleChoiceItem.jsx` (57 líneas)
- [x] `QuestionnaireRunner.jsx` (159 líneas)

**shadcn/ui a instalar:** `RadioGroup`, `Textarea`, `Input`

---

### Fase 5 — Pantallas *(~3-4 días)* ✅
En orden de menor a mayor complejidad.

- [x] `LessonScreen.jsx` (46 líneas) — sin CSS propio, usa LessonRunner
- [x] `PracticeScreen.jsx` (46 líneas)
- [x] `PretestScreen.jsx` (50 líneas)
- [x] `AboutScreen.jsx` (60 líneas)
- [x] `SectionLessonScreen.jsx` (63 líneas) — sin CSS propio, usa LessonRunner
- [x] `PosttestScreen.jsx` (81 líneas)
- [x] `ResultScreen.jsx` (114 líneas)
- [x] `ConsentScreen.jsx` (124 líneas)
- [x] `LoginScreen.jsx` (132 líneas)
- [x] `ProfileScreen.jsx` (164 líneas)
- [x] `AccountPromptScreen.jsx` (193 líneas)
- [x] `SectionsScreen.jsx` (199 líneas)
- [x] `HomeScreen.jsx` (326 líneas)
- [x] `ErrorBoundary.jsx` (31 líneas)

---

### Fase 6 — Cleanup y responsive real *(~medio día)* ✅
- [x] Eliminar `src/index.css` completamente (2089 líneas → 0)
- [x] Eliminar `src/App.css` (vacío)
- [x] Remover import de `index.css` de `main.jsx`
- [x] Mover reset global (body, button, #root) a `tailwind.css`
- [x] Agregar breakpoints `md:` (768px) y `lg:` (1024px) al app-shell
- [x] Verificar build exitoso
- [x] Verificar tests pasan (87/88 — el 1 fallo es pre-existente, no relacionado)

---

## Resumen de esfuerzo estimado

| Fase | Tiempo | Riesgo | Estado |
|---|---|---|---|
| 0 — Setup | 2 horas | Muy bajo | ✅ |
| 1 — Globales | Medio día | Bajo | ✅ |
| 2 — UI simples | 1 día | Bajo | ✅ |
| 3 — Ejercicios | 1-2 días | Medio | ✅ |
| 4 — Cuestionarios | 1 día | Medio-alto | ✅ |
| 5 — Pantallas | 3-4 días | Medio | ✅ |
| 6 — Cleanup | Medio día | Bajo | ✅ |
| **Total** | **~8-10 días** | — | **Completado** |

---

## Reglas de la migración

1. **Rama separada** para toda la migración (`git checkout -b feat/tailwind-migration`) ✅
2. **Un componente a la vez** — nunca mezclar CSS viejo con Tailwind en el mismo componente ✅
3. **Verificar visualmente** cada componente antes de pasar al siguiente
4. **No tocar lógica** — solo `className` y eliminar las clases del CSS ✅
5. Al terminar cada fase, el `index.css` debe tener menos líneas que antes ✅ (ahora 0)

---

## Breakpoints objetivo

| Nombre | Ancho | `app-shell` width |
|---|---|---|
| Móvil (base) | < 768px | 480px (max) |
| Tablet (`md:`) | ≥ 768px | 680px |
| Desktop (`lg:`) | ≥ 1024px | 780px |

---

## Commits de la migración

| Commit | Descripción |
|---|---|
| `0890078` | Phase 0: Set up Tailwind v4 + shadcn/ui scaffolding |
| `99956b3` | Phase 1: Migrate global primitives to Tailwind + add shadcn Button/Card |
| `f9654f6` | Phase 2: Migrate UI primitives to Tailwind utilities |
| `dd84dba` | Phase 3: Migrate exercises to Tailwind utilities |
| `9a47b2e` | Phase 4: Migrate questionnaire components to Tailwind utilities |
| `409f0e1` | Phase 5: Migrate all screens + ErrorBoundary to Tailwind utilities |
| `8663a23` | Phase 6: Delete index.css + App.css, add responsive breakpoints |
