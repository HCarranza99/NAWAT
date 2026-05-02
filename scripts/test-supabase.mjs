// Script de verificación end-to-end: simula un participante real
// Corre con: node scripts/test-supabase.mjs
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'

// Cargar .env.local manualmente (Node no lo lee solo)
const env = Object.fromEntries(
  readFileSync('.env.local', 'utf8')
    .split('\n')
    .filter((l) => l.trim() && !l.startsWith('#'))
    .map((l) => {
      const [k, ...v] = l.split('=')
      return [k.trim(), v.join('=').trim()]
    })
)

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY)

const log = (label, result) => {
  if (result.error) {
    console.error(`❌ ${label}:`, result.error.message)
    process.exit(1)
  }
  console.log(`✅ ${label}`)
  return result.data
}

console.log('\n🧪 Testing Supabase end-to-end flow...\n')

// 1. Crear participante
const p = log(
  'participants.insert',
  await supabase
    .from('participants')
    .insert({ first_name: 'Test', last_name: 'Script' })
    .select()
    .single()
)
console.log(`   → participant_id: ${p.id}`)

// 2. Crear sesión
const s = log(
  'sessions.insert',
  await supabase
    .from('sessions')
    .insert({ participant_id: p.id })
    .select()
    .single()
)
console.log(`   → session_id: ${s.id}`)

// 3. Crear lesson_attempt
const a = log(
  'lesson_attempts.insert',
  await supabase
    .from('lesson_attempts')
    .insert({
      participant_id: p.id,
      session_id: s.id,
      lesson_id: 1,
      lesson_title: 'Saludos (test)',
    })
    .select()
    .single()
)
console.log(`   → attempt_id: ${a.id}`)

// 4. Registrar una respuesta
log(
  'exercise_responses.insert',
  await supabase.from('exercise_responses').insert({
    participant_id: p.id,
    session_id: s.id,
    lesson_attempt_id: a.id,
    exercise_id: '1-1',
    exercise_type: 'flashcard',
    is_correct: true,
    response_time_sec: 3.42,
  })
)

// 5. Completar lesson_attempt (UPDATE)
log(
  'lesson_attempts.update',
  await supabase
    .from('lesson_attempts')
    .update({
      completed_at: new Date().toISOString(),
      duration_seconds: 120,
      score: 0.93,
      stars: 3,
      xp_earned: 150,
      passed: true,
    })
    .eq('id', a.id)
)

// 6. Cerrar sesión (UPDATE)
log(
  'sessions.update',
  await supabase
    .from('sessions')
    .update({
      ended_at: new Date().toISOString(),
      duration_seconds: 180,
    })
    .eq('id', s.id)
)

console.log('\n🎉 All checks passed. Your Supabase setup is working end-to-end.')
console.log(`\n   Go to Supabase → Table Editor → participants`)
console.log(`   You should see a row with first_name="Test" last_name="Script"`)
console.log(`   (You can delete it manually when done.)\n`)
