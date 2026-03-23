import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <span className="font-semibold">Privacy Policy</span>
        </div>
      </header>

      <main className="container max-w-3xl py-12">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Last updated: {new Date().getFullYear()}
        </p>

        <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed">
              Lost It Find It ("we", "our", or "us") operates the Lost &amp;
              Found platform available at lostitfindit.app. This Privacy Policy
              explains how we collect, use, and protect your information when
              you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              2. Information We Collect
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                <strong className="text-foreground">Identity:</strong> We use
                Internet Identity for authentication. We do not collect
                passwords or email addresses during sign-in.
              </li>
              <li>
                <strong className="text-foreground">Profile data:</strong>{" "}
                Display name you choose to set up within the app.
              </li>
              <li>
                <strong className="text-foreground">Item listings:</strong>{" "}
                Titles, descriptions, categories, locations, and optional photos
                you submit when reporting lost or found items.
              </li>
              <li>
                <strong className="text-foreground">Messages:</strong> In-app
                messages exchanged between users about items.
              </li>
              <li>
                <strong className="text-foreground">
                  Push notification subscriptions:
                </strong>{" "}
                Browser push subscription endpoints stored if you opt in to
                notifications.
              </li>
              <li>
                <strong className="text-foreground">Feedback:</strong> Comments
                and star ratings you voluntarily submit.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              3. How We Use Your Information
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>
                To operate the lost-and-found platform and display listings.
              </li>
              <li>To enable secure messaging between finders and owners.</li>
              <li>
                To send push notifications when you receive new messages (opt-in
                only).
              </li>
              <li>To improve the service based on feedback.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Data Storage</h2>
            <p className="text-muted-foreground leading-relaxed">
              All data is stored on the Internet Computer blockchain via
              canisters operated by Caffeine AI. Data is decentralised and
              stored on the ICP network.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell or share your personal data with third parties.
              Item listings and messages are only visible to registered users of
              the platform. Push notification subscriptions are used solely to
              deliver in-app notifications and are not shared.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Photos and Media</h2>
            <p className="text-muted-foreground leading-relaxed">
              Photos you upload for item listings are stored on the Internet
              Computer and may be visible to other users browsing the platform.
              Do not upload photos containing sensitive personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Your Rights</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>You may delete your item listings at any time.</li>
              <li>
                You may disable push notifications at any time from the Inbox
                page.
              </li>
              <li>
                To request deletion of your account data, contact us at the
                address below.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              8. Children's Privacy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              This service is not directed to children under 13. We do not
              knowingly collect data from children under 13.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">
              9. Changes to This Policy
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this policy from time to time. Continued use of the
              service after changes constitutes acceptance of the updated
              policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              For privacy-related questions or data deletion requests, please
              contact us through the feedback form within the app.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t bg-muted/30 py-6 mt-12">
        <div className="container text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Lost &amp; Found. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
