-- Sprint 1 | Supabase Principal
-- Tabelas de feature flags por módulo/cliente
-- REGRA: nunca modificar tabelas existentes (companies, users, etc.)

CREATE TABLE IF NOT EXISTS public.modulos (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug       text        NOT NULL UNIQUE,
  nome       text        NOT NULL,
  url_base   text,
  ativo      boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.company_modulos (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  uuid        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  modulo_id   uuid        NOT NULL REFERENCES public.modulos(id) ON DELETE CASCADE,
  ativo       boolean     NOT NULL DEFAULT false,
  config      jsonb,
  expira_em   timestamptz,
  ativado_por uuid        REFERENCES auth.users(id),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (company_id, modulo_id)
);

CREATE INDEX IF NOT EXISTS company_modulos_company_id_idx ON public.company_modulos(company_id);

-- RLS
ALTER TABLE public.modulos        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_modulos ENABLE ROW LEVEL SECURITY;

-- Qualquer autenticado pode ler módulos disponíveis
CREATE POLICY "modulos_select" ON public.modulos
  FOR SELECT TO authenticated USING (ativo = true);

-- Empresa vê apenas os próprios módulos
CREATE POLICY "company_modulos_select" ON public.company_modulos
  FOR SELECT TO authenticated
  USING (company_id = (
    SELECT c.id FROM public.companies c
    JOIN public.company_users cu ON cu.company_id = c.id
    WHERE cu.user_id = auth.uid()
    LIMIT 1
  ));

-- Seeds
INSERT INTO public.modulos (slug, nome, url_base, ativo) VALUES
  ('eventos',   'Eventos',   '/eventos',   true),
  ('pesquisas', 'Pesquisas', '/pesquisas', true),
  ('vagas',     'Vagas',     '/vagas',     true)
ON CONFLICT (slug) DO NOTHING;
