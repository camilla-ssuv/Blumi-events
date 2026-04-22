-- Sprint 1 | Supabase Events — Migration 5/11

CREATE TABLE IF NOT EXISTS public.subeventos (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id             uuid        NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  nome                  text        NOT NULL,
  descricao             text,
  modo_inscricao        text        NOT NULL CHECK (modo_inscricao IN ('inscricao', 'checkin_livre')),
  inscricao_automatica  boolean     NOT NULL DEFAULT false,
  data_inicio           timestamptz,
  data_fim              timestamptz,
  local                 text,
  vagas_total           integer,
  tipo_tag              text, -- ex: 'workshop', 'palestra', 'stand'
  created_at            timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subeventos_evento_id_idx ON public.subeventos(evento_id);

ALTER TABLE public.subeventos ENABLE ROW LEVEL SECURITY;

-- Visível a qualquer autenticado se o evento pai for público
CREATE POLICY "subeventos_select" ON public.subeventos
  FOR SELECT TO authenticated
  USING (
    evento_id IN (
      SELECT id FROM public.eventos WHERE status IN ('publicado', 'encerrado')
    )
    OR
    evento_id IN (
      SELECT e.id FROM public.eventos e
      JOIN public.tenants t ON t.id = e.tenant_id
      WHERE t.external_company_id = (auth.jwt()->>'company_id')::uuid
    )
  );

CREATE POLICY "subeventos_insert_tenant" ON public.subeventos
  FOR INSERT TO authenticated
  WITH CHECK (
    evento_id IN (
      SELECT e.id FROM public.eventos e
      JOIN public.tenants t ON t.id = e.tenant_id
      WHERE t.external_company_id = (auth.jwt()->>'company_id')::uuid
        AND e.status != 'encerrado'
    )
  );

CREATE POLICY "subeventos_update_tenant" ON public.subeventos
  FOR UPDATE TO authenticated
  USING (
    evento_id IN (
      SELECT e.id FROM public.eventos e
      JOIN public.tenants t ON t.id = e.tenant_id
      WHERE t.external_company_id = (auth.jwt()->>'company_id')::uuid
        AND e.status != 'encerrado'
    )
  );
