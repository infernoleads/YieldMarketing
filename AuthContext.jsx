// client/src/lib/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "@/api";
import { setToken, getToken } from "@/api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { user } = await authApi.me();
      setUser(user);
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const { token, user } = await authApi.login(email, password);
    setToken(token);
    setUser(user);
    return user;
  };

  const register = async (payload) => {
    const { token, user } = await authApi.register(payload);
    setToken(token);
    setUser(user);
    return user;
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh: loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

// Maps a role to its home dashboard path.
export function roleHome(role) {
  return {
    super_admin: "/super-admin",
    agency_owner: "/agency",
    producer: "/producer",
    telemarketer: "/telemarketer",
  }[role] || "/login";
}
