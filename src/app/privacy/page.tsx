import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Crown & Canvas privacy policy — how we collect, use, and protect your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-cream min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="space-y-4 mb-12">
          <h1 className="font-serif text-4xl font-bold text-charcoal sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="text-sm text-charcoal/50">
            Last updated: February 15, 2026
          </p>
        </div>

        <div className="prose-policy space-y-8">
          <Section title="1. Introduction">
            <p>
              Crown & Canvas (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy and is committed
              to protecting the personal information you share with us. This Privacy Policy explains how we
              collect, use, disclose, and safeguard your information when you visit our website and use our
              services to create custom pet portraits.
            </p>
            <p>
              By using our website and services, you consent to the practices described in this policy.
              If you do not agree with this policy, please do not use our services.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <h4>Information You Provide Directly</h4>
            <ul>
              <li><strong>Contact information:</strong> Name, email address</li>
              <li><strong>Pet photos:</strong> Images you upload for portrait creation</li>
              <li><strong>Pet details:</strong> Pet name and any customization preferences</li>
              <li><strong>Order information:</strong> Product selections, sizes, add-ons</li>
              <li><strong>Shipping address:</strong> For physical product delivery (canvas and framed prints)</li>
            </ul>

            <h4>Information Collected Automatically</h4>
            <ul>
              <li><strong>Device information:</strong> Browser type, operating system, screen resolution</li>
              <li><strong>Usage data:</strong> Pages visited, time spent, click patterns</li>
              <li><strong>IP address:</strong> For fraud prevention and analytics</li>
              <li><strong>Cookies:</strong> Session cookies for cart persistence and site functionality</li>
            </ul>

            <h4>Information from Third Parties</h4>
            <ul>
              <li><strong>Payment processor (Stripe):</strong> We receive confirmation of payment status. We do not
                store your credit card number, CVV, or full card details — Stripe handles all payment
                processing securely.</li>
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            <p>We use the information we collect to:</p>
            <ul>
              <li>Process and fulfill your pet portrait orders</li>
              <li>Generate your custom pet portrait using AI technology</li>
              <li>Send order confirmations, digital proofs, and delivery updates</li>
              <li>Provide customer support and respond to inquiries</li>
              <li>Process payments and prevent fraud</li>
              <li>Improve our website, products, and services</li>
              <li>Comply with legal obligations</li>
            </ul>
            <p>
              We will <strong>never</strong> sell your personal information or pet photos to third parties
              for marketing purposes.
            </p>
          </Section>

          <Section title="4. How We Share Your Information">
            <p>We share your information only with the following categories of service providers, and only as necessary to fulfill your order:</p>
            <ul>
              <li><strong>Stripe</strong> — Payment processing. Stripe&apos;s privacy policy applies to payment data.</li>
              <li><strong>Print fulfillment partners</strong> — To produce and ship canvas and framed prints. They receive your shipping address and the portrait image file.</li>
              <li><strong>Email service providers</strong> — To send order confirmations and updates.</li>
              <li><strong>AI processing services</strong> — To generate your pet portrait. Your pet photo is processed to create the portrait and is not used for any other purpose.</li>
              <li><strong>Hosting provider (Vercel)</strong> — Our website infrastructure provider.</li>
            </ul>
            <p>We may also disclose information if required by law, court order, or to protect our rights and safety.</p>
          </Section>

          <Section title="5. Pet Photo Usage">
            <p>Your pet photos are important to us, and we handle them with care:</p>
            <ul>
              <li>Photos are used <strong>solely</strong> to create your ordered portrait</li>
              <li>We may retain completed portraits in our systems for order fulfillment and re-download purposes</li>
              <li>We will <strong>not</strong> use your pet&apos;s photo in marketing materials without your explicit written consent</li>
              <li>You may request deletion of your photos at any time by contacting us</li>
            </ul>
          </Section>

          <Section title="6. Data Retention">
            <ul>
              <li><strong>Order data:</strong> Retained for as long as necessary for business and legal purposes (typically 3 years for tax compliance)</li>
              <li><strong>Pet photos and portraits:</strong> Retained for 90 days after order completion for re-download purposes, then deleted unless you request earlier removal</li>
              <li><strong>Account/contact information:</strong> Retained until you request deletion</li>
            </ul>
          </Section>

          <Section title="7. Data Security">
            <p>We implement appropriate technical and organizational measures to protect your personal information, including:</p>
            <ul>
              <li>HTTPS encryption for all data in transit</li>
              <li>PCI-DSS compliant payment processing through Stripe</li>
              <li>Access controls limiting who can view customer data</li>
              <li>Regular security reviews of our systems</li>
            </ul>
            <p>
              While we take reasonable steps to protect your information, no method of transmission over
              the Internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </Section>

          <Section title="8. Cookies">
            <p>We use cookies for:</p>
            <ul>
              <li><strong>Essential cookies:</strong> Cart functionality, session management</li>
              <li><strong>Analytics cookies:</strong> Understanding how visitors use our site to improve the experience</li>
            </ul>
            <p>You can control cookies through your browser settings. Disabling essential cookies may prevent the shopping cart from functioning properly.</p>
          </Section>

          <Section title="9. Your Rights">
            <p>Depending on your location, you may have the following rights:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
              <li><strong>Correction:</strong> Request correction of inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your personal information and pet photos</li>
              <li><strong>Portability:</strong> Request your data in a portable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing emails at any time</li>
            </ul>

            <h4>California Residents (CCPA)</h4>
            <p>
              California residents have additional rights under the California Consumer Privacy Act (CCPA),
              including the right to know what personal information is collected and the right to request
              deletion. We do not sell personal information. To exercise your rights, contact us at the
              email below.
            </p>

            <h4>European Residents (GDPR)</h4>
            <p>
              If you are in the European Economic Area, you have rights under the General Data Protection
              Regulation (GDPR), including the right to access, rectify, erase, and port your data.
              Our legal basis for processing is contract performance (fulfilling your order) and legitimate
              interest (improving our services). Contact us to exercise any of these rights.
            </p>
          </Section>

          <Section title="10. Children's Privacy">
            <p>
              Our services are not directed to children under 13. We do not knowingly collect personal
              information from children under 13. If you believe we have inadvertently collected such
              information, please contact us so we can promptly delete it.
            </p>
          </Section>

          <Section title="11. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of material changes
              by posting the updated policy on this page with a new &quot;Last updated&quot; date. Your continued
              use of our services after changes are posted constitutes acceptance of the updated policy.
            </p>
          </Section>

          <Section title="12. Contact Us">
            <p>If you have questions about this Privacy Policy or wish to exercise your data rights, contact us at:</p>
            <ul>
              <li><strong>Email:</strong> hello@crownandcanvas.com</li>
              <li><strong>Subject line:</strong> Privacy Request</li>
            </ul>
            <p>We will respond to all privacy-related requests within 30 days.</p>
          </Section>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40">
          <Link href="/terms" className="text-sm text-royal hover:text-royal-dark font-medium">
            View our Terms of Service &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white border border-border/40 p-6 space-y-3">
      <h2 className="font-semibold text-lg text-charcoal">{title}</h2>
      <div className="text-sm text-charcoal/60 leading-relaxed space-y-3 [&_h4]:font-semibold [&_h4]:text-charcoal/80 [&_h4]:mt-4 [&_h4]:text-sm [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_li]:text-sm">
        {children}
      </div>
    </div>
  );
}
