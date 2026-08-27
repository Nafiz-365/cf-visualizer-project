import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
    userHandle: string | null;
    isLoadingAuth: boolean;
    login: (handle: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [userHandle, setUserHandle] = useState<string | null>(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(true);

    useEffect(() => {
        fetch("/api/auth/me")
            .then((res) => res.json())
            .then((data) => {
                if (data.success && data.handle) {
                    setUserHandle(data.handle);
                }
            })
            .catch(() => {})
            .finally(() => setIsLoadingAuth(false));
    }, []);

    const login = (handle: string) => {
        setUserHandle(handle);
    };

    const logout = async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        setUserHandle(null);
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
