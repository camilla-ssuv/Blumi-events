-- Sprint 1 | Supabase Events — Migration 3/11
-- Participantes: sem tenant_id — são globais na plataforma Blūmi
-- participante_id = auth.uid() do Supabase Principal

CREATE TABLE IF NOT EXISTS public.participantes (
  id         uuid        PRIMARY KEY, -- = auth.uid() do Principal
  nome       text        NOT NULL,
  email      text        NOT NULL,
  telefone   text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.participantes ENABLE ROW LEVEL SECURITY;

-- Participante vê apenas o próprio perfil
CREATE POLICY "participantes_select_own" ON public.participantes
  FOR SELECT TO authenticated
  USING (id = auth.uid());

CREATE POLICY "participantes_insert_own" ON public.participantes
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "participantes_update_own" ON public.participantes
  FOR UPDATE TO authenticated
  USING (id = auth.uid());
