import type { SessionUser } from "@/lib/auth";

interface AuthResponse {
  user?: SessionUser;
  message?: string;
}

async function parseAuthResponse(response: Response) {
  const payload = (await response.json()) as AuthResponse;

  if (!response.ok || !payload.user) {
    throw new Error(payload.message ?? "Authentication failed.");
  }

  window.localStorage.setItem("slns-customer", JSON.stringify(payload.user));
  return payload.user;
}

export async function loginWithPassword(identifier: string, password: string) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password })
  });

  return parseAuthResponse(response);
}

export async function registerWithPassword(identifier: string, password: string) {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password })
  });

  return parseAuthResponse(response);
}

export async function getCurrentUser() {
  const response = await fetch("/api/auth/me", { cache: "no-store" });
  if (!response.ok) return null;

  const payload = (await response.json()) as AuthResponse;
  if (payload.user) {
    window.localStorage.setItem("slns-customer", JSON.stringify(payload.user));
  }

  return payload.user ?? null;
}

export async function logoutUser() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.localStorage.removeItem("slns-customer");
  window.localStorage.removeItem("slns-booking");
}
