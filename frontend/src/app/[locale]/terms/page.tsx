import Link from 'next/link';
import { Globe } from 'lucide-react';

export const metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl mb-10">
          <Globe className="h-6 w-6 text-primary" />
          <span>Linguara</span>
        </Link>

        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-10">Last updated: June 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-sm leading-7">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using Linguara ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
            <p>Linguara is a decentralized AI translation platform that uses GenLayer's blockchain-based consensus to produce verified translations across 70+ languages. Translations are recorded on-chain for auditability.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
            <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your credentials. Each account is automatically assigned a non-custodial Ethereum wallet — you are solely responsible for the security of any private key material you export.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Acceptable Use</h2>
            <p>You agree not to use the Service to translate content that is illegal, hateful, or violates third-party rights. Automated abuse, scraping, or deliberate attempts to manipulate consensus outcomes are prohibited.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Intellectual Property</h2>
            <p>You retain ownership of all content you submit. By submitting content, you grant Linguara a limited license to process it solely for the purpose of providing the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Disclaimer of Warranties</h2>
            <p>The Service is provided "as is" without warranties of any kind. AI-generated translations may contain errors. Linguara is not liable for decisions made based on translated content.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, Linguara shall not be liable for any indirect, incidental, or consequential damages arising out of your use of the Service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Changes to Terms</h2>
            <p>We may update these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Contact</h2>
            <p>Questions about these terms? Email us at <a href="mailto:support@linguara.app" className="text-primary hover:underline">support@linguara.app</a>.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex gap-6 text-sm text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
          <Link href="/" className="hover:text-foreground">Back to home</Link>
        </div>
      </div>
    </div>
  );
}
