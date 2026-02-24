import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div>
      <h2>404</h2>
      <p>Página inexistente.</p>
      <Link to="/">Volver</Link>
    </div>
  );
}