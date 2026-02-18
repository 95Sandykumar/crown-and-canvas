import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Crown & Canvas terms of service — the rules and guidelines for using our pet portrait services.",
};

export default function TermsOfServicePage() {
  return (
    <div className="bg-cream min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="space-y-4 mb-12">
          <h1 className="font-serif text-4xl font-bold text-charcoal sm:text-5xl">
            Terms of Service
          </h1>
          <p className="text-sm text-charcoal/50">
            Last updated: February 15, 2026
          </p>
        </div>

        <div className="prose-policy space-y-8">
          <Section title="1. Agreement to Terms">
            <p>
              By accessing or using the Crown & Canvas website and services (&quot;Services&quot;), you agree
              to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms,
              do not use our Services.
            </p>
            <p>
              &quot;You&quot; refers to the individual or entity using our Services.
              &quot;We,&quot; &quot;us,&quot; and &quot;our&quot; refer to Crown & Canvas.
            </p>
          </Section>

          <Section title="2. Services Description">
            <p>Crown & Canvas provides custom pet portrait creation services, including:</p>
            <ul>
              <li><strong>Digital downloads:</strong> High-resolution digital portrait files</li>
              <li><strong>Canvas prints:</strong> Gallery-wrapped canvas prints in various sizes</li>
              <li><strong>Framed prints:</strong> Framed portraits with UV-protective glass</li>
            </ul>
            <p>
              Portraits are created using AI technology combined with quality review processes.
              You upload a photo of your pet, select a style and product, and we create a custom portrait.
            </p>
          </Section>

          <Section title="3. Orders & Payment">
            <h4>Placing Orders</h4>
            <ul>
              <li>All orders are placed through our website and processed via Stripe</li>
              <li>Prices are listed in USD and include applicable taxes calculated at checkout</li>
              <li>Free shipping is included for all canvas and framed print orders within the United States</li>
              <li>By completing a purchase, you authorize us to charge the payment method provided</li>
            </ul>

            <h4>Order Confirmation</h4>
            <p>
              After payment, you will receive an email confirmation with your order details.
              This confirmation constitutes our acceptance of your order and forms a binding contract
              between you and Crown & Canvas.
            </p>

            <h4>Pricing</h4>
            <p>
              We reserve the right to change our prices at any time. Price changes will not affect
              orders that have already been confirmed and paid for.
            </p>
          </Section>

          <Section title="4. Portrait Creation Process">
            <h4>Turnaround Times</h4>
            <ul>
              <li><strong>Digital proof:</strong> Delivered via email within 24-48 hours of order placement</li>
              <li><strong>Rush processing (+$14.99):</strong> Digital proof within 12-24 hours</li>
              <li><strong>Physical products:</strong> Ship within 5-7 business days after portrait approval</li>
            </ul>
            <p>
              These are estimated timeframes and not guaranteed. Delays may occur due to high demand,
              quality reviews, or circumstances beyond our control.
            </p>

            <h4>Approval Process</h4>
            <p>
              For all orders, we will email you a digital preview of your portrait before proceeding.
              You may request reasonable revisions to the portrait. If we are unable to create a
              satisfactory portrait from the provided photo, we will offer a full refund.
            </p>

            <h4>Photo Requirements</h4>
            <p>For best results, submitted pet photos should:</p>
            <ul>
              <li>Clearly show your pet&apos;s face and features</li>
              <li>Be well-lit and in focus</li>
              <li>Be at least 1 megapixel in resolution</li>
              <li>Be in JPG, PNG, or WebP format (max 10MB)</li>
            </ul>
            <p>
              We reserve the right to request a replacement photo if the submitted image is insufficient
              for creating a quality portrait.
            </p>
          </Section>

          <Section title="5. Refund & Cancellation Policy">
            <h4>Digital Downloads</h4>
            <ul>
              <li><strong>Before portrait delivery:</strong> Full refund available</li>
              <li><strong>After portrait delivery:</strong> No refunds, as digital files cannot be returned. If you are unsatisfied with quality, we will work with you on revisions.</li>
            </ul>

            <h4>Canvas & Framed Prints</h4>
            <ul>
              <li><strong>Before portrait approval:</strong> Full refund available</li>
              <li><strong>After approval, before shipping:</strong> Cancellation with full refund minus a $10 processing fee</li>
              <li><strong>After shipping:</strong> No cancellations. See Damaged/Defective Items below.</li>
            </ul>

            <h4>Damaged or Defective Items</h4>
            <p>
              If your physical product arrives damaged or defective, contact us within 7 days of delivery
              with photos of the damage. We will send a free replacement at no cost to you.
            </p>

            <h4>Satisfaction Guarantee</h4>
            <p>
              We stand behind the quality of our work. If you are genuinely unsatisfied with your portrait
              and we cannot resolve the issue through revisions, we will issue a full refund.
              Contact us within 14 days of receiving your order.
            </p>

            <h4>Donations</h4>
            <p>
              Shelter pet donations added to your order are non-refundable, as they are forwarded to
              our partner animal shelters.
            </p>
          </Section>

          <Section title="6. Intellectual Property">
            <h4>Your Rights</h4>
            <ul>
              <li>You retain all rights to the pet photos you upload</li>
              <li>Upon purchase, you receive a personal, non-exclusive license to use your completed portrait for personal purposes (printing, displaying, sharing on social media)</li>
              <li>You may not resell, sublicense, or commercially distribute the portrait</li>
            </ul>

            <h4>Our Rights</h4>
            <ul>
              <li>Crown & Canvas retains rights to the artistic style, techniques, and processes used to create portraits</li>
              <li>We may use completed portraits in our portfolio, website, and marketing materials unless you opt out by notifying us in writing</li>
              <li>All website content, branding, and design elements are our intellectual property</li>
            </ul>
          </Section>

          <Section title="7. Prohibited Content">
            <p>You agree not to upload photos or request portraits that:</p>
            <ul>
              <li>Contain copyrighted characters or third-party intellectual property</li>
              <li>Depict illegal, offensive, or inappropriate content</li>
              <li>Contain images of people without their consent</li>
              <li>Are not photos of real animals (no AI-generated pet images)</li>
            </ul>
            <p>
              We reserve the right to refuse any order that violates these guidelines and issue a full refund.
            </p>
          </Section>

          <Section title="8. Shipping & Delivery">
            <ul>
              <li><strong>US domestic:</strong> Free standard shipping (7-10 business days after portrait approval)</li>
              <li><strong>International:</strong> Additional shipping charges may apply and will be calculated at checkout</li>
              <li>Shipping times are estimates and not guaranteed delivery dates</li>
              <li>We are not responsible for delays caused by carriers, customs, or weather</li>
              <li>Risk of loss transfers to you upon delivery to the carrier</li>
            </ul>
            <p>
              If your package appears lost, contact us within 30 days. We will work with the carrier
              to locate it or send a replacement.
            </p>
          </Section>

          <Section title="9. Limitation of Liability">
            <p>
              To the maximum extent permitted by law, Crown & Canvas shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages, including but not limited to loss of
              profits, data, or other intangible losses, arising from your use of our Services.
            </p>
            <p>
              Our total liability for any claim related to our Services shall not exceed the amount
              you paid for the specific order giving rise to the claim.
            </p>
          </Section>

          <Section title="10. Indemnification">
            <p>
              You agree to indemnify and hold harmless Crown & Canvas from any claims, damages, losses,
              or expenses (including reasonable attorney&apos;s fees) arising from your use of our Services,
              your violation of these Terms, or your violation of any third-party rights.
            </p>
          </Section>

          <Section title="11. Dispute Resolution">
            <p>
              Any disputes arising from these Terms or our Services shall first be attempted to be
              resolved through good-faith negotiation. If negotiation fails, disputes shall be resolved
              through binding arbitration in accordance with the rules of the American Arbitration Association.
            </p>
            <p>
              You agree to resolve disputes on an individual basis and waive any right to participate
              in a class action lawsuit or class-wide arbitration.
            </p>
          </Section>

          <Section title="12. Changes to Terms">
            <p>
              We may modify these Terms at any time. Material changes will be posted on this page with an
              updated date. Your continued use of our Services after changes are posted constitutes
              acceptance of the modified Terms.
            </p>
          </Section>

          <Section title="13. General Provisions">
            <ul>
              <li><strong>Governing law:</strong> These Terms are governed by the laws of the State of California, without regard to conflict of law principles.</li>
              <li><strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions remain in full effect.</li>
              <li><strong>Entire agreement:</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and Crown & Canvas.</li>
              <li><strong>Waiver:</strong> Failure to enforce any provision does not constitute a waiver of that provision.</li>
            </ul>
          </Section>

          <Section title="14. Contact Us">
            <p>For questions about these Terms of Service, contact us at:</p>
            <ul>
              <li><strong>Email:</strong> hello@crownandcanvas.com</li>
              <li><strong>Subject line:</strong> Terms of Service Inquiry</li>
            </ul>
          </Section>
        </div>

        <div className="mt-12 pt-8 border-t border-border/40">
          <Link href="/privacy" className="text-sm text-royal hover:text-royal-dark font-medium">
            View our Privacy Policy &rarr;
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
