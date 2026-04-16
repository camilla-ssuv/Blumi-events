import { useState } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useEventStore } from "@/hooks/use-event-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewEvent() {
  const [, setLocation] = useLocation();
  const { updateEvent } = useEventStore();
  const [form, setForm] = useState({
    name: "",
    description: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    venueName: "",
    venueAddress: "",
    maxCapacity: "",
    type: "simples" as "simples" | "feira com stands",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = () => {
    updateEvent({
      name: form.name || "Novo Evento",
      venueName: form.venueName,
      venueAddress: form.venueAddress,
      maxCapacity: Number(form.maxCapacity) || 100,
      type: form.type,
      status: "rascunho",
    });
    setLocation("/admin/eventos/evt-1");
  };

  const handlePublish = () => {
    updateEvent({
      name: form.name || "Novo Evento",
      venueName: form.venueName,
      venueAddress: form.venueAddress,
      maxCapacity: Number(form.maxCapacity) || 100,
      type: form.type,
      status: "publicado",
    });
    setLocation("/admin/eventos/evt-1");
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl">
        <h1 className="text-3xl font-heading font-bold text-[#314C5D] mb-8">
          Criar Novo Evento
        </h1>

        <div className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-[#314C5D]">
              Nome do evento
            </Label>
            <Input
              id="name"
              data-testid="input-event-name"
              placeholder="Ex: Imersão em QuantDev"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="mt-1.5 h-12 rounded-xl border-gray-200 bg-white"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-[#314C5D]">
              Descrição
            </Label>
            <Textarea
              id="description"
              data-testid="input-event-description"
              placeholder="Descreva o evento..."
              rows={4}
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              className="mt-1.5 rounded-xl border-gray-200 bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="text-sm font-medium text-[#314C5D]">
                Data de início
              </Label>
              <Input
                id="startDate"
                data-testid="input-start-date"
                type="date"
                value={form.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                className="mt-1.5 h-12 rounded-xl border-gray-200 bg-white"
              />
            </div>
            <div>
              <Label htmlFor="startTime" className="text-sm font-medium text-[#314C5D]">
                Hora de início
              </Label>
              <Input
                id="startTime"
                data-testid="input-start-time"
                type="time"
                value={form.startTime}
                onChange={(e) => handleChange("startTime", e.target.value)}
                className="mt-1.5 h-12 rounded-xl border-gray-200 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="endDate" className="text-sm font-medium text-[#314C5D]">
                Data de fim
              </Label>
              <Input
                id="endDate"
                data-testid="input-end-date"
                type="date"
                value={form.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                className="mt-1.5 h-12 rounded-xl border-gray-200 bg-white"
              />
            </div>
            <div>
              <Label htmlFor="endTime" className="text-sm font-medium text-[#314C5D]">
                Hora de fim
              </Label>
              <Input
                id="endTime"
                data-testid="input-end-time"
                type="time"
                value={form.endTime}
                onChange={(e) => handleChange("endTime", e.target.value)}
                className="mt-1.5 h-12 rounded-xl border-gray-200 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="venueName" className="text-sm font-medium text-[#314C5D]">
                Nome do local
              </Label>
              <Input
                id="venueName"
                data-testid="input-venue-name"
                placeholder="Ex: XP Inc."
                value={form.venueName}
                onChange={(e) => handleChange("venueName", e.target.value)}
                className="mt-1.5 h-12 rounded-xl border-gray-200 bg-white"
              />
            </div>
            <div>
              <Label htmlFor="venueAddress" className="text-sm font-medium text-[#314C5D]">
                Endereço
              </Label>
              <Input
                id="venueAddress"
                data-testid="input-venue-address"
                placeholder="Ex: Av. Faria Lima, 3500"
                value={form.venueAddress}
                onChange={(e) => handleChange("venueAddress", e.target.value)}
                className="mt-1.5 h-12 rounded-xl border-gray-200 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="maxCapacity" className="text-sm font-medium text-[#314C5D]">
                Capacidade máxima
              </Label>
              <Input
                id="maxCapacity"
                data-testid="input-max-capacity"
                type="number"
                placeholder="Ex: 500"
                value={form.maxCapacity}
                onChange={(e) => handleChange("maxCapacity", e.target.value)}
                className="mt-1.5 h-12 rounded-xl border-gray-200 bg-white"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-[#314C5D]">Tipo de evento</Label>
              <div className="mt-1.5 flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={form.type === "simples"}
                    onChange={() => handleChange("type", "simples")}
                    className="accent-[#314C5D]"
                  />
                  <span className="text-sm">Simples</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={form.type === "feira com stands"}
                    onChange={() => handleChange("type", "feira com stands")}
                    className="accent-[#314C5D]"
                  />
                  <span className="text-sm">Feira com Stands</span>
                </label>
              </div>
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              data-testid="button-save-draft"
              variant="outline"
              onClick={handleSaveDraft}
              className="h-12 px-8 rounded-xl border-[#314C5D] text-[#314C5D] hover:bg-[#314C5D]/5"
            >
              Salvar rascunho
            </Button>
            <Button
              data-testid="button-publish"
              onClick={handlePublish}
              className="h-12 px-8 rounded-xl bg-[#DEFF66] text-[#314C5D] font-bold hover:bg-[#c9eb55]"
            >
              Publicar evento
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
