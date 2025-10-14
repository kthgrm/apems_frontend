import api from "@/lib/axios";
import { createContext, useContext, useState, useEffect } from "react";
import type { User } from "@/types";

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string, remember: boolean) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    token: null,
    isLoading: true,
    login: async () => { },
    logout: async () => { }
})

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [token, setToken] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Initialize auth state on app load
    useEffect(() => {
        const initializeAuth = async () => {
            const savedToken = localStorage.getItem("token") || sessionStorage.getItem("token");

            if (savedToken) {
                try {
                    // Set the token in axios headers
                    api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;

                    // Verify token and get user data
                    const response = await api.get("/auth/user");
                    setUser(response.data.user);
                    setToken(savedToken);
                } catch (error) {
                    // Token is invalid, clear it
                    localStorage.removeItem("token");
                    sessionStorage.removeItem("token");
                    delete api.defaults.headers.common["Authorization"];
                }
            }
            setIsLoading(false);
        };

        initializeAuth();
    }, [])

    const login = async (email: string, password: string, remember: boolean) => {
        try {
            const res = await api.post("auth/login", { email, password });
            setUser(res.data.user);
            setToken(res.data.token);
            if (remember) {
                localStorage.setItem("token", res.data.token);
            } else {
                sessionStorage.setItem("token", res.data.token);
            }
            api.defaults.headers.common["Authorization"] = `Bearer ${res.data.token}`;
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.post("/auth/logout");
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setUser(null);
            setToken(null);
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
            delete api.defaults.headers.common["Authorization"];
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)