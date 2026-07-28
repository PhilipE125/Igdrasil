import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export interface Profile {
  id: string;
  legal_entity_name: string | null;
  business_description: string | null;
  sie4_file_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ needsOnboarding: boolean; emailConfirmationRequired: boolean }>;
  resendSignupVerification: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Pick<Profile, "legal_entity_name" | "business_description" | "sie4_file_url">>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      setProfile(null);
      return;
    }

    setProfile(data ?? null);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Use setTimeout to avoid Supabase deadlock
          setTimeout(() => fetchProfile(session.user.id), 0);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const normalizeEmail = (email: string) => email.trim().toLowerCase();

  const signIn = async (email: string, password: string) => {
    const normalizedEmail = normalizeEmail(email);
    const { error } = await supabase.auth.signInWithPassword({ email: normalizedEmail, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const normalizedEmail = normalizeEmail(email);
    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth` },
    });
    if (error) throw error;

    const emailConfirmationRequired = !data.session;
    return {
      needsOnboarding: !!data.session,
      emailConfirmationRequired,
    };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
    if (error) throw error;
  };

  const resendSignupVerification = async (email: string) => {
    const normalizedEmail = normalizeEmail(email);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: normalizedEmail,
      options: { emailRedirectTo: `${window.location.origin}/auth` },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const updateProfile = async (data: Partial<Pick<Profile, "legal_entity_name" | "business_description" | "sie4_file_url">>) => {
    if (!user) throw new Error("Not authenticated");
    const payload = {
      id: user.id,
      ...data,
      updated_at: new Date().toISOString(),
    };

    const { data: profileData, error } = await supabase
      .from("profiles")
      .upsert(payload, { onConflict: "id" })
      .select("*")
      .single();

    if (error) throw error;
    setProfile(profileData);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signIn, signUp, resendSignupVerification, signInWithGoogle, signOut, updateProfile, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
