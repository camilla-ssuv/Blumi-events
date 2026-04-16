import { useState, useRef, useEffect, useCallback } from "react";
import { useEventStore } from "@/hooks/use-event-store";
import { useLocation } from "wouter";
import { Search, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type CheckinResult = {
  status: "success" | "already" | "not_found";
  name?: string;
  initials?: string;
  time?: string;
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
  const { event, participants, checkInLogs, doCheckIn } = useEventStore();
  const [, setLocation] = useLocation();
  const [scanInput, setScanInput] = useState("");
  const [result, setResult] = useState<CheckinResult>(null);
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const checkedIn = participants.filter((p) => p.checkIn).length;

  useEffect(() => {
    if (!showManualSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showManualSearch, result]);

  const handleScan = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && scanInput.trim()) {
      const token = scanInput.trim();
      const res = doCheckIn(token);
      if (res.status === "success" && res.participant) {
        playBeep();
        setResult({
          status: "success",
          name: res.participant.name,
          initials: res.participant.name.split(" ").map((n) => n[0]).join(""),
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
      setScanInput("");
      setTimeout(() => setResult(null), 4000);
    }
  }, [scanInput, doCheckIn]);

  const handleManualCheckIn = (token: string) => {
    const res = doCheckIn(token);
    if (res.status === "success" && res.participant) {
      playBeep();
      setResult({
        status: "success",
        name: res.participant.name,
        initials: res.participant.name.split(" ").map((n) => n[0]).join(""),
      });
    } else if (res.status === "already" && res.participant) {
      setResult({
        status: "already",
        name: res.participant.name,
        time: res.participant.checkInTime,
      });
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
          <span className="text-sm">Voltar</span>
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

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="text-center mb-8">
          <div className="text-7xl md:text-9xl font-heading font-bold text-[#DEFF66]">
            {checkedIn}
            <span className="text-3xl md:text-5xl text-white/50"> / {event.maxCapacity}</span>
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
                  <p className="text-white/80">Check-in confirmado!</p>
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
                  disabled={p.checkIn}
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
                  {p.checkIn ? (
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
