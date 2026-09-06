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

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/api/auth/forgot-password", { email }, { auth: false });
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary-container/40 flex items-center justify-center mx-auto mb-6">
          <span
            className="material-symbols-outlined text-primary text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            mark_email_read
          </span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">
          Check your inbox
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-8">
          If an account exists for <span className="font-bold">{email}</span>,
          we&apos;ve sent a link to reset your password.
        </p>
        <Link
          href="/reset-password"
          className="text-primary font-bold hover:underline font-label-md text-label-md"
        >
          Already have a reset link? Continue →
        </Link>
        <div className="mt-10">
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
          No worries — enter the email linked to your account and we&apos;ll
          send you a link to reset it.
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
          {loading ? "Sending link..." : "Send reset link"}
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
