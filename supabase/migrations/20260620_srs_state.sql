-- ============================================================
-- MIGRACIÓN: Estado del repaso espaciado (SRS)
-- Ejecutar en el SQL Editor del dashboard de Supabase ANTES de
-- desplegar el código que sincroniza el SRS a la nube.
-- ============================================================

-- Mapa { claveDeConcepto: { halfLife, last, reps, lapses } } por usuario.
-- Mientras la columna no exista, el SRS funciona solo en localStorage.
alter table public.user_profiles
  add column if not exists srs jsonb not null default '{}';
