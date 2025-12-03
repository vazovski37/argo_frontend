"use client";

import { createContext, useContext, ReactNode } from "react";
import { useCurrentUser } from "@/hooks/queries/useAuth";
import { useLogin, useRegister, useGoogleAuth, useLogout } from "@/hooks/mutations";
import type { User, UserProgress } from "@/lib/schemas/auth";

interface AuthContextType {
  user: User | null;
  progress: UserProgress | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name?: string) => Promise<{ success: boolean; error?: string }>;
  googleLogin: (credential: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, refetch } = useCurrentUser();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const googleAuthMutation = useGoogleAuth();
  const logoutMutation = useLogout();

  const login = async (email: string, password: string) => {
    try {
      await loginMutation.mutateAsync({ email, password });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Login failed" 
      };
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      await registerMutation.mutateAsync({ email, password, name });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Registration failed" 
      };
    }
  };

  const googleLogin = async (credential: string) => {
    try {
      await googleAuthMutation.mutateAsync({ credential });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Google login failed" 
      };
    }
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  return (
    <AuthContext.Provider
      value={{
        user: data?.user || null,
        progress: data?.progress || null,
        isLoading,
        isAuthenticated: !!data?.user,
        login,
        register,
        googleLogin,
        logout,
        refetch,
      }}
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
