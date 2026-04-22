-- Sprint 1 | Supabase Events — Migration 7/11
-- enunciado vira cabeçalho de coluna no CSV exportado

CREATE TABLE IF NOT EXISTS public.perguntas_triagem (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  evento_id    uuid        NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  enunciado    text        NOT NULL,
  tipo         text        NOT NULL CHECK (tipo IN ('texto', 'escolha_unica', 'multipla_escolha')),
  opcoes       jsonb,       -- array de strings para escolha_unica / multipla_escolha
  obrigatoria  boolean     NOT NULL DEFAULT true,
  ordem        integer     NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS perguntas_triagem_evento_id_idx ON public.perguntas_triagem(evento_id);

ALTER TABLE public.perguntas_triagem ENABLE ROW LEVEL SECURITY;

CREATE POLICY "perguntas_select" ON public.perguntas_triagem
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

CREATE POLICY "perguntas_insert_tenant" ON public.perguntas_triagem
  FOR INSERT TO authenticated
  WITH CHECK (
    evento_id IN (
      SELECT e.id FROM public.eventos e
      JOIN public.tenants t ON t.id = e.tenant_id
      WHERE t.external_company_id = (auth.jwt()->>'company_id')::uuid
        AND e.status != 'encerrado'
    )
  );

CREATE POLICY "perguntas_update_tenant" ON public.perguntas_triagem
  FOR UPDATE TO authenticated
  USING (
    evento_id IN (
      SELECT e.id FROM public.eventos e
      JOIN public.tenants t ON t.id = e.tenant_id
      WHERE t.external_company_id = (auth.jwt()->>'company_id')::uuid
        AND e.status != 'encerrado'
    )
  );

CREATE POLICY "perguntas_delete_tenant" ON public.perguntas_triagem
  FOR DELETE TO authenticated
  USING (
    evento_id IN (
      SELECT e.id FROM public.eventos e
      JOIN public.tenants t ON t.id = e.tenant_id
      WHERE t.external_company_id = (auth.jwt()->>'company_id')::uuid
        AND e.status != 'encerrado'
    )
  );
