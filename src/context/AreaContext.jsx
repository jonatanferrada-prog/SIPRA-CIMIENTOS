import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useAuth } from "./AuthContext";

const AreaContext = createContext(null);

// Por ahora fijo. Después lo hacemos selector.
const DEFAULT_AREA_CODE = "RN-ANP-PLO";

export function AreaProvider({ children }) {
  const { user } = useAuth();

  const [area, setArea] = useState(null); // {id, nombre, codigo}
  const [areaRole, setAreaRole] = useState(null); // 'admin'|'operador'|'consultor'|null
  const [loadingArea, setLoadingArea] = useState(true);

  async function loadAreaAndRole() {
    if (!user?.id) {
      setArea(null);
      setAreaRole(null);
      setLoadingArea(false);
      return;
    }

    setLoadingArea(true);

    // 1) Área activa por código
    const { data: areaData, error: areaErr } = await supabase
      .from("areas")
      .select("id, nombre, codigo")
      .eq("codigo", DEFAULT_AREA_CODE)
      .maybeSingle();

    if (areaErr) {
      console.error("load area error:", areaErr);
      setArea(null);
      setAreaRole(null);
      setLoadingArea(false);
      return;
    }

    setArea(areaData ?? null);

    // 2) Rol del usuario en esa área
    if (areaData?.id) {
      const { data: roleData, error: roleErr } = await supabase
        .from("roles_area")
        .select("rol")
        .eq("user_id", user.id)
        .eq("area_id", areaData.id)
        .maybeSingle();

      if (roleErr) {
        console.error("load area role error:", roleErr);
        setAreaRole(null);
      } else {
        setAreaRole(roleData?.rol ?? null);
      }
    } else {
      setAreaRole(null);
    }

    setLoadingArea(false);
  }

  useEffect(() => {
    loadAreaAndRole();
    // recarga cuando cambia usuario
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const value = useMemo(
    () => ({
      area,
      areaRole,
      loadingArea,
      refreshAreaContext: loadAreaAndRole,
    }),
    [area, areaRole, loadingArea]
  );

  return <AreaContext.Provider value={value}>{children}</AreaContext.Provider>;
}

export function useArea() {
  const ctx = useContext(AreaContext);
  if (!ctx) throw new Error("useArea debe usarse dentro de AreaProvider");
  return ctx;
}