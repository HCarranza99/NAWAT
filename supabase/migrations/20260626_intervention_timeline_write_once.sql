-- ════════════════════════════════════════════════════════════════
--  intervention_timeline: hitos "write-once" + backfill (2026-06-26)
--
--  Problema detectado en auditoría: markPosttestUnlocked (y las otras marks)
--  hacían un upsert INCONDICIONAL del timestamp. PosttestScreen lo llama en un
--  useEffect al montar, así que un re-montaje (re-trigger de los 15 min al
--  reabrir en fase PLAYING) sobrescribía `posttest_unlocked_at` con una hora
--  posterior → 2 participantes con "desbloqueado" después de "completado".
--
--  Fix: trigger BEFORE UPDATE que conserva el PRIMER valor no nulo de cada hito.
--  Robusto sin importar la versión del cliente (incluye Service Workers viejos).
--
--  Aplicado vía Supabase MCP. Este archivo alinea el repo con la BD.
-- ════════════════════════════════════════════════════════════════

create or replace function public.preserve_first_timeline_ts()
returns trigger
language plpgsql
as $$
begin
  new.pretest_completed_at  := coalesce(old.pretest_completed_at,  new.pretest_completed_at);
  new.posttest_unlocked_at  := coalesce(old.posttest_unlocked_at,  new.posttest_unlocked_at);
  new.posttest_completed_at := coalesce(old.posttest_completed_at, new.posttest_completed_at);
  return new;
end;
$$;

drop trigger if exists trg_preserve_first_timeline_ts on public.intervention_timeline;
create trigger trg_preserve_first_timeline_ts
  before update on public.intervention_timeline
  for each row execute function public.preserve_first_timeline_ts();

-- Backfill (idempotente): participantes que completaron el postest (tienen
-- respuestas) pero cuyo timeline quedó sin `posttest_completed_at`. Se usa la
-- última respuesta de postest como momento de completado.
update public.intervention_timeline t
set posttest_completed_at = sub.maxa
from (
  select participant_id, max(answered_at) as maxa
  from public.questionnaire_responses
  where phase = 'posttest'
  group by participant_id
) sub
where t.participant_id = sub.participant_id
  and t.posttest_completed_at is null;

-- Nota: 2 filas con `posttest_unlocked_at` posterior a `posttest_completed_at`
-- (valor original irrecuperable) se dejan TAL CUAL a propósito, para excluirlas
-- manualmente del análisis de tiempos si corresponde.
