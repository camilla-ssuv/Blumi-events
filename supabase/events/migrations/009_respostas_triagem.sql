-- Sprint 1 | Supabase Events — Migration 9/11
-- ON DELETE CASCADE: se a inscrição for deletada, respostas somem junto

CREATE TABLE IF NOT EXISTS public.respostas_triagem (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  inscricao_id uuid        NOT NULL REFERENCES public.inscricoes(id) ON DELETE CASCADE,
  pergunta_id  uuid        NOT NULL REFERENCES public.perguntas_triagem(id) ON DELETE CASCADE,
  resposta     text,        -- texto livre ou opção selecionada
  opcoes       jsonb,       -- array de strings para multipla_escolha
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE (inscricao_id, pergunta_id)
);

CREATE INDEX IF NOT EXISTS respostas_triagem_inscricao_id_idx ON public.respostas_triagem(inscricao_id);

ALTER TABLE public.respostas_triagem ENABLE ROW LEVEL SECURITY;

CREATE POLICY "respostas_select_own" ON public.respostas_triagem
  FOR SELECT TO authenticated
  USING (
    inscricao_id IN (
      SELECT id FROM public.inscricoes WHERE participante_id = auth.uid()
    )
  );

CREATE POLICY "respostas_select_tenant" ON public.respostas_triagem
  FOR SELECT TO authenticated
  USING (
    inscricao_id IN (
      SELECT i.id FROM public.inscricoes i
      JOIN public.eventos e ON e.id = i.evento_id
      JOIN public.tenants t ON t.id = e.tenant_id
      WHERE t.external_company_id = (auth.jwt()->>'company_id')::uuid
    )
  );

CREATE POLICY "respostas_insert_own" ON public.respostas_triagem
  FOR INSERT TO authenticated
  WITH CHECK (
    inscricao_id IN (
      SELECT id FROM public.inscricoes WHERE participante_id = auth.uid()
    )
  );
