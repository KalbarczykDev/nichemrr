"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.get("verified") === "1") setInfo("Email verified! You can now sign in.");
    if (params.get("error") === "INVALID_TOKEN") setError("Invalid or expired verification link.");
  }, [params]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.ok) {
      router.push("/dashboard");
    } else {
      setError("Invalid credentials or unverified email — please check your inbox.");
    }
  }

  return (
    <>
      {info && <p className="text-sm text-green-600 dark:text-green-400">{info}</p>}
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
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
      >
        Continue with Google
      </Button>

      <div className="flex justify-between text-sm text-muted-foreground">
        <Link href="/register" className="hover:text-foreground">
          Create account
        </Link>
        <Link href="/forgot-password" className="hover:text-foreground">
          Forgot password?
        </Link>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <h1 className="text-2xl font-bold">Sign in to NicheMRR</h1>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
