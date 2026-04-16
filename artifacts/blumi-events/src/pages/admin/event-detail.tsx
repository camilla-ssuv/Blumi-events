import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useEventStore } from "@/hooks/use-event-store";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParticipantsTab } from "@/components/admin/participants-tab";
import { QuestionsTab } from "@/components/admin/questions-tab";
import { CheckinTab } from "@/components/admin/checkin-tab";
import { SubeventosTab } from "@/components/admin/subeventos-tab";

export default function EventDetail() {
  const { event, participants } = useEventStore();
  const [activeTab, setActiveTab] = useState("participantes");

  const checkedIn = participants.filter((p) => p.checkIn).length;
  const totalRegistered = participants.length;
  const spotsRemaining = event.maxCapacity - totalRegistered;
  const attendanceRate = totalRegistered > 0 ? Math.round((checkedIn / totalRegistered) * 100) : 0;

  const isFeira = event.tipo === "feira";

  const statusConfig = {
    rascunho: { label: "Rascunho", className: "bg-gray-200 text-gray-700" },
    publicado: { label: "Publicado", className: "bg-[#DEFF66] text-[#314C5D]" },
    encerrado: { label: "Encerrado", className: "bg-[#FF6982] text-white" },
  };

  const status = statusConfig[event.status];

  return (
    <AdminLayout>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
          <h1 className="text-3xl font-heading font-bold text-[#314C5D]">
            {event.name}
          </h1>
          <Badge data-testid="badge-status" className={`${status.className} font-semibold text-sm px-3 py-1 rounded-full`}>
            {status.label}
          </Badge>
          {isFeira && (
            <Badge className="bg-[#29D4FF] text-white font-semibold text-sm px-3 py-1 rounded-full">
              Feira
            </Badge>
          )}
        </div>
        <p className="text-[#314C5D]/70">
          {event.date} | {event.time} | {event.venueName}, {event.venueAddress}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Inscritos" value={totalRegistered} data-testid="metric-registered" />
        <MetricCard label="Vagas restantes" value={spotsRemaining} data-testid="metric-spots" />
        <MetricCard label="Check-ins" value={checkedIn} data-testid="metric-checkins" />
        <MetricCard label="Taxa de presença" value={`${attendanceRate}%`} data-testid="metric-rate" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-gray-200 rounded-xl p-1 mb-6">
          <TabsTrigger
            value="participantes"
            data-testid="tab-participants"
            className="rounded-lg px-4 py-2 data-[state=active]:bg-[#314C5D] data-[state=active]:text-white"
          >
            Participantes
          </TabsTrigger>
          {isFeira && (
            <TabsTrigger
              value="subeventos"
              data-testid="tab-subeventos"
              className="rounded-lg px-4 py-2 data-[state=active]:bg-[#314C5D] data-[state=active]:text-white"
            >
              Subeventos
            </TabsTrigger>
          )}
          <TabsTrigger
            value="triagem"
            data-testid="tab-screening"
            className="rounded-lg px-4 py-2 data-[state=active]:bg-[#314C5D] data-[state=active]:text-white"
          >
            Perguntas de triagem
          </TabsTrigger>
          <TabsTrigger
            value="checkin"
            data-testid="tab-checkin-live"
            className="rounded-lg px-4 py-2 data-[state=active]:bg-[#314C5D] data-[state=active]:text-white"
          >
            Check-in ao vivo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="participantes">
          <ParticipantsTab />
        </TabsContent>
        {isFeira && (
          <TabsContent value="subeventos">
            <SubeventosTab />
          </TabsContent>
        )}
        <TabsContent value="triagem">
          <QuestionsTab />
        </TabsContent>
        <TabsContent value="checkin">
          <CheckinTab />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

function MetricCard({ label, value, ...props }: { label: string; value: string | number; "data-testid"?: string }) {
  return (
    <div
      className="bg-[#314C5D] rounded-2xl p-6 flex flex-col justify-between"
      data-testid={props["data-testid"]}
    >
      <p className="text-white/70 text-sm font-medium mb-2">{label}</p>
      <p className="text-[#DEFF66] text-4xl font-heading font-bold">{value}</p>
    </div>
  );
}
