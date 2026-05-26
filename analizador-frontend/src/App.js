import { useState, useRef } from "react";
import "./index.css";

const API_URL = "http://localhost:3001";

// ── Icono SVG inline ──────────────────────────────────────────────────────────
const Icon = ({ name, size = 20 }) => {
  const icons = {
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></>,
    file: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>,
    check: <><polyline points="20 6 9 17 4 12"/></>,
    alert: <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
    x: <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    loader: <><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
    refresh: <><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {icons[name]}
    </svg>
  );
};

// ── Componente de una fila de dato ─────────────────────────────────────────────
const DataRow = ({ label, value }) => {
  if (!value && value !== 0) return null;
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start",
      padding:"10px 0", borderBottom:"1px solid var(--border)", gap:16 }}>
      <span style={{ color:"var(--text-muted)", fontSize:13, fontFamily:"'DM Mono', monospace",
        flexShrink:0 }}>{label}</span>
      <span style={{ color:"var(--text)", fontSize:13, textAlign:"right",
        wordBreak:"break-word", maxWidth:"60%" }}>{String(value)}</span>
    </div>
  );
};

// ── Tarjeta de sección ─────────────────────────────────────────────────────────
const Section = ({ title, accent = "var(--accent)", children }) => (
  <div style={{ background:"var(--card)", border:"1px solid var(--border)",
    borderRadius:var_radius, padding:"20px 24px", marginBottom:12 }}>
    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
      <div style={{ width:3, height:18, background:accent, borderRadius:2 }}/>
      <h3 style={{ fontSize:13, fontWeight:600, letterSpacing:"0.08em",
        textTransform:"uppercase", color:accent }}>{title}</h3>
    </div>
    {children}
  </div>
);
const var_radius = "var(--radius)";

// ── Alerta ─────────────────────────────────────────────────────────────────────
const Alerta = ({ texto }) => (
  <div style={{ display:"flex", gap:10, alignItems:"flex-start", padding:"10px 14px",
    background:"var(--red-soft)", border:"1px solid rgba(255,77,109,0.2)",
    borderRadius:"var(--radius-sm)", marginBottom:8 }}>
    <span style={{ color:"var(--red)", flexShrink:0, marginTop:1 }}><Icon name="alert" size={15}/></span>
    <span style={{ fontSize:13, color:"#ffb3c0", lineHeight:1.5 }}>{texto}</span>
  </div>
);

// ── Resultado de FACTURA ───────────────────────────────────────────────────────
const ResultadoFactura = ({ d }) => (
  <div>
    {d.alertas?.length > 0 && (
      <Section title="Alertas detectadas" accent="var(--red)">
        {d.alertas.map((a, i) => <Alerta key={i} texto={a}/>)}
      </Section>
    )}
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
      <Section title="Proveedor" accent="var(--accent)">
        <DataRow label="Nombre" value={d.proveedor?.nombre}/>
        <DataRow label="RUC / NIT" value={d.proveedor?.ruc_o_nit}/>
        <DataRow label="Dirección" value={d.proveedor?.direccion}/>
        <DataRow label="Teléfono" value={d.proveedor?.telefono}/>
        <DataRow label="Email" value={d.proveedor?.email}/>
      </Section>
      <Section title="Cliente" accent="var(--accent)">
        <DataRow label="Nombre" value={d.cliente?.nombre}/>
        <DataRow label="RUC / NIT" value={d.cliente?.ruc_o_nit}/>
        <DataRow label="Dirección" value={d.cliente?.direccion}/>
      </Section>
    </div>
    <Section title="Datos del documento" accent="var(--green)">
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0 32px" }}>
        <DataRow label="N° Factura" value={d.documento?.numero}/>
        <DataRow label="Moneda" value={d.documento?.moneda}/>
        <DataRow label="Emisión" value={d.documento?.fecha_emision}/>
        <DataRow label="Vencimiento" value={d.documento?.fecha_vencimiento}/>
      </div>
    </Section>
    {d.items?.length > 0 && (
      <Section title="Detalle de items" accent="var(--amber)">
        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ borderBottom:"1px solid var(--border)" }}>
                {["Descripción","Cant.","P. Unit.","Subtotal"].map(h => (
                  <th key={h} style={{ padding:"6px 8px", textAlign:"left",
                    color:"var(--text-muted)", fontWeight:500, fontFamily:"'DM Mono',monospace",
                    fontSize:12 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {d.items.map((item, i) => (
                <tr key={i} style={{ borderBottom:"1px solid var(--border)" }}>
                  <td style={{ padding:"8px", color:"var(--text)" }}>{item.descripcion}</td>
                  <td style={{ padding:"8px", color:"var(--text-muted)", textAlign:"center" }}>{item.cantidad}</td>
                  <td style={{ padding:"8px", color:"var(--text-muted)", textAlign:"right",
                    fontFamily:"'DM Mono',monospace" }}>{item.precio_unitario}</td>
                  <td style={{ padding:"8px", color:"var(--green)", textAlign:"right",
                    fontFamily:"'DM Mono',monospace" }}>{item.subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end",
          gap:6, marginTop:16, paddingTop:12, borderTop:"1px solid var(--border)" }}>
          <DataRow label="Subtotal" value={d.totales?.subtotal}/>
          <DataRow label={`IGV/IVA (${d.totales?.igv_iva_porcentaje}%)`} value={d.totales?.igv_iva_monto}/>
          <div style={{ display:"flex", justifyContent:"space-between", width:"100%",
            padding:"10px 12px", background:"var(--accent-soft)", borderRadius:"var(--radius-sm)",
            border:"1px solid var(--accent-glow)" }}>
            <span style={{ fontWeight:700, color:"var(--accent)" }}>TOTAL</span>
            <span style={{ fontWeight:700, color:"var(--accent)", fontFamily:"'DM Mono',monospace",
              fontSize:16 }}>{d.totales?.total}</span>
          </div>
        </div>
      </Section>
    )}
    {d.resumen && (
      <div style={{ padding:"14px 18px", background:"var(--green-soft)",
        border:"1px solid rgba(0,229,160,0.2)", borderRadius:"var(--radius-sm)",
        fontSize:13, color:"#a0f0d8", lineHeight:1.6 }}>
        {d.resumen}
      </div>
    )}
  </div>
);

// ── Resultado de CONTRATO ──────────────────────────────────────────────────────
const ResultadoContrato = ({ d }) => (
  <div>
    {d.alertas?.length > 0 && (
      <Section title="Alertas detectadas" accent="var(--red)">
        {d.alertas.map((a, i) => <Alerta key={i} texto={a}/>)}
      </Section>
    )}
    <Section title="Partes del contrato" accent="var(--accent)">
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {d.partes?.map((p, i) => (
          <div key={i} style={{ padding:"12px", background:"var(--surface)",
            borderRadius:"var(--radius-sm)", border:"1px solid var(--border)" }}>
            <div style={{ fontSize:11, fontWeight:600, color:"var(--accent)",
              letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8 }}>{p.rol}</div>
            <div style={{ fontSize:14, fontWeight:600 }}>{p.nombre}</div>
            {p.documento_identidad && <div style={{ fontSize:12, color:"var(--text-muted)",
              fontFamily:"'DM Mono',monospace", marginTop:4 }}>{p.documento_identidad}</div>}
          </div>
        ))}
      </div>
    </Section>
    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
      <Section title="Datos del contrato" accent="var(--green)">
        <DataRow label="Tipo" value={d.documento?.tipo_contrato}/>
        <DataRow label="N°" value={d.documento?.numero}/>
        <DataRow label="Fecha firma" value={d.documento?.fecha_firma}/>
        <DataRow label="Inicio" value={d.documento?.fecha_inicio}/>
        <DataRow label="Fin" value={d.documento?.fecha_fin}/>
        <DataRow label="Renovación auto" value={d.documento?.renovacion_automatica ? "⚠️ SÍ" : "No"}/>
      </Section>
      <Section title="Monto y pago" accent="var(--amber)">
        <DataRow label="Valor" value={d.monto?.valor}/>
        <DataRow label="Moneda" value={d.monto?.moneda}/>
        <DataRow label="Forma de pago" value={d.monto?.forma_pago}/>
        <DataRow label="Periodicidad" value={d.monto?.periodicidad}/>
      </Section>
    </div>
    {d.objeto && (
      <Section title="Objeto del contrato" accent="var(--accent)">
        <p style={{ fontSize:13, color:"var(--text-muted)", lineHeight:1.7 }}>{d.objeto}</p>
      </Section>
    )}
    {(d.obligaciones_parte_a?.length > 0 || d.obligaciones_parte_b?.length > 0) && (
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 }}>
        {[["Obligaciones parte A", d.obligaciones_parte_a], ["Obligaciones parte B", d.obligaciones_parte_b]].map(([titulo, lista]) => (
          lista?.length > 0 && (
            <Section key={titulo} title={titulo} accent="var(--green)">
              {lista.map((o, i) => (
                <div key={i} style={{ display:"flex", gap:8, padding:"5px 0",
                  borderBottom:"1px solid var(--border)", fontSize:13, color:"var(--text-muted)" }}>
                  <span style={{ color:"var(--green)", flexShrink:0 }}>›</span>{o}
                </div>
              ))}
            </Section>
          )
        ))}
      </div>
    )}
    {d.penalidades?.length > 0 && (
      <Section title="Penalidades" accent="var(--red)">
        {d.penalidades.map((p, i) => <Alerta key={i} texto={p}/>)}
      </Section>
    )}
    {d.clausulas_importantes?.length > 0 && (
      <Section title="Cláusulas importantes" accent="var(--amber)">
        {d.clausulas_importantes.map((c, i) => (
          <div key={i} style={{ padding:"8px 12px", background:"var(--amber-soft)",
            borderRadius:"var(--radius-sm)", marginBottom:6, fontSize:13,
            color:"#ffd0a0", lineHeight:1.5 }}>{c}</div>
        ))}
      </Section>
    )}
    {d.resumen && (
      <div style={{ padding:"14px 18px", background:"var(--green-soft)",
        border:"1px solid rgba(0,229,160,0.2)", borderRadius:"var(--radius-sm)",
        fontSize:13, color:"#a0f0d8", lineHeight:1.6 }}>{d.resumen}</div>
    )}
  </div>
);

// ── APP PRINCIPAL ──────────────────────────────────────────────────────────────
export default function App() {
  const [archivo, setArchivo] = useState(null);
  const [tipo, setTipo] = useState("auto");
  const [estado, setEstado] = useState("idle"); // idle | cargando | listo | error
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();

  const handleArchivo = (file) => {
    if (!file || file.type !== "application/pdf") {
      setError("Solo se permiten archivos PDF");
      return;
    }
    setArchivo(file);
    setResultado(null);
    setError("");
    setEstado("idle");
  };

  const analizar = async () => {
    if (!archivo) return;
    setEstado("cargando");
    setError("");
    try {
      const form = new FormData();
      form.append("archivo", archivo);
      form.append("tipo", tipo);
      const res = await fetch(`${API_URL}/analizar`, { method:"POST", body:form });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error);
      setResultado(json);
      setEstado("listo");
    } catch (e) {
      setError(e.message || "Error al conectar con el servidor");
      setEstado("error");
    }
  };

  const copiarJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(resultado?.datos, null, 2));
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const reset = () => {
    setArchivo(null); setResultado(null);
    setError(""); setEstado("idle");
  };

  return (
    <div style={{ position:"relative", zIndex:1, minHeight:"100vh" }}>
      {/* Header */}
      <header style={{ padding:"28px 40px 0", display:"flex",
        justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:36, height:36, background:"var(--accent)",
            borderRadius:10, display:"flex", alignItems:"center",
            justifyContent:"center", fontSize:18 }}>📄</div>
          <div>
            <h1 style={{ fontSize:18, fontWeight:800, letterSpacing:"-0.02em",
              color:"var(--text)" }}>DocAnalyzer <span style={{ color:"var(--accent)" }}>IA</span></h1>
            <p style={{ fontSize:11, color:"var(--text-dim)",
              fontFamily:"'DM Mono',monospace" }}>powered by Claude</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ width:8, height:8, borderRadius:"50%",
            background:"var(--green)", boxShadow:"0 0 8px var(--green)" }}/>
          <span style={{ fontSize:12, color:"var(--text-muted)",
            fontFamily:"'DM Mono',monospace" }}>API conectada</span>
        </div>
      </header>

      <main style={{ maxWidth:900, margin:"0 auto", padding:"32px 40px" }}>
        {/* Zona de subida */}
        {estado !== "listo" && (
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => { e.preventDefault(); setDragging(false);
              handleArchivo(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current.click()}
            style={{
              border:`2px dashed ${dragging ? "var(--accent)" : archivo ? "var(--green)" : "var(--border)"}`,
              borderRadius:"var(--radius)", padding:"48px 32px",
              textAlign:"center", cursor:"pointer", transition:"all 0.2s",
              background: dragging ? "var(--accent-soft)" : archivo ? "var(--green-soft)" : "var(--surface)",
              marginBottom:24
            }}>
            <input ref={fileRef} type="file" accept=".pdf"
              style={{ display:"none" }}
              onChange={e => handleArchivo(e.target.files[0])}/>
            <div style={{ marginBottom:16 }}>
              {archivo
                ? <span style={{ color:"var(--green)", fontSize:40 }}>✓</span>
                : <span style={{ color:"var(--text-dim)", display:"block",
                    marginBottom:8 }}><Icon name="upload" size={36}/></span>
              }
            </div>
            {archivo ? (
              <div>
                <p style={{ fontWeight:700, fontSize:16, color:"var(--green)" }}>{archivo.name}</p>
                <p style={{ color:"var(--text-muted)", fontSize:13, marginTop:4,
                  fontFamily:"'DM Mono',monospace" }}>
                  {(archivo.size/1024).toFixed(1)} KB — listo para analizar
                </p>
              </div>
            ) : (
              <div>
                <p style={{ fontWeight:600, fontSize:16, marginBottom:6 }}>
                  Arrastra tu PDF aquí
                </p>
                <p style={{ color:"var(--text-muted)", fontSize:13 }}>
                  o haz clic para seleccionar — facturas y contratos
                </p>
              </div>
            )}
          </div>
        )}

        {/* Controles */}
        {archivo && estado !== "listo" && (
          <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:24,
            flexWrap:"wrap" }}>
            <div style={{ flex:1, minWidth:200 }}>
              <label style={{ fontSize:12, color:"var(--text-muted)",
                fontFamily:"'DM Mono',monospace", display:"block", marginBottom:6 }}>
                tipo de documento
              </label>
              <select value={tipo} onChange={e => setTipo(e.target.value)}
                style={{ width:"100%", background:"var(--card)", border:"1px solid var(--border)",
                  borderRadius:"var(--radius-sm)", padding:"10px 14px",
                  color:"var(--text)", fontSize:14, fontFamily:"'Syne',sans-serif",
                  cursor:"pointer", outline:"none" }}>
                <option value="auto">Detectar automáticamente</option>
                <option value="factura">Factura</option>
                <option value="contrato">Contrato</option>
              </select>
            </div>
            <button onClick={analizar} disabled={estado === "cargando"}
              style={{
                marginTop:22, padding:"11px 28px", background:"var(--accent)",
                border:"none", borderRadius:"var(--radius-sm)", color:"#fff",
                fontSize:14, fontWeight:700, cursor:"pointer",
                opacity: estado === "cargando" ? 0.6 : 1,
                display:"flex", alignItems:"center", gap:8,
                fontFamily:"'Syne',sans-serif", letterSpacing:"0.02em"
              }}>
              {estado === "cargando"
                ? <><span style={{ animation:"spin 1s linear infinite",
                    display:"inline-block" }}><Icon name="loader" size={16}/></span> Analizando...</>
                : <><Icon name="file" size={16}/> Analizar con IA</>
              }
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ display:"flex", gap:10, padding:"14px 18px",
            background:"var(--red-soft)", border:"1px solid rgba(255,77,109,0.3)",
            borderRadius:"var(--radius-sm)", marginBottom:20, color:"var(--red)",
            fontSize:13 }}>
            <Icon name="alert" size={16}/> {error}
          </div>
        )}

        {/* Estado: cargando */}
        {estado === "cargando" && (
          <div style={{ textAlign:"center", padding:"60px 0" }}>
            <div style={{ fontSize:48, marginBottom:16,
              animation:"spin 2s linear infinite", display:"inline-block" }}>⚙</div>
            <p style={{ color:"var(--text-muted)", fontSize:14 }}>Claude está leyendo tu documento...</p>
            <p style={{ color:"var(--text-dim)", fontSize:12,
              fontFamily:"'DM Mono',monospace", marginTop:6 }}>esto puede tomar 5-15 segundos</p>
          </div>
        )}

        {/* Resultados */}
        {estado === "listo" && resultado && (
          <div>
            {/* Barra de info */}
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:10 }}>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                <span style={{ padding:"5px 12px", background:"var(--green-soft)",
                  border:"1px solid rgba(0,229,160,0.25)", borderRadius:20,
                  fontSize:12, color:"var(--green)", fontWeight:600 }}>
                  ✓ {resultado.datos.tipo?.toUpperCase()}
                </span>
                <span style={{ padding:"5px 12px", background:"var(--surface)",
                  border:"1px solid var(--border)", borderRadius:20,
                  fontSize:12, color:"var(--text-muted)",
                  fontFamily:"'DM Mono',monospace" }}>
                  {resultado.tiempo_ms}ms
                </span>
                <span style={{ padding:"5px 12px", background:"var(--surface)",
                  border:"1px solid var(--border)", borderRadius:20,
                  fontSize:12, color:"var(--text-muted)" }}>
                  {resultado.archivo}
                </span>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={copiarJSON}
                  style={{ display:"flex", alignItems:"center", gap:6,
                    padding:"7px 14px", background:"var(--card)",
                    border:"1px solid var(--border)", borderRadius:"var(--radius-sm)",
                    color:"var(--text-muted)", fontSize:12, cursor:"pointer",
                    fontFamily:"'Syne',sans-serif" }}>
                  <Icon name={copiado ? "check" : "copy"} size={13}/>
                  {copiado ? "Copiado" : "JSON"}
                </button>
                <button onClick={reset}
                  style={{ display:"flex", alignItems:"center", gap:6,
                    padding:"7px 14px", background:"var(--accent-soft)",
                    border:"1px solid var(--accent-glow)", borderRadius:"var(--radius-sm)",
                    color:"var(--accent)", fontSize:12, cursor:"pointer",
                    fontFamily:"'Syne',sans-serif" }}>
                  <Icon name="refresh" size={13}/> Nuevo
                </button>
              </div>
            </div>

            {resultado.datos.tipo === "factura"
              ? <ResultadoFactura d={resultado.datos}/>
              : resultado.datos.tipo === "contrato"
              ? <ResultadoContrato d={resultado.datos}/>
              : (
                <Section title="Datos extraídos" accent="var(--accent)">
                  <pre style={{ fontSize:12, color:"var(--text-muted)",
                    fontFamily:"'DM Mono',monospace", overflowX:"auto",
                    lineHeight:1.7, whiteSpace:"pre-wrap",
                    wordBreak:"break-word" }}>
                    {JSON.stringify(resultado.datos, null, 2)}
                  </pre>
                </Section>
              )
            }
          </div>
        )}
      </main>
      <footer style={{
        textAlign: 'center',
        padding: '20px',
        marginTop: '40px',
        color: 'var(--text-muted)', // Usa el mismo color tenue de tu app
        fontSize: '14px',
        borderTop: '1px solid var(--border)' // Usa el borde sutil de tu interfaz
      }}>
        <p>© 2026 DocAnalyzer IA. Desarrollado por Juan Gabriel para INNOVA FAT.</p>
      </footer>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        select option { background: #16161f; }
        button:hover { filter: brightness(1.1); }
        * { scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
      `}</style>
    </div>
  );
}
