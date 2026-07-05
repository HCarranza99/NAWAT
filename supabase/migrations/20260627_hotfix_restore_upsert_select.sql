-- ════════════════════════════════════════════════════════════════
--  HOTFIX CRÍTICO (2026-06-27): restaura el guardado de cuestionarios
--
--  INCIDENTE: desde el 2026-06-04 NO se guardó ninguna respuesta de
--  cuestionario (pretest/posttest) ni hito de intervention_timeline.
--  70 participantes de estudio quedaron con consentimiento pero SIN
--  respuestas. Datos irrecuperables (nunca se persistieron).
--
--  CAUSA: la migración 20260604_harden_rls_policies quitó la policy
--  SELECT de questionnaire_responses e intervention_timeline. La app
--  guarda con .upsert(), que genera `INSERT ... ON CONFLICT DO UPDATE`,
--  y Postgres EXIGE una policy SELECT para ejecutar ese comando (debe
--  poder ver la fila en conflicto). Sin ella → error 42501 (RLS)
--  capturado en silencio por el try/catch → datos perdidos sin aviso.
--  Las tablas con .insert() plano (consent, sessions, exercise_responses)
--  no se vieron afectadas.
--
--  FIX: re-habilitar SELECT para anon en las dos tablas con upsert.
--
--  ⚠️ DEUDA TÉCNICA: USING(true) re-expone la LECTURA a anon (estado
--  previo al 4-jun). El fix definitivo SIN fuga es mover el guardado a
--  funciones SECURITY DEFINER (RPC) y volver a quitar este SELECT.
-- ════════════════════════════════════════════════════════════════

drop policy if exists "anon_select_responses" on public.questionnaire_responses;
create policy "anon_select_responses" on public.questionnaire_responses
  for select to anon using (true);

drop policy if exists "anon_select_timeline" on public.intervention_timeline;
create policy "anon_select_timeline" on public.intervention_timeline
  for select to anon using (true);
