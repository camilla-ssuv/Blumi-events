import { useState } from "react";
import { useEventStore } from "@/hooks/use-event-store";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calendar, MapPin, Clock, Users, Check, ChevronRight, Info } from "lucide-react";

function formatSubDate(iso: string) {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const hour = d.getHours();
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${day}/${month} às ${hour}:${min}`;
}

const tipoColors: Record<string, string> = {
  stand: "bg-[#29D4FF] text-white",
  palestra: "bg-[#DEFF66] text-[#314C5D]",
  workshop: "bg-[#FF8C69] text-white",
  outro: "bg-gray-200 text-gray-700",
};

export default function SubeventPublic() {
  const { event, addParticipant } = useEventStore();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/eventos/:eventSlug/:subSlug");

  const subevento = (event.subeventos || []).find((s) => s.slug === params?.subSlug);

  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  if (!subevento) {
    return (
      <div className="min-h-screen bg-[#FBF7EB] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-heading font-bold text-[#314C5D] mb-4">Subevento não encontrado</h1>
          <Button onClick={() => setLocation(`/eventos/${event.slug}`)} className="bg-[#DEFF66] text-[#314C5D] font-bold rounded-xl">
            Voltar para a feira
          </Button>
        </div>
      </div>
    );
  }

  const vagasRest = subevento.capacidade ? subevento.capacidade - subevento.inscritos_count : null;
  const vagasPercent = subevento.capacidade ? (subevento.inscritos_count / subevento.capacidade) * 100 : 0;
  const esgotado = vagasRest !== null && vagasRest <= 0;

  const handleSubmit = () => {
    const newId = `p${Date.now()}`;
    addParticipant({
      id: newId,
      name: form.name,
      email: form.email,
      token: `QR-${String(Math.floor(Math.random() * 900) + 100)}`,
      checkIn: false,
      inscricoes_subeventos: [subevento.id],
    });
    setShowModal(false);
    setShowSuccess(true);
    setStep(1);
    setForm({ name: "", email: "", password: "" });
  };

  return (
    <div className="min-h-screen bg-[#FBF7EB]">
      <header className="text-white py-8 px-6 relative" style={{ backgroundColor: subevento.cor_primaria || "#314C5D" }}>
        <div className="max-w-3xl mx-auto">
          <button
            onClick={() => setLocation(`/eventos/${event.slug}`)}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4 text-sm transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar para a feira
          </button>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-lg">
              {subevento.logo_inicial}
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold">{subevento.nome}</h1>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${tipoColors[subevento.tipo]}`}>
                {subevento.tipo}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-white/80 mt-3">
            <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatSubDate(subevento.data_inicio)}</span>
            <span className="flex items-center gap-1.5"><Clock size={14} /> até {formatSubDate(subevento.data_fim)}</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} /> {event.venueName}</span>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-heading font-bold text-[#314C5D] mb-3">Sobre</h2>
              <p className="text-gray-700 leading-relaxed">{subevento.descricao}</p>
            </div>

            <div>
              <h2 className="text-xl font-heading font-bold text-[#314C5D] mb-3">Local</h2>
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin size={18} className="text-[#314C5D]" />
                <div>
                  <p className="font-medium">{event.venueName}</p>
                  <p className="text-sm text-gray-500">{event.venueAddress}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 sticky top-6">
              {subevento.capacidade && (
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600 flex items-center gap-1.5">
                      <Users size={16} className="text-[#314C5D]" />
                      Vagas
                    </span>
                    <span className="font-semibold text-[#314C5D]">
                      {vagasRest !== null ? vagasRest : "---"} restantes
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(vagasPercent, 100)}%`,
                        backgroundColor: vagasPercent > 80 ? "#FF8C69" : subevento.cor_primaria || "#314C5D",
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {subevento.inscritos_count} / {subevento.capacidade} inscritos
                  </p>
                </div>
              )}

              {subevento.modo_inscricao === "inscricao" ? (
                esgotado ? (
                  <Button disabled className="w-full h-14 rounded-xl bg-gray-200 text-gray-500 cursor-not-allowed text-lg">
                    Vagas esgotadas
                  </Button>
                ) : (
                  <Button
                    data-testid="button-sub-page-register"
                    onClick={() => setShowModal(true)}
                    className="w-full h-14 text-lg bg-[#DEFF66] text-[#314C5D] font-bold hover:bg-[#c9eb55] rounded-xl"
                  >
                    Quero participar
                  </Button>
                )
              ) : (
                <div className="bg-[#314C5D] rounded-2xl p-5 text-white">
                  <div className="flex items-start gap-3">
                    <Info size={20} className="text-[#DEFF66] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm leading-relaxed">
                        Este stand é de entrada livre durante a feira. Basta apresentar seu QR code do evento principal na entrada.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: subevento.cor_primaria || "#314C5D" }}>
              <div>
                <h3 className="text-white font-heading font-bold text-lg">{subevento.nome}</h3>
                {vagasRest !== null && (
                  <p className="text-white/70 text-xs mt-0.5">{vagasRest} vagas restantes</p>
                )}
              </div>
              <button onClick={() => { setShowModal(false); setStep(1); }} className="text-white/60 hover:text-white text-2xl">x</button>
            </div>

            <div className="flex gap-2 px-6 pt-4">
              <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 1 ? "bg-[#DEFF66]" : "bg-gray-200"}`} />
              <div className={`flex-1 h-1.5 rounded-full transition-colors ${step >= 2 ? "bg-[#DEFF66]" : "bg-gray-200"}`} />
            </div>
            <p className="px-6 pt-2 text-xs text-gray-500">Etapa {step} de 2</p>

            <div className="p-6 space-y-4">
              {step === 1 && (
                <>
                  <div>
                    <Label className="text-sm font-medium text-[#314C5D]">Nome completo *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Seu nome"
                      className="mt-1.5 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-[#314C5D]">E-mail *</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="seu@email.com"
                      className="mt-1.5 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-[#314C5D]">Senha</Label>
                    <Input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                      placeholder="Crie uma senha"
                      className="mt-1.5 rounded-xl"
                    />
                  </div>
                  <Button
                    onClick={() => setStep(2)}
                    disabled={!form.name || !form.email}
                    className="w-full h-12 bg-[#DEFF66] text-[#314C5D] font-bold rounded-xl hover:bg-[#c9eb55] gap-2"
                  >
                    Próximo <ChevronRight size={16} />
                  </Button>
                </>
              )}
              {step === 2 && (
                <>
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-4">Nenhuma pergunta adicional para este subevento.</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1 h-12 rounded-xl">Voltar</Button>
                    <Button onClick={handleSubmit} className="flex-1 h-12 bg-[#DEFF66] text-[#314C5D] font-bold rounded-xl hover:bg-[#c9eb55]">
                      Confirmar inscrição
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#314C5D] rounded-2xl w-full max-w-md p-8 text-center shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-[#DEFF66] flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-[#314C5D]" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-white mb-3">
              Inscrição confirmada no {subevento.nome}!
            </h3>
            <p className="text-white/80 mb-2">
              Você também foi inscrito automaticamente no evento principal.
            </p>
            <p className="text-white/60 text-sm mb-8">
              Seu QR code foi enviado para o seu e-mail.
            </p>
            <Button
              onClick={() => { setShowSuccess(false); setLocation("/minha-area"); }}
              className="bg-[#DEFF66] text-[#314C5D] font-bold rounded-xl px-8 h-12 hover:bg-[#c9eb55]"
            >
              Ver minha área
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
