"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, Phone, UserPlus } from "lucide-react";
import { Brand } from "@/components/brand";
import { loginWithPassword, registerWithPassword } from "@/lib/client-auth";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function continueToDashboard() {
    const trimmedIdentifier = identifier.trim();

    if (!trimmedIdentifier || !password) {
      setError("Enter your phone/email and password to continue.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const user = await loginWithPassword(trimmedIdentifier, password);
      router.push(user.role === "admin" ? "/admin/vehicles" : "/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to log in.");
    } finally {
      setSubmitting(false);
    }
  }

  async function createAccount() {
    const trimmedIdentifier = identifier.trim();

    if (!trimmedIdentifier || !password) {
      setError("Enter your phone/email and password to create an account.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await registerWithPassword(trimmedIdentifier, password);
      router.push("/dashboard");
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div
        className="min-h-screen bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(9,9,11,.94), rgba(9,9,11,.62), rgba(9,9,11,.24)), url(https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1800&q=80)"
        }}
      >
        <div className="flex min-h-screen items-center px-4 py-10 sm:px-8">
          <section className="w-full max-w-md rounded-2xl border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl sm:p-7">
            <Brand />
            <div className="mt-10">
              <p className="text-sm font-semibold uppercase tracking-wide text-amber-300">Secure access</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight">Book premium vehicles in minutes.</h1>
              <p className="mt-3 text-sm leading-6 text-zinc-200">
                Mobile-first booking, instant fare calculation, invoices, and fleet control for SLNS Enterprises.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-zinc-300">Phone number or email ID</span>
                <span className="mt-2 flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3">
                  {identifier.includes("@") ? <Mail className="h-4 w-4 text-zinc-300" /> : <Phone className="h-4 w-4 text-zinc-300" />}
                  <input
                    value={identifier}
                    onChange={(event) => {
                      setIdentifier(event.target.value);
                      setError("");
                    }}
                    className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-zinc-400"
                    placeholder="Enter phone number or email"
                    inputMode="email"
                  />
                </span>
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wide text-zinc-300">Password</span>
                <span className="mt-2 flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-3">
                  <LockKeyhole className="h-4 w-4 text-zinc-300" />
                  <input
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                    className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-zinc-400"
                    placeholder="Enter password"
                    type={showPassword ? "text" : "password"}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-zinc-300 transition hover:bg-white/10"
                    onClick={() => setShowPassword((value) => !value)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </span>
              </label>

              {error && <p className="rounded-lg bg-rose-500/15 px-3 py-2 text-sm font-semibold text-rose-100">{error}</p>}

              <button
                type="button"
                className="btn-primary w-full"
                onClick={continueToDashboard}
                disabled={submitting}
              >
                {submitting ? "Please wait..." : "Login and Continue"} <ArrowRight className="h-4 w-4" />
              </button>
              <button type="button" className="btn-secondary w-full border-white/15 bg-white/10 text-white hover:bg-white/15" onClick={createAccount} disabled={submitting}>
                <UserPlus className="h-4 w-4" /> Create Account
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
