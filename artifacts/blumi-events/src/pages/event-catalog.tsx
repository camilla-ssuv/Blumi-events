import { useState, useMemo } from "react";
import { useLocation, useSearch } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useEventStore } from "@/hooks/use-event-store";
import { Navbar } from "@/components/navbar";
import { type CatalogEvent } from "@/lib/mock-data";
import { Search, Calendar, MapPin, Tent } from "lucide-react";

const tipoLabelColors: Record<string, { bg: string; text: string }> = {
  feira: { bg: "#314C5D", text: "#FFFFFF" },
  palestra: { bg: "#DEFF66", text: "#314C5D" },
  workshop: { bg: "#FF8C69", text: "#FFFFFF" },
};

type TipoFilter = "todos" | "feira" | "palestra" | "workshop";
type DataFilter = "todos" | "esta_semana" | "este_mes" | "proximos_3_meses";

function formatDate(iso: string) {
  const d = new Date(iso);
  const months = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function vagasColor(event: CatalogEvent) {
  const pct = event.vagas_restantes / event.capacidade_total;
  if (pct < 0.1) return { text: "text-[#FF6982]", label: "Últimas vagas!" };
  if (pct < 0.2) return { text: "text-[#FF8C69]", label: `${event.vagas_restantes} vagas` };
  return { text: "text-emerald-600", label: `${event.vagas_restantes} vagas` };
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="h-[180px] bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
        <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
        <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
      </div>
      <div className="border-t border-gray-200 px-4 py-3 flex justify-between">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
        <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
      </div>
    </div>
  );
}

export default function EventCatalog() {
  const { role } = useAuth();
  const { catalogEventsList } = useEventStore();
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);

  const [search, setSearch] = useState(params.get("q") || "");
  const [tipoFilter, setTipoFilter] = useState<TipoFilter>((params.get("tipo") as TipoFilter) || "todos");
  const [dataFilter, setDataFilter] = useState<DataFilter>((params.get("data") as DataFilter) || "todos");
  const [cidadeFilter, setCidadeFilter] = useState(params.get("cidade") || "todas");
  const [empresaFilter, setEmpresaFilter] = useState(params.get("empresa") || "todas");
  const [loading] = useState(false);

  const isLoggedIn = role === "participant";
  const enrolledEventIds = isLoggedIn ? ["evt-1"] : [];

  const cidades = useMemo(() => {
    const set = new Set(catalogEventsList.map((e) => e.cidade));
    return Array.from(set).sort();
  }, [catalogEventsList]);

  const empresas = useMemo(() => {
    const set = new Set(catalogEventsList.map((e) => e.empresa));
    return Array.from(set).sort();
  }, [catalogEventsList]);

  const filtered = useMemo(() => {
    let result = catalogEventsList.filter((e) => e.status === "publicado");

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.nome.toLowerCase().includes(q) ||
          e.empresa.toLowerCase().includes(q) ||
          e.cidade.toLowerCase().includes(q)
      );
    }

    if (tipoFilter !== "todos") {
      result = result.filter((e) => e.tipo_label === tipoFilter);
    }

    if (dataFilter !== "todos") {
      const now = new Date();
      result = result.filter((e) => {
        const d = new Date(e.data_inicio);
        if (dataFilter === "esta_semana") {
          const weekEnd = new Date(now);
          weekEnd.setDate(weekEnd.getDate() + 7);
          return d >= now && d <= weekEnd;
        }
        if (dataFilter === "este_mes") {
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }
        if (dataFilter === "proximos_3_meses") {
          const threeMonths = new Date(now);
          threeMonths.setMonth(threeMonths.getMonth() + 3);
          return d >= now && d <= threeMonths;
        }
        return true;
      });
    }

    if (cidadeFilter !== "todas") {
      result = result.filter((e) => e.cidade === cidadeFilter);
    }

    if (empresaFilter !== "todas") {
      result = result.filter((e) => e.empresa === empresaFilter);
    }

    return result;
  }, [search, tipoFilter, dataFilter, cidadeFilter, empresaFilter, catalogEventsList]);

  const updateUrl = (newTipo: TipoFilter, newData: DataFilter, newCidade: string, newEmpresa: string, newQ: string) => {
    const p = new URLSearchParams();
    if (newQ) p.set("q", newQ);
    if (newTipo !== "todos") p.set("tipo", newTipo);
    if (newData !== "todos") p.set("data", newData);
    if (newCidade !== "todas") p.set("cidade", newCidade);
    if (newEmpresa !== "todas") p.set("empresa", newEmpresa);
    const qs = p.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  };

  const setFilterAndUrl = (setter: (v: string) => void, key: string, value: string) => {
    setter(value);
    const newTipo = key === "tipo" ? (value as TipoFilter) : tipoFilter;
    const newData = key === "data" ? (value as DataFilter) : dataFilter;
    const newCidade = key === "cidade" ? value : cidadeFilter;
    const newEmpresa = key === "empresa" ? value : empresaFilter;
    const newQ = key === "q" ? value : search;
    updateUrl(newTipo, newData, newCidade, newEmpresa, newQ);
  };

  const clearFilters = () => {
    setSearch("");
    setTipoFilter("todos");
    setDataFilter("todos");
    setCidadeFilter("todas");
    setEmpresaFilter("todas");
    window.history.replaceState(null, "", window.location.pathname);
  };

  const handleCardClick = (event: CatalogEvent) => {
    setLocation(`/eventos/${event.slug}`);
  };

  return (
    <div className="min-h-screen bg-[#F5F6F8]">
      <Navbar />

      <div className="bg-[#314C5D] px-6 pt-12 pb-14">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-heading font-bold text-white mb-3">
            Encontre seu próximo evento
          </h1>
          <p className="text-white/80 text-base md:text-lg mb-8 max-w-2xl mx-auto">
            Feiras de carreira, palestras e workshops das melhores empresas do Brasil
          </p>
          <div className="max-w-xl mx-auto relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setFilterAndUrl(setSearch, "q", e.target.value);
              }}
              placeholder="Buscar por evento, empresa ou cidade..."
              className="w-full h-13 pl-12 pr-4 py-3.5 rounded-xl bg-white text-gray-800 placeholder:text-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#DEFF66]"
            />
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center gap-4">
          <div className="flex gap-2 flex-wrap">
            {(["todos", "feira", "palestra", "workshop"] as TipoFilter[]).map((t) => (
              <button
                key={t}
                data-testid={`catalog-filter-tipo-${t}`}
                onClick={() => setFilterAndUrl(setTipoFilter as (v: string) => void, "tipo", t)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  tipoFilter === t
                    ? "bg-[#314C5D] text-white"
                    : "border border-[#314C5D] text-[#314C5D] hover:bg-[#314C5D]/5"
                }`}
              >
                {t === "todos" ? "Todos" : t === "feira" ? "Feira" : t === "palestra" ? "Palestra" : "Workshop"}
              </button>
            ))}
          </div>

          <select
            value={dataFilter}
            onChange={(e) => setFilterAndUrl(setDataFilter as (v: string) => void, "data", e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#314C5D]"
          >
            <option value="todos">Todas as datas</option>
            <option value="esta_semana">Esta semana</option>
            <option value="este_mes">Este mês</option>
            <option value="proximos_3_meses">Próximos 3 meses</option>
          </select>

          <select
            value={cidadeFilter}
            onChange={(e) => setFilterAndUrl(setCidadeFilter, "cidade", e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#314C5D]"
          >
            <option value="todas">Todas as cidades</option>
            {cidades.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={empresaFilter}
            onChange={(e) => setFilterAndUrl(setEmpresaFilter, "empresa", e.target.value)}
            className="h-9 px-3 rounded-lg border border-gray-300 bg-white text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#314C5D]"
          >
            <option value="todas">Todas as empresas</option>
            {empresas.map((e) => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>

          <span className="ml-auto text-sm text-gray-500 whitespace-nowrap">
            {filtered.length} evento{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-[#314C5D] flex items-center justify-center mb-6">
              <Calendar size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-heading font-bold text-[#314C5D] mb-2">Nenhum evento encontrado</h3>
            <p className="text-gray-500 mb-6">Tente ajustar os filtros ou buscar por outro termo.</p>
            <button
              onClick={clearFilters}
              className="px-6 py-2.5 bg-[#314C5D] text-white rounded-xl font-medium hover:bg-[#314C5D]/90 transition-colors"
            >
              Limpar filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((evt) => {
              const isEnrolled = enrolledEventIds.includes(evt.id);
              const vagas = vagasColor(evt);
              const labelStyle = tipoLabelColors[evt.tipo_label] || tipoLabelColors.feira;

              return (
                <div
                  key={evt.id}
                  data-testid={`catalog-card-${evt.id}`}
                  className="bg-white rounded-2xl border border-[#E0E0E0] overflow-hidden hover:-translate-y-1 transition-transform duration-200 cursor-pointer group"
                  onClick={() => handleCardClick(evt)}
                >
                  <div
                    className="h-[180px] relative overflow-hidden"
                    style={{
                      background: evt.cor_primaria === "#314C5D"
                        ? "linear-gradient(135deg, #314C5D 0%, #29D4FF 100%)"
                        : evt.cor_primaria === "#DEFF66"
                        ? "linear-gradient(135deg, #314C5D 0%, #DEFF66 100%)"
                        : `linear-gradient(135deg, ${evt.cor_primaria} 0%, ${evt.cor_primaria}99 100%)`,
                    }}
                  >
                    <div className="absolute inset-0 opacity-10" style={{
                      backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 30%, white 1px, transparent 1px)",
                      backgroundSize: "40px 40px, 60px 60px",
                    }} />
                    {evt.visibilidade === "convite" && (
                      <div className="absolute top-3 right-3 bg-[#314C5D] text-[#DEFF66] text-[10px] font-bold px-2.5 py-1 rounded-md">
                        Por convite
                      </div>
                    )}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#314C5D] font-bold text-sm shadow-lg">
                        {evt.logo_inicial}
                      </div>
                    </div>
                  </div>

                  <div className="p-4">
                    <span
                      className="inline-block text-[10px] uppercase font-bold px-2.5 py-1 rounded-md mb-2"
                      style={{ backgroundColor: labelStyle.bg, color: labelStyle.text }}
                    >
                      {evt.tipo_label}
                    </span>
                    <h3 className="font-heading font-bold text-[15px] text-[#314C5D] leading-snug line-clamp-2 mb-1.5 group-hover:underline">
                      {evt.nome}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">{evt.empresa}</p>
                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        <span>{formatDate(evt.data_inicio)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={12} />
                        <span>{evt.cidade === "Remoto" ? "Online" : evt.cidade}</span>
                      </div>
                      {evt.subeventos_count > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Tent size={12} />
                          <span>{evt.subeventos_count} atividades</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-gray-200 px-4 py-3 flex items-center justify-between">
                    <span className={`text-sm font-medium ${vagas.text}`}>
                      {vagas.label}
                    </span>
                    {isEnrolled ? (
                      <span className="px-4 py-1.5 bg-[#E8F5E9] text-[#085041] text-sm font-medium rounded-lg">
                        Inscrito ✓
                      </span>
                    ) : evt.visibilidade === "convite" ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/eventos/${evt.slug}`);
                        }}
                        className="px-4 py-1.5 border border-[#314C5D] text-[#314C5D] text-sm font-medium rounded-lg hover:bg-[#314C5D]/5 transition-colors"
                      >
                        Ver evento
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/eventos/${evt.slug}`);
                        }}
                        className="px-4 py-1.5 bg-[#DEFF66] text-[#314C5D] text-sm font-bold rounded-lg hover:bg-[#c9eb55] transition-colors"
                      >
                        Inscrever-se
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
