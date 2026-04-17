import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

export function PrototypeBanner() {
  const { role, setRole } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-1.5 flex items-center justify-center gap-3 text-xs text-gray-600 z-50">
      <span className="font-medium">Protótipo — Entrar como:</span>
      <button
        onClick={() => { setRole("admin"); setLocation("/admin/eventos/evt-1"); }}
        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
          role === "admin" ? "bg-[#314C5D] text-white" : "bg-white border border-gray-300 hover:bg-gray-100"
        }`}
      >
        Admin
      </button>
      <button
        onClick={() => { setRole("participant"); setLocation("/eventos"); }}
        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
          role === "participant" ? "bg-[#314C5D] text-white" : "bg-white border border-gray-300 hover:bg-gray-100"
        }`}
      >
        Participante
      </button>
      {role && (
        <button
          onClick={() => { setRole(null); setLocation("/eventos"); }}
          className="px-2.5 py-1 rounded-md font-medium bg-white border border-gray-300 hover:bg-gray-100 transition-colors"
        >
          Sair
        </button>
      )}
    </div>
  );
}
