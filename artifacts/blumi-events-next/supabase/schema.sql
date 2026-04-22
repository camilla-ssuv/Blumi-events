-- ============================================================
-- Blūmi Events — Schema completo (Supabase Events project)
-- Execute este arquivo no SQL Editor do Supabase Studio
-- ============================================================

-- -------------------------------------------------------
-- 1. tenants
-- -------------------------------------------------------
create table if not exists public.tenants (
  id              uuid primary key default gen_random_uuid(),
  external_company_id text not null unique,
  nome            text not null,
  cor_primaria    text,
  logo_url        text,
  created_at      timestamptz not null default now()
);

alter table public.tenants enable row level security;

create policy "tenants: leitura autenticada"
  on public.tenants for select
  using (auth.role() = 'authenticated' or auth.role() = 'service_role');

-- -------------------------------------------------------
-- 2. usuarios (admins / operadores por tenant)
-- -------------------------------------------------------
create table if not exists public.usuarios (
  id          uuid primary key default gen_random_uuid(),
  tenant_id   uuid not null references public.tenants(id) on delete cascade,
  nome        text not null,
  email       text not null,
  role        text not null check (role in ('company_admin','operator')),
  ativo       boolean not null default true,
  created_at  timestamptz not null default now()
);

alter table public.usuarios enable row level security;

create policy "usuarios: acesso por tenant"
  on public.usuarios for all
  using (auth.role() = 'service_role');

-- -------------------------------------------------------
-- 3. participantes (global — sem tenant_id)
-- -------------------------------------------------------
create table if not exists public.participantes (
  id          uuid primary key,  -- mesmo UUID do Supabase Principal
  nome        text not null,
  email       text not null unique,
  created_at  timestamptz not null default now()
);

alter table public.participantes enable row level security;

create policy "participantes: leitura autenticada"
  on public.participantes for select
  using (auth.role() in ('authenticated', 'service_role'));

create policy "participantes: escrita service_role"
  on public.participantes for insert
  with check (auth.role() = 'service_role');

create policy "participantes: update service_role"
  on public.participantes for update
  using (auth.role() = 'service_role');

-- -------------------------------------------------------
-- 4. eventos
-- -------------------------------------------------------
create table if not exists public.eventos (
  id                        uuid primary key default gen_random_uuid(),
  tenant_id                 uuid not null references public.tenants(id) on delete cascade,
  nome                      text not null,
  slug                      text not null unique,
  tipo                      text not null check (tipo in ('simples','feira')),
  visibilidade              text not null default 'aberto' check (visibilidade in ('aberto','convite')),
  status                    text not null default 'rascunho' check (status in ('rascunho','publicado','encerrado')),
  descricao                 text,
  cidade                    text,
  endereco                  text,
  vagas_total               integer,
  codigo_convite            text,
  data_inicio               timestamptz,
  data_fim                  timestamptz,
  emitir_certificados       boolean not null default false,
  certificado_titulo        text,
  certificado_carga_horaria text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

alter table public.eventos enable row level security;

create policy "eventos: leitura publica para publicados"
  on public.eventos for select
  using (status = 'publicado' or auth.role() in ('authenticated','service_role'));

create policy "eventos: escrita autenticada"
  on public.eventos for insert
  with check (auth.role() in ('authenticated','service_role'));

create policy "eventos: update autenticado"
  on public.eventos for update
  using (auth.role() in ('authenticated','service_role'));

-- Atualiza updated_at automaticamente
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger eventos_updated_at
  before update on public.eventos
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------
-- 5. subeventos
-- -------------------------------------------------------
create table if not exists public.subeventos (
  id                  uuid primary key default gen_random_uuid(),
  evento_id           uuid not null references public.eventos(id) on delete cascade,
  nome                text not null,
  descricao           text,
  modo_inscricao      text not null default 'inscricao' check (modo_inscricao in ('inscricao','checkin_livre')),
  inscricao_automatica boolean not null default false,
  data_inicio         timestamptz,
  data_fim            timestamptz,
  local               text,
  vagas_total         integer,
  tipo_tag            text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.subeventos enable row level security;

create policy "subeventos: leitura publica"
  on public.subeventos for select using (true);

create policy "subeventos: escrita autenticada"
  on public.subeventos for all
  using (auth.role() in ('authenticated','service_role'));

create trigger subeventos_updated_at
  before update on public.subeventos
  for each row execute function public.set_updated_at();

-- -------------------------------------------------------
-- 6. tipos_ingresso
-- -------------------------------------------------------
create table if not exists public.tipos_ingresso (
  id          uuid primary key default gen_random_uuid(),
  evento_id   uuid not null references public.eventos(id) on delete cascade,
  nome        text not null,
  descricao   text,
  vagas       integer,
  created_at  timestamptz not null default now()
);

alter table public.tipos_ingresso enable row level security;

create policy "tipos_ingresso: leitura publica"
  on public.tipos_ingresso for select using (true);

create policy "tipos_ingresso: escrita autenticada"
  on public.tipos_ingresso for all
  using (auth.role() in ('authenticated','service_role'));

-- -------------------------------------------------------
-- 7. perguntas_triagem
-- -------------------------------------------------------
create table if not exists public.perguntas_triagem (
  id                  uuid primary key default gen_random_uuid(),
  evento_id           uuid not null references public.eventos(id) on delete cascade,
  enunciado           text not null,
  tipo                text not null check (tipo in ('texto','escolha_unica','multipla_escolha')),
  opcoes              text[],
  obrigatoria         boolean not null default true,
  ordem               integer not null default 0,
  condicao_pergunta_id uuid references public.perguntas_triagem(id),
  condicao_valor      text,
  created_at          timestamptz not null default now()
);

alter table public.perguntas_triagem enable row level security;

create policy "perguntas_triagem: leitura publica"
  on public.perguntas_triagem for select using (true);

create policy "perguntas_triagem: escrita autenticada"
  on public.perguntas_triagem for all
  using (auth.role() in ('authenticated','service_role'));

-- -------------------------------------------------------
-- 8. inscricoes
-- -------------------------------------------------------
create table if not exists public.inscricoes (
  id               uuid primary key default gen_random_uuid(),
  participante_id  uuid not null references public.participantes(id),
  evento_id        uuid not null references public.eventos(id) on delete cascade,
  subevento_id     uuid references public.subeventos(id) on delete cascade,
  tipo_ingresso_id uuid references public.tipos_ingresso(id),
  status           text not null default 'confirmada' check (status in ('confirmada','cancelada','pendente')),
  qr_token         text not null unique default encode(gen_random_bytes(20), 'hex'),
  created_at       timestamptz not null default now(),
  unique (participante_id, evento_id, subevento_id)
);

alter table public.inscricoes enable row level security;

create policy "inscricoes: leitura autenticada"
  on public.inscricoes for select
  using (auth.role() in ('authenticated','service_role'));

create policy "inscricoes: escrita autenticada"
  on public.inscricoes for insert
  with check (auth.role() in ('authenticated','service_role'));

create policy "inscricoes: update autenticado"
  on public.inscricoes for update
  using (auth.role() in ('authenticated','service_role'));

-- -------------------------------------------------------
-- 9. respostas_triagem
-- -------------------------------------------------------
create table if not exists public.respostas_triagem (
  id          uuid primary key default gen_random_uuid(),
  inscricao_id uuid not null references public.inscricoes(id) on delete cascade,
  pergunta_id  uuid not null references public.perguntas_triagem(id),
  resposta    text,
  opcoes      text[],
  created_at  timestamptz not null default now()
);

alter table public.respostas_triagem enable row level security;

create policy "respostas_triagem: leitura autenticada"
  on public.respostas_triagem for select
  using (auth.role() in ('authenticated','service_role'));

create policy "respostas_triagem: escrita autenticada"
  on public.respostas_triagem for insert
  with check (auth.role() in ('authenticated','service_role'));

-- -------------------------------------------------------
-- 10. checkins
-- -------------------------------------------------------
create table if not exists public.checkins (
  id              uuid primary key default gen_random_uuid(),
  inscricao_id    uuid not null references public.inscricoes(id) on delete cascade,
  cancelado       boolean not null default false,
  cancelado_por   text,
  cancelado_em    timestamptz,
  motivo_cancel   text,
  origem          text not null default 'manual' check (origem in ('camera','usb','manual','correcao_admin')),
  feito_por       text,
  dispositivo_id  uuid,
  created_at      timestamptz not null default now()
);

-- Índice parcial: bloqueia duplo check-in ativo (permite correção)
create unique index if not exists checkins_inscricao_ativo_idx
  on public.checkins (inscricao_id)
  where cancelado = false;

alter table public.checkins enable row level security;

create policy "checkins: leitura autenticada"
  on public.checkins for select
  using (auth.role() in ('authenticated','service_role'));

create policy "checkins: escrita autenticada"
  on public.checkins for insert
  with check (auth.role() in ('authenticated','service_role'));

create policy "checkins: update autenticado"
  on public.checkins for update
  using (auth.role() in ('authenticated','service_role'));

-- -------------------------------------------------------
-- 11. dispositivos
-- -------------------------------------------------------
create table if not exists public.dispositivos (
  id               uuid primary key default gen_random_uuid(),
  tenant_id        uuid not null references public.tenants(id) on delete cascade,
  evento_id        uuid not null references public.eventos(id) on delete cascade,
  subevento_id     uuid references public.subeventos(id),
  nome             text not null,
  tipo             text not null check (tipo in ('fixo','movel')),
  ativo            boolean not null default true,
  codigo_sessao    text not null,
  codigo_expira_em timestamptz not null,
  created_at       timestamptz not null default now()
);

alter table public.dispositivos enable row level security;

create policy "dispositivos: leitura publica por codigo"
  on public.dispositivos for select using (true);

create policy "dispositivos: escrita autenticada"
  on public.dispositivos for all
  using (auth.role() in ('authenticated','service_role'));

-- -------------------------------------------------------
-- 12. visitas_subevento  (Modo B — sem UNIQUE)
-- -------------------------------------------------------
create table if not exists public.visitas_subevento (
  id            uuid primary key default gen_random_uuid(),
  subevento_id  uuid not null references public.subeventos(id) on delete cascade,
  inscricao_id  uuid not null references public.inscricoes(id),
  dispositivo_id uuid,
  created_at    timestamptz not null default now()
);

alter table public.visitas_subevento enable row level security;

create policy "visitas_subevento: leitura autenticada"
  on public.visitas_subevento for select
  using (auth.role() in ('authenticated','service_role'));

create policy "visitas_subevento: escrita autenticada"
  on public.visitas_subevento for insert
  with check (auth.role() in ('authenticated','service_role'));

-- -------------------------------------------------------
-- 13. links_expositor
-- -------------------------------------------------------
create table if not exists public.links_expositor (
  id           uuid primary key default gen_random_uuid(),
  subevento_id uuid not null references public.subeventos(id) on delete cascade,
  token        text not null unique default encode(gen_random_bytes(20), 'hex'),
  ativo        boolean not null default true,
  views        integer not null default 0,
  created_at   timestamptz not null default now()
);

alter table public.links_expositor enable row level security;

create policy "links_expositor: leitura publica por token"
  on public.links_expositor for select using (true);

create policy "links_expositor: escrita autenticada"
  on public.links_expositor for all
  using (auth.role() in ('authenticated','service_role'));
