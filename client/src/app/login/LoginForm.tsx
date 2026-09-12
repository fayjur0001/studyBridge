"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

type Role = "student" | "agency" | "admin";

const ROLE_DASHBOARD: Record<Role, string> = {
  student: "/student/dashboard",
  agency: "/agency/dashboard",
  admin: "/admin/overview",
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryEmail = searchParams.get("email");
  const queryRole = searchParams.get("role") as Role | null;
  const isResetSuccess = searchParams.get("reset") === "success";

  const { login } = useAuth();
  const [role, setRole] = useState<Role>(
    queryRole === "agency" || queryRole === "admin" || queryRole === "student"
      ? queryRole
      : "student"
  );
  const [email, setEmail] = useState(queryEmail || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter both your email and password.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await login(email, password, role);
      router.push(ROLE_DASHBOARD[role]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-8">
        <div className="bg-surface-container-low p-1.5 rounded-full flex relative w-full">
          {(["student", "agency", "admin"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`relative z-10 flex-1 py-2 text-label-md font-label-md transition-colors duration-300 rounded-full capitalize ${
                role === r
                  ? "text-primary font-bold bg-surface-container-lowest shadow-sm"
                  : "text-on-surface-variant"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {isResetSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2.5 mb-6 shadow-xs animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-emerald-600 text-[22px] shrink-0">
            check_circle
          </span>
          <div>
            <p className="font-bold text-sm">Password Reset Successfully 🎉</p>
            <p className="text-[11px] opacity-90 mt-0.5">
              Please enter your new password below to sign in to your account.
            </p>
          </div>
        </div>
      )}

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <Input
          id="email"
          name="email"
          type="email"
          label="Email address"
          icon="mail"
          placeholder="name@university.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label
              htmlFor="password"
              className="font-label-md text-label-md text-on-surface-variant"
            >
              Password
            </label>
            <Link
              className="font-label-md text-label-md text-primary hover:underline transition-all"
              href="/forgot-password"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            icon="lock"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="text-error font-body-md text-body-md px-1" role="alert">
            {error}
          </p>
        )}

        <div className="flex items-center space-x-2 px-1">
          <input
            id="remember"
            type="checkbox"
            className="w-4 h-4 rounded text-primary border-outline-variant focus:ring-primary"
          />
          <label
            htmlFor="remember"
            className="font-body-md text-body-md text-on-surface-variant cursor-pointer"
          >
            Remember me for 30 days
          </label>
        </div>
        <Button type="submit" className="w-full mt-2" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </Button>
      </form>

      <div className="relative my-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-outline-variant" />
        </div>
        <div className="relative flex justify-center text-label-md">
          <span className="px-4 bg-surface-container-lowest text-outline font-label-md">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          className="flex items-center justify-center gap-3 px-4 py-3 border border-outline-variant rounded-xl hover:bg-surface-container transition-colors active:scale-95"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="font-label-md text-label-md text-on-surface-variant">
            Google
          </span>
        </button>
        <button
          type="button"
          className="flex items-center justify-center gap-3 px-4 py-3 border border-outline-variant rounded-xl hover:bg-surface-container transition-colors active:scale-95"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06 0 1.14-.92 2.06-2.06 2.06zM20.45 20.45h-3.56v-5.6c0-1.34-.03-3.06-1.87-3.06-1.87 0-2.15 1.46-2.15 2.96v5.7h-3.56V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z"
              fill="#0077B5"
            />
          </svg>
          <span className="font-label-md text-label-md text-on-surface-variant">
            LinkedIn
          </span>
        </button>
      </div>

      <div className="mt-10 text-center">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-primary font-bold hover:underline transition-all"
          >
            Start your application
          </Link>
        </p>
      </div>
    </>
  );
}
