import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const Auth = () => {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupDisabled, setSignupDisabled] = useState(false);

  useEffect(() => {
    if (mode !== "sign-up") {
      setSignupDisabled(false);
      return;
    }

    const checkSlots = async () => {
      const { count, error: countError } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true });
      if (countError) {
        setError("Unable to verify user slots. Contact an administrator.");
        return;
      }
      setSignupDisabled((count ?? 0) >= 3);
    };

    void checkSlots();
  }, [mode]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (mode === "sign-in") {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (signInError) {
        setError(signInError.message);
      }
      setIsSubmitting(false);
      return;
    }

    if (signupDisabled) {
      setError("User limit reached. Contact an administrator.");
      setIsSubmitting(false);
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    });

    if (signUpError) {
      setError(signUpError.message);
      setIsSubmitting(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from("profiles").insert({
        id: data.user.id,
        email: data.user.email,
        role: "Technician"
      });
      if (profileError) {
        setError("Signed up, but failed to create profile.");
      }
    }

    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-800">
      <div className="w-full max-w-md rounded-3xl border border-white/40 bg-white/80 p-8 shadow-xl backdrop-blur-md">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Dr Instruments
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-brand-primary">
            Operations Console
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {mode === "sign-in"
              ? "Sign in to access the laboratory dashboard."
              : "Create one of three authorized accounts."}
          </p>
        </div>

        <div className="mt-6 flex rounded-full border border-slate-200 bg-white/80 p-1 text-xs font-semibold text-slate-500">
          <button
            type="button"
            onClick={() => setMode("sign-in")}
            className={`flex-1 rounded-full px-4 py-2 transition active:scale-95 ${
              mode === "sign-in" ? "bg-brand-primary text-white" : ""}
            `}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode("sign-up")}
            className={`flex-1 rounded-full px-4 py-2 transition active:scale-95 ${
              mode === "sign-up" ? "bg-brand-primary text-white" : ""}
            `}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm focus:border-brand-primary focus:outline-none"
              placeholder="lab.tech@drinstruments.com"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm focus:border-brand-primary focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting || (mode === "sign-up" && signupDisabled)}
            className="w-full rounded-xl bg-brand-secondary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 active:scale-95 disabled:cursor-not-allowed disabled:bg-emerald-200"
          >
            {isSubmitting
              ? "Processing..."
              : mode === "sign-in"
                ? "Sign In"
                : signupDisabled
                  ? "User Limit Reached"
                  : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
