-- Sprint 10 | Subeventos completos (feiras) + Dashboard expositor

-- Visitas a subeventos em Modo B (checkin_livre)
-- Sem UNIQUE — a mesma pessoa pode visitar um stand múltiplas vezes
CREATE TABLE IF NOT EXISTS public.visitas_subevento (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  subevento_id  uuid        NOT NULL REFERENCES public.subeventos(id) ON DELETE CASCADE,
  inscricao_id  uuid        NOT NULL REFERENCES public.inscricoes(id) ON DELETE CASCADE,
  dispositivo_id uuid,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS visitas_subevento_sub_idx ON public.visitas_subevento(subevento_id);
CREATE INDEX IF NOT EXISTS visitas_subevento_ins_idx ON public.visitas_subevento(inscricao_id);

ALTER TABLE public.visitas_subevento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "visitas_select_tenant" ON public.visitas_subevento
  FOR SELECT TO authenticated
  USING (
    subevento_id IN (
      SELECT s.id FROM public.subeventos s
      JOIN public.eventos e ON e.id = s.evento_id
      JOIN public.tenants t ON t.id = e.tenant_id
      WHERE t.external_company_id = (auth.jwt()->>'company_id')::uuid
    )
  );

CREATE POLICY "visitas_insert_tenant" ON public.visitas_subevento
  FOR INSERT TO authenticated
  WITH CHECK (
    subevento_id IN (
      SELECT s.id FROM public.subeventos s
      JOIN public.eventos e ON e.id = s.evento_id
      JOIN public.tenants t ON t.id = e.tenant_id
      WHERE t.external_company_id = (auth.jwt()->>'company_id')::uuid
    )
  );

-- Links únicos de acesso ao dashboard do expositor
CREATE TABLE IF NOT EXISTS public.links_expositor (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  subevento_id  uuid        NOT NULL REFERENCES public.subeventos(id) ON DELETE CASCADE,
  token         text        NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(20), 'hex'),
  ativo         boolean     NOT NULL DEFAULT true,
  views         integer     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS links_expositor_subevento_idx ON public.links_expositor(subevento_id);
CREATE INDEX IF NOT EXISTS links_expositor_token_idx ON public.links_expositor(token);

ALTER TABLE public.links_expositor ENABLE ROW LEVEL SECURITY;

CREATE POLICY "links_expositor_select_tenant" ON public.links_expositor
  FOR SELECT TO authenticated
  USING (
    subevento_id IN (
      SELECT s.id FROM public.subeventos s
      JOIN public.eventos e ON e.id = s.evento_id
      JOIN public.tenants t ON t.id = e.tenant_id
      WHERE t.external_company_id = (auth.jwt()->>'company_id')::uuid
    )
  );

CREATE POLICY "links_expositor_insert_tenant" ON public.links_expositor
  FOR INSERT TO authenticated
  WITH CHECK (
    subevento_id IN (
      SELECT s.id FROM public.subeventos s
      JOIN public.eventos e ON e.id = s.evento_id
      JOIN public.tenants t ON t.id = e.tenant_id
      WHERE t.external_company_id = (auth.jwt()->>'company_id')::uuid
    )
  );

CREATE POLICY "links_expositor_update_tenant" ON public.links_expositor
  FOR UPDATE TO authenticated
  USING (
    subevento_id IN (
      SELECT s.id FROM public.subeventos s
      JOIN public.eventos e ON e.id = s.evento_id
      JOIN public.tenants t ON t.id = e.tenant_id
      WHERE t.external_company_id = (auth.jwt()->>'company_id')::uuid
    )
  );
