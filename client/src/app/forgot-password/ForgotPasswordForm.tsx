"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { api, ApiError } from "@/lib/api";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [resetLink, setResetLink] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post<{
        message: string;
        resetLink?: string;
        token?: string;
      }>("/api/auth/forgot-password", { email }, { auth: false });

      setResetLink(res.resetLink || (res.token ? `/reset-password?token=${res.token}` : null));
      setToken(res.token || null);
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopyToken() {
    if (token) {
      navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }

  if (sent) {
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
          Reset Link Ready
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">
          Password reset instructions have been generated for{" "}
          <span className="font-bold text-on-surface">{email}</span>.
        </p>

        {resetLink ? (
          <div className="space-y-4 mb-8">
            <Link
              href={resetLink}
              className="w-full py-3.5 px-6 rounded-xl bg-primary text-on-primary font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">lock_reset</span>
              Proceed to Reset Password Now →
            </Link>

            <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-left">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-outline">
                  Reset Token / Code
                </span>
                <button
                  type="button"
                  onClick={handleCopyToken}
                  className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[13px]">
                    {copied ? "check" : "content_copy"}
                  </span>
                  {copied ? "Copied!" : "Copy Token"}
                </button>
              </div>
              <p className="font-mono text-xs text-on-surface select-all break-all bg-surface-container p-2 rounded-lg">
                {token}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-surface-container-low text-xs text-on-surface-variant mb-6 border border-outline-variant/30">
            If an account matches this email, you may proceed to reset your password.
          </div>
        )}

        <div className="mt-8">
          <Link
            href="/login"
            className="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to sign in
          </Link>
        </div>
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
          Forgot your password?
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Enter your registered email address and we&apos;ll generate a secure link to reset your password.
        </p>
      </div>

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

        {error && (
          <p className="text-error font-body-md text-body-md px-1" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full mt-2" disabled={loading}>
          {loading ? "Generating link..." : "Send reset link"}
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
