-- =============================================================================
-- AUDIT_RLS_PENDIENTE.sql
-- Políticas de seguridad (Row Level Security) para aplicar en Supabase
-- =============================================================================

-- 1. Habilitar RLS en todas las tablas
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questionnaire_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intervention_timeline ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para user_profiles (Solo usuarios autenticados pueden ver/modificar su perfil)
CREATE POLICY "Users can view own profile" 
ON public.user_profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON public.user_profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.user_profiles FOR UPDATE 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

-- 3. Políticas para tablas de recolección de datos (Modo Invitado / Anónimo)
-- Como la app permite jugar sin cuenta (guest mode), debemos permitir INSERT y UPDATE a cualquiera
-- pero bloquear SELECT y DELETE para evitar raspado de datos.

-- participants
CREATE POLICY "Anyone can insert participants" 
ON public.participants FOR INSERT 
WITH CHECK (true);
-- No se permite SELECT, UPDATE, DELETE

-- sessions
CREATE POLICY "Anyone can insert sessions" 
ON public.sessions FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update sessions" 
ON public.sessions FOR UPDATE 
USING (true) 
WITH CHECK (true);
-- No se permite SELECT, DELETE

-- lesson_attempts
CREATE POLICY "Anyone can insert lesson_attempts" 
ON public.lesson_attempts FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update lesson_attempts" 
ON public.lesson_attempts FOR UPDATE 
USING (true) 
WITH CHECK (true);
-- No se permite SELECT, DELETE

-- exercise_responses
CREATE POLICY "Anyone can insert exercise_responses" 
ON public.exercise_responses FOR INSERT 
WITH CHECK (true);
-- No se permite SELECT, UPDATE, DELETE

-- consent_records
CREATE POLICY "Anyone can insert consent_records" 
ON public.consent_records FOR INSERT 
WITH CHECK (true);
-- No se permite SELECT, UPDATE, DELETE

-- questionnaire_responses (Usa upsert, requiere INSERT y UPDATE)
CREATE POLICY "Anyone can insert questionnaire_responses" 
ON public.questionnaire_responses FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update questionnaire_responses" 
ON public.questionnaire_responses FOR UPDATE 
USING (true) 
WITH CHECK (true);
-- No se permite SELECT, DELETE

-- intervention_timeline (Usa upsert, requiere INSERT y UPDATE)
CREATE POLICY "Anyone can insert intervention_timeline" 
ON public.intervention_timeline FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update intervention_timeline" 
ON public.intervention_timeline FOR UPDATE 
USING (true) 
WITH CHECK (true);
-- No se permite SELECT, DELETE

-- Fin de políticas RLS.
