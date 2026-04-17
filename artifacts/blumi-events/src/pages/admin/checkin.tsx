import { useState, useRef, useEffect, useCallback } from "react";
import { useEventStore } from "@/hooks/use-event-store";
import { useLocation } from "wouter";
import { Search, ArrowLeft, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Subevento } from "@/lib/mock-data";

type CheckinResult = {
  status: "success" | "already" | "not_found" | "not_subscribed";
  name?: string;
  initials?: string;
  time?: string;
  label?: string;
} | null;

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.3;
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch {
    // silently fail
  }
}

export default function CheckinPage() {
  const { event, participants, checkInLogs, doCheckIn, doSubeventoCheckIn } = useEventStore();
  const [, setLocation] = useLocation();
  const [scanInput, setScanInput] = useState("");
  const [result, setResult] = useState<CheckinResult>(null);
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTarget, setSelectedTarget] = useState<string>("geral");
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const checkedIn = participants.filter((p) => p.checkIn).length;
  const publishedSubeventos = (event.subeventos || []).filter((s) => s.status === "publicado");
  const selectedSubevento = publishedSubeventos.find((s) => s.id === selectedTarget);

  const targetLabel = selectedTarget === "geral"
    ? "Evento geral"
    : selectedSubevento?.nome || "Evento geral";

  useEffect(() => {
    if (!showManualSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showManualSearch, result]);

  const handleScan = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && scanInput.trim()) {
      const token = scanInput.trim();

      if (selectedTarget === "geral") {
        const res = doCheckIn(token);
        if (res.status === "success" && res.participant) {
          playBeep();
          setResult({
            status: "success",
            name: res.participant.name,
            initials: res.participant.name.split(" ").map((n) => n[0]).join(""),
            label: "Check-in confirmado!",
          });
        } else if (res.status === "already" && res.participant) {
          setResult({
            status: "already",
            name: res.participant.name,
            time: res.participant.checkInTime,
          });
        } else {
          setResult({ status: "not_found" });
        }
      } else if (selectedSubevento) {
        const res = doSubeventoCheckIn(token, selectedSubevento);
        if (res.status === "success" && res.participant) {
          playBeep();
          setResult({
            status: "success",
            name: res.participant.name,
            initials: res.participant.name.split(" ").map((n) => n[0]).join(""),
            label: res.label || "Check-in confirmado!",
          });
        } else if (res.status === "not_subscribed" && res.participant) {
          setResult({
            status: "not_subscribed",
            name: res.participant.name,
          });
        } else {
          setResult({ status: "not_found" });
        }
      }
      setScanInput("");
      setTimeout(() => setResult(null), 4000);
    }
  }, [scanInput, doCheckIn, doSubeventoCheckIn, selectedTarget, selectedSubevento]);

  const handleManualCheckIn = (token: string) => {
    if (selectedTarget === "geral") {
      const res = doCheckIn(token);
      if (res.status === "success" && res.participant) {
        playBeep();
        setResult({
          status: "success",
          name: res.participant.name,
          initials: res.participant.name.split(" ").map((n) => n[0]).join(""),
          label: "Check-in confirmado!",
        });
      } else if (res.status === "already" && res.participant) {
        setResult({
          status: "already",
          name: res.participant.name,
          time: res.participant.checkInTime,
        });
      }
    } else if (selectedSubevento) {
      const res = doSubeventoCheckIn(token, selectedSubevento);
      if (res.status === "success" && res.participant) {
        playBeep();
        setResult({
          status: "success",
          name: res.participant.name,
          initials: res.participant.name.split(" ").map((n) => n[0]).join(""),
          label: res.label || "Check-in confirmado!",
        });
      } else if (res.status === "not_subscribed" && res.participant) {
        setResult({
          status: "not_subscribed",
          name: res.participant.name,
        });
      } else {
        setResult({ status: "not_found" });
      }
    }
    setShowManualSearch(false);
    setSearchQuery("");
    setTimeout(() => setResult(null), 4000);
  };

  const filteredParticipants = searchQuery
    ? participants.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.token.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : participants;

  return (
    <div className="min-h-screen bg-[#314C5D] text-white flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <button
          data-testid="button-back"
          onClick={() => setLocation("/admin/eventos/evt-1")}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm">Voltar ao painel do evento</span>
        </button>
        <span className="font-heading font-bold text-lg">{event.name}</span>
        <Button
          data-testid="button-manual-search"
          onClick={() => {
            setShowManualSearch(true);
            setTimeout(() => searchInputRef.current?.focus(), 100);
          }}
          variant="ghost"
          className="text-white/70 hover:text-white hover:bg-white/10 gap-2"
        >
          <Search size={16} />
          Busca manual
        </Button>
      </div>

      {publishedSubeventos.length > 0 && (
        <div className="flex items-center justify-center p-3 border-b border-white/10 bg-white/5">
          <div className="relative">
            <button
              data-testid="dropdown-checkin-target"
              onClick={() => setShowDropdown(!showDropdown)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 transition-colors text-sm font-medium"
            >
              Check-in para: <span className="text-[#DEFF66] font-bold">{targetLabel}</span>
              <ChevronDown size={16} className={`transition-transform ${showDropdown ? "rotate-180" : ""}`} />
            </button>
            {showDropdown && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl shadow-xl overflow-hidden z-50 min-w-[240px]">
                <button
                  onClick={() => { setSelectedTarget("geral"); setShowDropdown(false); }}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${
                    selectedTarget === "geral" ? "bg-[#F5F6F8] text-[#314C5D] font-semibold" : "text-gray-700"
                  }`}
                >
                  Evento geral
                </button>
                {publishedSubeventos.map((s) => (
                  <button
                    key={s.id}
                    data-testid={`dropdown-target-${s.id}`}
                    onClick={() => { setSelectedTarget(s.id); setShowDropdown(false); }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors flex items-center gap-3 ${
                      selectedTarget === s.id ? "bg-[#F5F6F8] text-[#314C5D] font-semibold" : "text-gray-700"
                    }`}
                  >
                    <div
                      className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: s.cor_primaria }}
                    >
                      {s.logo_inicial}
                    </div>
                    <span>{s.nome}</span>
                    <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded font-medium ${
                      s.modo_inscricao === "inscricao" ? "bg-[#314C5D] text-white" : "bg-[#FF6982] text-white"
                    }`}>
                      {s.modo_inscricao === "inscricao" ? "Pre-inscr." : "Livre"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-8">
          <div className="text-7xl md:text-9xl font-heading font-bold text-[#DEFF66]">
            {selectedTarget === "geral" ? checkedIn : selectedSubevento?.presentes_count ?? 0}
            <span className="text-3xl md:text-5xl text-white/50">
              {" / "}
              {selectedTarget === "geral"
                ? event.maxCapacity
                : selectedSubevento?.capacidade ?? "---"}
            </span>
          </div>
          <p className="text-white/60 text-lg mt-2">presentes</p>
        </div>

        <div className="w-full max-w-xl mb-8">
          <input
            ref={inputRef}
            data-testid="input-scan"
            type="text"
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            onKeyDown={handleScan}
            placeholder="Aguardando leitura do QR code..."
            className="w-full h-16 bg-white/10 border border-white/20 rounded-2xl px-6 text-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#DEFF66] focus:border-transparent text-center"
          />
        </div>

        {result && (
          <div className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            {result.status === "success" && (
              <div className="bg-green-500 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                  {result.initials}
                </div>
                <div>
                  <p className="font-heading font-bold text-xl">{result.name}</p>
                  <p className="text-white/80">{result.label}</p>
                </div>
              </div>
            )}
            {result.status === "already" && (
              <div className="bg-[#FF6982] rounded-2xl p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                  !!
                </div>
                <div>
                  <p className="font-heading font-bold text-xl">{result.name}</p>
                  <p className="text-white/80">Já registrado às {result.time}</p>
                </div>
              </div>
            )}
            {result.status === "not_found" && (
              <div className="bg-[#FF8C69] rounded-2xl p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                  ?
                </div>
                <div>
                  <p className="font-heading font-bold text-xl">Participante não encontrado</p>
                  <p className="text-white/80">Verifique o código e tente novamente</p>
                </div>
              </div>
            )}
            {result.status === "not_subscribed" && (
              <div className="bg-[#FF8C69] rounded-2xl p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                  !
                </div>
                <div>
                  <p className="font-heading font-bold text-xl">{result.name}</p>
                  <p className="text-white/80">Participante não inscrito neste subevento</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-white/10 p-4">
        <p className="text-xs text-white/40 mb-3 font-medium uppercase tracking-wider">Últimos check-ins</p>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {checkInLogs.slice(0, 10).map((log, i) => (
            <div key={i} className="flex items-center justify-between text-sm py-1.5 px-3 rounded-lg bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#DEFF66] text-[#314C5D] flex items-center justify-center text-xs font-bold">
                  {log.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <span>{log.name}</span>
              </div>
              <div className="flex items-center gap-3 text-white/50">
                <span>{log.time}</span>
                <span className="text-xs">{log.origin}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showManualSearch && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center pt-20 px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg text-foreground shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-heading font-bold text-[#314C5D]">Busca manual</h3>
              <button
                onClick={() => {
                  setShowManualSearch(false);
                  setSearchQuery("");
                }}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              <Input
                ref={searchInputRef}
                data-testid="input-manual-search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nome, e-mail ou token..."
                className="rounded-xl"
              />
            </div>
            <div className="max-h-72 overflow-y-auto divide-y">
              {filteredParticipants.map((p) => (
                <button
                  key={p.id}
                  data-testid={`manual-checkin-${p.id}`}
                  onClick={() => handleManualCheckIn(p.token)}
                  disabled={selectedTarget === "geral" && p.checkIn}
                  className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 disabled:opacity-50 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#314C5D] text-white flex items-center justify-center text-xs font-bold">
                      {p.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.email}</p>
                    </div>
                  </div>
                  {selectedTarget === "geral" && p.checkIn ? (
                    <span className="text-xs text-green-600 font-medium">Presente</span>
                  ) : (
                    <span className="text-xs text-[#314C5D] font-medium">Check-in</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
