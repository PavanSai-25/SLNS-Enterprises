"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Moon, SunMedium } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Brand } from "@/components/brand";
import { isAdminSession, loadSessionUser } from "@/lib/auth";
import { getCurrentUser, logoutUser } from "@/lib/client-auth";

const navItems = [
  { href: "/dashboard", label: "Book", adminOnly: false },
  { href: "/checkout", label: "Checkout", adminOnly: false },
  { href: "/invoice", label: "Invoice", adminOnly: false },
  { href: "/admin/vehicles", label: "Admin", adminOnly: true },
  { href: "/admin/bookings", label: "Bookings", adminOnly: true }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;

    const storedTheme = window.localStorage.getItem("slns-theme");
    if (storedTheme) return storedTheme === "dark";

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    window.localStorage.setItem("slns-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    setIsAdmin(isAdminSession(loadSessionUser()));
    void getCurrentUser().then((user) => setIsAdmin(user?.role === "admin"));
  }, [pathname]);

  const visibleNavItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  async function logout() {
    await logoutUser();
    router.push("/");
  }

  return (
    <main className="min-h-screen px-4 py-4 sm:px-6 lg:px-8">
      <header className="mx-auto mb-6 flex max-w-7xl flex-col gap-4 rounded-xl border border-white/50 bg-white/70 p-3 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-950/70 sm:flex-row sm:items-center sm:justify-between">
        <Brand />
        <div className="flex items-center gap-2 overflow-x-auto">
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                pathname === item.href
                  ? "bg-teal-700 text-white"
                  : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            aria-label="Toggle dark mode"
            onClick={() => setDark((value) => !value)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          >
            {dark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            type="button"
            aria-label="Logout"
            title="Logout"
            onClick={logout}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>
      <div className="mx-auto max-w-7xl animate-rise">{children}</div>
    </main>
  );
}
