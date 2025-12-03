/**
 * Cookie utilities for auth token management
 */

import { cookies } from "next/headers";

const AUTH_COOKIE_NAME = "auth_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Get the auth token from cookies (server-side)
 */
export async function getAuthToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE_NAME)?.value;
}

/**
 * Set the auth token cookie (server-side)
 */
export async function setAuthToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

/**
 * Clear the auth token cookie (server-side)
 */
export async function clearAuthToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
}

