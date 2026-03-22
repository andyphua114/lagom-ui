import { useState, type FormEvent } from "react";
import { useAuth } from "../auth/useAuth";
import { CAN_EDIT_API_BASE_URL } from "../config";

interface LoginPageProps {
  assistantName: string;
}

export function LoginPage({ assistantName }: LoginPageProps) {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!username.trim() || !password) {
      setError("Enter both your username and password.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await login({
        password,
        username: username.trim(),
      });
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "We could not sign you in.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <section className="w-full max-w-md rounded-[32px] border border-white/70 bg-white/90 p-6 shadow-[0_30px_90px_rgba(15,23,42,0.18)] backdrop-blur-sm sm:p-8">
        <div className="inline-flex items-center rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-slate-500 shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
          {assistantName}
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">
          Sign in
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          Use your directory credentials to start a secure session with the
          assistant.
        </p>

        {!CAN_EDIT_API_BASE_URL ? (
          <p className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            This production build is pinned to the backend origin configured at
            build time.
          </p>
        ) : null}

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Username</span>
            <input
              type="text"
              autoComplete="username"
              disabled={isSubmitting}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white disabled:cursor-not-allowed"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              autoComplete="current-password"
              disabled={isSubmitting}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-300 focus:bg-white disabled:cursor-not-allowed"
            />
          </label>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
