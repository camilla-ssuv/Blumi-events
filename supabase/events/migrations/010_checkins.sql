-- Sprint 1 | Supabase Events — Migration 10/11
-- NUNCA deletar um check-in. Usar cancelado = true com log de quem e quando.
-- UNIQUE em inscricao_id bloqueia duplo check-in no banco.

CREATE TABLE IF NOT EXISTS public.checkins (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  inscricao_id  uuid        NOT NULL REFERENCES public.inscricoes(id) ON DELETE CASCADE,
  cancelado     boolean     NOT NULL DEFAULT false,
  cancelado_por uuid        REFERENCES public.usuarios(id),
  cancelado_em  timestamptz,
  motivo_cancel text,
  origem        text        NOT NULL CHECK (origem IN ('camera', 'usb', 'manual', 'correcao_admin')),
  feito_por     uuid        REFERENCES public.usuarios(id),
  dispositivo_id uuid,      -- FK adicionada na migration 011
  created_at    timestamptz NOT NULL DEFAULT now(),
  -- sem UNIQUE aqui: usamos partial unique index abaixo
);

CREATE INDEX IF NOT EXISTS checkins_inscricao_id_idx ON public.checkins(inscricao_id);
CREATE INDEX IF NOT EXISTS checkins_cancelado_idx    ON public.checkins(cancelado);

-- Partial unique: bloqueia duplo check-in ativo, permite correcao_admin após cancelamento
CREATE UNIQUE INDEX IF NOT EXISTS checkins_inscricao_ativo_uq
  ON public.checkins(inscricao_id) WHERE cancelado = false;

ALTER TABLE public.checkins ENABLE ROW LEVEL SECURITY;

-- Admin/operador lê check-ins dos eventos do próprio tenant
CREATE POLICY "checkins_select_tenant" ON public.checkins
  FOR SELECT TO authenticated
  USING (
    inscricao_id IN (
      SELECT i.id FROM public.inscricoes i
      JOIN public.eventos e ON e.id = i.evento_id
      JOIN public.tenants t ON t.id = e.tenant_id
      WHERE t.external_company_id = (auth.jwt()->>'company_id')::uuid
    )
  );

-- Participante vê o próprio check-in
CREATE POLICY "checkins_select_own" ON public.checkins
  FOR SELECT TO authenticated
  USING (
    inscricao_id IN (
      SELECT id FROM public.inscricoes WHERE participante_id = auth.uid()
    )
  );

CREATE POLICY "checkins_insert_tenant" ON public.checkins
  FOR INSERT TO authenticated
  WITH CHECK (
    inscricao_id IN (
      SELECT i.id FROM public.inscricoes i
      JOIN public.eventos e ON e.id = i.evento_id
      JOIN public.tenants t ON t.id = e.tenant_id
      WHERE t.external_company_id = (auth.jwt()->>'company_id')::uuid
    )
  );

-- Apenas UPDATE para marcar cancelado — nunca DELETE
CREATE POLICY "checkins_update_tenant" ON public.checkins
  FOR UPDATE TO authenticated
  USING (
    inscricao_id IN (
      SELECT i.id FROM public.inscricoes i
      JOIN public.eventos e ON e.id = i.evento_id
      JOIN public.tenants t ON t.id = e.tenant_id
      WHERE t.external_company_id = (auth.jwt()->>'company_id')::uuid
    )
  );
