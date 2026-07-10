import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Models } from "appwrite";
import { account } from "@/lib/appwrite";
import { MOCK_USER_ID, MOCK_USER_NAME, MOCK_USER_EMAIL } from "@/lib/mockdata";
import toast from "react-hot-toast";

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<Models.Session>;
  logout: () => Promise<void>;
  checkSession: () => Promise<Models.User<Models.Preferences> | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ─── Mock mode flag ───────────────────────────────────────────────────
// When VITE_USE_MOCK_DATA=true the AuthProvider uses a hardcoded mock user
// instead of calling account.get() so the app renders without Appwrite.
const isMockMode = import.meta.env.VITE_USE_MOCK_DATA === "true";

// Fake Appwrite user object that satisfies Models.User<Models.Preferences>
const MOCK_USER: Models.User<Models.Preferences> = {
  $id: MOCK_USER_ID,
  $createdAt: "2026-01-01T00:00:00.000Z",
  $updatedAt: "2026-06-01T00:00:00.000Z",
  name: MOCK_USER_NAME,
  email: MOCK_USER_EMAIL,
  phone: "",
  emailVerification: true,
  phoneVerification: false,
  status: true,
  labels: [],
  passwordUpdate: "2026-01-01T00:00:00.000Z",
  registration: "2026-01-01T00:00:00.000Z",
  accessedAt: new Date().toISOString(),
  prefs: {} as Models.Preferences,
  mfa: false,
  targets: [],
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore session on mount
  const checkSession = async (): Promise<Models.User<Models.Preferences> | null> => {
    // ─ Mock mode: skip real Appwrite call ──────────────────────────────
    if (isMockMode) {
      setUser(MOCK_USER);
      setIsLoading(false);
      return MOCK_USER;
    }
    // ─ Real Appwrite path (unchanged) ───────────────────────────────
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
    // ─ Mock mode: simulate login success ──────────────────────────────
    if (isMockMode) {
      await new Promise((res) => setTimeout(res, 600));
      setUser(MOCK_USER);
      setIsLoading(false);
      return { $id: "mock_session", userId: MOCK_USER_ID } as any;
    }
    // ─ Real Appwrite path (unchanged) ───────────────────────────────
    try {
      // Create email password session
      const session = await account.createEmailPasswordSession(email, password);
      // Fetch the logged-in user profile
      const currentUser = await account.get();
      setUser(currentUser);
      return session;
    } catch (error: any) {
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    // ─ Mock mode: simulate logout ────────────────────────────────
    if (isMockMode) {
      await new Promise((res) => setTimeout(res, 400));
      setUser(null);
      setIsLoading(false);
      window.location.href = "/login";
      return;
    }
    // ─ Real Appwrite path (unchanged) ───────────────────────────────
    try {
      await account.deleteSession("current");
    } catch (error) {
      console.error("Error during Appwrite logout session deletion:", error);
    } finally {
      setUser(null);
      setIsLoading(false);
      // Redirect to login page
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
