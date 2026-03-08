import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { HardHat, MapPin, Calendar, DollarSign, ArrowLeft, Building, Camera, FileText, ChevronDown, ExternalLink, Activity, TrendingUp, Image } from "lucide-react";

const TABLERO_PLACEHOLDER = [];
// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 }).format(n);
const fmtM = (n) => `$${(n / 1_000_000).toFixed(1)}M`;
const limpiarNum = (v) => { if (typeof v === "number") return v; return parseFloat(String(v).replace(/[$,%]/g, "").replace(",", ".")) || 0; };
const driveThumb = (link) => { const m = link?.match(/\/file\/d\/([^/]+)/); return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w800` : link; };
const estadoColor = (e = "") => {
  const s = e.toLowerCase();
  if (s.includes("finalizado")) return { bg: "bg-sky-100", text: "text-sky-700", border: "border-sky-200", dot: "bg-sky-500" };
  if (s.includes("ejecución") || s.includes("ejecucion")) return { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" };
  return { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" };
};
const proyectoEstado = (ocs) => {
  const porcs = ocs.filter(o => o.adjudicado > 0).map(o => o.porcentaje);
  if (!porcs.length) return "En Gestión";
  const avg = porcs.reduce((a, b) => a + b, 0) / porcs.length;
  if (avg >= 1) return "Finalizado";
  if (avg > 0) return "En Ejecución";
  return "En Gestión";
};

// ─── Tooltip personalizado para el gráfico ───────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-sm">
        <p className="font-bold mb-1">{label}</p>
        <p className="text-sky-400 font-black">{fmt(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

// ─── Vista de índice (lista de proyectos) ─────────────────────────────────────
function IndexView({ onSelect, tablero }) {
  return (
    <div className="min-h-screen bg-[#f0f4f8]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <header className="bg-[#0c2a3a] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-sky-500 p-2.5 rounded-xl">
              <HardHat size={22} className="text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-sky-300 uppercase tracking-widest">Municipalidad de San Miguel</p>
              <h1 className="text-lg font-bold">Secretaría de Obras y Espacios Públicos</h1>
            </div>
          </div>
          <span className="hidden md:block text-xs font-semibold bg-sky-900/60 border border-sky-700/40 px-4 py-2 rounded-full">
            Tablero de Control Abierto
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 mb-1">Obras en curso</h2>
          <p className="text-slate-500 text-sm">{TABLERO.length} proyecto(s) — hacé clic para ver el detalle</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tablero.map((proyecto) => {
            const estado = proyectoEstado(proyecto.ocs);
            const col = estadoColor(estado);
            const adjTotal = proyecto.ocs.reduce((s, o) => s + o.adjudicado, 0);
            const pagTotal = proyecto.ocs.reduce((s, o) => s + o.pagado, 0);
            const pct = adjTotal > 0 ? (pagTotal / adjTotal) * 100 : 0;
            const presup = limpiarNum(proyecto.presupuesto);
            return (
              <button key={proyecto.cat_programatica}
                onClick={() => onSelect(proyecto)}
                className="text-left bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md hover:border-sky-300 transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md font-mono">{proyecto.cat_programatica}</span>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${col.bg} ${col.text} ${col.border} flex items-center gap-1.5`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`}></span>
                    {estado}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-base mb-4 group-hover:text-sky-700 transition-colors leading-snug">
                  {proyecto.nombre_proyecto}
                </h3>
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                    <span>Avance financiero</span>
                    <span className="font-bold text-sky-600">{pct.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-sky-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%` }}></div>
                  </div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 font-medium mt-3 pt-3 border-t border-slate-100">
                  <span>Presupuesto: <span className="text-slate-600 font-bold">{fmtM(presup)}</span></span>
                  <span>Pagado: <span className="text-sky-600 font-bold">{fmtM(pagTotal)}</span></span>
                </div>
              </button>
            );
          })}
        </div>
      </main>

      <footer className="bg-[#0c2a3a] text-slate-400 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="font-bold text-white mb-1">Secretaría de Obras y Espacios Públicos — San Miguel</p>
          <p className="text-xs text-sky-700/80 max-w-xl mx-auto">
            Datos extraídos automáticamente de Actas de Medición y Certificados oficiales. Acceso público irrestricto.
          </p>
        </div>
      </footer>
    </div>
  );
}

// ─── Vista de detalle de proyecto ────────────────────────────────────────────
function ProyectoView({ proyecto, onBack }) {
  const [ocActiva, setOcActiva] = useState(0);
  const [cerSeleccionado, setCerSeleccionado] = useState(null);
  const [fotoAmpliada, setFotoAmpliada] = useState(null);

  const oc = proyecto.ocs[ocActiva];
  const historial = oc.historial_cer || [];
  const items = oc.items || [];
  const adjTotal = proyecto.ocs.reduce((s, o) => s + o.adjudicado, 0);
  const pagTotal = proyecto.ocs.reduce((s, o) => s + o.pagado, 0);
  const pctFin = adjTotal > 0 ? (pagTotal / adjTotal) * 100 : 0;
  const presup = limpiarNum(proyecto.presupuesto);
  const estado = proyectoEstado(proyecto.ocs);
  const col = estadoColor(estado);

  // Datos para gráfico de barras
  const datosGrafico = historial
    .filter(h => h.total_importe_mes >= 0)
    .map(h => ({ name: h.certificado, monto: h.total_importe_mes, acum: h.total_importe_acum }));

  // Fotos del cert seleccionado o activo
  const cerConFotos = cerSeleccionado
    ? historial.find(h => h.certificado === cerSeleccionado)
    : historial.find(h => h.fotos?.length > 0);
  const fotos = cerConFotos?.fotos || [];

  return (
    <div className="min-h-screen bg-[#f0f4f8]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />

      {/* Header */}
      <header className="bg-[#0c2a3a] text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-sky-800 rounded-xl transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-sky-500 p-2 rounded-xl"><HardHat size={18} /></div>
            <div>
              <p className="text-[10px] font-semibold text-sky-300 uppercase tracking-widest">Municipalidad de San Miguel</p>
              <h1 className="text-sm font-bold">{proyecto.nombre_proyecto}</h1>
            </div>
          </div>
          <span className={`ml-auto text-[11px] font-bold px-3 py-1.5 rounded-full border ${col.bg} ${col.text} ${col.border} flex items-center gap-1.5`}>
            <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`}></span>{estado}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Título */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold font-mono bg-white border border-slate-200 text-slate-500 px-2.5 py-1 rounded-md">{proyecto.cat_programatica}</span>
          </div>
          <h2 className="text-4xl font-extrabold text-slate-900 mb-2 leading-tight">{proyecto.nombre_proyecto}</h2>
          {oc.descripcion && (
            <p className="text-slate-500 text-base max-w-3xl leading-relaxed">{oc.descripcion}</p>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Presupuesto", value: fmtM(presup), sub: null, accent: "border-slate-300" },
            { label: "Adjudicado", value: fmtM(adjTotal), sub: null, accent: "border-blue-400" },
            { label: "Pagado", value: fmtM(pagTotal), sub: null, accent: "border-sky-400" },
            { label: "Avance Financiero", value: `${pctFin.toFixed(0)}%`, sub: null, accent: "border-indigo-400" },
          ].map(k => (
            <div key={k.label} className={`bg-white rounded-2xl border-b-4 ${k.accent} border border-slate-200 p-5 shadow-sm`}>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{k.label}</p>
              <p className="text-2xl font-black text-slate-800">{k.value}</p>
            </div>
          ))}
        </div>

        {/* Selector OC si hay más de una */}
        {proyecto.ocs.length > 1 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {proyecto.ocs.map((o, i) => (
              <button key={o.oc}
                onClick={() => { setOcActiva(i); setCerSeleccionado(null); }}
                className={`px-4 py-2 rounded-xl text-sm font-bold border transition-all ${ocActiva === i ? "bg-sky-600 text-white border-sky-600" : "bg-white text-slate-600 border-slate-200 hover:border-sky-300"}`}>
                OC {o.oc}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Columna principal */}
          <div className="xl:col-span-2 space-y-6">

            {/* Info OC */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Building size={18} className="text-sky-600" /> Orden de Compra — {oc.oc}
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Proveedor</p>
                  <p className="font-bold text-slate-800">{oc.proveedor || "—"}</p>
                </div>
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Estado</p>
                  <p className="font-semibold text-slate-700 text-xs leading-snug">{oc.estado}</p>
                </div>
                {oc.fecha_inicio && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Inicio</p>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5"><Calendar size={14} className="text-sky-500" />{oc.fecha_inicio}</p>
                  </div>
                )}
                {oc.fecha_fin_estimada && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Fin estimado</p>
                    <p className="font-bold text-slate-800 flex items-center gap-1.5"><Calendar size={14} className="text-slate-400" />{oc.fecha_fin_estimada}</p>
                  </div>
                )}
              </div>
              {oc.inspector && (
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
                  <div className="bg-sky-100 text-sky-700 p-2 rounded-lg"><HardHat size={16} /></div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inspector de obra</p>
                    <p className="font-semibold text-slate-800">{oc.inspector}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Gráfico de importes por certificado */}
            {datosGrafico.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                  <TrendingUp size={18} className="text-sky-600" /> Importe ejecutado por certificado
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={datosGrafico} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 600, fill: "#64748b" }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={v => fmtM(v)} tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={60} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />
                    <Bar dataKey="monto" radius={[6, 6, 0, 0]}>
                      {datosGrafico.map((_, i) => (
                        <Cell key={i} fill={i === datosGrafico.length - 1 ? "#0ea5e9" : "#38bdf8"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Avance físico por ítem */}
            {items.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                  <Activity size={18} className="text-sky-600" /> Avance físico por ítem
                  <span className="ml-auto text-xs font-mono text-slate-400">{oc.certificado}</span>
                </h3>
                <div className="space-y-4">
                  {items.map((it) => (
                    <div key={it.Item} className="group">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-700 group-hover:text-sky-700 transition-colors">
                          <span className="text-slate-400 font-mono mr-1.5">#{it.Item}</span>
                          {it.Denominacion}
                        </span>
                        <span className="font-black text-indigo-600 ml-4">{limpiarNum(it.Porcentaje_Acumulado).toFixed(0)}%</span>
                      </div>
                      <div className="relative h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div className="absolute left-0 top-0 h-full bg-slate-300/60 rounded-full transition-all"
                          style={{ width: `${limpiarNum(it.Porcentaje_anterior)}%` }}></div>
                        <div className="absolute left-0 top-0 h-full rounded-full transition-all"
                          style={{
                            width: `${limpiarNum(it.Porcentaje_Acumulado)}%`,
                            background: limpiarNum(it.Porcentaje_Acumulado) >= 100 ? "#0ea5e9" : "#0ea5e9"
                          }}></div>
                      </div>
                      <div className="flex gap-4 mt-1 text-[10px] text-slate-400">
                        <span>Ant: {limpiarNum(it.Porcentaje_anterior).toFixed(0)}%</span>
                        <span>Mes: {limpiarNum(it.Porcentaje_en_mes).toFixed(0)}%</span>
                        <span>Acum: <b className="text-indigo-500">{limpiarNum(it.Porcentaje_Acumulado).toFixed(0)}%</b></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Historial de certificados */}
            {historial.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
                  <FileText size={18} className="text-sky-600" /> Historial de certificados
                </h3>
                <div className="space-y-2">
                  {historial.map((cer) => {
                    const isActive = cerSeleccionado === cer.certificado;
                    return (
                      <div key={cer.certificado}
                        className={`rounded-xl border transition-all ${isActive ? "border-sky-300 bg-sky-50" : "border-slate-100 hover:border-slate-200 bg-slate-50/50"}`}>
                        <button
                          onClick={() => setCerSeleccionado(isActive ? null : cer.certificado)}
                          className="w-full flex items-center justify-between p-4 text-left"
                        >
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded-lg ${isActive ? "bg-sky-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}>
                              {cer.certificado}
                            </span>
                            <div>
                              <p className="text-sm font-bold text-slate-800">{fmt(cer.total_importe_mes)}</p>
                              <p className="text-[10px] text-slate-400">Acum: {fmt(cer.total_importe_acum)} · {cer.total_pct_acum}%</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {cer.fotos?.length > 0 && (
                              <span className="flex items-center gap-1 text-[11px] font-semibold text-sky-600 bg-sky-50 px-2 py-1 rounded-lg border border-sky-200">
                                <Camera size={12} /> {cer.fotos.length}
                              </span>
                            )}
                            <div className="flex gap-2">
                              {cer.link_cer && (
                                <a href={cer.link_cer} target="_blank" rel="noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  className="text-[11px] font-bold text-sky-600 hover:text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 flex items-center gap-1">
                                  <ExternalLink size={11} /> CER
                                </a>
                              )}
                              {cer.link_in && (
                                <a href={cer.link_in} target="_blank" rel="noreferrer"
                                  onClick={e => e.stopPropagation()}
                                  className="text-[11px] font-bold text-sky-600 hover:text-sky-800 bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-200 flex items-center gap-1">
                                  <Image size={11} /> IN
                                </a>
                              )}
                            </div>
                            <ChevronDown size={16} className={`text-slate-400 transition-transform ${isActive ? "rotate-180" : ""}`} />
                          </div>
                        </button>

                        {/* Fotos desplegadas */}
                        {isActive && cer.fotos?.length > 0 && (
                          <div className="px-4 pb-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">Registro fotográfico</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {cer.fotos.map((foto, fi) => (
                                <button key={fi} onClick={() => setFotoAmpliada(foto)}
                                  className="group relative overflow-hidden rounded-xl aspect-[4/3] bg-slate-200 border border-slate-200 hover:border-sky-300 transition-all">
                                  <img
                                    src={driveThumb(foto.link)}
                                    alt={foto.nombre}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    onError={e => { e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-slate-400 text-xs">Sin vista previa</div>'; }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                    <span className="text-white text-[11px] font-bold">{foto.nombre}</span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        {isActive && cer.fotos?.length === 0 && (
                          <div className="px-4 pb-4 text-xs text-slate-400 italic">Sin fotos para este certificado.</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Columna lateral */}
          <div className="space-y-6">

            {/* Avance global circular */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-center">
              <h3 className="font-bold text-slate-800 mb-5">Avance Financiero</h3>
              <div className="relative inline-flex items-center justify-center">
                <svg width="160" height="160" className="-rotate-90">
                  <circle cx="80" cy="80" r="66" strokeWidth="12" fill="none" className="text-slate-100" stroke="currentColor" />
                  <circle cx="80" cy="80" r="66" strokeWidth="12" fill="none" stroke="#0ea5e9"
                    strokeDasharray={414.69}
                    strokeDashoffset={414.69 - (414.69 * Math.min(pctFin, 100)) / 100}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute">
                  <p className="text-4xl font-black text-slate-900">{pctFin.toFixed(0)}%</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">pagado</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-center">
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-blue-400 uppercase">Adjudicado</p>
                  <p className="font-black text-blue-700 text-sm">{fmtM(adjTotal)}</p>
                </div>
                <div className="bg-sky-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-sky-400 uppercase">Pagado</p>
                  <p className="font-black text-sky-700 text-sm">{fmtM(pagTotal)}</p>
                </div>
              </div>
            </div>

            {/* Resumen por OC */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-4">Órdenes de Compra</h3>
              <div className="space-y-3">
                {proyecto.ocs.map((o, i) => {
                  const pct = o.adjudicado > 0 ? (o.pagado / o.adjudicado) * 100 : 0;
                  const c = estadoColor(o.estado);
                  return (
                    <button key={o.oc} onClick={() => setOcActiva(i)}
                      className={`w-full text-left p-4 rounded-xl border transition-all ${ocActiva === i ? "border-sky-300 bg-sky-50" : "border-slate-100 hover:border-slate-200 bg-slate-50/50"}`}>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold font-mono text-slate-600">{o.oc}</span>
                        <span className="text-xs font-black text-indigo-600">{pct.toFixed(0)}%</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mb-2 truncate">{o.proveedor || "Sin proveedor"}</p>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }}></div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Link al certificado */}
            {oc.link_certificado && (
              <a href={oc.link_certificado} target="_blank" rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm shadow-sm">
                <ExternalLink size={16} /> Ver certificado en Drive
              </a>
            )}
          </div>
        </div>
      </main>

      {/* Modal foto ampliada */}
      {fotoAmpliada && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setFotoAmpliada(null)}>
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <img src={driveThumb(fotoAmpliada.link, 1200)} alt={fotoAmpliada.nombre}
              className="w-full rounded-2xl shadow-2xl"
              onError={e => { e.target.src = ""; }} />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-4 rounded-b-2xl flex justify-between items-end">
              <span className="text-white font-bold">{fotoAmpliada.nombre}</span>
              <a href={fotoAmpliada.link} target="_blank" rel="noreferrer"
                className="text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 backdrop-blur-sm">
                <ExternalLink size={14} /> Drive
              </a>
            </div>
            <button onClick={() => setFotoAmpliada(null)}
              className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center text-lg backdrop-blur-sm">
              ×
            </button>
          </div>
        </div>
      )}

      <footer className="bg-[#0c2a3a] text-slate-400 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="font-bold text-white mb-1">Secretaría de Obras y Espacios Públicos — San Miguel</p>
          <p className="text-xs text-sky-700/80">Datos extraídos automáticamente de Actas de Medición y Certificados oficiales.</p>
        </div>
      </footer>
    </div>
  );
}

// ─── App raíz con fetch dinámico ─────────────────────────────────────────────
export default function App() {
  const [proyectoActivo, setProyectoActivo] = useState(null);
  const [tablero, setTablero] = useState(null);
  const [error, setError] = useState(null);

  // Carga tablero.json publicado por GitHub Actions
  const [, forceRender] = useState(0);
  useEffect(() => {
    fetch("tablero.json")
      .then(r => { if (!r.ok) throw new Error("No se pudo cargar tablero.json"); return r.json(); })
      .then(data => setTablero(data))
      .catch(err => {
        console.error("Error cargando tablero.json:", err);
        setTablero([]);
      });
  }, []);

  if (!tablero) {
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;700;800&display=swap" rel="stylesheet" />
        <div className="bg-white p-10 rounded-3xl shadow-lg flex flex-col items-center border border-slate-100">
          <div className="relative mb-5">
            <div className="absolute inset-0 bg-sky-100 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-sky-600 p-4 rounded-full text-white"><HardHat size={28} /></div>
          </div>
          <h2 className="text-xl font-black text-slate-800 mb-1">Cargando Tablero</h2>
          <p className="text-slate-400 text-sm">Procesando certificados y actas de medición...</p>
          <div className="w-48 bg-slate-100 h-1.5 rounded-full mt-5 overflow-hidden">
            <div className="bg-sky-500 h-full w-1/2 animate-pulse rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (proyectoActivo) {
    return <ProyectoView proyecto={proyectoActivo} onBack={() => setProyectoActivo(null)} />;
  }
  return <IndexView onSelect={setProyectoActivo} tablero={tablero} />;
}
