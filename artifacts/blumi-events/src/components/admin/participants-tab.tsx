import { useEventStore } from "@/hooks/use-event-store";
import { Check, X } from "lucide-react";

export function ParticipantsTab() {
  const { participants } = useEventStore();

  return (
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
            {participants.map((p) => (
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
  );
}
