-- Sprint 1 | Supabase Events — Migration 11/11
-- codigo_sessao: 6 dígitos, válido 24h, gerado pelo sistema
-- subevento_id nullable: dispositivo pode ser vinculado ao evento pai

CREATE TABLE IF NOT EXISTS public.dispositivos (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  evento_id       uuid        NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  subevento_id    uuid        REFERENCES public.subeventos(id) ON DELETE SET NULL,
  nome            text        NOT NULL,
  tipo            text        NOT NULL CHECK (tipo IN ('fixo', 'movel')),
  codigo_sessao   char(6)     NOT NULL,
  codigo_expira_em timestamptz NOT NULL,
  ativo           boolean     NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dispositivos_tenant_id_idx       ON public.dispositivos(tenant_id);
CREATE INDEX IF NOT EXISTS dispositivos_evento_id_idx       ON public.dispositivos(evento_id);
CREATE INDEX IF NOT EXISTS dispositivos_codigo_sessao_idx   ON public.dispositivos(codigo_sessao);

-- FK reversa: checkins.dispositivo_id → dispositivos.id
ALTER TABLE public.checkins
  ADD CONSTRAINT checkins_dispositivo_id_fkey
  FOREIGN KEY (dispositivo_id) REFERENCES public.dispositivos(id) ON DELETE SET NULL;

ALTER TABLE public.dispositivos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dispositivos_select_tenant" ON public.dispositivos
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants
      WHERE external_company_id = (auth.jwt()->>'company_id')::uuid
    )
  );

CREATE POLICY "dispositivos_insert_tenant" ON public.dispositivos
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM public.tenants
      WHERE external_company_id = (auth.jwt()->>'company_id')::uuid
    )
  );

CREATE POLICY "dispositivos_update_tenant" ON public.dispositivos
  FOR UPDATE TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants
      WHERE external_company_id = (auth.jwt()->>'company_id')::uuid
    )
  );

-- Função auxiliar para gerar código de sessão de 6 dígitos
CREATE OR REPLACE FUNCTION public.gerar_codigo_sessao()
RETURNS char(6)
LANGUAGE sql
AS $$
  SELECT LPAD(FLOOR(RANDOM() * 1000000)::text, 6, '0');
$$;
