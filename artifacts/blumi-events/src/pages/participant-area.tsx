import { useState } from "react";
import { ParticipantLayout } from "@/components/layout/participant-layout";
import { useEventStore } from "@/hooks/use-event-store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Download } from "lucide-react";

function FakeQRCode({ token }: { token: string }) {
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

  return (
    <svg width="110" height="110" viewBox="0 0 110 110" className="rounded-lg">
      <rect width="110" height="110" fill="white" />
      {cells.map((row, i) =>
        row.map((cell, j) =>
          cell ? (
            <rect key={`${i}-${j}`} x={j * 10} y={i * 10} width="10" height="10" fill="black" />
          ) : null
        )
      )}
    </svg>
  );
}

export default function ParticipantArea() {
  const { event, participants } = useEventStore();
  const [activeTab, setActiveTab] = useState("ativos");

  const myParticipant = participants[3];

  const pastEvent = {
    name: "Workshop de Data Science",
    date: "10/03/2025",
    time: "14h–17h",
    venueName: "Google Campus",
    venueAddress: "Rua Coronel Oscar Porto, 70, São Paulo",
  };

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
          <div className="space-y-4">
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
          </div>
        </TabsContent>

        <TabsContent value="passados">
          <div className="space-y-4">
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
          </div>
        </TabsContent>
      </Tabs>
    </ParticipantLayout>
  );
}
