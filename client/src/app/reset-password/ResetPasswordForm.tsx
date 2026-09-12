"use client";

import { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlToken = searchParams.get("token") || "";

  const [inputToken, setInputToken] = useState(urlToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetRole, setResetRole] = useState("student");

  const effectiveToken = (urlToken || inputToken).trim();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!effectiveToken) {
      setError("Please provide your reset token or request a new reset link.");
      return;
    }
    if (password.length < 8) {
      setError("Your password should be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<{ message: string; email?: string; role?: string }>(
        "/api/auth/reset-password",
        { token: effectiveToken, newPassword: password },
        { auth: false }
      );
      setResetEmail(res.email || "");
      setResetRole(res.role || "student");
      setDone(true);
      setTimeout(() => {
        router.push(
          `/login?email=${encodeURIComponent(res.email || "")}&role=${encodeURIComponent(
            res.role || "student"
          )}&reset=success`
        );
      }, 2000);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <span
            className="material-symbols-outlined text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
          Password Updated 🎉
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">
          Your password has been reset successfully. Redirecting you to sign in with your new password...
        </p>
        <Link
          href={`/login?email=${encodeURIComponent(resetEmail)}&role=${encodeURIComponent(
            resetRole
          )}&reset=success`}
          className="w-full py-3 px-6 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-md hover:opacity-90 transition-all inline-flex items-center justify-center gap-1.5"
        >
          Go to Sign In Now →
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-10 flex items-center gap-2">
        <span
          className="material-symbols-outlined text-primary text-3xl"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          school
        </span>
        <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">
          StudyBridge
        </span>
      </div>
      <div className="mb-8">
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
          Set a new password
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Enter your new password below. You will use this new password to sign in to your account.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        {/* Token Input if not in URL */}
        {!urlToken ? (
          <div>
            <Input
              id="token"
              name="token"
              type="text"
              label="Reset Code / Token"
              icon="key"
              placeholder="Paste your 64-character token"
              value={inputToken}
              onChange={(e) => setInputToken(e.target.value)}
              required
            />
            <p className="text-[11px] text-outline mt-1 px-1">
              Don&apos;t have a token?{" "}
              <Link href="/forgot-password" className="text-primary font-bold hover:underline">
                Request a reset link
              </Link>
            </p>
          </div>
        ) : (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300">
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
            <span className="font-medium">Reset token successfully verified from link</span>
          </div>
        )}

        <Input
          id="password"
          name="password"
          type="password"
          label="New password"
          icon="lock"
          placeholder="••••••••"
          hint="Use at least 8 characters."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          id="confirm-password"
          name="confirmPassword"
          type="password"
          label="Confirm new password"
          icon="lock"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        {error && (
          <p className="text-error font-body-md text-body-md px-1" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full mt-2" disabled={loading}>
          {loading ? "Updating password..." : "Reset password & continue"}
        </Button>
      </form>

      <div className="mt-10 text-center">
        <Link
          href="/login"
          className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Back to sign in
        </Link>
      </div>
    </>
  );
}
