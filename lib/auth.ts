import type { CustomerDetails } from "@/lib/types";

export const adminMobileNumber = "9703223332";

export interface SessionUser extends CustomerDetails {
  role?: "admin" | "customer";
}

export function normalizeMobile(value: string) {
  return value.replace(/\D/g, "");
}

export function isAdminSession(user: SessionUser | null) {
  return user?.role === "admin" && normalizeMobile(user.mobile) === adminMobileNumber;
}

export function loadSessionUser(): SessionUser | null {
  if (typeof window === "undefined") return null;

  const stored = window.localStorage.getItem("slns-customer");
  if (!stored) return null;

  try {
    return JSON.parse(stored) as SessionUser;
  } catch {
    window.localStorage.removeItem("slns-customer");
    return null;
  }
}
