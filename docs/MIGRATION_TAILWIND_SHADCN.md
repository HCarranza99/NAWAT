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

### Fase 0 — Setup del stack *(~2 horas)*
- [ ] Instalar Tailwind v4 + configurar Vite
- [ ] Instalar shadcn/ui y su CLI
- [ ] Mapear design tokens actuales a variables CSS de Tailwind (colores, radios, sombras)
- [ ] Verificar que la app sigue funcionando con `index.css` intacto

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

### Fase 1 — Clases globales y primitivas *(~medio día)*
Estilos compartidos por todos los componentes. Migrarlos primero maximiza el impacto.

- [ ] `.app-shell` con breakpoints responsive
- [ ] `.screen` (contenedor base)
- [ ] `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-danger`
- [ ] `.card`

**shadcn/ui a instalar:** `Button`, `Card`

---

### Fase 2 — Componentes UI simples *(~1 día)*
Los más pequeños primero para ganar ritmo sin riesgo.

- [ ] `ProgressBar.jsx` (8 líneas)
- [ ] `LivesBar.jsx` (11 líneas)
- [ ] `TorogozBadge.jsx` (21 líneas)
- [ ] `WordHint.jsx` (33 líneas)
- [ ] `FeedbackModal.jsx` (35 líneas)
- [ ] `BottomNav.jsx` (62 líneas)
- [ ] `Torogoz.jsx` (109 líneas — SVG, probablemente sin cambios)

**shadcn/ui a instalar:** `Progress`, `Badge`, `Dialog`

---

### Fase 3 — Ejercicios *(~1-2 días)*
Orden de menor a mayor complejidad. `Flashcard` tiene animación CSS de flip — la más delicada.

- [ ] `MultipleChoiceText.jsx` (67 líneas)
- [ ] `Matching.jsx` (94 líneas)
- [ ] `BuildSentence.jsx` (111 líneas)
- [ ] `Flashcard.jsx` (79 líneas) — cuidado con la animación flip

---

### Fase 4 — Cuestionarios *(~1 día)*
Código sensible: afecta directamente la validez del instrumento de investigación.  
No alterar lógica, solo estilos.

- [ ] `ShortTextItem.jsx` (20 líneas)
- [ ] `LongTextItem.jsx` (20 líneas)
- [ ] `LikertItem.jsx` (31 líneas) — preservar polaridad alternada SUS
- [ ] `QuestionCard.jsx` (38 líneas)
- [ ] `SingleChoiceItem.jsx` (57 líneas)
- [ ] `QuestionnaireRunner.jsx` (159 líneas)

**shadcn/ui a instalar:** `RadioGroup`, `Textarea`, `Input`

---

### Fase 5 — Pantallas *(~3-4 días)*
En orden de menor a mayor complejidad.

- [ ] `LessonScreen.jsx` (46 líneas)
- [ ] `PracticeScreen.jsx` (46 líneas)
- [ ] `PretestScreen.jsx` (50 líneas)
- [ ] `AboutScreen.jsx` (60 líneas)
- [ ] `SectionLessonScreen.jsx` (63 líneas)
- [ ] `PosttestScreen.jsx` (81 líneas)
- [ ] `ResultScreen.jsx` (114 líneas)
- [ ] `ConsentScreen.jsx` (124 líneas)
- [ ] `LoginScreen.jsx` (132 líneas)
- [ ] `ProfileScreen.jsx` (164 líneas)
- [ ] `AccountPromptScreen.jsx` (193 líneas)
- [ ] `SectionsScreen.jsx` (199 líneas)
- [ ] `HomeScreen.jsx` (326 líneas) — dejar para el final

---

### Fase 6 — Cleanup y responsive real *(~medio día)*
- [ ] Eliminar `src/index.css` completamente
- [ ] Agregar breakpoints `md:` (768px) y `lg:` (1024px) donde corresponde
- [ ] Probar en móvil, tablet y desktop
- [ ] Verificar PWA sigue funcionando

---

## Resumen de esfuerzo estimado

| Fase | Tiempo | Riesgo |
|---|---|---|
| 0 — Setup | 2 horas | Muy bajo |
| 1 — Globales | Medio día | Bajo |
| 2 — UI simples | 1 día | Bajo |
| 3 — Ejercicios | 1-2 días | Medio |
| 4 — Cuestionarios | 1 día | Medio-alto |
| 5 — Pantallas | 3-4 días | Medio |
| 6 — Cleanup | Medio día | Bajo |
| **Total** | **~8-10 días** | — |

---

## Reglas de la migración

1. **Rama separada** para toda la migración (`git checkout -b feat/tailwind-migration`)
2. **Un componente a la vez** — nunca mezclar CSS viejo con Tailwind en el mismo componente
3. **Verificar visualmente** cada componente antes de pasar al siguiente
4. **No tocar lógica** — solo `className` y eliminar las clases del CSS
5. Al terminar cada fase, el `index.css` debe tener menos líneas que antes

---

## Breakpoints objetivo

| Nombre | Ancho | `app-shell` width |
|---|---|---|
| Móvil (base) | < 768px | 100% |
| Tablet (`md:`) | ≥ 768px | 680px |
| Desktop (`lg:`) | ≥ 1024px | 780px |
