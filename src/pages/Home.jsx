import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { user, profile, loadingProfile } = useAuth();

  return (
    <div>
      <h2>Inicio</h2>
      <p style={{ opacity: 0.8 }}>
        Base-Cimientos E1 en progreso: RBAC (roles) desde profiles.
      </p>

      <div style={card}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Sesión</div>
        <div><b>User ID:</b> {user?.id}</div>
        <div><b>Email:</b> {user?.email}</div>
        <div>
          <b>Rol:</b>{" "}
          {loadingProfile ? "cargando…" : (profile?.role ?? "SIN PERFIL")}
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