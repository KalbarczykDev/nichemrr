import Link from "next/link";

export const metadata = { title: "Privacy Policy — NicheMRR" };

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-10">Last updated: March 2026</p>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">1. What We Collect</h2>
          <p>When you register, we collect:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Your email address</li>
            <li>A bcrypt hash of your password (never the plaintext password)</li>
            <li>The date and time you accepted these terms</li>
            <li>If you sign in with Google: your Google account email and profile picture URL</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">2. How We Use Your Data</h2>
          <p>We use your data solely to:</p>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>Authenticate you and maintain your session</li>
            <li>Send transactional emails (email verification, password reset)</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p>We do not sell, rent, or share your personal data with third parties for marketing.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">3. Third-Party Services</h2>
          <ul className="list-disc list-inside space-y-1 pl-2">
            <li>
              <span className="text-foreground font-medium">MongoDB Atlas</span> — stores your
              account data securely in the cloud
            </li>
            <li>
              <span className="text-foreground font-medium">Resend</span> — used to send
              transactional emails
            </li>
            <li>
              <span className="text-foreground font-medium">Google OAuth</span> — optional sign-in
              method; governed by Google&apos;s Privacy Policy
            </li>
            <li>
              <span className="text-foreground font-medium">TrustMrr</span> — source of startup
              data displayed in the app; no personal data is shared with them
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">4. Cookies & Sessions</h2>
          <p>
            We use a single HTTP-only cookie to maintain your authenticated session (via
            NextAuth.js). No tracking or advertising cookies are used.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">5. Data Retention</h2>
          <p>
            Your data is retained for as long as your account exists. You may delete your account
            at any time from the account settings page, which permanently removes all personal data
            associated with your account.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">6. Security</h2>
          <p>
            Passwords are hashed using bcrypt and never stored in plaintext. All data is
            transmitted over HTTPS. We take reasonable precautions to protect your data, but no
            system is completely secure.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">7. Your Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data. To exercise these
            rights, delete your account from the settings page or contact us directly.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-semibold text-foreground">8. Contact</h2>
          <p>
            Questions about this policy? Reach out on{" "}
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
  );
}
