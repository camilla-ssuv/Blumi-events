-- ============================================================
-- Blūmi Events — Seed de desenvolvimento
-- Execute APÓS o schema.sql
-- ============================================================

-- Tenant de teste
insert into public.tenants (id, external_company_id, nome, cor_primaria)
values (
  'aaaaaaaa-0000-0000-0000-000000000001',
  'dev-company-001',
  'Empresa Demo',
  '#314C5D'
) on conflict (external_company_id) do nothing;

-- Participantes de teste (os IDs devem bater com os UUIDs que o mock auth retorna)
insert into public.participantes (id, nome, email)
values
  ('bbbbbbbb-0000-0000-0000-000000000001', 'Admin Demo',       'admin@demo.dev'),
  ('bbbbbbbb-0000-0000-0000-000000000002', 'Operador Demo',    'operador@demo.dev'),
  ('bbbbbbbb-0000-0000-0000-000000000003', 'Participante Demo','participante@demo.dev')
on conflict (email) do nothing;

-- Evento simples publicado
insert into public.eventos (
  id, tenant_id, nome, slug, tipo, visibilidade, status,
  descricao, cidade, vagas_total, data_inicio, data_fim,
  emitir_certificados, certificado_titulo
) values (
  'cccccccc-0000-0000-0000-000000000001',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'Workshop de Inovação 2025',
  'workshop-inovacao-2025',
  'simples',
  'aberto',
  'publicado',
  'Um workshop prático sobre inovação corporativa com foco em jovens talentos.',
  'São Paulo, SP',
  100,
  now() + interval '7 days',
  now() + interval '7 days' + interval '8 hours',
  true,
  'Certificado de Participação'
) on conflict (slug) do nothing;

-- Pergunta de triagem para o evento
insert into public.perguntas_triagem (
  id, evento_id, enunciado, tipo, opcoes, obrigatoria, ordem
) values (
  'dddddddd-0000-0000-0000-000000000001',
  'cccccccc-0000-0000-0000-000000000001',
  'Qual é a sua área de atuação?',
  'escolha_unica',
  array['Tecnologia', 'Design', 'Negócios', 'Marketing', 'Outra'],
  true,
  1
),
(
  'dddddddd-0000-0000-0000-000000000002',
  'cccccccc-0000-0000-0000-000000000001',
  'Como ficou sabendo do evento?',
  'escolha_unica',
  array['LinkedIn', 'Instagram', 'Indicação', 'E-mail', 'Outro'],
  false,
  2
) on conflict do nothing;

-- Tipo de ingresso
insert into public.tipos_ingresso (id, evento_id, nome, vagas)
values (
  'eeeeeeee-0000-0000-0000-000000000001',
  'cccccccc-0000-0000-0000-000000000001',
  'Geral',
  80
) on conflict do nothing;

-- Evento feira publicado
insert into public.eventos (
  id, tenant_id, nome, slug, tipo, visibilidade, status,
  descricao, cidade, vagas_total, data_inicio, data_fim
) values (
  'cccccccc-0000-0000-0000-000000000002',
  'aaaaaaaa-0000-0000-0000-000000000001',
  'Feira de Carreiras Blūmi 2025',
  'feira-carreiras-blumi-2025',
  'feira',
  'aberto',
  'publicado',
  'A maior feira de talentos do Brasil. Conecte-se com as melhores empresas.',
  'São Paulo, SP',
  500,
  now() + interval '14 days',
  now() + interval '14 days' + interval '10 hours'
) on conflict (slug) do nothing;

-- Subeventos da feira
insert into public.subeventos (
  id, evento_id, nome, modo_inscricao, inscricao_automatica, tipo_tag, local
) values
(
  'ffffffff-0000-0000-0000-000000000001',
  'cccccccc-0000-0000-0000-000000000002',
  'Stand Nubank',
  'checkin_livre',
  false,
  'Fintech',
  'Espaço A - Mesa 1'
),
(
  'ffffffff-0000-0000-0000-000000000002',
  'cccccccc-0000-0000-0000-000000000002',
  'Stand BTG Pactual',
  'checkin_livre',
  false,
  'Investimentos',
  'Espaço A - Mesa 2'
),
(
  'ffffffff-0000-0000-0000-000000000003',
  'cccccccc-0000-0000-0000-000000000002',
  'Palestra: Carreira em Tech',
  'inscricao',
  false,
  'Tecnologia',
  'Auditório Principal'
) on conflict do nothing;

-- Inscrição do participante de teste no workshop
insert into public.inscricoes (
  id, participante_id, evento_id, tipo_ingresso_id, status
) values (
  '11111111-0000-0000-0000-000000000001',
  'bbbbbbbb-0000-0000-0000-000000000003',
  'cccccccc-0000-0000-0000-000000000001',
  'eeeeeeee-0000-0000-0000-000000000001',
  'confirmada'
) on conflict do nothing;

-- Inscrição do participante na feira
insert into public.inscricoes (
  id, participante_id, evento_id, status
) values (
  '11111111-0000-0000-0000-000000000002',
  'bbbbbbbb-0000-0000-0000-000000000003',
  'cccccccc-0000-0000-0000-000000000002',
  'confirmada'
) on conflict do nothing;
