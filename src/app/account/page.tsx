"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AccountPage() {
  const { data: session } = useSession();

  async function handleDelete() {
    if (!window.confirm("Delete your account permanently? This cannot be undone.")) return;
    const res = await fetch("/api/auth/delete-account", { method: "DELETE" });
    if (res.ok) {
      await signOut({ callbackUrl: "/login" });
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold">Account</h1>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← Back to dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto max-w-md px-4 py-12 space-y-8">
        <div className="rounded-lg border p-6 space-y-2">
          <p className="text-sm text-muted-foreground">Signed in as</p>
          <p className="font-medium">{session?.user?.email}</p>
        </div>

        <div className="rounded-lg border border-destructive/40 p-6 space-y-4">
          <div>
            <h2 className="font-semibold text-destructive">Danger zone</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Permanently delete your account and all associated data.
            </p>
          </div>
          <Button variant="destructive" onClick={handleDelete}>
            Delete account
          </Button>
        </div>
      </main>
    </div>
  );
}
