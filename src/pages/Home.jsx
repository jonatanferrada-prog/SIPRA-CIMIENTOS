import React from "react";
import { useAuth } from "../context/AuthContext";
import { useArea } from "../context/AreaContext";

export default function Home() {
  const { user, profile, loadingProfile } = useAuth();
  const { area, areaRole, loadingArea } = useArea();

  return (
    <div>
      <h2>Inicio</h2>
      <p style={{ opacity: 0.8 }}>
        Base-Cimientos: transición a RBAC por área (nacional).
      </p>

      <div style={card}>
        <div style={{ fontWeight: 700, marginBottom: 6 }}>Sesión</div>
        <div><b>User ID:</b> {user?.id}</div>
        <div><b>Email:</b> {user?.email}</div>

        <div style={{ marginTop: 10, fontWeight: 700 }}>Rol global (profiles)</div>
        <div><b>Rol:</b> {loadingProfile ? "cargando…" : (profile?.role ?? "SIN PERFIL")}</div>

        <div style={{ marginTop: 10, fontWeight: 700 }}>Contexto nacional (por área)</div>
        <div>
          <b>Área activa:</b>{" "}
          {loadingArea ? "cargando…" : (area ? `${area.nombre} (${area.codigo})` : "NO ENCONTRADA")}
        </div>
        <div>
          <b>Rol en el área:</b>{" "}
          {loadingArea ? "cargando…" : (areaRole ?? "SIN ROL")}
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