import { useState } from "react";
import { useEventStore } from "@/hooks/use-event-store";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Calendar, Clock, Users, Check, ChevronRight, Info } from "lucide-react";
import type { Subevento } from "@/lib/mock-data";

function formatSubDate(iso: string) {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const hour = d.getHours();
  return `${day}/${month} às ${hour}h`;
}

const tipoColors: Record<string, string> = {
  stand: "bg-[#29D4FF] text-white",
  palestra: "bg-[#DEFF66] text-[#314C5D]",
  workshop: "bg-[#FF8C69] text-white",
  outro: "bg-gray-200 text-gray-700",
};

type SubFilter = "todos" | "stand" | "palestra" | "workshop";

export default function EventPublic() {
  const { event, addParticipant } = useEventStore();
  const [, setLocation] = useLocation();
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [subFilter, setSubFilter] = useState<SubFilter>("todos");
  const [subModal, setSubModal] = useState<Subevento | null>(null);
  const [subStep, setSubStep] = useState(1);
  const [subShowSuccess, setSubShowSuccess] = useState(false);
  const [tooltip, setTooltip] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    ticketType: "Ingresso Padrão",
    q1: "",
    q2: "",
  });

  const [subForm, setSubForm] = useState({ name: "", email: "", password: "" });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const newId = `p${Date.now()}`;
    addParticipant({
      id: newId,
      name: form.name,
      email: form.email,
      token: `QR-${String(Math.floor(Math.random() * 900) + 100)}`,
      checkIn: false,
      inscricoes_subeventos: [],
    });
    setShowModal(false);
    setShowSuccess(true);
    setStep(1);
    setForm({ name: "", email: "", password: "", ticketType: "Ingresso Padrão", q1: "", q2: "" });
  };

  const handleSubSubmit = () => {
    if (subModal) {
      const newId = `p${Date.now()}`;
      addParticipant({
        id: newId,
        name: subForm.name,
        email: subForm.email,
        token: `QR-${String(Math.floor(Math.random() * 900) + 100)}`,
        checkIn: false,
        inscricoes_subeventos: [subModal.id],
      });
      setSubModal(null);
      setSubStep(1);
      setSubShowSuccess(true);
      setSubForm({ name: "", email: "", password: "" });
    }
  };

  const isFeira = event.tipo === "feira";
  const publishedSubs = (event.subeventos || []).filter((s) => s.status === "publicado");
  const filteredSubs = subFilter === "todos" ? publishedSubs : publishedSubs.filter((s) => s.tipo === subFilter);

  return (
    <div className="min-h-screen bg-[#FBF7EB]">
      <header className="bg-[#314C5D] text-white py-6 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-sm text-white/60 font-medium mb-1">blūmi events</p>
          <h1 className="text-3xl md:text-4xl font-heading font-bold mb-2">{event.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1.5"><Calendar size={14} /> {event.date}</span>
            <span className="flex items-center gap-1.5"><Clock size={14} /> {event.time}</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} /> {event.venueName}</span>
          </div>
        </div>
      </header>

      <div className="h-48 md:h-64 bg-gradient-to-r from-[#314C5D] to-[#29D4FF] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 30%, white 1px, transparent 1px)`,
          backgroundSize: "40px 40px, 60px 60px",
        }} />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div>
              <h2 className="text-2xl font-heading font-bold text-[#314C5D] mb-4">Sobre o evento</h2>
              <p className="text-gray-700 leading-relaxed">
                Uma experiência imersiva de um dia inteiro dedicada à interseção entre finanças quantitativas
                e tecnologia. Aprenda com especialistas da XP Inc. sobre modelos quantitativos, algoritmos de
                trading, infraestrutura de dados e muito mais. Ideal para desenvolvedores, engenheiros de dados
                e profissionais de finanças que querem explorar o mundo de QuantDev.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              <div className="flex items-center gap-3 text-[#314C5D]">
                <MapPin size={20} />
                <div>
                  <p className="font-medium">{event.venueName}</p>
                  <p className="text-sm text-gray-500">{event.venueAddress}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[#314C5D]">
                <Users size={20} />
                <p className="text-sm">{event.maxCapacity} vagas</p>
              </div>
              <Button
                data-testid="button-register"
                onClick={() => setShowModal(true)}
                className="w-full h-14 text-lg bg-[#DEFF66] text-[#314C5D] font-bold hover:bg-[#c9eb55] rounded-xl"
              >
                Quero me inscrever
              </Button>
            </div>
          </div>
        </div>

        {isFeira && publishedSubs.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-heading font-bold text-[#314C5D] mb-6">
              O que acontece na feira
            </h2>

            <div className="flex gap-2 mb-6 flex-wrap">
              {(["todos", "stand", "palestra", "workshop"] as SubFilter[]).map((f) => (
                <button
                  key={f}
                  data-testid={`public-filter-${f}`}
                  onClick={() => setSubFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors capitalize ${
                    subFilter === f
                      ? "bg-[#314C5D] text-white"
                      : "bg-transparent border border-gray-300 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {f === "todos" ? "Todos" : f === "stand" ? "Stands" : f === "palestra" ? "Palestras" : "Workshops"}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredSubs.map((s) => {
                const vagasRest = s.capacidade ? s.capacidade - s.inscritos_count : null;
                const lowVagas = vagasRest !== null && s.capacidade && vagasRest / s.capacidade < 0.2;
                const esgotado = vagasRest !== null && vagasRest <= 0;

                return (
                  <div
                    key={s.id}
                    data-testid={`public-sub-card-${s.id}`}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="h-1.5" style={{ backgroundColor: s.cor_primaria || "#314C5D" }} />
                    <div className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                          style={{ backgroundColor: s.cor_primaria || "#314C5D" }}
                        >
                          {s.logo_inicial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <button
                            onClick={() => setLocation(`/eventos/${event.slug}/${s.slug}`)}
                            className="text-left"
                          >
                            <h3 className="font-heading font-bold text-[#314C5D] leading-tight hover:underline">
                              {s.nome}
                            </h3>
                          </button>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${tipoColors[s.tipo]}`}>
                              {s.tipo}
                            </span>
                            <span className="text-xs text-gray-500">{formatSubDate(s.data_inicio)}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{s.descricao}</p>

                      {vagasRest !== null && !esgotado && (
                        <p className={`text-xs font-medium mb-3 ${lowVagas ? "text-[#FF8C69]" : "text-gray-500"}`}>
                          {vagasRest} vagas restantes
                        </p>
                      )}

                      {esgotado ? (
                        <Button disabled className="w-full rounded-xl bg-gray-200 text-gray-500 cursor-not-allowed">
                          Vagas esgotadas
                        </Button>
                      ) : s.modo_inscricao === "inscricao" ? (
                        <Button
                          data-testid={`button-sub-register-${s.id}`}
                          onClick={() => { setSubModal(s); setSubStep(1); }}
                          className="w-full rounded-xl bg-[#DEFF66] text-[#314C5D] font-bold hover:bg-[#c9eb55]"
                        >
                          Quero participar
                        </Button>
                      ) : (
                        <div className="relative">
                          <Button
                            variant="outline"
                            data-testid={`button-sub-livre-${s.id}`}
                            onMouseEnter={() => setTooltip(s.id)}
                            onMouseLeave={() => setTooltip(null)}
                            className="w-full rounded-xl border-gray-300 text-gray-600 gap-2"
                          >
                            <Info size={14} />
                            Entrada livre — apresente seu QR
                          </Button>
                          {tooltip === s.id && (
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#314C5D] text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap shadow-lg z-10">
                              Basta ter inscrição no evento principal
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="bg-[#314C5D] px-6 py-4 flex items-center justify-between">
              <h3 className="text-white font-heading font-bold text-lg">Inscrição</h3>
              <button
                onClick={() => { setShowModal(false); setStep(1); }}
                className="text-white/60 hover:text-white text-2xl"
              >
                x
              </button>
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
                    <Label className="text-sm font-medium text-[#314C5D]">Nome completo</Label>
                    <Input
                      data-testid="input-reg-name"
                      value={form.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="Seu nome"
                      className="mt-1.5 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-[#314C5D]">E-mail</Label>
                    <Input
                      data-testid="input-reg-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="seu@email.com"
                      className="mt-1.5 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-[#314C5D]">Senha</Label>
                    <Input
                      data-testid="input-reg-password"
                      type="password"
                      value={form.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      placeholder="Crie uma senha"
                      className="mt-1.5 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-[#314C5D]">Tipo de ingresso</Label>
                    <div className="mt-2 space-y-2">
                      {["Ingresso Padrão", "Ingresso VIP"].map((t) => (
                        <label key={t} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form.ticketType === t ? "border-[#314C5D] bg-[#314C5D]/5" : "border-gray-200"}`}>
                          <input
                            type="radio"
                            name="ticketType"
                            checked={form.ticketType === t}
                            onChange={() => handleChange("ticketType", t)}
                            className="accent-[#314C5D]"
                          />
                          <span className="text-sm font-medium">{t}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Button
                    data-testid="button-next-step"
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
                  {event.questions.map((q) => (
                    <div key={q.id}>
                      <Label className="text-sm font-medium text-[#314C5D]">
                        {q.statement}
                        {q.required && <span className="text-[#FF6982] ml-1">*</span>}
                      </Label>
                      {q.type === "texto livre" ? (
                        <Input
                          data-testid={`input-screening-${q.id}`}
                          className="mt-1.5 rounded-xl"
                          placeholder="Sua resposta..."
                          onChange={(e) => handleChange(q.id, e.target.value)}
                        />
                      ) : (
                        <div className="mt-2 space-y-2">
                          {q.options?.map((opt) => (
                            <label key={opt} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${form[q.id as keyof typeof form] === opt ? "border-[#314C5D] bg-[#314C5D]/5" : "border-gray-200"}`}>
                              <input
                                type={q.type === "seleção única" ? "radio" : "checkbox"}
                                name={q.id}
                                checked={form[q.id as keyof typeof form] === opt}
                                onChange={() => handleChange(q.id, opt)}
                                className="accent-[#314C5D]"
                              />
                              <span className="text-sm">{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setStep(1)}
                      className="flex-1 h-12 rounded-xl"
                    >
                      Voltar
                    </Button>
                    <Button
                      data-testid="button-submit-registration"
                      onClick={handleSubmit}
                      className="flex-1 h-12 bg-[#DEFF66] text-[#314C5D] font-bold rounded-xl hover:bg-[#c9eb55]"
                    >
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
              Inscrição confirmada!
            </h3>
            <p className="text-white/80 mb-8">
              Seu QR code foi enviado para o seu e-mail.
            </p>
            <Button
              data-testid="button-close-success"
              onClick={() => setShowSuccess(false)}
              className="bg-[#DEFF66] text-[#314C5D] font-bold rounded-xl px-8 h-12 hover:bg-[#c9eb55]"
            >
              Fechar
            </Button>
          </div>
        </div>
      )}

      {subModal && !subShowSuccess && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between" style={{ backgroundColor: subModal.cor_primaria || "#314C5D" }}>
              <div>
                <h3 className="text-white font-heading font-bold text-lg">{subModal.nome}</h3>
                {subModal.capacidade && (
                  <p className="text-white/70 text-xs mt-0.5">
                    {Math.max(0, subModal.capacidade - subModal.inscritos_count)} vagas restantes
                  </p>
                )}
              </div>
              <button
                onClick={() => { setSubModal(null); setSubStep(1); }}
                className="text-white/60 hover:text-white text-2xl"
              >
                x
              </button>
            </div>

            <div className="flex gap-2 px-6 pt-4">
              <div className={`flex-1 h-1.5 rounded-full transition-colors ${subStep >= 1 ? "bg-[#DEFF66]" : "bg-gray-200"}`} />
              <div className={`flex-1 h-1.5 rounded-full transition-colors ${subStep >= 2 ? "bg-[#DEFF66]" : "bg-gray-200"}`} />
            </div>
            <p className="px-6 pt-2 text-xs text-gray-500">Etapa {subStep} de 2</p>

            <div className="p-6 space-y-4">
              {subStep === 1 && (
                <>
                  <div>
                    <Label className="text-sm font-medium text-[#314C5D]">Nome completo *</Label>
                    <Input
                      data-testid="input-sub-reg-name"
                      value={subForm.name}
                      onChange={(e) => setSubForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="Seu nome"
                      className="mt-1.5 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-[#314C5D]">E-mail *</Label>
                    <Input
                      data-testid="input-sub-reg-email"
                      type="email"
                      value={subForm.email}
                      onChange={(e) => setSubForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="seu@email.com"
                      className="mt-1.5 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-[#314C5D]">Senha</Label>
                    <Input
                      data-testid="input-sub-reg-password"
                      type="password"
                      value={subForm.password}
                      onChange={(e) => setSubForm((p) => ({ ...p, password: e.target.value }))}
                      placeholder="Crie uma senha"
                      className="mt-1.5 rounded-xl"
                    />
                  </div>
                  <Button
                    data-testid="button-sub-next-step"
                    onClick={() => setSubStep(2)}
                    disabled={!subForm.name || !subForm.email}
                    className="w-full h-12 bg-[#DEFF66] text-[#314C5D] font-bold rounded-xl hover:bg-[#c9eb55] gap-2"
                  >
                    Próximo <ChevronRight size={16} />
                  </Button>
                </>
              )}
              {subStep === 2 && (
                <>
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500 mb-4">Nenhuma pergunta adicional para este subevento.</p>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setSubStep(1)} className="flex-1 h-12 rounded-xl">
                      Voltar
                    </Button>
                    <Button
                      data-testid="button-sub-submit"
                      onClick={handleSubSubmit}
                      className="flex-1 h-12 bg-[#DEFF66] text-[#314C5D] font-bold rounded-xl hover:bg-[#c9eb55]"
                    >
                      Confirmar inscrição
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {subShowSuccess && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-[#314C5D] rounded-2xl w-full max-w-md p-8 text-center shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-[#DEFF66] flex items-center justify-center mx-auto mb-6">
              <Check size={40} className="text-[#314C5D]" />
            </div>
            <h3 className="text-2xl font-heading font-bold text-white mb-3">
              Inscrição confirmada no {subModal?.nome || "subevento"}!
            </h3>
            <p className="text-white/80 mb-2">
              Você também foi inscrito automaticamente no evento principal.
            </p>
            <p className="text-white/60 text-sm mb-8">
              Seu QR code foi enviado para o seu e-mail.
            </p>
            <Button
              data-testid="button-sub-success-area"
              onClick={() => { setSubShowSuccess(false); setLocation("/minha-area"); }}
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
