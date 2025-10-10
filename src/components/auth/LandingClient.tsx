"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type AuthMode = "login" | "register";

export default function LandingClient() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");

    if (!email || !password) {
      setError("Please fill out both email and password.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Unable to submit form");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      id="auth"
      className="mx-auto max-w-md space-y-6 rounded-3xl bg-neutral-900 p-6 shadow-xl"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h2>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setMode(mode === "login" ? "register" : "login");
          }}
          className="text-sm text-neutral-400 underline underline-offset-4 hover:text-neutral-100"
        >
          {mode === "login" ? "Need an account?" : "Already have an account?"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="auth-email" className="text-sm text-neutral-300">
            Email
          </label>
          <input
            id="auth-email"
            name="email"
            type="email"
            autoComplete="email"
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
            required
          />
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <label htmlFor="auth-password" className="text-neutral-300">
              Password
            </label>
            <span className="text-neutral-500">min 8 characters</span>
          </div>
          <input
            id="auth-password"
            name="password"
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm focus:border-teal-500 focus:outline-none"
            minLength={8}
            required
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-teal-500 px-3 py-2 text-sm font-semibold text-neutral-950 transition-colors hover:bg-teal-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? mode === "login"
              ? "Signing in..."
              : "Creating account..."
            : mode === "login"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>

      <div className="rounded-xl bg-neutral-950 p-3 text-xs leading-relaxed text-neutral-400">
        <p className="font-semibold text-neutral-200">Security notes</p>
        <ul className="list-disc space-y-1 pl-4">
          <li>Your password is hashed with bcrypt before storage.</li>
          <li>Credentials are persisted in your AWS DynamoDB table.</li>
          <li>
            Sessions are signed and stored in an HTTP-only cookie for 7 days.
          </li>
        </ul>
      </div>
    </div>
  );
}
