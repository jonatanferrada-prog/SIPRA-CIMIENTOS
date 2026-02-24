import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function Events() {
  const { user, profile } = useAuth();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  async function loadEvents() {
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase
      .from("events")
      .select("id, title, event_type, event_date, status, created_at, created_by")
      .order("event_date", { ascending: false })
      .limit(200);

    if (error) {
      console.error("loadEvents error:", error);
      setErrorMsg(error.message);
      setRows([]);
    } else {
      setRows(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <div>
      <h2>Eventos</h2>
      <p style={{ opacity: 0.8, marginTop: -6 }}>
        Rol: <b>{profile?.role ?? "?"}</b>
      </p>

      <CreateEvent onCreated={loadEvents} userId={user?.id} role={profile?.role} />

      <div style={{ marginTop: 14 }}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Listado</div>

        {loading ? <div>Cargando…</div> : null}
        {errorMsg ? <div style={{ color: "crimson" }}>{errorMsg}</div> : null}

        {!loading && !errorMsg && rows.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No hay eventos aún.</div>
        ) : null}

        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          {rows.map((r) => (
            <div key={r.id} style={card}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div style={{ fontWeight: 800 }}>{r.title}</div>
                <div style={{ fontSize: 12, opacity: 0.75 }}>{new Date(r.event_date).toLocaleString()}</div>
              </div>
              <div style={{ marginTop: 6, fontSize: 13, opacity: 0.85 }}>
                <b>Tipo:</b> {r.event_type} &nbsp;•&nbsp; <b>Estado:</b> {r.status}
              </div>
              <div style={{ marginTop: 6, fontSize: 12, opacity: 0.65 }}>
                ID: {r.id}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CreateEvent({ onCreated, userId, role }) {
  const canWrite = role === "admin" || role === "operador";

  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("operativo");
  const [eventDate, setEventDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [status, setStatus] = useState("open");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleCreate(e) {
    e.preventDefault();
    setErrorMsg("");

    if (!canWrite) {
      setErrorMsg("Tu rol no permite crear eventos.");
      return;
    }
    if (!userId) {
      setErrorMsg("Sesión inválida: falta userId.");
      return;
    }

    setSaving(true);

    const payload = {
      title: title.trim(),
      description: description.trim() || null,
      event_type: eventType.trim(),
      event_date: new Date(eventDate).toISOString(),
      status,
      created_by: userId,
    };

    const { error } = await supabase.from("events").insert(payload);

    setSaving(false);

    if (error) {
      console.error("createEvent error:", error);
      setErrorMsg(error.message);
      return;
    }

    setTitle("");
    setDescription("");
    setEventType("operativo");
    setStatus("open");
    setEventDate(new Date().toISOString().slice(0, 16));

    onCreated?.();
  }

  return (
    <div style={panel}>
      <div style={{ fontWeight: 800, marginBottom: 8 }}>Crear evento</div>

      {!canWrite ? (
        <div style={{ fontSize: 13, opacity: 0.75 }}>
          Tu rol es <b>{role ?? "?"}</b>. Solo <b>admin</b> y <b>operador</b> pueden crear.
        </div>
      ) : (
        <form onSubmit={handleCreate} style={{ display: "grid", gap: 10 }}>
          <label>
            Título *
            <input value={title} onChange={(e) => setTitle(e.target.value)} required style={input} />
          </label>

          <label>
            Tipo *
            <input value={eventType} onChange={(e) => setEventType(e.target.value)} required style={input} />
          </label>

          <label>
            Fecha/hora *
            <input
              type="datetime-local"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              style={input}
            />
          </label>

          <label>
            Estado *
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={input}>
              <option value="open">open</option>
              <option value="closed">closed</option>
            </select>
          </label>

          <label>
            Descripción
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={input} />
          </label>

          {errorMsg ? <div style={{ color: "crimson", fontSize: 13 }}>{errorMsg}</div> : null}

          <button disabled={saving} style={btn}>
            {saving ? "Guardando…" : "Crear"}
          </button>
        </form>
      )}
    </div>
  );
}

const panel = {
  padding: 12,
  border: "1px solid rgba(0,0,0,0.10)",
  borderRadius: 12,
  marginTop: 12,
};

const card = {
  padding: 12,
  border: "1px solid rgba(0,0,0,0.10)",
  borderRadius: 12,
};

const input = {
  width: "100%",
  padding: "8px 10px",
  marginTop: 4,
  border: "1px solid rgba(0,0,0,0.15)",
  borderRadius: 8,
};

const btn = {
  padding: "10px 12px",
  cursor: "pointer",
  borderRadius: 10,
  border: "1px solid rgba(0,0,0,0.15)",
};