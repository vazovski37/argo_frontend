"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query";

interface LoginInput {
  email: string;
  password: string;
}

interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

interface GoogleAuthInput {
  credential: string;
}

interface AuthResult {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatar_url: string | null;
    is_admin: boolean;
  };
}

async function login(input: LoginInput): Promise<AuthResult> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Login failed");
  }

  return data;
}

async function register(input: RegisterInput): Promise<AuthResult> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Registration failed");
  }

  return data;
}

async function googleAuth(input: GoogleAuthInput): Promise<AuthResult> {
  const response = await fetch("/api/auth/google", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Google authentication failed");
  }

  return data;
}

async function logout(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Logout failed");
  }
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: () => {
      // Invalidate all queries to refetch with new auth
      queryClient.invalidateQueries();
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: register,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useGoogleAuth() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: googleAuth,
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
    },
  });
}

