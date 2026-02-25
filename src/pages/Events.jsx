import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

function toInputDateTimeLocal(iso) {
  // Convierte ISO a yyyy-MM-ddTHH:mm para <input type="datetime-local">
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
}

function nowLocalInput() {
  return toInputDateTimeLocal(new Date().toISOString());
}

export default function Events() {
  const { profile, loadingProfile } = useAuth();
  const role = profile?.role;

  const canWrite = role === "admin" || role === "operador";

  // Filtros
  const [filterStatus, setFilterStatus] = useState(""); // open/closed/""
  const [filterType, setFilterType] = useState("");
  const [dateFrom, setDateFrom] = useState(""); // yyyy-MM-dd
  const [dateTo, setDateTo] = useState(""); // yyyy-MM-dd

  // Datos
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Form
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventType, setEventType] = useState("operativo");
  const [eventDate, setEventDate] = useState(nowLocalInput());
  const [status, setStatus] = useState("open");

  const header = useMemo(() => {
    if (loadingProfile) return "Eventos (cargando rol…)";
    return `Eventos (${role ?? "sin rol"})`;
  }, [loadingProfile, role]);

  async function loadEvents() {
    setErr("");
    setLoading(true);

    let q = supabase
      .from("events")
      .select("id, title, description, event_type, event_date, status, created_by, created_at")
      .order("event_date", { ascending: false });

    if (filterStatus) q = q.eq("status", filterStatus);
    if (filterType.trim()) q = q.ilike("event_type", `%${filterType.trim()}%`);

    if (dateFrom) q = q.gte("event_date", new Date(`${dateFrom}T00:00:00`).toISOString());
    if (dateTo) q = q.lte("event_date", new Date(`${dateTo}T23:59:59`).toISOString());

    const { data, error } = await q;

    setLoading(false);
    if (error) {
      setErr(error.message);
      setEvents([]);
      return;
    }

    setEvents(data ?? []);
  }

  useEffect(() => {
    loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSave(e) {
    e.preventDefault();
    setErr("");

    if (!canWrite) {
      setErr("No tenés permisos para crear/editar eventos (solo admin/operador).");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      event_type: eventType.trim(),
      // El input datetime-local entrega local; lo convertimos a Date y guardamos ISO.
      event_date: new Date(eventDate).toISOString(),
      status,
    };

    if (!payload.title) {
      setErr("Título es obligatorio.");
      return;
    }

    let res;
    if (editingId) {
      res = await supabase.from("events").update(payload).eq("id", editingId);
    } else {
      res = await supabase.from("events").insert(payload);
    }

    if (res.error) {
      setErr(res.error.message);
      return;
    }

    // reset form
    setEditingId(null);
    setTitle("");
    setDescription("");
    setEventType("operativo");
    setEventDate(nowLocalInput());
    setStatus("open");

    await loadEvents();
  }

  function startEdit(ev) {
    if (!canWrite) return;
    setEditingId(ev.id);
    setTitle(ev.title ?? "");
    setDescription(ev.description ?? "");
    setEventType(ev.event_type ?? "operativo");
    setEventDate(toInputDateTimeLocal(ev.event_date));
    setStatus(ev.status ?? "open");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDelete(ev) {
    if (!canWrite) {
      setErr("No tenés permisos para eliminar eventos (solo admin/operador).");
      return;
    }
    const ok = confirm(`Eliminar evento: "${ev.title}" ?`);
    if (!ok) return;

    setErr("");
    const { error } = await supabase.from("events").delete().eq("id", ev.id);
    if (error) {
      setErr(error.message);
      return;
    }
    await loadEvents();
  }

  function cancelEdit() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setEventType("operativo");
    setEventDate(nowLocalInput());
    setStatus("open");
  }

  return (
    <div>
      <h2>{header}</h2>

      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
          <div style={{ fontWeight: 700 }}>
            {editingId ? "Editar evento" : "Crear evento"}
          </div>
          {!canWrite ? (
            <div style={{ fontSize: 12, opacity: 0.75 }}>
              Modo lectura (consultor)
            </div>
          ) : null}
        </div>

        <form onSubmit={handleSave} style={{ display: "grid", gap: 10, marginTop: 10 }}>
          <label>
            Título *
            <input value={title} onChange={(e) => setTitle(e.target.value)} style={inputStyle} />
          </label>

          <label>
            Descripción
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} style={{ ...inputStyle, height: 80 }} />
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            <label>
              Tipo
              <input value={eventType} onChange={(e) => setEventType(e.target.value)} style={inputStyle} />
            </label>

            <label>
              Fecha/Hora
              <input
                type="datetime-local"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                style={inputStyle}
              />
            </label>

            <label>
              Estado
              <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
                <option value="open">open</option>
                <option value="closed">closed</option>
              </select>
            </label>
          </div>

          {err ? <div style={{ color: "crimson", fontSize: 13 }}>{err}</div> : null}

          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={!canWrite} style={btnStyle}>
              {editingId ? "Guardar cambios" : "Crear"}
            </button>
            {editingId ? (
              <button type="button" onClick={cancelEdit} style={btnStyle}>
                Cancelar
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "baseline" }}>
          <div style={{ fontWeight: 700 }}>Listado</div>
          <button onClick={loadEvents} style={btnStyle}>Refrescar</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
          <label>
            Estado
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={inputStyle}>
              <option value="">(todos)</option>
              <option value="open">open</option>
              <option value="closed">closed</option>
            </select>
          </label>

          <label>
            Tipo (contiene)
            <input value={filterType} onChange={(e) => setFilterType(e.target.value)} style={inputStyle} />
          </label>

          <label>
            Desde (fecha)
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={inputStyle} />
          </label>

          <label>
            Hasta (fecha)
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={inputStyle} />
          </label>
        </div>

        <div style={{ marginTop: 10 }}>
          <button onClick={loadEvents} style={btnStyle}>Aplicar filtros</button>
        </div>

        {loading ? <div style={{ padding: 12 }}>Cargando…</div> : null}

        <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
          {events.map((ev) => (
            <div key={ev.id} style={row}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontWeight: 700 }}>{ev.title}</div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>
                  {new Date(ev.event_date).toLocaleString()}
                </div>
              </div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                <b>Tipo:</b> {ev.event_type} &nbsp;|&nbsp; <b>Estado:</b> {ev.status}
              </div>
              {ev.description ? (
                <div style={{ fontSize: 13, marginTop: 6 }}>{ev.description}</div>
              ) : null}

              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <button onClick={() => startEdit(ev)} disabled={!canWrite} style={btnStyle}>Editar</button>
                <button onClick={() => handleDelete(ev)} disabled={!canWrite} style={btnStyle}>Eliminar</button>
              </div>
            </div>
          ))}

          {!loading && events.length === 0 ? (
            <div style={{ padding: 12, opacity: 0.75 }}>No hay eventos con esos filtros.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const card = {
  marginTop: 12,
  padding: 12,
  border: "1px solid rgba(0,0,0,0.10)",
  borderRadius: 12,
};

const row = {
  padding: 12,
  border: "1px solid rgba(0,0,0,0.10)",
  borderRadius: 12,
};

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  marginTop: 4,
  border: "1px solid rgba(0,0,0,0.15)",
  borderRadius: 8,
};

const btnStyle = {
  padding: "8px 10px",
  cursor: "pointer",
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.15)",
};