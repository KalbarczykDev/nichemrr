import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";
import { UserSettingsSync } from "@/components/UserSettingsSync";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NicheMRR | Find niche for your next SaaS",
  description: "Analyze startup niches and deal scores using TrustMrr data",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
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
            defaultTheme="system"
            enableSystem={true}
          >
            <UserSettingsSync />
            <div className="flex min-h-screen flex-col">
              {/* Beta notice */}
              <div className="bg-amber-400 text-amber-950 text-xs text-center px-4 py-2 font-medium flex items-center justify-center gap-1 flex-wrap">
                You&apos;re viewing an early preview of NicheMRR. Some data is
                placeholder and scores may change. By using this site you agree
                to our{" "}
                <Link
                  href="/tos"
                  className="underline underline-offset-2 hover:opacity-70"
                >
                  Terms
                </Link>{" "}
                &amp;{" "}
                <Link
                  href="/privacy"
                  className="underline underline-offset-2 hover:opacity-70"
                >
                  Privacy Policy
                </Link>
                .
              </div>
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
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
