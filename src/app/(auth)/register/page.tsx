"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [tosAccepted, setTosAccepted] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!tosAccepted) {
      setError("You must accept the Terms of Service.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, tosAccepted }),
    });
    setLoading(false);
    if (res.status === 201) {
      setDone(true);
    } else {
      const data = await res.json();
      if (data.error === "EMAIL_TAKEN") {
        setError("An account with this email already exists.");
      } else {
        setError(data.error ?? "Registration failed. Please try again.");
      }
    }
  }

  if (done) {
    return (
      <div className="w-full max-w-sm space-y-4 text-center">
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="text-muted-foreground">
          We sent a verification link to <strong>{email}</strong>. Click it to activate your account.
        </p>
        <Link href="/login" className="text-sm hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      <h1 className="text-2xl font-bold">Create an account</h1>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <label className="flex items-start gap-2 text-sm text-muted-foreground cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 shrink-0"
            checked={tosAccepted}
            onChange={(e) => setTosAccepted(e.target.checked)}
          />
          <span>
            I agree to the{" "}
            <Link href="/tos" className="text-foreground hover:underline">
              Terms of Service
            </Link>
          </span>
        </label>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      >
        Continue with Google
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="hover:text-foreground">
          Sign in
        </Link>
      </p>
    </div>
  );
}
