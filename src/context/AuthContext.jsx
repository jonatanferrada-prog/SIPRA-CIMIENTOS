import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);

  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [booting, setBooting] = useState(true);

  async function fetchProfile(userId) {
    if (!userId) {
      setProfile(null);
      return;
    }

    setLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, role, created_at")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("fetchProfile error:", error);
        setProfile(null);
      } else {
        setProfile(data ?? null);
      }
    } finally {
      setLoadingProfile(false);
    }
  }

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) console.error("getSession error:", error);

        if (!alive) return;

        const s = data?.session ?? null;
        setSession(s);
        setUser(s?.user ?? null);

        // ✅ IMPORTANTE: no bloqueamos el arranque por profile
        setBooting(false);

        if (s?.user?.id) {
          fetchProfile(s.user.id); // fire-and-forget
        }
      } catch (e) {
        console.error("boot error:", e);
        if (alive) setBooting(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setBooting(false);

      if (newSession?.user?.id) fetchProfile(newSession.user.id);
      else setProfile(null);
    });

    return () => {
      alive = false;
      sub?.subscription?.unsubscribe?.();
    };
  }, []);

  const value = useMemo(
    () => ({
      booting,
      session,
      user,
      profile,
      loadingProfile,
      signInWithPassword: async (email, password) => {
        return supabase.auth.signInWithPassword({ email, password });
      },
      signOut: async () => supabase.auth.signOut(),
      refreshProfile: async () => fetchProfile(user?.id),
    }),
    [booting, session, user, profile, loadingProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}