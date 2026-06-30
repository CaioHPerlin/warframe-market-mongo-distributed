import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { api } from "./api";

type Player = {
  id: string;
  username: string;
  platform: string;
  createdAt?: string;
};

type AuthContext = {
  player: Player | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, platform: string) => Promise<void>;
  logout: () => Promise<void>;
};

const ctx = createContext<AuthContext>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Player>("/api/auth/me").then(setPlayer).catch(() => setPlayer(null)).finally(() => setLoading(false));
  }, []);

  const login = async (username: string, password: string) => {
    const p = await api.post<Player>("/api/auth/login", { username, password });
    setPlayer(p);
  };

  const register = async (username: string, password: string, platform: string) => {
    const p = await api.post<Player>("/api/auth/register", { username, password, platform });
    setPlayer(p);
  };

  const logout = async () => {
    await api.post("/api/auth/logout");
    setPlayer(null);
  };

  return (
    <ctx.Provider value={{ player, loading, login, register, logout }}>
      {children}
    </ctx.Provider>
  );
}

export function useAuth() {
  return useContext(ctx);
}
