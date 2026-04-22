// Dados mock realistas para desenvolvimento local
// Nunca chega em produção (eliminado por tree-shaking via NODE_ENV guard)

export const MOCK_TENANTS = [
  {
    id: 'tenant-xp-001',
    nome: 'XP Inc',
    cor_primaria: '#F59E0B',
    external_company_id: 'company-xp-001',
    created_at: '2024-01-10T10:00:00Z',
    updated_at: '2024-01-10T10:00:00Z',
  },
  {
    id: 'tenant-nu-001',
    nome: 'Nubank',
    cor_primaria: '#8B5CF6',
    external_company_id: 'company-nu-001',
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
]

// Tabelas do Supabase Principal (gestão de empresas/módulos)
export const MOCK_COMPANIES = [
  { id: 'company-xp-001', name: 'XP Inc', created_at: '2024-01-10T10:00:00Z' },
  { id: 'company-nu-001', name: 'Nubank', created_at: '2024-01-15T10:00:00Z' },
]

export const MOCK_MODULOS = [
  { id: 'mod-eventos', slug: 'eventos', nome: 'Eventos', ativo: true },
  { id: 'mod-pesquisas', slug: 'pesquisas', nome: 'Pesquisas', ativo: true },
  { id: 'mod-vagas', slug: 'vagas', nome: 'Vagas', ativo: true },
]

export const MOCK_COMPANY_MODULOS = [
  { company_id: 'company-xp-001', modulo_id: 'mod-eventos', ativo: true, expira_em: null, config: null },
  { company_id: 'company-nu-001', modulo_id: 'mod-eventos', ativo: true, expira_em: null, config: null },
  { company_id: 'company-nu-001', modulo_id: 'mod-pesquisas', ativo: true, expira_em: null, config: null },
]

export const MOCK_PARTICIPANTES = [
  { id: 'part-001', nome: 'Ana Lima', email: 'ana@email.com', created_at: '2024-06-01T00:00:00Z' },
  { id: 'part-002', nome: 'Carlos Silva', email: 'carlos@email.com', created_at: '2024-06-02T00:00:00Z' },
  { id: 'part-003', nome: 'Beatriz Santos', email: 'bea@email.com', created_at: '2024-06-03T00:00:00Z' },
  { id: 'part-004', nome: 'Diego Alves', email: 'diego@email.com', created_at: '2024-06-04T00:00:00Z' },
  { id: 'part-005', nome: 'Fernanda Costa', email: 'fer@email.com', created_at: '2024-06-05T00:00:00Z' },
]

export const MOCK_EVENTOS = [
  {
    id: 'evt-workshop-xp',
    tenant_id: 'tenant-xp-001',
    nome: 'Workshop de Liderança XP 2025',
    slug: 'workshop-lideranca-xp-2025',
    tipo: 'simples',
    status: 'publicado',
    visibilidade: 'aberto',
    codigo_convite: null,
    descricao: 'Transforme sua liderança com as melhores práticas da XP. Um dia inteiro de imersão com os líderes da empresa, networking e dinâmicas exclusivas.',
    cidade: 'São Paulo',
    endereco: 'Av. Brigadeiro Faria Lima, 3900 — Itaim Bibi',
    data_inicio: '2025-08-15T09:00:00Z',
    data_fim: '2025-08-15T18:00:00Z',
    vagas_total: 200,
    emitir_certificados: true,
    carga_horaria: 8,
    created_at: '2025-06-01T10:00:00Z',
    updated_at: '2025-06-01T10:00:00Z',
  },
  {
    id: 'evt-feira-nu',
    tenant_id: 'tenant-nu-001',
    nome: 'Feira de Carreiras Nubank 2025',
    slug: 'feira-carreiras-nubank-2025',
    tipo: 'feira',
    status: 'publicado',
    visibilidade: 'aberto',
    codigo_convite: null,
    descricao: 'Conheça as oportunidades de carreira no Nubank. Três stands, uma palestra de abertura e muito networking com quem faz o roxinho funcionar.',
    cidade: 'São Paulo',
    endereco: 'Rua Capote Valente, 39 — Pinheiros',
    data_inicio: '2025-09-10T08:00:00Z',
    data_fim: '2025-09-11T18:00:00Z',
    vagas_total: 500,
    emitir_certificados: false,
    carga_horaria: null,
    created_at: '2025-07-01T10:00:00Z',
    updated_at: '2025-07-01T10:00:00Z',
  },
  {
    id: 'evt-summit-xp',
    tenant_id: 'tenant-xp-001',
    nome: 'Tech Summit XP 2024',
    slug: 'tech-summit-xp-2024',
    tipo: 'simples',
    status: 'encerrado',
    visibilidade: 'aberto',
    codigo_convite: null,
    descricao: 'O maior evento de tecnologia da XP Inc. Palestras, workshops e hackathon com os melhores da área.',
    cidade: 'São Paulo',
    endereco: 'Av. Brigadeiro Faria Lima, 3900 — Itaim Bibi',
    data_inicio: '2024-11-10T09:00:00Z',
    data_fim: '2024-11-11T18:00:00Z',
    vagas_total: 300,
    emitir_certificados: true,
    carga_horaria: 16,
    created_at: '2024-09-01T10:00:00Z',
    updated_at: '2024-12-01T10:00:00Z',
  },
  {
    id: 'evt-convite-xp',
    tenant_id: 'tenant-xp-001',
    nome: 'Masterclass Exclusiva XP',
    slug: 'masterclass-exclusiva-xp',
    tipo: 'simples',
    status: 'publicado',
    visibilidade: 'convite',
    codigo_convite: 'XPMASTER25',
    descricao: 'Masterclass exclusiva para parceiros estratégicos da XP.',
    cidade: 'São Paulo',
    endereco: 'Torre XP — Av. Chedid Jafet, 75',
    data_inicio: '2025-10-05T14:00:00Z',
    data_fim: '2025-10-05T18:00:00Z',
    vagas_total: 50,
    emitir_certificados: true,
    carga_horaria: 4,
    created_at: '2025-08-01T10:00:00Z',
    updated_at: '2025-08-01T10:00:00Z',
  },
]

export const MOCK_SUBEVENTOS = [
  {
    id: 'sub-eng-001',
    evento_id: 'evt-feira-nu',
    nome: 'Stand Engenharia',
    modo_inscricao: 'checkin_livre',
    inscricao_automatica: true,
    local: 'Espaço A — Térreo',
    tipo_tag: 'Engenharia',
    data_inicio: '2025-09-10T08:00:00Z',
    data_fim: '2025-09-11T18:00:00Z',
    vagas_total: null,
    created_at: '2025-07-01T10:00:00Z',
    updated_at: '2025-07-01T10:00:00Z',
  },
  {
    id: 'sub-produto-001',
    evento_id: 'evt-feira-nu',
    nome: 'Stand Produto & Design',
    modo_inscricao: 'checkin_livre',
    inscricao_automatica: true,
    local: 'Espaço B — Térreo',
    tipo_tag: 'Produto',
    data_inicio: '2025-09-10T08:00:00Z',
    data_fim: '2025-09-11T18:00:00Z',
    vagas_total: null,
    created_at: '2025-07-01T10:00:00Z',
    updated_at: '2025-07-01T10:00:00Z',
  },
  {
    id: 'sub-palestra-001',
    evento_id: 'evt-feira-nu',
    nome: 'Palestra de Abertura',
    modo_inscricao: 'inscricao',
    inscricao_automatica: false,
    local: 'Auditório Principal — 2º andar',
    tipo_tag: null,
    data_inicio: '2025-09-10T09:00:00Z',
    data_fim: '2025-09-10T11:00:00Z',
    vagas_total: 150,
    created_at: '2025-07-01T10:00:00Z',
    updated_at: '2025-07-01T10:00:00Z',
  },
]

export const MOCK_TIPOS_INGRESSO = [
  { id: 'tipo-001', evento_id: 'evt-workshop-xp', nome: 'Colaborador XP', descricao: null, created_at: '2025-06-01T10:00:00Z' },
  { id: 'tipo-002', evento_id: 'evt-workshop-xp', nome: 'Parceiro Estratégico', descricao: 'Empresas parceiras da XP', created_at: '2025-06-01T10:00:00Z' },
  { id: 'tipo-003', evento_id: 'evt-feira-nu', nome: 'Candidato Externo', descricao: null, created_at: '2025-07-01T10:00:00Z' },
]

export const MOCK_PERGUNTAS_TRIAGEM = [
  // Workshop XP
  {
    id: 'perg-001',
    evento_id: 'evt-workshop-xp',
    enunciado: 'Qual sua área de atuação?',
    tipo: 'escolha_unica',
    opcoes: ['Tecnologia', 'Finanças', 'Marketing', 'RH', 'Operações', 'Jurídico'],
    obrigatoria: true,
    ordem: 1,
    condicao_pergunta_id: null,
    condicao_valor: null,
  },
  {
    id: 'perg-002',
    evento_id: 'evt-workshop-xp',
    enunciado: 'Há quanto tempo você está na empresa?',
    tipo: 'escolha_unica',
    opcoes: ['Menos de 1 ano', '1 a 3 anos', '3 a 5 anos', 'Mais de 5 anos'],
    obrigatoria: true,
    ordem: 2,
    condicao_pergunta_id: null,
    condicao_valor: null,
  },
  // Feira Nubank
  {
    id: 'perg-003',
    evento_id: 'evt-feira-nu',
    enunciado: 'Qual cargo você está buscando?',
    tipo: 'texto',
    opcoes: null,
    obrigatoria: true,
    ordem: 1,
    condicao_pergunta_id: null,
    condicao_valor: null,
  },
  {
    id: 'perg-004',
    evento_id: 'evt-feira-nu',
    enunciado: 'Quais áreas te interessam?',
    tipo: 'multipla_escolha',
    opcoes: ['Engenharia', 'Produto', 'Design', 'Data Science', 'Operações', 'Marketing'],
    obrigatoria: false,
    ordem: 2,
    condicao_pergunta_id: null,
    condicao_valor: null,
  },
]

export const MOCK_INSCRICOES = [
  // Workshop XP — 3 inscrições
  { id: 'insc-001', participante_id: 'part-001', evento_id: 'evt-workshop-xp', subevento_id: null, tipo_ingresso_id: 'tipo-001', qr_token: 'qr-001-workshop', status: 'ativo', created_at: '2025-07-10T14:30:00Z', updated_at: '2025-07-10T14:30:00Z' },
  { id: 'insc-002', participante_id: 'part-002', evento_id: 'evt-workshop-xp', subevento_id: null, tipo_ingresso_id: 'tipo-001', qr_token: 'qr-002-workshop', status: 'ativo', created_at: '2025-07-11T09:15:00Z', updated_at: '2025-07-11T09:15:00Z' },
  { id: 'insc-003', participante_id: 'part-003', evento_id: 'evt-workshop-xp', subevento_id: null, tipo_ingresso_id: 'tipo-002', qr_token: 'qr-003-workshop', status: 'ativo', created_at: '2025-07-12T16:45:00Z', updated_at: '2025-07-12T16:45:00Z' },
  // Feira Nubank — 4 inscrições
  { id: 'insc-004', participante_id: 'part-001', evento_id: 'evt-feira-nu', subevento_id: null, tipo_ingresso_id: 'tipo-003', qr_token: 'qr-004-feira', status: 'ativo', created_at: '2025-08-01T10:00:00Z', updated_at: '2025-08-01T10:00:00Z' },
  { id: 'insc-005', participante_id: 'part-002', evento_id: 'evt-feira-nu', subevento_id: null, tipo_ingresso_id: 'tipo-003', qr_token: 'qr-005-feira', status: 'ativo', created_at: '2025-08-02T11:30:00Z', updated_at: '2025-08-02T11:30:00Z' },
  { id: 'insc-006', participante_id: 'part-003', evento_id: 'evt-feira-nu', subevento_id: null, tipo_ingresso_id: 'tipo-003', qr_token: 'qr-006-feira', status: 'ativo', created_at: '2025-08-03T08:00:00Z', updated_at: '2025-08-03T08:00:00Z' },
  { id: 'insc-007', participante_id: 'part-004', evento_id: 'evt-feira-nu', subevento_id: null, tipo_ingresso_id: 'tipo-003', qr_token: 'qr-007-feira', status: 'ativo', created_at: '2025-08-04T09:00:00Z', updated_at: '2025-08-04T09:00:00Z' },
  // Tech Summit XP (encerrado) — 3 inscrições
  { id: 'insc-008', participante_id: 'part-001', evento_id: 'evt-summit-xp', subevento_id: null, tipo_ingresso_id: null, qr_token: 'qr-008-summit', status: 'ativo', created_at: '2024-10-01T10:00:00Z', updated_at: '2024-10-01T10:00:00Z' },
  { id: 'insc-009', participante_id: 'part-002', evento_id: 'evt-summit-xp', subevento_id: null, tipo_ingresso_id: null, qr_token: 'qr-009-summit', status: 'ativo', created_at: '2024-10-02T11:00:00Z', updated_at: '2024-10-02T11:00:00Z' },
  { id: 'insc-010', participante_id: 'part-005', evento_id: 'evt-summit-xp', subevento_id: null, tipo_ingresso_id: null, qr_token: 'qr-010-summit', status: 'ativo', created_at: '2024-10-03T12:00:00Z', updated_at: '2024-10-03T12:00:00Z' },
]

export const MOCK_CHECKINS = [
  { id: 'ck-001', inscricao_id: 'insc-001', cancelado: false, origem: 'camera', feito_por: 'system', created_at: '2025-08-15T09:05:00Z' },
  { id: 'ck-002', inscricao_id: 'insc-002', cancelado: false, origem: 'usb',    feito_por: 'system', created_at: '2025-08-15T09:22:00Z' },
  { id: 'ck-003', inscricao_id: 'insc-004', cancelado: false, origem: 'camera', feito_por: 'system', created_at: '2025-09-10T08:03:00Z' },
  { id: 'ck-004', inscricao_id: 'insc-005', cancelado: false, origem: 'camera', feito_por: 'system', created_at: '2025-09-10T08:18:00Z' },
  { id: 'ck-005', inscricao_id: 'insc-008', cancelado: false, origem: 'manual', feito_por: 'system', created_at: '2024-11-10T09:30:00Z' },
]

export const MOCK_RESPOSTAS_TRIAGEM = [
  // insc-001 (part-001, Workshop XP)
  { id: 'resp-001', inscricao_id: 'insc-001', pergunta_id: 'perg-001', resposta: 'Tecnologia',    opcoes: null, created_at: '2025-07-10T14:30:00Z' },
  { id: 'resp-002', inscricao_id: 'insc-001', pergunta_id: 'perg-002', resposta: '1 a 3 anos',    opcoes: null, created_at: '2025-07-10T14:30:00Z' },
  // insc-002 (part-002, Workshop XP)
  { id: 'resp-003', inscricao_id: 'insc-002', pergunta_id: 'perg-001', resposta: 'Finanças',      opcoes: null, created_at: '2025-07-11T09:15:00Z' },
  { id: 'resp-004', inscricao_id: 'insc-002', pergunta_id: 'perg-002', resposta: 'Mais de 5 anos', opcoes: null, created_at: '2025-07-11T09:15:00Z' },
  // insc-003 (part-003, Workshop XP)
  { id: 'resp-005', inscricao_id: 'insc-003', pergunta_id: 'perg-001', resposta: 'Marketing',     opcoes: null, created_at: '2025-07-12T16:45:00Z' },
  { id: 'resp-006', inscricao_id: 'insc-003', pergunta_id: 'perg-002', resposta: 'Menos de 1 ano', opcoes: null, created_at: '2025-07-12T16:45:00Z' },
  // insc-004 (part-001, Feira Nubank)
  { id: 'resp-007', inscricao_id: 'insc-004', pergunta_id: 'perg-003', resposta: 'Engenheiro de Software Sênior', opcoes: null, created_at: '2025-08-01T10:00:00Z' },
  { id: 'resp-008', inscricao_id: 'insc-004', pergunta_id: 'perg-004', resposta: null, opcoes: ['Engenharia', 'Data Science'], created_at: '2025-08-01T10:00:00Z' },
  // insc-005 (part-002, Feira Nubank)
  { id: 'resp-009', inscricao_id: 'insc-005', pergunta_id: 'perg-003', resposta: 'Product Manager', opcoes: null, created_at: '2025-08-02T11:30:00Z' },
  { id: 'resp-010', inscricao_id: 'insc-005', pergunta_id: 'perg-004', resposta: null, opcoes: ['Produto', 'Design'], created_at: '2025-08-02T11:30:00Z' },
]

export const MOCK_DISPOSITIVOS = [
  {
    id: 'disp-001',
    evento_id: 'evt-workshop-xp',
    subevento_id: null,
    nome: 'Terminal Entrada Principal',
    tipo: 'camera',
    ativo: true,
    codigo_sessao: '123456',
    codigo_expira_em: '2027-01-01T00:00:00Z',
    created_at: '2025-07-01T00:00:00Z',
  },
  {
    id: 'disp-002',
    evento_id: 'evt-feira-nu',
    subevento_id: 'sub-eng-001',
    nome: 'Stand Engenharia — Leitor',
    tipo: 'camera',
    ativo: true,
    codigo_sessao: '654321',
    codigo_expira_em: '2027-01-01T00:00:00Z',
    created_at: '2025-08-01T00:00:00Z',
  },
]

export const MOCK_LINKS_EXPOSITOR = [
  {
    id: 'link-001',
    token: 'mock-expo-token-eng',
    subevento_id: 'sub-eng-001',
    ativo: true,
    views: 42,
    created_at: '2025-09-01T00:00:00Z',
  },
]

export const MOCK_VISITAS_SUBEVENTO = [
  { id: 'vis-001', subevento_id: 'sub-eng-001', inscricao_id: 'insc-004', created_at: '2025-09-10T08:05:00Z' },
  { id: 'vis-002', subevento_id: 'sub-eng-001', inscricao_id: 'insc-005', created_at: '2025-09-10T08:20:00Z' },
  { id: 'vis-003', subevento_id: 'sub-produto-001', inscricao_id: 'insc-004', created_at: '2025-09-10T09:10:00Z' },
]

export const INITIAL_DATA = {
  // Supabase Events
  tenants: MOCK_TENANTS,
  participantes: MOCK_PARTICIPANTES,
  eventos: MOCK_EVENTOS,
  subeventos: MOCK_SUBEVENTOS,
  tipos_ingresso: MOCK_TIPOS_INGRESSO,
  perguntas_triagem: MOCK_PERGUNTAS_TRIAGEM,
  inscricoes: MOCK_INSCRICOES,
  checkins: MOCK_CHECKINS,
  respostas_triagem: MOCK_RESPOSTAS_TRIAGEM,
  dispositivos: MOCK_DISPOSITIVOS,
  links_expositor: MOCK_LINKS_EXPOSITOR,
  visitas_subevento: MOCK_VISITAS_SUBEVENTO,
  // Supabase Principal
  companies: MOCK_COMPANIES,
  modulos: MOCK_MODULOS,
  company_modulos: MOCK_COMPANY_MODULOS,
}
