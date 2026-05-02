-- ============================================================
-- MIGRACIÓN: Sistema de Cuentas de Usuario
-- Ejecutar en el SQL Editor del dashboard de Supabase
-- ============================================================

-- Tabla principal de perfiles de usuario (vinculada a Supabase Auth)
create table if not exists public.user_profiles (
  -- Clave primaria: el UUID del usuario en Supabase Auth
  id uuid references auth.users(id) on delete cascade primary key,

  -- Referencia al participante de investigación (puede ser null si se registró sin completar protocolo)
  participant_id uuid references public.participants(id) on delete set null,

  -- ── Gamificación ──────────────────────────────────────────
  xp                    int         not null default 0,
  lives                 int         not null default 3,
  lives_last_lost_at    timestamptz,
  streak                int         not null default 0,
  last_played_date      text,                          -- 'YYYY-MM-DD' en hora local
  section_progress      jsonb       not null default '{}',
  lesson_progress       jsonb       not null default '{}',

  -- ── Protocolo de estudio ──────────────────────────────────
  study_phase           text        not null default 'consent',
  consent_accepted_at   timestamptz,
  pretest_completed_at  timestamptz,
  posttest_completed_at timestamptz,

  -- ── Metadatos ─────────────────────────────────────────────
  updated_at            timestamptz not null default now()
);

-- Trigger para actualizar updated_at automáticamente
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger user_profiles_updated_at
  before update on public.user_profiles
  for each row execute procedure public.handle_updated_at();

-- ── Row Level Security ─────────────────────────────────────
alter table public.user_profiles enable row level security;

-- Cada usuario solo puede ver y modificar su propio perfil
create policy "Users can view own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

-- ============================================================
-- NOTAS DE CONFIGURACIÓN (hacer manualmente en el dashboard):
-- 1. Authentication > Providers > Email: ya viene activado por defecto.
-- 2. Para Google OAuth:
--    - Ir a Authentication > Providers > Google
--    - Activar y pegar Client ID + Client Secret de Google Cloud Console
--    - En Google Cloud Console: añadir el Redirect URI de Supabase
--      (está en Authentication > URL Configuration > Redirect URLs)
-- ============================================================
