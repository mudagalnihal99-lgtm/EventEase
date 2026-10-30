import { useEffect, useState, type FormEvent } from "react";
import { CalendarDays, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import App from "./App";
import { isSupabaseConfigured, supabase } from "./lib/supabase";

type AuthMode = "login" | "signup";

export default function AuthGate() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let active = true;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (active) setSession(nextSession);
      },
    );

    void supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError) setError(sessionError.message);
      setSession(data.session);
      setIsLoading(false);
    }).catch((caught: unknown) => {
      if (!active) return;
      setError(caught instanceof Error ? caught.message : "Unable to restore your session.");
      setIsLoading(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");

    try {
      const result = mode === "signup"
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      if (result.error) throw result.error;
      if (mode === "signup" && !result.data.session) {
        setMessage("Account created. Check your email to confirm it, then log in.");
      }
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Authentication failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    setError("");
    setIsSigningOut(true);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) setError(signOutError.message);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Unable to log out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F3ED] text-[#292D27]">
        <div className="flex items-center gap-3 text-sm text-[#77756C]" role="status">
          <LoaderCircle className="animate-spin" size={18} />
          Restoring your session...
        </div>
      </main>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F5F3ED] p-5 text-[#292D27]">
        <section className="w-full max-w-lg rounded-xl border border-[#EAE5DB] bg-[#FBFAF7] p-7 shadow-sm sm:p-9">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#BD704E] text-white">
            <CalendarDays size={22} />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[2px] text-[#B16A4A]">EventEase setup</p>
          <h1 className="mt-2 text-2xl font-semibold">Supabase configuration required</h1>
          <p className="mt-3 text-sm leading-6 text-[#77756C]">
            Add these variables to your local <code className="text-[#292D27]">.env</code> file and restart the development server:
          </p>
          <ul className="mt-4 space-y-2 text-sm text-[#292D27]">
            <li><code>VITE_SUPABASE_URL</code></li>
            <li><code>VITE_SUPABASE_ANON_KEY</code></li>
          </ul>
          <p className="mt-4 text-xs leading-5 text-[#77756C]">
            Use your Supabase project URL and publishable/anon key. Never put a service-role key in a browser environment variable.
          </p>
        </section>
      </main>
    );
  }

  if (session) {
    return (
      <App
        userEmail={session.user.email || ""}
        authError={error}
        isSigningOut={isSigningOut}
        onSignOut={handleSignOut}
      />
    );
  }

  return (
    <main className="min-h-screen bg-[#F5F3ED] p-4 text-[#292D27] sm:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-5xl overflow-hidden rounded-xl border border-[#EAE5DB] bg-[#FBFAF7] shadow-sm sm:min-h-[calc(100vh-4rem)] lg:grid-cols-[0.9fr_1.1fr]">
        <section className="flex flex-col justify-between bg-[#252923] p-7 text-white sm:p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#BD704E]">
              <CalendarDays size={21} />
            </div>
            <div>
              <p className="text-xl font-semibold">EventEase</p>
              <p className="text-[10px] uppercase tracking-[2px] text-white/45">Department workspace</p>
            </div>
          </div>
          <div className="mt-12 max-w-sm pb-2">
            <p className="text-xs font-semibold uppercase tracking-[2px] text-[#E6A27D]">Plan together</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-white">Bring every event into focus.</h1>
            <p className="mt-4 text-sm leading-6 text-white/60">Sign in to return to your department workspace.</p>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-12">
          <div className="w-full max-w-sm">
            <p className="text-xs font-semibold uppercase tracking-[2px] text-[#B16A4A]">Your workspace</p>
            <h2 className="mt-2 text-2xl font-semibold">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h2>
            <p className="mt-2 text-sm text-[#858278]">
              {mode === "login" ? "Log in to continue to EventEase." : "Use your email to get started with EventEase."}
            </p>

            <div className="mt-7 grid grid-cols-2 rounded-lg border border-[#E5E0D6] bg-white p-1" role="tablist" aria-label="Authentication mode">
              {(["login", "signup"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={mode === option}
                  onClick={() => {
                    setMode(option);
                    setError("");
                    setMessage("");
                  }}
                  className={`rounded-md px-3 py-2 text-sm font-medium capitalize transition ${mode === option ? "bg-[#252923] text-white" : "text-[#77756C] hover:bg-[#F5F3ED]"}`}
                >
                  {option === "login" ? "Log in" : "Sign up"}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <label className="block text-xs font-medium text-[#77756C]">
                Email address
                <span className="mt-2 flex items-center gap-2 rounded-lg border border-[#E5E0D6] bg-white px-3 focus-within:border-[#BD704E]">
                  <Mail size={16} className="shrink-0 text-[#99958B]" />
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="you@example.com"
                    className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[#292D27] outline-none"
                  />
                </span>
              </label>
              <label className="block text-xs font-medium text-[#77756C]">
                Password
                <span className="mt-2 flex items-center gap-2 rounded-lg border border-[#E5E0D6] bg-white px-3 focus-within:border-[#BD704E]">
                  <LockKeyhole size={16} className="shrink-0 text-[#99958B]" />
                  <input
                    name="password"
                    type="password"
                    autoComplete={mode === "signup" ? "new-password" : "current-password"}
                    minLength={6}
                    required
                    placeholder="At least 6 characters"
                    className="min-w-0 flex-1 bg-transparent py-3 text-sm text-[#292D27] outline-none"
                  />
                </span>
              </label>

              {error && <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">{error}</p>}
              {message && <p className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800" role="status">{message}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#BD704E] py-3 text-sm font-semibold text-white hover:bg-[#A85D3D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting && <LoaderCircle className="animate-spin" size={17} />}
                {isSubmitting ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}