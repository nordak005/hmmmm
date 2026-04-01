"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isGuest: boolean;
  loading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // No Supabase configured — check for guest mode and finish loading
      const guestMode = typeof window !== "undefined" && localStorage.getItem("trustflow_guest");
      if (guestMode === "true") setIsGuest(true);
      setLoading(false);
      return;
    }

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (!s) {
        const guestMode = localStorage.getItem("trustflow_guest");
        if (guestMode === "true") setIsGuest(true);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s) {
        setIsGuest(false);
        localStorage.removeItem("trustflow_guest");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    if (!isSupabaseConfigured) {
      return { error: "Supabase is not configured. Please add your credentials to .env and restart the server." };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (!isSupabaseConfigured) {
      return { error: "Supabase is not configured. Please add your credentials to .env and restart the server." };
    }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setIsGuest(false);
    localStorage.removeItem("trustflow_guest");
  };

  const continueAsGuest = () => {
    setIsGuest(true);
    localStorage.setItem("trustflow_guest", "true");
  };

  return (
    <AuthContext.Provider value={{ user, session, isGuest, loading, isConfigured: isSupabaseConfigured, signIn, signUp, signOut, continueAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
