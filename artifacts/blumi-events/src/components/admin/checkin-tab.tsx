import { useEventStore } from "@/hooks/use-event-store";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export function CheckinTab() {
  const { participants, checkInLogs } = useEventStore();
  const [, setLocation] = useLocation();

  const checkedIn = participants.filter((p) => p.checkIn).length;
  const total = participants.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-heading font-semibold text-[#314C5D]">
            Check-in ao vivo
          </h3>
          <p className="text-sm text-[#314C5D]/60 mt-1">
            {checkedIn} de {total} participantes presentes
          </p>
        </div>
        <Button
          data-testid="button-open-checkin"
          onClick={() => setLocation("/admin/checkin/evt-1")}
          className="bg-[#314C5D] text-white rounded-xl gap-2 hover:bg-[#314C5D]/90"
        >
          <ExternalLink size={16} />
          Abrir tela de check-in
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm font-semibold text-[#314C5D]">Últimos check-ins</p>
        </div>
        <div className="divide-y divide-gray-50">
          {checkInLogs.slice(0, 10).map((log, i) => (
            <div key={i} className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#DEFF66] text-[#314C5D] flex items-center justify-center text-xs font-bold">
                  {log.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <span className="font-medium text-sm">{log.name}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>{log.time}</span>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{log.origin}</span>
              </div>
            </div>
          ))}
          {checkInLogs.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">
              Nenhum check-in registrado ainda
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
