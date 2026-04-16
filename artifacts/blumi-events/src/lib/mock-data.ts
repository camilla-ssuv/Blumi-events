export type TicketType = 'simples' | 'feira com stands';
export type QuestionType = 'texto livre' | 'seleção única' | 'múltipla escolha';
export type ModoInscricao = 'inscricao' | 'checkin_livre';

export interface ScreeningQuestion {
  id: string;
  statement: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
}

export interface Subevento {
  id: string;
  evento_id: string;
  nome: string;
  tipo: 'stand' | 'palestra' | 'workshop' | 'outro';
  descricao: string;
  capacidade: number | null;
  data_inicio: string;
  data_fim: string;
  slug: string;
  logo_inicial: string;
  cor_primaria: string;
  modo_inscricao: ModoInscricao;
  inscricao_automatica: boolean;
  status: 'rascunho' | 'publicado' | 'encerrado';
  ordem: number;
  inscritos_count: number;
  presentes_count: number;
}

export interface EventData {
  id: string;
  slug: string;
  name: string;
  date: string;
  time: string;
  venueName: string;
  venueAddress: string;
  maxCapacity: number;
  type: TicketType;
  tipo: 'simples' | 'feira';
  status: 'rascunho' | 'publicado' | 'encerrado';
  visibilidade: 'aberto' | 'convite';
  questions: ScreeningQuestion[];
  subeventos?: Subevento[];
}

export interface CatalogEvent {
  id: string;
  slug: string;
  nome: string;
  tipo: 'simples' | 'feira';
  tipo_label: 'feira' | 'palestra' | 'workshop';
  empresa: string;
  logo_inicial: string;
  cor_primaria: string;
  data_inicio: string;
  local_nome: string;
  cidade: string;
  capacidade_total: number;
  vagas_restantes: number;
  visibilidade: 'aberto' | 'convite';
  status: 'rascunho' | 'publicado' | 'encerrado';
  subeventos_count: number;
  descricao: string;
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  token: string;
  checkIn: boolean;
  checkInTime?: string;
  inscricoes_subeventos?: string[];
}

export interface Inscricao {
  token: string;
  participante_id: string;
  subevento_id?: string | null;
  nome: string;
}

export const initialEvent: EventData = {
  id: "evt-1",
  slug: "imersao-quantdev-xp",
  name: "Imersão em QuantDev na XP Inc.",
  date: "15/05/2025",
  time: "9h–18h",
  venueName: "XP Inc.",
  venueAddress: "Av. Brigadeiro Faria Lima, 3500, São Paulo",
  maxCapacity: 500,
  type: "simples",
  tipo: "feira",
  status: "publicado",
  visibilidade: "aberto",
  questions: [
    { id: "q1", statement: "Qual é a sua área de atuação?", type: "seleção única", required: true, options: ["Tecnologia", "Finanças", "Marketing", "Outro"] },
    { id: "q2", statement: "Como ficou sabendo do evento?", type: "seleção única", required: false, options: ["LinkedIn", "Instagram", "Indicação", "E-mail"] }
  ],
  subeventos: [
    {
      id: "sub-001",
      evento_id: "evt-001",
      nome: "Stand XP Inc.",
      tipo: "stand",
      descricao: "Conheça as oportunidades de carreira na XP Inc. e converse com nosso time de talentos.",
      capacidade: null,
      data_inicio: "2025-05-15T09:00:00",
      data_fim: "2025-05-15T18:00:00",
      slug: "stand-xp-inc",
      logo_inicial: "XP",
      cor_primaria: "#FF6982",
      modo_inscricao: "checkin_livre",
      inscricao_automatica: false,
      status: "publicado",
      ordem: 1,
      inscritos_count: 0,
      presentes_count: 0,
    },
    {
      id: "sub-002",
      evento_id: "evt-001",
      nome: "Workshop de Quant Finance",
      tipo: "workshop",
      descricao: "Workshop prático de 2h com casos reais de finanças quantitativas. Vagas limitadas.",
      capacidade: 30,
      data_inicio: "2025-05-15T10:00:00",
      data_fim: "2025-05-15T12:00:00",
      slug: "workshop-quant-finance",
      logo_inicial: "QF",
      cor_primaria: "#29D4FF",
      modo_inscricao: "inscricao",
      inscricao_automatica: false,
      status: "publicado",
      ordem: 2,
      inscritos_count: 24,
      presentes_count: 0,
    },
    {
      id: "sub-003",
      evento_id: "evt-001",
      nome: "Palestra de Abertura — O futuro do QuantDev",
      tipo: "palestra",
      descricao: "Palestra de abertura com o CEO da XP Inc. sobre o futuro das finanças quantitativas no Brasil.",
      capacidade: 500,
      data_inicio: "2025-05-15T09:30:00",
      data_fim: "2025-05-15T10:00:00",
      slug: "palestra-abertura",
      logo_inicial: "PA",
      cor_primaria: "#DEFF66",
      modo_inscricao: "inscricao",
      inscricao_automatica: true,
      status: "publicado",
      ordem: 3,
      inscritos_count: 498,
      presentes_count: 0,
    },
    {
      id: "sub-004",
      evento_id: "evt-001",
      nome: "Stand BTG Pactual",
      tipo: "stand",
      descricao: "Oportunidades em tecnologia e finanças no BTG Pactual. Traga seu currículo!",
      capacidade: null,
      data_inicio: "2025-05-15T09:00:00",
      data_fim: "2025-05-15T18:00:00",
      slug: "stand-btg-pactual",
      logo_inicial: "BT",
      cor_primaria: "#314C5D",
      modo_inscricao: "checkin_livre",
      inscricao_automatica: false,
      status: "publicado",
      ordem: 4,
      inscritos_count: 0,
      presentes_count: 0,
    },
  ],
};

export const initialParticipants: Participant[] = [
  { id: "p1", name: "Ana Costa", email: "ana@email.com", token: "QR-001", checkIn: true, checkInTime: "09:12", inscricoes_subeventos: ["sub-003"] },
  { id: "p2", name: "Bruno Lima", email: "bruno@email.com", token: "QR-002", checkIn: true, checkInTime: "09:18", inscricoes_subeventos: ["sub-003"] },
  { id: "p3", name: "Carla Souza", email: "carla@email.com", token: "QR-003", checkIn: true, checkInTime: "09:31", inscricoes_subeventos: ["sub-003"] },
  { id: "p4", name: "Diego Alves", email: "diego@email.com", token: "QR-004", checkIn: false, inscricoes_subeventos: ["sub-002", "sub-003"] },
  { id: "p5", name: "Elena Rocha", email: "elena@email.com", token: "QR-005", checkIn: false, inscricoes_subeventos: ["sub-002", "sub-003"] },
  { id: "p6", name: "Felipe Dias", email: "felipe@email.com", token: "QR-006", checkIn: false, inscricoes_subeventos: [] },
  { id: "p7", name: "Gabriela Nunes", email: "gabriela@email.com", token: "QR-007", checkIn: false, inscricoes_subeventos: [] },
  { id: "p8", name: "Henrique Mota", email: "henrique@email.com", token: "QR-008", checkIn: false, inscricoes_subeventos: [] },
];

export const mockSubeventoInscricoes: Inscricao[] = [
  { token: "QR-SUB-001", participante_id: "p4", subevento_id: "sub-002", nome: "Diego Alves" },
  { token: "QR-SUB-002", participante_id: "p5", subevento_id: "sub-002", nome: "Elena Rocha" },
  { token: "QR-SUB-003", participante_id: "p1", subevento_id: "sub-003", nome: "Ana Costa" },
  { token: "QR-SUB-004", participante_id: "p2", subevento_id: "sub-003", nome: "Bruno Lima" },
  { token: "QR-SUB-005", participante_id: "p3", subevento_id: "sub-003", nome: "Carla Souza" },
  { token: "QR-SUB-006", participante_id: "p4", subevento_id: "sub-003", nome: "Diego Alves" },
  { token: "QR-SUB-007", participante_id: "p5", subevento_id: "sub-003", nome: "Elena Rocha" },
];

export const catalogEvents: CatalogEvent[] = [
  {
    id: "evt-1",
    slug: "imersao-quantdev-xp",
    nome: "Imersão em QuantDev na XP Inc.",
    tipo: "feira",
    tipo_label: "feira",
    empresa: "XP Inc.",
    logo_inicial: "XP",
    cor_primaria: "#314C5D",
    data_inicio: "2025-05-15T09:00:00",
    local_nome: "XP Inc.",
    cidade: "São Paulo",
    capacidade_total: 500,
    vagas_restantes: 423,
    visibilidade: "aberto",
    status: "publicado",
    subeventos_count: 4,
    descricao: "Uma experiência imersiva de um dia inteiro dedicada à interseção entre finanças quantitativas e tecnologia.",
  },
  {
    id: "evt-002",
    slug: "feira-carreiras-btg-2025",
    nome: "Feira de Carreiras BTG Pactual 2025",
    tipo: "feira",
    tipo_label: "feira",
    empresa: "BTG Pactual",
    logo_inicial: "BT",
    cor_primaria: "#314C5D",
    data_inicio: "2025-06-10T09:00:00",
    local_nome: "BTG Pactual — Torre B",
    cidade: "São Paulo",
    capacidade_total: 1500,
    vagas_restantes: 1243,
    visibilidade: "aberto",
    status: "publicado",
    subeventos_count: 6,
    descricao: "A maior feira de carreiras do BTG Pactual. Conecte-se com nosso time de tecnologia, finanças e operações.",
  },
  {
    id: "evt-003",
    slug: "workshop-python-financas-xp",
    nome: "Workshop de Python para Finanças — XP Inc.",
    tipo: "simples",
    tipo_label: "workshop",
    empresa: "XP Inc.",
    logo_inicial: "XP",
    cor_primaria: "#FF6982",
    data_inicio: "2025-05-28T14:00:00",
    local_nome: "Online — Zoom",
    cidade: "Remoto",
    capacidade_total: 100,
    vagas_restantes: 12,
    visibilidade: "convite",
    status: "publicado",
    subeventos_count: 0,
    descricao: "Workshop intensivo de Python aplicado a finanças quantitativas. Vagas muito limitadas.",
  },
  {
    id: "evt-004",
    slug: "palestra-futuro-mercado-financeiro",
    nome: "Palestra: O Futuro do Mercado Financeiro Brasileiro",
    tipo: "simples",
    tipo_label: "palestra",
    empresa: "Blūmi Talents",
    logo_inicial: "BL",
    cor_primaria: "#DEFF66",
    data_inicio: "2025-07-03T19:00:00",
    local_nome: "Auditório Faria Lima",
    cidade: "São Paulo",
    capacidade_total: 300,
    vagas_restantes: 287,
    visibilidade: "aberto",
    status: "publicado",
    subeventos_count: 0,
    descricao: "Uma noite de debates sobre tendências, regulação e oportunidades no mercado financeiro brasileiro.",
  },
];
