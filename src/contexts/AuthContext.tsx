import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
    userHandle: string | null;
    isLoadingAuth: boolean;
    login: (handle: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [userHandle, setUserHandle] = useState<string | null>(() => {
        // Instant read from localStorage — no flicker on page refresh
        try { return localStorage.getItem("cf_user_handle"); } catch { return null; }
    });
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    useEffect(() => {
        // Silently verify the session in the background
        fetch("/api/auth/me")
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.handle) {
                    setUserHandle(data.handle);
                    try { localStorage.setItem("cf_user_handle", data.handle); } catch {}
                } else {
                    // Session expired — clear cached handle
                    setUserHandle(null);
                    try { localStorage.removeItem("cf_user_handle"); } catch {}
                }
            })
            .catch(() => {})
            .finally(() => setIsLoadingAuth(false));
    }, []);

    const login = (handle: string) => {
        setUserHandle(handle);
        try { localStorage.setItem("cf_user_handle", handle); } catch {}
    };

    const logout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        setUserHandle(null);
        try { localStorage.removeItem("cf_user_handle"); } catch {}
    };

    return (
        <AuthContext.Provider
            value={{ userHandle, isLoadingAuth, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
