import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SiteHeader() {
  return (
    <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div>
            <p className="text-lg font-bold">NicheMRR</p>
            <p className="text-xs text-muted-foreground">Powered by TrustMrr</p>
          </div>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
