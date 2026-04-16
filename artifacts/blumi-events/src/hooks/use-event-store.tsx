import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  type EventData,
  type Participant,
  type ScreeningQuestion,
  type Subevento,
  type Inscricao,
  type CatalogEvent,
  initialEvent,
  initialParticipants,
  mockSubeventoInscricoes,
  catalogEvents,
} from "@/lib/mock-data";

interface CheckInLog {
  name: string;
  time: string;
  origin: string;
}

type CheckInResult = {
  status: "success" | "already" | "not_found" | "not_subscribed";
  participant?: Participant;
  label?: string;
};

interface EventStoreContextType {
  event: EventData;
  participants: Participant[];
  checkInLogs: CheckInLog[];
  subeventoInscricoes: Inscricao[];
  subeventoCheckins: Record<string, Set<string>>;
  catalogEventsList: CatalogEvent[];
  updateEvent: (updates: Partial<EventData>) => void;
  addParticipant: (p: Participant) => void;
  doCheckIn: (token: string) => CheckInResult;
  doSubeventoCheckIn: (token: string, subevento: Subevento) => CheckInResult;
  addQuestion: (q: ScreeningQuestion) => void;
  updateQuestion: (id: string, q: Partial<ScreeningQuestion>) => void;
  deleteQuestion: (id: string) => void;
  reorderQuestions: (questions: ScreeningQuestion[]) => void;
  addSubevento: (s: Subevento) => void;
  updateSubevento: (id: string, updates: Partial<Subevento>) => void;
  deleteSubevento: (id: string) => void;
  addCatalogEvent: (e: CatalogEvent) => void;
}

const EventStoreContext = createContext<EventStoreContextType | undefined>(undefined);

export function EventStoreProvider({ children }: { children: ReactNode }) {
  const [event, setEvent] = useState<EventData>(initialEvent);
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [subeventoInscricoes] = useState<Inscricao[]>(mockSubeventoInscricoes);
  const [subeventoCheckins, setSubeventoCheckins] = useState<Record<string, Set<string>>>({});
  const [catalogEventsList, setCatalogEventsList] = useState<CatalogEvent[]>(catalogEvents);
  const [checkInLogs, setCheckInLogs] = useState<CheckInLog[]>([
    { name: "Ana Costa", time: "09:12", origin: "QR Scanner" },
    { name: "Bruno Lima", time: "09:18", origin: "QR Scanner" },
    { name: "Carla Souza", time: "09:31", origin: "QR Scanner" },
  ]);

  const updateEvent = useCallback((updates: Partial<EventData>) => {
    setEvent((prev) => ({ ...prev, ...updates }));
  }, []);

  const addParticipant = useCallback((p: Participant) => {
    setParticipants((prev) => [...prev, p]);
  }, []);

  const getTimeStr = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  };

  const doCheckIn = useCallback((token: string): CheckInResult => {
    const participant = participants.find((p) => p.token === token);
    if (!participant) {
      return { status: "not_found" };
    }
    if (participant.checkIn) {
      return { status: "already", participant };
    }
    const timeStr = getTimeStr();
    setParticipants((prev) =>
      prev.map((p) =>
        p.token === token ? { ...p, checkIn: true, checkInTime: timeStr } : p
      )
    );
    setCheckInLogs((prev) => [
      { name: participant.name, time: timeStr, origin: "QR Scanner" },
      ...prev,
    ]);
    return { status: "success", participant };
  }, [participants]);

  const doSubeventoCheckIn = useCallback((token: string, subevento: Subevento): CheckInResult => {
    const trackSubeventoCheckin = (participantId: string, subeventoId: string) => {
      setSubeventoCheckins((prev) => {
        const existing = prev[subeventoId] || new Set();
        const updated = new Set(existing);
        updated.add(participantId);
        return { ...prev, [subeventoId]: updated };
      });
    };

    if (subevento.modo_inscricao === "checkin_livre") {
      const participant = participants.find((p) => p.token === token);
      if (!participant) {
        return { status: "not_found" };
      }
      const timeStr = getTimeStr();
      setEvent((prev) => ({
        ...prev,
        subeventos: prev.subeventos?.map((s) =>
          s.id === subevento.id ? { ...s, presentes_count: s.presentes_count + 1 } : s
        ),
      }));
      trackSubeventoCheckin(participant.id, subevento.id);
      setCheckInLogs((prev) => [
        { name: participant.name, time: timeStr, origin: subevento.nome },
        ...prev,
      ]);
      return { status: "success", participant, label: `Visita registrada — ${subevento.nome}` };
    }

    const inscricao = subeventoInscricoes.find(
      (i) => i.token === token && i.subevento_id === subevento.id
    );
    if (!inscricao) {
      const participant = participants.find((p) => p.token === token);
      if (participant) {
        return { status: "not_subscribed", participant };
      }
      return { status: "not_found" };
    }

    const participant = participants.find((p) => p.id === inscricao.participante_id);
    if (!participant) {
      return { status: "not_found" };
    }

    const timeStr = getTimeStr();
    setEvent((prev) => ({
      ...prev,
      subeventos: prev.subeventos?.map((s) =>
        s.id === subevento.id ? { ...s, presentes_count: s.presentes_count + 1 } : s
      ),
    }));
    trackSubeventoCheckin(participant.id, subevento.id);
    setCheckInLogs((prev) => [
      { name: participant.name, time: timeStr, origin: subevento.nome },
      ...prev,
    ]);
    return { status: "success", participant };
  }, [participants, subeventoInscricoes]);

  const addQuestion = useCallback((q: ScreeningQuestion) => {
    setEvent((prev) => ({ ...prev, questions: [...prev.questions, q] }));
  }, []);

  const updateQuestion = useCallback((id: string, updates: Partial<ScreeningQuestion>) => {
    setEvent((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === id ? { ...q, ...updates } : q)),
    }));
  }, []);

  const deleteQuestion = useCallback((id: string) => {
    setEvent((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== id),
    }));
  }, []);

  const reorderQuestions = useCallback((questions: ScreeningQuestion[]) => {
    setEvent((prev) => ({ ...prev, questions }));
  }, []);

  const addSubevento = useCallback((s: Subevento) => {
    setEvent((prev) => ({
      ...prev,
      subeventos: [...(prev.subeventos || []), s],
    }));
  }, []);

  const updateSubevento = useCallback((id: string, updates: Partial<Subevento>) => {
    setEvent((prev) => ({
      ...prev,
      subeventos: prev.subeventos?.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  }, []);

  const deleteSubevento = useCallback((id: string) => {
    setEvent((prev) => ({
      ...prev,
      subeventos: prev.subeventos?.filter((s) => s.id !== id),
    }));
  }, []);

  const addCatalogEvent = useCallback((e: CatalogEvent) => {
    setCatalogEventsList((prev) => [...prev, e]);
  }, []);

  return (
    <EventStoreContext.Provider
      value={{
        event,
        participants,
        checkInLogs,
        subeventoInscricoes,
        subeventoCheckins,
        catalogEventsList,
        updateEvent,
        addParticipant,
        doCheckIn,
        doSubeventoCheckIn,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        reorderQuestions,
        addSubevento,
        updateSubevento,
        deleteSubevento,
        addCatalogEvent,
      }}
    >
      {children}
    </EventStoreContext.Provider>
  );
}

export function useEventStore() {
  const context = useContext(EventStoreContext);
  if (context === undefined) {
    throw new Error("useEventStore must be used within an EventStoreProvider");
  }
  return context;
}
