import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";
import { useArea } from "../context/AreaContext";

export default function Registros() {
  const { user } = useAuth();
  const { area, areaRole, loadingArea } = useArea();

  const canWrite = useMemo(
    () => ["admin", "operador"].includes(areaRole ?? ""),
    [areaRole]
  );

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);

  // formulario
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("operativo");
  const [estado, setEstado] = useState("abierto");
  const [prioridad, setPrioridad] = useState("media");

  // filtros
  const [fEstado, setFEstado] = useState("");
  const [fCategoria, setFCategoria] = useState("");

  const [msg, setMsg] = useState("");

  async function load() {
    // No cargar nada si no hay sesión o todavía no hay área activa
    if (!user?.id || loadingArea || !area?.id) return;

    setLoading(true);
    setMsg("");

    try {
      let q = supabase
        .from("registros")
        .select("id, titulo, categoria, estado, prioridad, created_at, fecha_cierre")
        .order("created_at", { ascending: false })
        .limit(200);

      if (fEstado) q = q.eq("estado", fEstado);
      if (fCategoria) q = q.eq("categoria", fCategoria);

      const { data, error } = await q;

      if (error) {
        console.error("load registros error:", error);
        setMsg(error.message ?? "Error cargando registros");
        setItems([]);
      } else {
        setItems(data ?? []);
      }
    } catch (e) {
      console.error("load registros exception:", e);
      setMsg("Error de red cargando registros");
      setItems([]);
    }

    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, loadingArea, area?.id, fEstado, fCategoria]);

  async function createRegistro(e) {
    e.preventDefault();
    setMsg("");

    if (!canWrite) {
      setMsg("No tenés permisos para crear registros en esta área.");
      return;
    }
    if (!titulo.trim()) {
      setMsg("El título es obligatorio.");
      return;
    }

    const payload = {
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || null,
      categoria,
      estado,
      prioridad,
      created_by: user.id, // area_id lo pone el DEFAULT current_area_id()
      fuente: "app",
      nivel_validacion: "pendiente",
    };

    try {
      const { error } = await supabase.from("registros").insert(payload);

      if (error) {
        console.error("insert registro error:", error);
        setMsg(error.message ?? "Error creando registro");
        return;
      }

      setTitulo("");
      setDescripcion("");
      setCategoria("operativo");
      setEstado("abierto");
      setPrioridad("media");

      await load();
    } catch (e) {
      console.error("insert registro exception:", e);
      setMsg("Error de red creando registro");
    }
  }

  async function cerrarRegistro(id) {
    setMsg("");

    if (!canWrite) {
      setMsg("No tenés permisos para cerrar registros en esta área.");
      return;
    }

    try {
      // Seteamos fecha_cierre explícitamente para no depender de trigger
      const { error } = await supabase
        .from("registros")
        .update({
          estado: "cerrado",
          fecha_cierre: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        console.error("cerrar registro error:", error);
        setMsg(error.message ?? "Error cerrando registro");
        return;
      }

      await load();
    } catch (e) {
      console.error("cerrar registro exception:", e);
      setMsg("Error de red cerrando registro");
    }
  }

  return (
    <div>
      <h2>Registros</h2>

      <p style={{ opacity: 0.8 }}>
        Modelo nacional • Área activa:{" "}
        {loadingArea
          ? "cargando…"
          : area
          ? `${area.nombre} (${area.codigo})`
          : "NO ENCONTRADA"}{" "}
        • Rol: {areaRole ?? "—"}
      </p>

      {msg ? <div style={alert}>{msg}</div> : null}

      <div style={grid}>
        <div style={panel}>
          <div style={panelTitle}>Crear registro</div>

          {!canWrite ? (
            <div style={{ opacity: 0.8 }}>
              Solo <b>admin</b> u <b>operador</b> pueden crear registros.
            </div>
          ) : (
            <form onSubmit={createRegistro} style={{ display: "grid", gap: 10 }}>
              <label style={label}>
                Título *
                <input
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  style={input}
                />
              </label>

              <label style={label}>
                Descripción
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  style={textarea}
                />
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 10,
                }}
              >
                <label style={label}>
                  Categoría
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    style={input}
                  >
                    <option value="operativo">operativo</option>
                    <option value="monitoreo">monitoreo</option>
                    <option value="incidente">incidente</option>
                    <option value="educacion">educación</option>
                    <option value="control">control</option>
                    <option value="rescate">rescate</option>
                  </select>
                </label>

                <label style={label}>
                  Estado
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    style={input}
                  >
                    <option value="abierto">abierto</option>
                    <option value="en_proceso">en_proceso</option>
                    <option value="cerrado">cerrado</option>
                    <option value="archivado">archivado</option>
                  </select>
                </label>

                <label style={label}>
                  Prioridad
                  <select
                    value={prioridad}
                    onChange={(e) => setPrioridad(e.target.value)}
                    style={input}
                  >
                    <option value="baja">baja</option>
                    <option value="media">media</option>
                    <option value="alta">alta</option>
                    <option value="critica">crítica</option>
                  </select>
                </label>
              </div>

              <button style={button} type="submit">
                Guardar
              </button>
            </form>
          )}
        </div>

        <div style={panel}>
          <div style={panelTitle}>Listado</div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 10,
            }}
          >
            <label style={labelInline}>
              Filtro estado:
              <select
                value={fEstado}
                onChange={(e) => setFEstado(e.target.value)}
                style={inputSmall}
              >
                <option value="">(todos)</option>
                <option value="abierto">abierto</option>
                <option value="en_proceso">en_proceso</option>
                <option value="cerrado">cerrado</option>
                <option value="archivado">archivado</option>
              </select>
            </label>

            <label style={labelInline}>
              Filtro categoría:
              <select
                value={fCategoria}
                onChange={(e) => setFCategoria(e.target.value)}
                style={inputSmall}
              >
                <option value="">(todas)</option>
                <option value="operativo">operativo</option>
                <option value="monitoreo">monitoreo</option>
                <option value="incidente">incidente</option>
                <option value="educacion">educación</option>
                <option value="control">control</option>
                <option value="rescate">rescate</option>
              </select>
            </label>

            <button
              style={buttonGhost}
              onClick={() => {
                setFEstado("");
                setFCategoria("");
              }}
            >
              Limpiar
            </button>

            <button style={buttonGhost} onClick={load}>
              Recargar
            </button>
          </div>

          {loading ? (
            <div style={{ opacity: 0.8 }}>Cargando…</div>
          ) : items.length === 0 ? (
            <div style={{ opacity: 0.8 }}>No hay registros.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {items.map((r) => (
                <div key={r.id} style={item}>
                  <div style={{ fontWeight: 700 }}>{r.titulo}</div>

                  <div style={{ opacity: 0.85 }}>
                    {r.categoria} • {r.estado} • prioridad: {r.prioridad}
                  </div>

                  <div style={{ opacity: 0.7, fontSize: 12 }}>
                    {r.created_at ? new Date(r.created_at).toLocaleString() : "—"}
                  </div>

                  {r.estado === "cerrado" && r.fecha_cierre ? (
                    <div style={{ opacity: 0.7, fontSize: 12 }}>
                      Cerrado: {new Date(r.fecha_cierre).toLocaleString()}
                    </div>
                  ) : null}

                  {canWrite && r.estado !== "cerrado" ? (
                    <button
                      style={{ ...buttonGhost, marginTop: 8 }}
                      onClick={() => cerrarRegistro(r.id)}
                    >
                      Cerrar registro
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const grid = { display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 12 };
const panel = { border: "1px solid rgba(0,0,0,0.10)", borderRadius: 12, padding: 12 };
const panelTitle = { fontWeight: 800, marginBottom: 10 };
const label = { display: "grid", gap: 6, fontSize: 14 };
const input = { padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)" };
const textarea = { padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)", minHeight: 90 };
const button = { padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)", cursor: "pointer" };
const buttonGhost = { padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)", background: "transparent", cursor: "pointer" };
const alert = { padding: 10, borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)", marginBottom: 10 };
const item = { padding: 10, borderRadius: 12, border: "1px solid rgba(0,0,0,0.10)" };
const labelInline = { display: "flex", gap: 8, alignItems: "center" };
const inputSmall = { padding: 8, borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)" };