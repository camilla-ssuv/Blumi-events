-- Sprint 1 | Supabase Events — Migration 6/11

CREATE TABLE IF NOT EXISTS public.tipos_ingresso (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id  uuid        NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  nome       text        NOT NULL,
  descricao  text,
  vagas      integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS tipos_ingresso_evento_id_idx ON public.tipos_ingresso(evento_id);

ALTER TABLE public.tipos_ingresso ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tipos_ingresso_select" ON public.tipos_ingresso
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

CREATE POLICY "tipos_ingresso_insert_tenant" ON public.tipos_ingresso
  FOR INSERT TO authenticated
  WITH CHECK (
    evento_id IN (
      SELECT e.id FROM public.eventos e
      JOIN public.tenants t ON t.id = e.tenant_id
      WHERE t.external_company_id = (auth.jwt()->>'company_id')::uuid
        AND e.status != 'encerrado'
    )
  );
