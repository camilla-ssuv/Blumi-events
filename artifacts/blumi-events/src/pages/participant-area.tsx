import { useState } from "react";
import { ParticipantLayout } from "@/components/layout/participant-layout";
import { useEventStore } from "@/hooks/use-event-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Download } from "lucide-react";

function FakeQRCode({ token, size = 110 }: { token: string; size?: number }) {
  const seed = token.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const cells: boolean[][] = [];
  for (let i = 0; i < 11; i++) {
    const row: boolean[] = [];
    for (let j = 0; j < 11; j++) {
      const inCorner =
        (i < 3 && j < 3) ||
        (i < 3 && j > 7) ||
        (i > 7 && j < 3);
      if (inCorner) {
        const isOuter = i === 0 || i === 2 || j === 0 || j === 2 || i === 8 || i === 10 || j === 8 || j === 10;
        const isCenter = (i === 1 && j === 1) || (i === 1 && j === 9) || (i === 9 && j === 1);
        row.push(isOuter || isCenter);
      } else {
        row.push(((seed * (i + 1) * (j + 1) + i * 7 + j * 13) % 3) !== 0);
      }
    }
    cells.push(row);
  }
  const cellSize = size / 11;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg">
      <rect width={size} height={size} fill="white" />
      {cells.map((row, i) =>
        row.map((cell, j) =>
          cell ? (
            <rect key={`${i}-${j}`} x={j * cellSize} y={i * cellSize} width={cellSize} height={cellSize} fill="black" />
          ) : null
        )
      )}
    </svg>
  );
}

function formatSubTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function ParticipantArea() {
  const { event, participants, subeventoCheckins } = useEventStore();
  const [activeTab, setActiveTab] = useState("ativos");

  const myParticipant = participants[3];
  const mySubeventoIds = myParticipant?.inscricoes_subeventos || [];
  const mySubs = (event.subeventos || []).filter((s) => mySubeventoIds.includes(s.id));
  const isFeira = event.tipo === "feira";

  const pastEvent = {
    name: "Workshop de Data Science",
    date: "10/03/2025",
    time: "14h–17h",
    venueName: "Google Campus",
    venueAddress: "Rua Coronel Oscar Porto, 70, São Paulo",
  };

  const pastSubs = [
    { id: "past-sub-1", nome: "Palestra sobre ML em Finanças", tipo: "palestra", data_inicio: "2025-03-10T14:00:00", attended: true },
    { id: "past-sub-2", nome: "Stand Google Cloud", tipo: "stand", data_inicio: "2025-03-10T14:00:00", attended: false },
  ];

  return (
    <ParticipantLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-[#314C5D]">Minha Área</h1>
        <p className="text-[#314C5D]/60 mt-1">Gerencie suas inscrições e certificados</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-gray-200 rounded-xl p-1 mb-6">
          <TabsTrigger
            value="ativos"
            data-testid="tab-my-events"
            className="rounded-lg px-4 py-2 data-[state=active]:bg-[#314C5D] data-[state=active]:text-white"
          >
            Meus eventos
          </TabsTrigger>
          <TabsTrigger
            value="passados"
            data-testid="tab-past-events"
            className="rounded-lg px-4 py-2 data-[state=active]:bg-[#314C5D] data-[state=active]:text-white"
          >
            Eventos passados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ativos">
          <div className="space-y-6">
            <div
              data-testid="card-active-event"
              className="bg-white rounded-2xl border-2 border-[#314C5D] p-6 flex flex-col sm:flex-row gap-6"
            >
              <div className="flex-1">
                <h3 className="text-xl font-heading font-bold text-[#314C5D] mb-3">
                  {event.name}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#314C5D]" />
                    <span>{event.date} | {event.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#314C5D]" />
                    <span>{event.venueName}, {event.venueAddress}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#DEFF66] text-[#314C5D]">
                    Inscrito
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <FakeQRCode token={myParticipant?.token || "QR-004"} />
                <p className="text-xs text-gray-500 font-mono">{myParticipant?.token || "QR-004"}</p>
              </div>
            </div>

            {isFeira && mySubs.length > 0 && (
              <div>
                <h3 className="text-lg font-heading font-semibold text-[#314C5D] mb-4">
                  Suas atividades na feira
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {mySubs.map((s) => {
                    const checkedInSet = subeventoCheckins[s.id] || new Set();
                    const isPresente = myParticipant ? checkedInSet.has(myParticipant.id) : false;
                    const subToken = `QR-SUB-${s.id.replace("sub-", "")}`;

                    return (
                      <div
                        key={s.id}
                        data-testid={`card-sub-activity-${s.id}`}
                        className="bg-white rounded-2xl border border-gray-200 p-5"
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                            style={{ backgroundColor: s.cor_primaria || "#314C5D" }}
                          >
                            {s.logo_inicial}
                          </div>
                          <div className="min-w-0">
                            <p className="font-heading font-bold text-[#314C5D] text-sm leading-tight">{s.nome}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {formatSubTime(s.data_inicio)} – {formatSubTime(s.data_fim)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-end justify-between">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                            isPresente ? "bg-[#29D4FF]/10 text-[#29D4FF]" : "bg-green-100 text-green-700"
                          }`}>
                            {isPresente ? "Presente" : "Inscrito"}
                          </span>
                          <div className="flex flex-col items-center gap-1">
                            <FakeQRCode token={subToken} size={70} />
                            <p className="text-[10px] text-gray-400 font-mono">{subToken}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="passados">
          <div className="space-y-6">
            <div
              data-testid="card-past-event"
              className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col sm:flex-row gap-6 opacity-60 grayscale"
            >
              <div className="flex-1">
                <h3 className="text-xl font-heading font-bold text-[#314C5D] mb-3">
                  {pastEvent.name}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-[#314C5D]" />
                    <span>{pastEvent.date} | {pastEvent.time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#314C5D]" />
                    <span>{pastEvent.venueName}, {pastEvent.venueAddress}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-end">
                <Button
                  data-testid="button-download-certificate"
                  variant="outline"
                  className="border-[#314C5D] text-[#314C5D] rounded-xl gap-2"
                >
                  <Download size={16} />
                  Baixar certificado
                </Button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#314C5D] mb-3">Atividades neste evento</h4>
              <div className="space-y-2">
                {pastSubs.map((ps) => (
                  <div key={ps.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm text-[#314C5D]">{ps.nome}</p>
                      <p className="text-xs text-gray-500">{ps.tipo}</p>
                    </div>
                    {ps.attended ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-[#314C5D] text-[#314C5D] rounded-lg gap-1.5 text-xs"
                      >
                        <Download size={14} />
                        Baixar certificado
                      </Button>
                    ) : (
                      <span className="text-xs text-gray-400 font-medium">Não compareceu</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </ParticipantLayout>
  );
}
