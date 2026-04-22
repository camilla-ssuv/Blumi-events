-- Sprint 1 | Supabase Events — Migration 4/11

CREATE TABLE IF NOT EXISTS public.eventos (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        uuid        NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  nome             text        NOT NULL,
  descricao        text,
  tipo             text        NOT NULL CHECK (tipo IN ('simples', 'feira')),
  status           text        NOT NULL DEFAULT 'rascunho'
                               CHECK (status IN ('rascunho', 'publicado', 'encerrado')),
  visibilidade     text        NOT NULL DEFAULT 'aberto'
                               CHECK (visibilidade IN ('aberto', 'convite')),
  codigo_convite   text,
  data_inicio      timestamptz,
  data_fim         timestamptz,
  cidade           text,
  endereco         text,
  capa_url         text,
  vagas_total      integer,
  created_by       uuid        REFERENCES public.usuarios(id),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS eventos_tenant_id_idx  ON public.eventos(tenant_id);
CREATE INDEX IF NOT EXISTS eventos_status_idx     ON public.eventos(status);
CREATE INDEX IF NOT EXISTS eventos_visibilidade_idx ON public.eventos(visibilidade);

ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

-- Eventos publicados/encerrados são visíveis a qualquer autenticado (catálogo público)
CREATE POLICY "eventos_select_public" ON public.eventos
  FOR SELECT TO authenticated
  USING (status IN ('publicado', 'encerrado'));

-- Admin/operador vê todos os eventos do próprio tenant (inclusive rascunhos)
CREATE POLICY "eventos_select_tenant" ON public.eventos
  FOR SELECT TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants
      WHERE external_company_id = (auth.jwt()->>'company_id')::uuid
    )
  );

CREATE POLICY "eventos_insert_tenant" ON public.eventos
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT id FROM public.tenants
      WHERE external_company_id = (auth.jwt()->>'company_id')::uuid
    )
  );

CREATE POLICY "eventos_update_tenant" ON public.eventos
  FOR UPDATE TO authenticated
  USING (
    tenant_id IN (
      SELECT id FROM public.tenants
      WHERE external_company_id = (auth.jwt()->>'company_id')::uuid
    )
    AND status != 'encerrado' -- eventos encerrados são READ-ONLY
  );
