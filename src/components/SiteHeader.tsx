import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { SignOutButton } from "@/components/SignOutButton";
import { UserMenu } from "@/components/UserMenu";

export default async function SiteHeader() {
  const session = await getServerSession(authOptions);
  const loggedIn = !!session;

  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icon.svg" alt="NicheMRR" width={40} height={40} />
          <div>
            <p className="text-lg font-bold">NicheMRR</p>
            <p className="text-xs text-muted-foreground">Powered by TrustMrr</p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          {loggedIn ? (
            <>
              <Link href="/dashboard">
                <Button size="sm">Dashboard</Button>
              </Link>
              <SignOutButton />
              <UserMenu />
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get started</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
