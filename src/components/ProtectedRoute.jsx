import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { booting, user } = useAuth();

  if (booting) return <div style={{ padding: 16 }}>Cargando sesión…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}