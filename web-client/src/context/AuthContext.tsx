import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Models } from "appwrite";
import { account } from "@/lib/appwrite";

interface AuthContextType {
    user: Models.User<Models.Preferences> | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<Models.Session>;
    logout: () => Promise<void>;
    checkSession: () => Promise<Models.User<Models.Preferences> | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const checkSession = async (): Promise<Models.User<Models.Preferences> | null> => {
        try {
            const currentUser = await account.get();
            setUser(currentUser);
            return currentUser;
        } catch (error) {
            setUser(null);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        checkSession();
    }, []);

    const login = async (email: string, password: string): Promise<Models.Session> => {
        setIsLoading(true);
        try {
            const session = await account.createEmailPasswordSession(email, password);
            const currentUser = await account.get();
            setUser(currentUser);
            return session;
        } catch (error: unknown) {
            setUser(null);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await account.deleteSession("current");
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setUser(null);
            setIsLoading(false);
            window.location.href = "/login";
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, checkSession }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};