import { useState } from "react";
import { useEventStore } from "@/hooks/use-event-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GripVertical, Pencil, Trash2, Plus, X } from "lucide-react";
import type { ScreeningQuestion, QuestionType } from "@/lib/mock-data";

export function QuestionsTab() {
  const { event, addQuestion, updateQuestion, deleteQuestion } = useEventStore();
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<ScreeningQuestion | null>(null);

  const handleEdit = (q: ScreeningQuestion) => {
    setEditingQuestion(q);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingQuestion(null);
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-heading font-semibold text-[#314C5D]">
          Perguntas de triagem ({event.questions.length})
        </h3>
        <Button
          data-testid="button-add-question"
          onClick={handleAdd}
          className="bg-[#DEFF66] text-[#314C5D] font-bold hover:bg-[#c9eb55] rounded-xl gap-2"
        >
          <Plus size={18} />
          Adicionar pergunta
        </Button>
      </div>

      <div className="space-y-3">
        {event.questions.map((q, index) => (
          <div
            key={q.id}
            data-testid={`question-${q.id}`}
            className="bg-white rounded-2xl border border-gray-200 p-5 flex items-start gap-4 group hover:shadow-md transition-shadow"
          >
            <div className="text-gray-300 mt-1 cursor-grab">
              <GripVertical size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground mb-1">
                    {index + 1}. {q.statement}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#29D4FF]/10 text-[#29D4FF] font-medium">
                      {q.type}
                    </span>
                    {q.required && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF6982]/10 text-[#FF6982] font-medium">
                        Obrigatória
                      </span>
                    )}
                  </div>
                  {q.options && q.options.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {q.options.map((opt) => (
                        <span key={opt} className="text-xs px-2 py-1 rounded-lg bg-gray-100 text-gray-600">
                          {opt}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    data-testid={`button-edit-question-${q.id}`}
                    onClick={() => handleEdit(q)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-[#314C5D] transition-colors"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    data-testid={`button-delete-question-${q.id}`}
                    onClick={() => deleteQuestion(q.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-[#FF6982] transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <QuestionModal
          question={editingQuestion}
          onClose={() => setShowModal(false)}
          onSave={(q) => {
            if (editingQuestion) {
              updateQuestion(editingQuestion.id, q);
            } else {
              addQuestion({ ...q, id: `q${Date.now()}` });
            }
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}

function QuestionModal({
  question,
  onClose,
  onSave,
}: {
  question: ScreeningQuestion | null;
  onClose: () => void;
  onSave: (q: Omit<ScreeningQuestion, "id">) => void;
}) {
  const [statement, setStatement] = useState(question?.statement || "");
  const [type, setType] = useState<QuestionType>(question?.type || "texto livre");
  const [required, setRequired] = useState(question?.required ?? true);
  const [options, setOptions] = useState<string[]>(question?.options || [""]);

  const handleSubmit = () => {
    const cleanOptions = type !== "texto livre" ? options.filter((o) => o.trim()) : undefined;
    onSave({ statement, type, required, options: cleanOptions });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-heading font-bold text-[#314C5D]">
            {question ? "Editar pergunta" : "Nova pergunta"}
          </h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-[#314C5D]">Enunciado</Label>
            <Input
              data-testid="input-question-statement"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              placeholder="Digite a pergunta..."
              className="mt-1.5 rounded-xl"
            />
          </div>

          <div>
            <Label className="text-sm font-medium text-[#314C5D]">Tipo</Label>
            <div className="mt-1.5 flex gap-2 flex-wrap">
              {(["texto livre", "seleção única", "múltipla escolha"] as QuestionType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                    type === t
                      ? "bg-[#314C5D] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {type !== "texto livre" && (
            <div>
              <Label className="text-sm font-medium text-[#314C5D]">Opções</Label>
              <div className="mt-1.5 space-y-2">
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[i] = e.target.value;
                        setOptions(newOpts);
                      }}
                      placeholder={`Opção ${i + 1}`}
                      className="rounded-xl"
                    />
                    {options.length > 1 && (
                      <button
                        onClick={() => setOptions(options.filter((_, j) => j !== i))}
                        className="p-2 text-gray-400 hover:text-[#FF6982]"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <Button
                  variant="ghost"
                  onClick={() => setOptions([...options, ""])}
                  className="text-[#29D4FF] hover:text-[#29D4FF]/80 text-sm"
                >
                  + Adicionar opção
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-[#314C5D]">Obrigatória</Label>
            <Switch checked={required} onCheckedChange={setRequired} />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 rounded-xl border-gray-200"
          >
            Cancelar
          </Button>
          <Button
            data-testid="button-save-question"
            onClick={handleSubmit}
            className="flex-1 rounded-xl bg-[#DEFF66] text-[#314C5D] font-bold hover:bg-[#c9eb55]"
          >
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}
