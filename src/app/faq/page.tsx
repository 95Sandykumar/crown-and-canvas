import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS } from "@/data/faq";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Frequently asked questions about Crown & Canvas pet royal portraits.",
};

export default function FAQPage() {
  return (
    <div className="bg-cream min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="text-center space-y-4 mb-12">
          <h1 className="font-serif text-4xl font-bold text-charcoal sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-charcoal/60">
            Everything you need to know about Crown & Canvas
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {FAQS.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="rounded-xl bg-white border border-border/40 px-6 data-[state=open]:shadow-sm"
            >
              <AccordionTrigger className="text-left font-medium text-charcoal hover:text-royal py-5 [&[data-state=open]]:text-royal">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-charcoal/60 leading-relaxed pb-5">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* CTA */}
        <div className="mt-16 rounded-2xl bg-royal p-8 text-center space-y-4">
          <h2 className="font-serif text-2xl font-bold text-white">
            Still Have Questions?
          </h2>
          <p className="text-white/70">
            We&apos;re here to help! Reach out and we&apos;ll get back to you within 24 hours.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:hello@crownandcanvas.com">
              <Button size="lg" className="bg-gold hover:bg-gold-light text-charcoal font-semibold px-8 py-6">
                Contact Us
              </Button>
            </a>
            <Link href="/order/upload">
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8 py-6 gap-2">
                Create Portrait <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
