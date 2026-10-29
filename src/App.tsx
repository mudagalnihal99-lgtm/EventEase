import { useEffect, useState } from "react";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { isSupabaseConfigured, supabase } from "./lib/supabase";

type Status = "checking" | "ok" | "missing-env" | "error";

export default function App() {
  const [status, setStatus] = useState<Status>("checking");
  const [detail, setDetail] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setStatus("missing-env");
      return;
    }
    supabase.auth
      .getSession()
      .then(({ error }) => {
        if (error) {
          setStatus("error");
          setDetail(error.message);
        } else {
          setStatus("ok");
        }
      })
      .catch((e: unknown) => {
        setStatus("error");
        setDetail(e instanceof Error ? e.message : "Unknown error");
      });
  }, []);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
      <p className="eyebrow">Department Event Manager</p>
      <h1 className="mt-1">EventEase</h1>
      <p className="mt-3 text-charcoal-500">
        Setup check. If you can read this, GitHub and Vercel are working.
      </p>

      <div className="panel mt-8 p-4">
        {status === "checking" && (
          <p className="flex items-center gap-2 text-charcoal-500">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            Checking Supabase connection…
          </p>
        )}
        {status === "ok" && (
          <p className="flex items-center gap-2 text-ok">
            <CheckCircle2 className="h-5 w-5" aria-hidden />
            Supabase is reachable and configured.
          </p>
        )}
        {status === "missing-env" && (
          <div className="flex gap-2 text-warn">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <p>
              Supabase variables are missing. Add{" "}
              <code className="font-semibold">VITE_SUPABASE_URL</code> and{" "}
              <code className="font-semibold">VITE_SUPABASE_ANON_KEY</code> in
              Vercel, then redeploy.
            </p>
          </div>
        )}
        {status === "error" && (
          <div className="flex gap-2 text-danger">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <p>Could not reach Supabase. {detail}</p>
          </div>
        )}
      </div>
    </main>
  );
}
