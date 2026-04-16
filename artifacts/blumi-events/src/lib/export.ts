import type { Participant } from "./mock-data";

type TriagemData = { area: string; como_soube: string; inscrito_em: string };

const triagemMock: Record<string, TriagemData> = {
  p1: { area: "Tecnologia", como_soube: "LinkedIn", inscrito_em: "10/05/2025 14:22:15" },
  p2: { area: "Finanças", como_soube: "Indicação", inscrito_em: "10/05/2025 15:03:42" },
  p3: { area: "Tecnologia", como_soube: "Instagram", inscrito_em: "11/05/2025 09:17:08" },
  p4: { area: "Finanças", como_soube: "LinkedIn", inscrito_em: "11/05/2025 11:45:33" },
  p5: { area: "Marketing", como_soube: "E-mail", inscrito_em: "12/05/2025 08:29:51" },
  p6: { area: "Tecnologia", como_soube: "LinkedIn", inscrito_em: "12/05/2025 16:12:27" },
  p7: { area: "Outro", como_soube: "Instagram", inscrito_em: "13/05/2025 10:55:04" },
  p8: { area: "Finanças", como_soube: "Indicação", inscrito_em: "13/05/2025 19:38:19" },
};

function escapeCell(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function generateCSV(participantes: Participant[], eventSlug = "imersao-quantdev-xp"): void {
  const BOM = "\uFEFF";

  const headers = [
    "Data/hora inscrição",
    "Nome completo",
    "E-mail",
    "Tipo de ingresso",
    "Hora check-in",
    "Qual é a sua área de atuação?",
    "Como ficou sabendo do evento?",
    "Compareceu",
  ];

  const rows = participantes.map((p) => {
    const t = triagemMock[p.id] || { area: "", como_soube: "", inscrito_em: "" };
    const checkinTime = p.checkIn && p.checkInTime ? `${p.checkInTime}:00` : "";
    return [
      t.inscrito_em,
      p.name,
      p.email,
      "Geral",
      checkinTime,
      t.area,
      t.como_soube,
      p.checkIn ? "Sim" : "Não",
    ];
  });

  const csvContent =
    BOM +
    [headers, ...rows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dateStr = new Date().toISOString().split("T")[0];
  link.href = url;
  link.download = `${eventSlug}_${dateStr}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
