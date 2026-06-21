import Link from 'next/link';
import { Globe } from 'lucide-react';

export const metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl mb-10">
          <Globe className="h-6 w-6 text-primary" />
          <span>Linguara</span>
        </Link>

        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-10">Last updated: June 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-7">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly (name, email, password hash) and information generated through use of the Service (translation content, usage logs, wallet addresses).</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. How We Use Information</h2>
            <p>We use collected information to provide and improve the Service, authenticate users, send transactional emails (e.g., email verification, password reset), and maintain audit trails of translations.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Blockchain Data</h2>
            <p>Translation metadata submitted to the GenLayer network is recorded on-chain and is publicly visible. Do not submit content you wish to keep private without understanding this. We do not store raw translation content in a way that links it to your identity in our databases.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Wallet Security</h2>
            <p>Your Ethereum wallet private key is encrypted with AES-256-GCM using a key derived from your account and our secure master key. We never transmit your private key. You may export and self-custody your key at any time from your wallet settings.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Data Sharing</h2>
            <p>We do not sell your personal data. We share data only with infrastructure providers necessary to operate the Service (database hosting, email delivery, Redis caching) under data processing agreements.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Cookies</h2>
            <p>We use HTTP-only cookies to store authentication tokens. These are strictly necessary for the Service to function and are not used for tracking or advertising.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Data Retention</h2>
            <p>Account data is retained for the lifetime of your account. You may request deletion of your account and associated data at any time by contacting us.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Your Rights</h2>
            <p>Depending on your jurisdiction, you may have rights to access, correct, or delete your personal data. Contact us to exercise these rights.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Contact</h2>
            <p>Privacy questions? Email <a href="mailto:support@linguara.app" className="text-primary hover:underline">support@linguara.app</a>.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex gap-6 text-sm text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
          <Link href="/" className="hover:text-foreground">Back to home</Link>
        </div>
      </div>
    </div>
  );
}
