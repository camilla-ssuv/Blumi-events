export type TicketType = 'simples' | 'feira com stands';
export type QuestionType = 'texto livre' | 'seleção única' | 'múltipla escolha';

export interface ScreeningQuestion {
  id: string;
  statement: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
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
  status: 'rascunho' | 'publicado' | 'encerrado';
  questions: ScreeningQuestion[];
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  token: string;
  checkIn: boolean;
  checkInTime?: string;
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
  status: "publicado",
  questions: [
    { id: "q1", statement: "Qual é a sua área de atuação?", type: "seleção única", required: true, options: ["Tecnologia", "Finanças", "Marketing", "Outro"] },
    { id: "q2", statement: "Como ficou sabendo do evento?", type: "seleção única", required: false, options: ["LinkedIn", "Instagram", "Indicação", "E-mail"] }
  ]
};

export const initialParticipants: Participant[] = [
  { id: "p1", name: "Ana Costa", email: "ana@email.com", token: "QR-001", checkIn: true, checkInTime: "09:12" },
  { id: "p2", name: "Bruno Lima", email: "bruno@email.com", token: "QR-002", checkIn: true, checkInTime: "09:18" },
  { id: "p3", name: "Carla Souza", email: "carla@email.com", token: "QR-003", checkIn: true, checkInTime: "09:31" },
  { id: "p4", name: "Diego Alves", email: "diego@email.com", token: "QR-004", checkIn: false },
  { id: "p5", name: "Elena Rocha", email: "elena@email.com", token: "QR-005", checkIn: false },
  { id: "p6", name: "Felipe Dias", email: "felipe@email.com", token: "QR-006", checkIn: false },
  { id: "p7", name: "Gabriela Nunes", email: "gabriela@email.com", token: "QR-007", checkIn: false },
  { id: "p8", name: "Henrique Mota", email: "henrique@email.com", token: "QR-008", checkIn: false },
];
