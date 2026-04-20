import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getLocalSessionUser,
  getOrCreateLocalWorkspaceUser,
  localLogin,
  localLogout,
  localSignup,
} from "../services/localStore.js";
import { hasSupabaseConfig, supabase } from "../services/supabase.js";

const AuthContext = createContext(null);

function normalizeSupabaseUser(user) {
  if (!user) {
    return null;
  }

  return {
    uid: user.id,
    email: user.email,
    displayName: user.user_metadata?.display_name || user.email?.split("@")[0] || "Student",
    isSupabaseUser: true,
  };
}

function getEmailRedirectUrl() {
  return `${window.location.origin}/dashboard`;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) {
      setUser(getLocalSessionUser() || getOrCreateLocalWorkspaceUser());
      setLoading(false);
      return undefined;
    }

    let active = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) {
        return;
      }

      if (error) {
        setAuthError(error.message);
      }

      setUser(normalizeSupabaseUser(data.session?.user));
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(normalizeSupabaseUser(session?.user));
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const signup = useCallback(async ({ name, email, password }) => {
    if (!hasSupabaseConfig || !supabase) {
      const localUser = await localSignup({ name, email, password });
      setUser(localUser);
      return localUser;
    }

    setAuthError("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: getEmailRedirectUrl(),
        data: {
          display_name: name,
        },
      },
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }

    const nextUser = normalizeSupabaseUser(data.user);
    if (data.session && nextUser) {
      setUser(nextUser);
      return nextUser;
    }

    return null;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    if (!hasSupabaseConfig || !supabase) {
      const localUser = await localLogin({ email, password });
      setUser(localUser);
      return localUser;
    }

    setAuthError("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }

    const nextUser = normalizeSupabaseUser(data.user);
    setUser(nextUser);
    return nextUser;
  }, []);

  const logout = useCallback(async () => {
    if (!hasSupabaseConfig || !supabase) {
      await localLogout();
      setUser(getOrCreateLocalWorkspaceUser());
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      setAuthError(error.message);
      throw error;
    }

    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      authError,
      backendMode: hasSupabaseConfig ? "supabase" : "local",
      loading,
      login,
      logout,
      signup,
      supabaseReady: hasSupabaseConfig,
      user,
    }),
    [authError, loading, login, logout, signup, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
