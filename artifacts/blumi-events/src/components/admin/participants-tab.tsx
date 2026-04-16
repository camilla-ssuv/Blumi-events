import { useMemo, useState } from "react";
import { useEventStore } from "@/hooks/use-event-store";
import { generateCSV } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { Check, X, Download, Loader2 } from "lucide-react";

type PresenceFilter = "todos" | "presentes" | "ausentes";

export function ParticipantsTab() {
  const { participants, event } = useEventStore();
  const [presenceFilter, setPresenceFilter] = useState<PresenceFilter>("todos");
  const [isExporting, setIsExporting] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const filtered = useMemo(() => {
    if (presenceFilter === "presentes") return participants.filter((p) => p.checkIn);
    if (presenceFilter === "ausentes") return participants.filter((p) => !p.checkIn);
    return participants;
  }, [participants, presenceFilter]);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      generateCSV(filtered, event.slug || "evento");
      setIsExporting(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex gap-2">
          {(["todos", "presentes", "ausentes"] as PresenceFilter[]).map((f) => (
            <button
              key={f}
              data-testid={`filter-presence-${f}`}
              onClick={() => setPresenceFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                presenceFilter === f
                  ? "bg-[#314C5D] text-white"
                  : "bg-transparent border border-gray-300 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="flex flex-col items-end gap-1">
          <Button
            data-testid="button-export-csv"
            variant="outline"
            onClick={handleExport}
            disabled={isExporting || filtered.length === 0}
            className="border-[#314C5D] text-[#314C5D] hover:bg-[#314C5D]/5 rounded-xl gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Download size={16} />
                Baixar relatório de presença CSV
              </>
            )}
          </Button>
          <span className="text-xs text-gray-500">
            Exportando {filtered.length} participante{filtered.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 text-sm font-semibold text-[#314C5D]">Nome</th>
                <th className="text-left p-4 text-sm font-semibold text-[#314C5D]">E-mail</th>
                <th className="text-left p-4 text-sm font-semibold text-[#314C5D]">Token</th>
                <th className="text-left p-4 text-sm font-semibold text-[#314C5D]">Check-in</th>
                <th className="text-left p-4 text-sm font-semibold text-[#314C5D]">Hora</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-[#FBF7EB]/50 transition-colors" data-testid={`row-participant-${p.id}`}>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#314C5D] text-white flex items-center justify-center text-sm font-semibold">
                        {p.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <span className="font-medium">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{p.email}</td>
                  <td className="p-4">
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{p.token}</code>
                  </td>
                  <td className="p-4">
                    {p.checkIn ? (
                      <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                        <Check size={16} /> Sim
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-gray-400 text-sm">
                        <X size={16} /> Não
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {p.checkInTime || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showToast && (
        <div
          data-testid="toast-csv-success"
          className="fixed bottom-6 right-6 bg-[#314C5D] text-white px-5 py-3 rounded-xl shadow-lg z-50 text-sm font-medium animate-in fade-in slide-in-from-bottom-4"
        >
          CSV baixado com sucesso
        </div>
      )}
    </div>
  );
}
