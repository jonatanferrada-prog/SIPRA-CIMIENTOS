import React from "react";
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AppShell() {
  const { user, signOut } = useAuth();

  return (
    <div style={{ minHeight: "100vh" }}>
      <header style={styles.header}>
        <div style={styles.brand}>
          <span style={styles.logo}>SIPRA</span>
          <span style={styles.sub}>BASE-CIMIENTOS • E0</span>
        </div>

        <nav style={styles.nav}>
  <Link to="/" style={styles.link}>Inicio</Link>
  <Link to="/events" style={styles.link}>Eventos</Link>

  {user ? (
    <button onClick={signOut} style={styles.button}>Salir</button>
  ) : (
    <Link to="/login" style={styles.link}>Ingresar</Link>
  )}
</nav>
      </header>

      <main style={styles.main}>
        <Outlet />
      </main>

      <footer style={styles.footer}>
        Núcleo técnico • sin cosmética • estabilidad primero
      </footer>
    </div>
  );
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid rgba(0,0,0,0.08)",
    position: "sticky",
    top: 0,
    background: "white",
    zIndex: 10,
  },
  brand: { display: "flex", gap: 10, alignItems: "baseline" },
  logo: { fontWeight: 800, letterSpacing: 1 },
  sub: { opacity: 0.7, fontSize: 12 },
  nav: { display: "flex", gap: 12, alignItems: "center" },
  link: { textDecoration: "none" },
  button: { padding: "6px 10px", cursor: "pointer" },
  main: { padding: 16, maxWidth: 900, margin: "0 auto" },
  footer: { padding: 16, opacity: 0.6, fontSize: 12, textAlign: "center" },
};