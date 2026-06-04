import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// `createClient` lanza una excepción síncrona si la URL o la key están vacías,
// lo que rompería el arranque de la app (pantalla en blanco, antes de montar
// el ErrorBoundary). Si faltan las variables usamos valores placeholder válidos:
// el cliente se crea sin lanzar y todas las operaciones de red fallan de forma
// controlada (cada función en analytics.js / auth.js tiene try/catch silencioso).
const FALLBACK_URL = 'https://placeholder.supabase.co'
const FALLBACK_KEY = 'placeholder-anon-key'

if ((!supabaseUrl || !supabaseKey) && import.meta.env.DEV) {
  console.warn(
    '[supabase] Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY. ' +
    'La app funcionará en modo offline (sin sincronización ni telemetría).'
  )
}

export const supabase = createClient(
  supabaseUrl || FALLBACK_URL,
  supabaseKey || FALLBACK_KEY
)
