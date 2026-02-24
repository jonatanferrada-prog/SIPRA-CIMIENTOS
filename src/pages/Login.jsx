import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, booting, signInWithPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ✅ Si está cargando sesión, no muestres login todavía
  if (booting) return <div style={{ padding: 16 }}>Cargando sesión…</div>;

  // ✅ Si ya hay usuario, afuera del login
  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const { error } = await signInWithPassword(email.trim(), password);

    setLoading(false);
    if (error) return setErrorMsg(error.message);

    navigate("/", { replace: true });
  }

  return (
    <div style={{ maxWidth: 420 }}>
      <h2>Ingresar</h2>

      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <label>
          Email
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required style={inputStyle} />
        </label>

        <label>
          Password
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required style={inputStyle} />
        </label>

        {errorMsg ? <div style={{ color: "crimson", fontSize: 13 }}>{errorMsg}</div> : null}

        <button disabled={loading} style={btnStyle}>
          {loading ? "Ingresando…" : "Ingresar"}
        </button>
      </form>

      <div style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
        Nota: el usuario se crea desde Supabase (Auth) por ahora.
      </div>
    </div>
  );
}

const inputStyle = { width: "100%", padding: "8px 10px", marginTop: 4, border: "1px solid rgba(0,0,0,0.15)", borderRadius: 8 };
const btnStyle = { padding: "10px 12px", cursor: "pointer", borderRadius: 10, border: "1px solid rgba(0,0,0,0.15)" };