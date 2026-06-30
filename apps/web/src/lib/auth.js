import { createContext, useContext, useState, useEffect } from "react";
import { api } from "./api";
const ctx = createContext(null);
export function AuthProvider({ children }) {
    const [player, setPlayer] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        api.get("/api/auth/me").then(setPlayer).catch(() => setPlayer(null)).finally(() => setLoading(false));
    }, []);
    const login = async (username, password) => {
        const p = await api.post("/api/auth/login", { username, password });
        setPlayer(p);
    };
    const register = async (username, password, platform) => {
        const p = await api.post("/api/auth/register", { username, password, platform });
        setPlayer(p);
    };
    const logout = async () => {
        await api.post("/api/auth/logout");
        setPlayer(null);
    };
    return (<ctx.Provider value={{ player, loading, login, register, logout }}>
      {children}
    </ctx.Provider>);
}
export function useAuth() {
    return useContext(ctx);
}
//# sourceMappingURL=auth.js.map