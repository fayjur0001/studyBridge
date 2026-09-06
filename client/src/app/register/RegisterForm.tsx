"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

type Role = "student" | "agency";

const ROLE_DASHBOARD: Record<Role, string> = {
  student: "/student/dashboard",
  agency: "/agency/dashboard",
};

export default function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();
  const [role, setRole] = useState<Role>("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("Please fill in every field to continue.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 8) {
      setError("Your password should be at least 8 characters long.");
      return;
    }
    if (!agreed) {
      setError("Please accept the Terms of Service and Privacy Policy.");
      return;
    }

    setLoading(true);
    try {
      await register({
        email,
        password,
        fullName,
        role,
        companyName: role === "agency" ? fullName : undefined,
      });
      router.push(ROLE_DASHBOARD[role]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Role toggle */}
      <div className="mb-8">
        <div className="bg-surface-container-low p-1.5 rounded-full flex relative w-full max-w-sm mx-auto md:mx-0">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`relative z-10 flex-1 py-2 text-label-md font-label-md transition-colors duration-300 rounded-full ${
              role === "student"
                ? "text-primary font-bold bg-surface-container-lowest shadow-sm"
                : "text-on-surface-variant"
            }`}
          >
            Student
          </button>
          <button
            type="button"
            onClick={() => setRole("agency")}
            className={`relative z-10 flex-1 py-2 text-label-md font-label-md transition-colors duration-300 rounded-full ${
              role === "agency"
                ? "text-primary font-bold bg-surface-container-lowest shadow-sm"
                : "text-on-surface-variant"
            }`}
          >
            Agency
          </button>
        </div>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <Input
          id="full-name"
          label={role === "agency" ? "Agency Name" : "Full Name"}
          icon="person"
          placeholder={role === "agency" ? "Global Reach Consultants" : "John Doe"}
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
        <Input
          id="email"
          label="Email Address"
          icon="mail"
          placeholder="john@example.com"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          id="password"
          label="Password"
          icon="lock"
          placeholder="••••••••"
          type="password"
          hint="Use at least 8 characters."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-start gap-3 py-2">
          <input
            id="terms"
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant cursor-pointer"
          />
          <label
            htmlFor="terms"
            className="font-body-md text-body-md text-on-surface-variant leading-tight"
          >
            I agree to the{" "}
            <Link className="text-primary font-bold hover:underline" href="/terms">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link className="text-primary font-bold hover:underline" href="/privacy">
              Privacy Policy
            </Link>
            .
          </label>
        </div>

        {error && (
          <p className="text-error font-body-md text-body-md" role="alert">
            {error}
          </p>
        )}

        <Button type="submit" className="w-full mt-4" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
        </Button>
      </form>

      <div className="mt-10 text-center">
        <p className="font-body-md text-body-md text-on-surface-variant">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary font-bold hover:underline ml-1"
          >
            Login here
          </Link>
        </p>
      </div>
    </>
  );
}
