import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";

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
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
        >
          <div className="flex min-h-screen flex-col">
            <div className="flex flex-1 flex-col">{children}</div>
            <footer className="border-t py-5">
              <div className="container mx-auto flex flex-col items-center gap-2 px-4 text-xs text-muted-foreground sm:flex-row sm:justify-between">
                <span>
                  Feedback or ideas?{" "}
                  <a
                    href="https://twitter.com/KalbarczykDev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 hover:text-foreground transition-colors"
                  >
                    @KalbarczykDev
                  </a>{" "}
                  on Twitter/X
                </span>
                <span>© {new Date().getFullYear()} NicheMRR</span>
              </div>
            </footer>
          </div>
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
