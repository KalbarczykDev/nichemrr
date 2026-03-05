import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";

export const metadata = { title: "Terms of Service — NicheMRR" };

export default function TosPage() {
  return (
    <>
    <SiteHeader />
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: March 2026</p>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">1. Acceptance</h2>
          <p>
            By creating an account or using NicheMRR, you agree to these Terms of Service. If you
            do not agree, do not use the service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">2. Description of Service</h2>
          <p>
            NicheMRR is a web application that aggregates and analyses startup data sourced from
            TrustMrr. It provides niche opportunity scores and deal analysis for informational
            purposes only. Nothing on this platform constitutes financial or investment advice.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">3. Accounts</h2>
          <p>
            You are responsible for maintaining the confidentiality of your login credentials. You
            must provide a valid email address and keep your account information accurate. You may
            not share your account with others.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Attempt to scrape, reverse-engineer, or abuse the service</li>
            <li>Use the service for any unlawful purpose</li>
            <li>Share or resell data obtained from NicheMRR without permission</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">5. Data Accuracy</h2>
          <p>
            Data is sourced from TrustMrr and cached periodically. NicheMRR makes no guarantees
            about its accuracy, completeness, or timeliness. Use it at your own risk.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">6. Account Deletion</h2>
          <p>
            You may delete your account at any time from the account settings page. Upon deletion,
            your personal data will be removed from our systems.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">7. Modifications</h2>
          <p>
            We may update these terms from time to time. Continued use of the service after changes
            are posted constitutes acceptance of the revised terms.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">8. Limitation of Liability</h2>
          <p>
            NicheMRR is provided "as is" without warranty of any kind. To the fullest extent
            permitted by law, Oskar Kalbarczyk shall not be liable for any indirect, incidental, or
            consequential damages arising from your use of the service.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">9. Contact</h2>
          <p>
            Questions? Reach out on{" "}
            <a
              href="https://twitter.com/KalbarczykDev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline"
            >
              Twitter
            </a>
            .
          </p>
        </section>
      </div>

      <div className="mt-10 text-sm">
        <Link href="/" className="text-muted-foreground hover:text-foreground">
          ← Back to dashboard
        </Link>
      </div>
    </div>
    </>
  );
}
