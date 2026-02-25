import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { booting, user } = useAuth();
  const location = useLocation();

  // Mientras se resuelve sesión, no redirijas (evita parpadeos)
  if (booting) return <div style={{ padding: 16 }}>Cargando sesión…</div>;

  // Si no hay usuario, afuera
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return children;
}