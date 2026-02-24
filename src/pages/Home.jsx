import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user } = useAuth();

  return (
    <div>
      <h2>Inicio</h2>
      <p style={{ opacity: 0.8 }}>
        Base-Cimientos E0 listo. Próximo: RBAC (E1) y luego Events CRUD (E2).
      </p>

      <div style={card}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Sesión</div>
        <div><b>User ID:</b> {user?.id}</div>
        <div><b>Email:</b> {user?.email}</div>
      </div>
    </div>
  );
}

const card = { marginTop: 12, padding: 12, border: "1px solid rgba(0,0,0,0.10)", borderRadius: 12 };