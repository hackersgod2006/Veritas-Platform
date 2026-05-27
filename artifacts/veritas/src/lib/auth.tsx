import { createContext, useContext, useState } from "react";
import { useGetMe, useLogout, useLogin, useRegister } from "@workspace/api-client-react";
import type { User, LoginInput, RegisterInput, AuthResponse } from "@workspace/api-client-react";
import { getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<AuthResponse>;
  register: (data: RegisterInput) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Only call the API when a session token exists — avoids treating
  // Netlify's HTML 404/redirect responses as valid user JSON.
  const [hasToken] = useState(() => !!localStorage.getItem("token"));

  const { data: user, isLoading } = useGetMe({
    query: {
      enabled: hasToken,
      queryKey: getGetMeQueryKey(),
      retry: false,
    },
  });

  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const login = async (data: LoginInput) => {
    const result = await loginMutation.mutateAsync({ data });
    localStorage.setItem("token", result.token);
    queryClient.setQueryData(getGetMeQueryKey(), result.user);
    return result;
  };

  const register = async (data: RegisterInput) => {
    const result = await registerMutation.mutateAsync({ data });
    localStorage.setItem("token", result.token);
    queryClient.setQueryData(getGetMeQueryKey(), result.user);
    return result;
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      localStorage.removeItem("token");
      queryClient.setQueryData(getGetMeQueryKey(), null);
      setLocation("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading: hasToken ? isLoading : false,
        login,
        register,
        logout,
        isAuthenticated: !!user,
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
