# Aprende Nawat — Learn the Pipil Language

A gamified mobile-first web app for learning **Náhuat**, the ancestral language of the Pipil people of El Salvador. Built as an MVP for a university thesis research project on language-learning engagement, designed to collect usage analytics from 100+ participants for statistical analysis in R.

## What it does

- **4 themed lessons** (Greetings, Numbers, Colors, Family) with 15 exercises each
- **4 exercise types**: flashcards, multiple choice, matching pairs, and sentence builders
- **Gamification**: XP points, 3 lives per session (30-minute recharge), up to 3 stars per lesson, daily streak tracking
- **Text-to-speech** pronunciation of Náhuat words via the Web Speech API
- **Installable PWA** with offline support — users add it to their home screen and play without a connection
- **Participant profiles** + **analytics backend** for thesis data collection: session durations, lesson attempts, per-exercise response times, accuracy per item

## Tech stack

| Layer          | Tools                                                             |
| -------------- | ----------------------------------------------------------------- |
| UI framework   | React 19 + Vite 8                                                 |
| Routing        | React Router 7                                                    |
| State          | Zustand 5 (with `persist` middleware → localStorage)              |
| Styling        | Plain CSS (custom design system, mobile-first)                    |
| PWA            | `vite-plugin-pwa` + Workbox (auto-update service worker)          |
| Speech         | Web Speech API (`SpeechSynthesis`)                                |
| Backend        | Supabase (PostgreSQL + JS SDK) for analytics                      |
| Data export    | Supabase CSV export → R (`read.csv`)                              |

## Analytics schema (Supabase)

Four tables capture everything needed for the thesis:

- `participants` — UUID, first/last name, created_at
- `sessions` — one row per app open, with duration_seconds
- `lesson_attempts` — lesson_id, score, stars, xp_earned, duration_seconds
- `exercise_responses` — exercise_id, exercise_type, is_correct, response_time_sec

All analytics calls are wrapped in silent `try/catch` — if Supabase is unreachable, the app keeps working and the participant gets a locally-generated UUID.

## Getting started

### 1. Install

```bash
npm install --legacy-peer-deps
```

### 2. Configure Supabase

Create a project at [supabase.com](https://supabase.com), then in the SQL Editor run the schema from the planning notes (4 tables: `participants`, `sessions`, `lesson_attempts`, `exercise_responses`).

Copy your Project URL and anon public key into a `.env.local` file at the repo root:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run

```bash
npm run dev      # dev server at http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the production build
```

### 4. Export data for R

In Supabase: **Table Editor → select table → Export as CSV**, then in R:

```r
responses <- read.csv("exercise_responses.csv")
attempts  <- read.csv("lesson_attempts.csv")
```

## Project structure

```
src/
├── components/       # UI primitives, exercise components, ErrorBoundary
├── data/             # lessons.js, gameConfig.js (static content)
├── hooks/            # useLivesRecharge
├── lib/              # supabase.js (client singleton)
├── screens/          # Onboarding, Home, Lesson, Result
├── services/         # analytics.js (all Supabase calls)
├── store/            # useGameStore.js (Zustand)
└── index.css         # global styles
```

## License

Educational / research use. The Náhuat vocabulary is the cultural heritage of the Pipil people of El Salvador.
