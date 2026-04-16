import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import {
  type EventData,
  type Participant,
  type ScreeningQuestion,
  initialEvent,
  initialParticipants,
} from "@/lib/mock-data";

interface CheckInLog {
  name: string;
  time: string;
  origin: string;
}

interface EventStoreContextType {
  event: EventData;
  participants: Participant[];
  checkInLogs: CheckInLog[];
  updateEvent: (updates: Partial<EventData>) => void;
  addParticipant: (p: Participant) => void;
  doCheckIn: (token: string) => { status: "success" | "already" | "not_found"; participant?: Participant };
  addQuestion: (q: ScreeningQuestion) => void;
  updateQuestion: (id: string, q: Partial<ScreeningQuestion>) => void;
  deleteQuestion: (id: string) => void;
  reorderQuestions: (questions: ScreeningQuestion[]) => void;
}

const EventStoreContext = createContext<EventStoreContextType | undefined>(undefined);

export function EventStoreProvider({ children }: { children: ReactNode }) {
  const [event, setEvent] = useState<EventData>(initialEvent);
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
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

  const doCheckIn = useCallback((token: string): { status: "success" | "already" | "not_found"; participant?: Participant } => {
    const participant = participants.find((p) => p.token === token);
    if (!participant) {
      return { status: "not_found" };
    }
    if (participant.checkIn) {
      return { status: "already", participant };
    }
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
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

  return (
    <EventStoreContext.Provider
      value={{
        event,
        participants,
        checkInLogs,
        updateEvent,
        addParticipant,
        doCheckIn,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        reorderQuestions,
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
