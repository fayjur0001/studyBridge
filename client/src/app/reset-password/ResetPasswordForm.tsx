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
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("This reset link is missing or invalid. Please request a new one.");
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
      await api.post("/api/auth/reset-password", { token, newPassword: password }, { auth: false });
      setDone(true);
      setTimeout(() => router.push("/login"), 1800);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary-container/40 flex items-center justify-center mx-auto mb-6">
          <span
            className="material-symbols-outlined text-primary text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
          Password updated
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">
          Your password has been reset successfully. Taking you to sign in...
        </p>
        <Link
          href="/login"
          className="text-primary font-bold hover:underline font-label-md text-label-md"
        >
          Go to sign in now →
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
          Choose a strong password you haven&apos;t used before.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
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
          {loading ? "Updating..." : "Reset password"}
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
