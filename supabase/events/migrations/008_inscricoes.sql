-- Sprint 1 | Supabase Events — Migration 8/11
-- qr_token: UUID único por inscrição, usado no QR Code de check-in
-- subevento_id nullable: inscrição no evento pai não tem subevento

CREATE TABLE IF NOT EXISTS public.inscricoes (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  participante_id  uuid        NOT NULL REFERENCES public.participantes(id),
  evento_id        uuid        NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  subevento_id     uuid        REFERENCES public.subeventos(id) ON DELETE CASCADE,
  tipo_ingresso_id uuid        REFERENCES public.tipos_ingresso(id),
  qr_token         uuid        NOT NULL UNIQUE DEFAULT gen_random_uuid(),
  status           text        NOT NULL DEFAULT 'confirmada'
                               CHECK (status IN ('confirmada', 'cancelada')),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE (participante_id, evento_id, subevento_id)
);

CREATE INDEX IF NOT EXISTS inscricoes_evento_id_idx       ON public.inscricoes(evento_id);
CREATE INDEX IF NOT EXISTS inscricoes_participante_id_idx ON public.inscricoes(participante_id);
CREATE INDEX IF NOT EXISTS inscricoes_qr_token_idx        ON public.inscricoes(qr_token);

ALTER TABLE public.inscricoes ENABLE ROW LEVEL SECURITY;

-- Participante vê as próprias inscrições
CREATE POLICY "inscricoes_select_own" ON public.inscricoes
  FOR SELECT TO authenticated
  USING (participante_id = auth.uid());

-- Admin/operador vê inscrições dos eventos do próprio tenant
CREATE POLICY "inscricoes_select_tenant" ON public.inscricoes
  FOR SELECT TO authenticated
  USING (
    evento_id IN (
      SELECT e.id FROM public.eventos e
      JOIN public.tenants t ON t.id = e.tenant_id
      WHERE t.external_company_id = (auth.jwt()->>'company_id')::uuid
    )
  );

CREATE POLICY "inscricoes_insert_own" ON public.inscricoes
  FOR INSERT TO authenticated
  WITH CHECK (participante_id = auth.uid());
