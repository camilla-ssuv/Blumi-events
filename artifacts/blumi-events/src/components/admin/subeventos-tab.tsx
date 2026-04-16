import { useState } from "react";
import { useEventStore } from "@/hooks/use-event-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Eye, Pencil, X, Download, AlertTriangle } from "lucide-react";
import type { Subevento } from "@/lib/mock-data";

const tipoColors: Record<string, string> = {
  stand: "bg-[#29D4FF] text-white",
  palestra: "bg-[#DEFF66] text-[#314C5D]",
  workshop: "bg-[#FF8C69] text-white",
  outro: "bg-gray-200 text-gray-700",
};

const statusColors: Record<string, string> = {
  publicado: "bg-green-100 text-green-700",
  rascunho: "bg-gray-200 text-gray-600",
  encerrado: "bg-red-100 text-red-700",
};

type FilterType = "todos" | "stand" | "palestra" | "workshop";

export function SubeventosTab() {
  const { event, addSubevento, updateSubevento } = useEventStore();
  const [filter, setFilter] = useState<FilterType>("todos");
  const [showModal, setShowModal] = useState(false);
  const [editingSubevento, setEditingSubevento] = useState<Subevento | null>(null);
  const [detailSubevento, setDetailSubevento] = useState<Subevento | null>(null);

  const subeventos = event.subeventos || [];
  const filtered = filter === "todos" ? subeventos : subeventos.filter((s) => s.tipo === filter);

  const handleAdd = () => {
    setEditingSubevento(null);
    setShowModal(true);
  };

  const handleEdit = (s: Subevento) => {
    setEditingSubevento(s);
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-heading font-semibold text-[#314C5D]">
          Subeventos da feira ({subeventos.length})
        </h3>
        <Button
          data-testid="button-add-subevento"
          onClick={handleAdd}
          className="bg-[#DEFF66] text-[#314C5D] font-bold hover:bg-[#c9eb55] rounded-xl gap-2"
        >
          <Plus size={18} />
          Adicionar subevento
        </Button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {(["todos", "stand", "palestra", "workshop"] as FilterType[]).map((f) => (
          <button
            key={f}
            data-testid={`filter-${f}`}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors capitalize ${
              filter === f
                ? "bg-[#314C5D] text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f === "todos" ? "Todos" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((s) => (
          <div
            key={s.id}
            data-testid={`subevento-card-${s.id}`}
            className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ backgroundColor: s.cor_primaria }}
                >
                  {s.logo_inicial}
                </div>
                <div>
                  <p className="font-medium text-foreground">{s.nome}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tipoColors[s.tipo]}`}>
                      {s.tipo}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      s.modo_inscricao === "inscricao" ? "bg-[#314C5D] text-white" : "bg-[#FF6982] text-white"
                    }`}>
                      {s.modo_inscricao === "inscricao" ? "Pre-inscricao" : "Check-in livre"}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[s.status]}`}>
                      {s.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-gray-500">Vagas</p>
                  <p className="font-semibold text-sm">{s.capacidade ?? "Ilimitado"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Inscritos</p>
                  <p className="font-semibold text-sm">{s.inscritos_count}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    data-testid={`button-view-${s.id}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => setDetailSubevento(s)}
                    className="text-[#314C5D] hover:bg-[#314C5D]/5 gap-1.5 rounded-lg"
                  >
                    <Eye size={16} />
                    <span className="hidden sm:inline">Ver detalhes</span>
                  </Button>
                  <Button
                    data-testid={`button-edit-${s.id}`}
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(s)}
                    className="text-[#314C5D] hover:bg-[#314C5D]/5 rounded-lg"
                  >
                    <Pencil size={16} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            Nenhum subevento encontrado
          </div>
        )}
      </div>

      {showModal && (
        <SubeventoModal
          subevento={editingSubevento}
          eventId={event.id}
          existingCount={subeventos.length}
          onClose={() => setShowModal(false)}
          onSave={(s, status) => {
            if (editingSubevento) {
              updateSubevento(editingSubevento.id, { ...s, status });
            } else {
              addSubevento({ ...s, status, id: `sub-${Date.now()}` } as Subevento);
            }
            setShowModal(false);
          }}
        />
      )}

      {detailSubevento && (
        <SubeventoDetail
          subevento={detailSubevento}
          onClose={() => setDetailSubevento(null)}
          onEncerrar={() => {
            updateSubevento(detailSubevento.id, { status: "encerrado" });
            setDetailSubevento(null);
          }}
        />
      )}
    </div>
  );
}

function SubeventoModal({
  subevento,
  eventId,
  existingCount,
  onClose,
  onSave,
}: {
  subevento: Subevento | null;
  eventId: string;
  existingCount: number;
  onClose: () => void;
  onSave: (s: Partial<Subevento>, status: Subevento["status"]) => void;
}) {
  const [nome, setNome] = useState(subevento?.nome || "");
  const [tipo, setTipo] = useState<Subevento["tipo"]>(subevento?.tipo || "stand");
  const [descricao, setDescricao] = useState(subevento?.descricao || "");
  const [capacidade, setCapacidade] = useState(subevento?.capacidade?.toString() || "");
  const [dataInicio, setDataInicio] = useState(subevento?.data_inicio || "");
  const [dataFim, setDataFim] = useState(subevento?.data_fim || "");
  const [corPrimaria, setCorPrimaria] = useState(subevento?.cor_primaria || "#314C5D");
  const [modoInscricao, setModoInscricao] = useState(subevento?.modo_inscricao || "inscricao");
  const [inscricaoAutomatica, setInscricaoAutomatica] = useState(subevento?.inscricao_automatica ?? false);

  const handleSave = (status: Subevento["status"]) => {
    const slug = nome.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    onSave({
      evento_id: eventId,
      nome,
      tipo,
      descricao,
      capacidade: capacidade ? Number(capacidade) : null,
      data_inicio: dataInicio,
      data_fim: dataFim,
      slug,
      logo_inicial: nome.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
      cor_primaria: corPrimaria,
      modo_inscricao: modoInscricao,
      inscricao_automatica: inscricaoAutomatica,
      ordem: subevento?.ordem ?? existingCount + 1,
      inscritos_count: subevento?.inscritos_count ?? 0,
      presentes_count: subevento?.presentes_count ?? 0,
    }, status);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-8">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-heading font-bold text-[#314C5D]">
            {subevento ? "Editar subevento" : "Novo subevento"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <Label className="text-sm font-medium text-[#314C5D]">Nome *</Label>
            <Input
              data-testid="input-sub-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do subevento"
              className="mt-1.5 rounded-xl"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-[#314C5D]">Tipo *</Label>
            <select
              data-testid="select-sub-tipo"
              value={tipo}
              onChange={(e) => setTipo(e.target.value as Subevento["tipo"])}
              className="mt-1.5 w-full h-10 rounded-xl border border-gray-200 px-3 text-sm bg-white"
            >
              <option value="stand">Stand</option>
              <option value="palestra">Palestra</option>
              <option value="workshop">Workshop</option>
              <option value="outro">Outro</option>
            </select>
          </div>

          <div>
            <Label className="text-sm font-medium text-[#314C5D]">Descricao</Label>
            <Textarea
              data-testid="input-sub-descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva o subevento..."
              rows={3}
              className="mt-1.5 rounded-xl"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-[#314C5D]">Capacidade (vazio = ilimitado)</Label>
            <Input
              data-testid="input-sub-capacidade"
              type="number"
              value={capacidade}
              onChange={(e) => setCapacidade(e.target.value)}
              placeholder="Ilimitado"
              className="mt-1.5 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium text-[#314C5D]">Inicio</Label>
              <Input
                data-testid="input-sub-inicio"
                type="datetime-local"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="mt-1.5 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-[#314C5D]">Fim</Label>
              <Input
                data-testid="input-sub-fim"
                type="datetime-local"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="mt-1.5 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-sm font-medium text-[#314C5D]">Logo da empresa</Label>
              <Input
                type="file"
                accept="image/*"
                className="mt-1.5 rounded-xl text-sm"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-[#314C5D]">Cor primaria</Label>
              <div className="mt-1.5 flex gap-2 items-center">
                <input
                  type="color"
                  value={corPrimaria}
                  onChange={(e) => setCorPrimaria(e.target.value)}
                  className="w-10 h-10 rounded-lg border-0 cursor-pointer"
                />
                <span className="text-sm text-gray-500 font-mono">{corPrimaria}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#F5F5F0] rounded-xl p-4 space-y-3">
            <Label className="text-sm font-bold text-[#314C5D]">Modo de inscricao</Label>
            <div className="space-y-2">
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  modoInscricao === "inscricao" ? "border-[#314C5D] bg-white" : "border-transparent"
                }`}
              >
                <input
                  type="radio"
                  name="modoInscricao"
                  checked={modoInscricao === "inscricao"}
                  onChange={() => setModoInscricao("inscricao")}
                  className="accent-[#314C5D] mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium">Pre-inscricao obrigatoria</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Participante se inscreve no subevento e recebe QR proprio.
                  </p>
                </div>
              </label>
              <label
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  modoInscricao === "checkin_livre" ? "border-[#FF6982] bg-white" : "border-transparent"
                }`}
              >
                <input
                  type="radio"
                  name="modoInscricao"
                  checked={modoInscricao === "checkin_livre"}
                  onChange={() => setModoInscricao("checkin_livre")}
                  className="accent-[#FF6982] mt-0.5"
                />
                <div>
                  <p className="text-sm font-medium">Check-in livre</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Qualquer inscrito no evento pai pode entrar. O beep rastreia a visita.
                  </p>
                </div>
              </label>
            </div>

            {modoInscricao === "inscricao" && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <div>
                  <p className="text-sm font-medium text-[#314C5D]">Inscricao automatica</p>
                  <p className="text-xs text-gray-500">
                    Inscrever automaticamente todos os inscritos no evento pai
                  </p>
                </div>
                <Switch checked={inscricaoAutomatica} onCheckedChange={setInscricaoAutomatica} />
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button variant="outline" onClick={onClose} className="rounded-xl border-gray-200">
            Cancelar
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave("rascunho")}
            className="rounded-xl border-[#314C5D] text-[#314C5D]"
          >
            Salvar como rascunho
          </Button>
          <Button
            data-testid="button-publish-subevento"
            onClick={() => handleSave("publicado")}
            className="flex-1 rounded-xl bg-[#DEFF66] text-[#314C5D] font-bold hover:bg-[#c9eb55]"
          >
            Publicar subevento
          </Button>
        </div>
      </div>
    </div>
  );
}

function SubeventoDetail({
  subevento,
  onClose,
  onEncerrar,
}: {
  subevento: Subevento;
  onClose: () => void;
  onEncerrar: () => void;
}) {
  const { participants, subeventoCheckins } = useEventStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const inscritosNeste = participants.filter(
    (p) => p.inscricoes_subeventos?.includes(subevento.id)
  );

  const checkedInSet = subeventoCheckins[subevento.id] || new Set();
  const isCheckedInSubevento = (participantId: string) => checkedInSet.has(participantId);

  const vagasRestantes = subevento.capacidade
    ? subevento.capacidade - subevento.inscritos_count
    : null;
  const taxa = subevento.inscritos_count > 0
    ? Math.round((subevento.presentes_count / subevento.inscritos_count) * 100)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-xl h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: subevento.cor_primaria }}
            >
              {subevento.logo_inicial}
            </div>
            <div>
              <h3 className="font-heading font-bold text-[#314C5D]">{subevento.nome}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tipoColors[subevento.tipo]}`}>
                {subevento.tipo}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-[#314C5D] rounded-2xl p-4">
              <p className="text-white/70 text-xs font-medium mb-1">Inscritos</p>
              <p className="text-[#DEFF66] text-2xl font-heading font-bold">{subevento.inscritos_count}</p>
            </div>
            <div className="bg-[#314C5D] rounded-2xl p-4">
              <p className="text-white/70 text-xs font-medium mb-1">Vagas restantes</p>
              <p className="text-[#DEFF66] text-2xl font-heading font-bold">
                {vagasRestantes !== null ? vagasRestantes : "Ilimitado"}
              </p>
            </div>
            <div className="bg-[#314C5D] rounded-2xl p-4">
              <p className="text-white/70 text-xs font-medium mb-1">Presentes</p>
              <p className="text-[#DEFF66] text-2xl font-heading font-bold">{subevento.presentes_count}</p>
            </div>
            <div className="bg-[#314C5D] rounded-2xl p-4">
              <p className="text-white/70 text-xs font-medium mb-1">Taxa de presenca</p>
              <p className="text-[#DEFF66] text-2xl font-heading font-bold">{taxa}%</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-[#314C5D]">
                Participantes inscritos ({inscritosNeste.length})
              </h4>
              <Button
                variant="outline"
                size="sm"
                className="text-xs gap-1.5 rounded-lg border-[#314C5D] text-[#314C5D]"
              >
                <Download size={14} />
                Exportar CSV
              </Button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left p-3 text-xs font-semibold text-[#314C5D]">Nome</th>
                    <th className="text-left p-3 text-xs font-semibold text-[#314C5D]">E-mail</th>
                    <th className="text-left p-3 text-xs font-semibold text-[#314C5D]">Presenca</th>
                  </tr>
                </thead>
                <tbody>
                  {inscritosNeste.map((p) => (
                    <tr key={p.id} className="border-b border-gray-50">
                      <td className="p-3 text-sm font-medium">{p.name}</td>
                      <td className="p-3 text-sm text-gray-600">{p.email}</td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          isCheckedInSubevento(p.id) ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {isCheckedInSubevento(p.id) ? "Presente" : "Ausente"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {inscritosNeste.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-sm text-gray-400">
                        Nenhum inscrito neste subevento
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {subevento.status !== "encerrado" && (
            <Button
              data-testid="button-encerrar-subevento"
              variant="outline"
              onClick={() => setShowConfirm(true)}
              className="w-full rounded-xl border-red-300 text-red-600 hover:bg-red-50 gap-2"
            >
              <AlertTriangle size={16} />
              Encerrar subevento
            </Button>
          )}
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={28} className="text-red-500" />
              </div>
              <h4 className="font-heading font-bold text-lg text-[#314C5D] mb-2">
                Encerrar subevento?
              </h4>
              <p className="text-sm text-gray-500 mb-6">
                Esta acao nao pode ser desfeita. O subevento sera marcado como encerrado.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 rounded-xl"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={onEncerrar}
                  className="flex-1 rounded-xl bg-red-500 text-white hover:bg-red-600"
                >
                  Encerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
