import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NicheMRR | Find your next SaaS niche",
  description: "Analyze startup niches and deal scores using TrustMrr data",
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📊</text></svg>" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SessionProviderWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
          >
            <div className="flex min-h-screen flex-col">
              <div className="flex flex-1 flex-col">{children}</div>
              <footer className="border-t py-6">
                <div className="container mx-auto flex flex-col items-center gap-2 px-4 text-xs text-muted-foreground">
                  <span>
                    © {new Date().getFullYear()}{" "}
                    <a
                      href="https://kalbarczyk.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground transition-colors"
                    >
                      @KalbarczykDev
                    </a>
                  </span>
                  <div className="flex items-center gap-4">
                    <Link
                      href="/tos"
                      className="hover:text-foreground transition-colors"
                    >
                      Terms
                    </Link>
                    <Link
                      href="/privacy"
                      className="hover:text-foreground transition-colors"
                    >
                      Privacy
                    </Link>
                  </div>
                </div>
              </footer>
            </div>
            <Toaster />
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
