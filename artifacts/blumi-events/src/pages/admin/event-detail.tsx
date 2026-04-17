import { useState } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useEventStore } from "@/hooks/use-event-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ParticipantsTab } from "@/components/admin/participants-tab";
import { QuestionsTab } from "@/components/admin/questions-tab";
import { CheckinTab } from "@/components/admin/checkin-tab";
import { SubeventosTab } from "@/components/admin/subeventos-tab";
import { QrCode, Users, Ticket, CheckCircle2, TrendingUp } from "lucide-react";

export default function EventDetail() {
  const { event, participants } = useEventStore();
  const [, setLocation] = useLocation();
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
          <Button
            onClick={() => setLocation(`/admin/checkin/${event.id}`)}
            className="bg-[#DEFF66] text-[#314C5D] font-bold rounded-xl hover:bg-[#c9eb55] gap-2 ml-auto"
          >
            <QrCode size={18} />
            Iniciar check-in
          </Button>
        </div>
        <p className="text-[#314C5D]/70">
          {event.date} | {event.time} | {event.venueName}, {event.venueAddress}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Inscritos"
          value={totalRegistered}
          accent="#314C5D"
          icon={<Users size={16} />}
          context={`de ${event.maxCapacity} vagas`}
          data-testid="metric-registered"
        />
        <MetricCard
          label="Vagas restantes"
          value={spotsRemaining}
          accent="#29D4FF"
          icon={<Ticket size={16} />}
          context={`${Math.round((spotsRemaining / event.maxCapacity) * 100)}% disponível`}
          data-testid="metric-spots"
        />
        <MetricCard
          label="Check-ins"
          value={checkedIn}
          accent="#DEFF66"
          icon={<CheckCircle2 size={16} />}
          context={`de ${totalRegistered} inscritos`}
          data-testid="metric-checkins"
        />
        <MetricCard
          label="Taxa de presença"
          value={`${attendanceRate}%`}
          accent="#FF6982"
          icon={<TrendingUp size={16} />}
          context="presentes / inscritos"
          data-testid="metric-rate"
        />
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

function MetricCard({
  label,
  value,
  accent,
  icon,
  context,
  ...props
}: {
  label: string;
  value: string | number;
  accent: string;
  icon: React.ReactNode;
  context: string;
  "data-testid"?: string;
}) {
  return (
    <div
      className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4 hover:shadow-sm transition-shadow"
      data-testid={props["data-testid"]}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: accent }}
            aria-hidden
          />
          <p className="text-sm font-medium text-gray-600">{label}</p>
        </div>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${accent}1A`, color: accent }}
          aria-hidden
        >
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-[#314C5D] text-4xl font-heading font-bold leading-none">
          {value}
        </p>
      </div>
      <p className="text-xs text-gray-500 -mt-1">{context}</p>
    </div>
  );
}
