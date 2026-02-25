import React, { useEffect, useMemo, useState } from "react";
import { useArea } from "../context/AreaContext";
import { crearRegistro, listarRegistros } from "../lib/registrosService";

export default function Registros() {
  const { areaActiva, rolEnArea } = useArea();

  const puedeCrear = useMemo(
    () => rolEnArea === "admin" || rolEnArea === "editor",
    [rolEnArea]
  );

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState("operativo");
  const [estado, setEstado] = useState("open");

  const [fEstado, setFEstado] = useState("todos");
  const [fTipo, setFTipo] = useState("");
  const [fDesde, setFDesde] = useState("");
  const [fHasta, setFHasta] = useState("");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function refresh() {
    if (!areaActiva?.id) return;
    setLoading(true);
    setMsg("");
    try {
      const data = await listarRegistros({
        areaId: areaActiva.id,
        estado: fEstado,
        tipoContiene: fTipo,
        desde: fDesde ? new Date(fDesde).toISOString() : null,
        hasta: fHasta ? new Date(fHasta).toISOString() : null,
      });
      setItems(data);
    } catch (e) {
      setMsg(e.message || "Error al listar registros");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [areaActiva?.id]);

  async function onCrear(e) {
    e.preventDefault();
    if (!areaActiva?.id) return;

    setMsg("");
    try {
      await crearRegistro({
        areaId: areaActiva.id,
        tipo,
        titulo,
        descripcion,
        estado,
      });
      setTitulo("");
      setDescripcion("");
      setTipo("operativo");
      setEstado("open");
      await refresh();
    } catch (e2) {
      setMsg(e2.message || "Error al crear");
    }
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto" }}>
      <h2>Registros (área)</h2>

      <div style={{ opacity: 0.9, marginBottom: 12 }}>
        <b>Área:</b> {areaActiva ? `${areaActiva.nombre} (${areaActiva.codigo})` : "NO ENCONTRADA"}{" "}
        | <b>Rol:</b> {rolEnArea || "SIN ROL"}
      </div>

      {msg && (
        <div style={{ padding: 10, border: "1px solid #ddd", marginBottom: 12 }}>
          {msg}
        </div>
      )}

      {puedeCrear ? (
        <form onSubmit={onCrear} style={{ border: "1px solid #ddd", padding: 14, borderRadius: 8 }}>
          <h3>Crear registro</h3>

          <label style={{ display: "block", marginTop: 8 }}>
            Título *
            <input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </label>

          <label style={{ display: "block", marginTop: 8 }}>
            Descripción
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={4}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </label>

          <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
            <label>
              Tipo
              <input
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                style={{ padding: 8, marginLeft: 8 }}
              />
            </label>

            <label>
              Estado
              <select value={estado} onChange={(e) => setEstado(e.target.value)} style={{ padding: 8, marginLeft: 8 }}>
                <option value="open">open</option>
                <option value="closed">closed</option>
              </select>
            </label>

            <button type="submit" style={{ padding: "8px 14px" }}>
              Crear
            </button>
          </div>
        </form>
      ) : (
        <div style={{ border: "1px solid #ddd", padding: 14, borderRadius: 8 }}>
          No tenés permisos para crear (necesitás admin o editor del área).
        </div>
      )}

      <div style={{ marginTop: 16, border: "1px solid #ddd", padding: 14, borderRadius: 8 }}>
        <h3>Listado</h3>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "end" }}>
          <label>
            Estado
            <select value={fEstado} onChange={(e) => setFEstado(e.target.value)} style={{ padding: 8, marginLeft: 8 }}>
              <option value="todos">todos</option>
              <option value="open">open</option>
              <option value="closed">closed</option>
            </select>
          </label>

          <label>
            Tipo (contiene)
            <input value={fTipo} onChange={(e) => setFTipo(e.target.value)} style={{ padding: 8, marginLeft: 8 }} />
          </label>

          <label>
            Desde (fecha)
            <input type="date" value={fDesde} onChange={(e) => setFDesde(e.target.value)} style={{ padding: 8, marginLeft: 8 }} />
          </label>

          <label>
            Hasta (fecha)
            <input type="date" value={fHasta} onChange={(e) => setFHasta(e.target.value)} style={{ padding: 8, marginLeft: 8 }} />
          </label>

          <button onClick={refresh} disabled={loading} style={{ padding: "8px 14px" }}>
            {loading ? "Cargando..." : "Refrescar"}
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          {items.length === 0 ? (
            <div style={{ opacity: 0.7 }}>Sin registros todavía.</div>
          ) : (
            items.map((r) => (
              <div key={r.id} style={{ borderTop: "1px solid #eee", padding: "10px 0" }}>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <b>{r.titulo}</b>
                  <span style={{ opacity: 0.8 }}>{r.tipo}</span>
                  <span style={{ opacity: 0.8 }}>{new Date(r.fecha_hora).toLocaleString()}</span>
                  <span style={{ opacity: 0.8 }}>{r.estado}</span>
                </div>
                {r.descripcion && <div style={{ marginTop: 6, opacity: 0.9 }}>{r.descripcion}</div>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}