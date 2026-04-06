"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Star,
  CheckCircle,
  Upload,
  Palette,
  Package,
  Shield,
  Truck,
  RotateCcw,
  Quote,
  ChevronRight,
  Medal,
  Anchor,
  Plane,
  Rocket,
  Target,
  Flag,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { PORTRAIT_STYLES } from "@/data/styles";

// ---------------------------------------------------------------------------
// SEO Metadata (exported from a separate generateMetadata for App Router)
// ---------------------------------------------------------------------------
// NOTE: Since this is a "use client" page, metadata must be in a separate
// layout or use generateMetadata in a server component wrapper. The metadata
// object is declared here for reference but will be exported from the layout.

// ---------------------------------------------------------------------------
// Military-specific data
// ---------------------------------------------------------------------------

const MILITARY_STYLES = PORTRAIT_STYLES.filter(
  (s) => s.category === "Military"
);

interface Branch {
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const BRANCHES: Branch[] = [
  {
    name: "Army",
    icon: <Shield className="h-6 w-6" />,
    color: "bg-green-800",
    description: "Dress blues, Class A uniforms, and combat decorations",
  },
  {
    name: "Navy",
    icon: <Anchor className="h-6 w-6" />,
    color: "bg-blue-900",
    description: "Dress whites, navy blues, and admiral insignia",
  },
  {
    name: "Marines",
    icon: <Target className="h-6 w-6" />,
    color: "bg-red-800",
    description: "Dress blues with the iconic red stripe and gold details",
  },
  {
    name: "Air Force",
    icon: <Plane className="h-6 w-6" />,
    color: "bg-blue-700",
    description: "Service dress, flight suits, and aviation heritage",
  },
  {
    name: "Coast Guard",
    icon: <Flag className="h-6 w-6" />,
    color: "bg-blue-600",
    description: "Dress blues, tropical whites, and maritime tradition",
  },
  {
    name: "Space Force",
    icon: <Rocket className="h-6 w-6" />,
    color: "bg-slate-800",
    description: "Modern dress uniforms with the newest branch identity",
  },
];

interface MilitaryTestimonial {
  name: string;
  petName: string;
  petType: string;
  quote: string;
  rating: number;
  branch: string;
  relationship: string;
}

const MILITARY_TESTIMONIALS: MilitaryTestimonial[] = [
  {
    name: "Amanda R.",
    petName: "Sarge",
    petType: "German Shepherd",
    quote:
      "I got this for my husband who just retired after 22 years in the Army. He saw Sarge in dress blues and couldn't stop laughing. Then he got emotional. Best retirement gift ever.",
    rating: 5,
    branch: "Army",
    relationship: "Military Spouse",
  },
  {
    name: "Kevin T.",
    petName: "Anchor",
    petType: "Labrador",
    quote:
      "My kids got me this for Father's Day. Anchor in a Navy admiral's uniform is now hanging in my office on base. Even my CO wants one for his dog.",
    rating: 5,
    branch: "Navy",
    relationship: "Active Duty",
  },
  {
    name: "Jessica M.",
    petName: "Gunner",
    petType: "Bulldog",
    quote:
      "Ordered the General portrait for my Marine dad's birthday. The detail on the medals and the way they captured Gunner's tough-guy face... perfection. Dad got misty-eyed.",
    rating: 5,
    branch: "Marines",
    relationship: "Military Kid",
  },
  {
    name: "Ryan P.",
    petName: "Maverick",
    petType: "Husky",
    quote:
      "Named him Maverick for a reason, and seeing him in a pilot's uniform is everything I hoped for. The canvas quality is museum-grade. Hanging it in the squadron lounge.",
    rating: 5,
    branch: "Air Force",
    relationship: "Active Duty",
  },
  {
    name: "Maria S.",
    petName: "Biscuit",
    petType: "Golden Retriever",
    quote:
      "Lost my dad last year, a 30-year Coast Guard veteran. I got Biscuit painted as an admiral to honor his memory. It's hanging next to Dad's portrait now. Means the world.",
    rating: 5,
    branch: "Coast Guard",
    relationship: "Gold Star Family",
  },
  {
    name: "Chris L.",
    petName: "Luna",
    petType: "Maine Coon",
    quote:
      "My wife said 'no more military stuff in the house.' Then she saw Luna in a Space Force uniform. Now it's her favorite thing in the living room.",
    rating: 5,
    branch: "Space Force",
    relationship: "Veteran",
  },
];

interface PricingTier {
  name: string;
  price: string;
  originalPrice?: string;
  description: string;
  features: string[];
  popular: boolean;
  cta: string;
}

const PRICING_TIERS: PricingTier[] = [
  {
    name: "Digital Download",
    price: "$29",
    description: "High-res digital file delivered to your inbox",
    features: [
      "High-resolution JPG + PNG",
      "Print-ready (300 DPI)",
      "Instant email delivery",
      "Unlimited personal use",
    ],
    popular: false,
    cta: "Get Digital",
  },
  {
    name: "Premium Canvas",
    price: "$59",
    originalPrice: "$79",
    description: "Museum-quality canvas, ready to hang",
    features: [
      "Premium cotton canvas",
      "Gallery-wrapped edges",
      "Ready to hang",
      "Free shipping",
      "Digital file included",
    ],
    popular: true,
    cta: "Order Canvas",
  },
  {
    name: "Luxury Framed",
    price: "$109",
    description: "Exquisite framed portrait with UV glass",
    features: [
      "Museum-quality wooden frame",
      "UV-protective glass",
      "Archival matte paper",
      "Free shipping",
      "Digital file included",
    ],
    popular: false,
    cta: "Order Framed",
  },
];

const FAQS = [
  {
    question: "How does it work?",
    answer:
      "It's simple: upload a clear photo of your pet, choose a military portrait style and branch, and we'll transform your pet into a decorated service member. You'll receive a digital proof in 24-48 hours to approve before we print.",
  },
  {
    question: "How long does it take?",
    answer:
      "Digital portraits are delivered within 24-48 hours. Canvas prints ship within 5-7 business days after proof approval. Framed prints ship within 7-10 business days. Need it faster? Add rush processing for 3-5 business day delivery.",
  },
  {
    question: "What kind of photo works best?",
    answer:
      "A clear, well-lit photo of your pet's face works best. Head shots or close-ups with good lighting give the best results. The photo should show your pet looking forward or at a slight angle. Avoid blurry photos, extreme angles, or photos where your pet's face is partially hidden.",
  },
  {
    question: "Can I choose a specific military branch or rank?",
    answer:
      "Absolutely. You can specify any branch (Army, Navy, Marines, Air Force, Coast Guard, Space Force) and we'll match the uniform details accordingly. You can also request specific ranks, medals, or unit insignia in the order notes.",
  },
  {
    question: "Is this a good gift for a veteran or active duty family member?",
    answer:
      "It's our most popular gift category. Over 70% of military portraits are purchased as gifts for veterans, active duty service members, military spouses, and families. We offer premium gift wrapping and personalized notes.",
  },
  {
    question: "What if I'm not happy with the result?",
    answer:
      "We include one free revision with every order. If you're still not satisfied after the revision, we offer a full refund. Our satisfaction rate is over 99%, but we want you to love it.",
  },
  {
    question: "Can I order a portrait of a pet who has passed away?",
    answer:
      "Yes, and we handle memorial portraits with extra care. Many customers order military portraits to honor both a beloved pet and a family member's service. Just upload the best photo you have and we'll create something special.",
  },
];

// ---------------------------------------------------------------------------
// Framer Motion variants
// ---------------------------------------------------------------------------

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function MilitaryLandingPage() {
  const [activeBranch, setActiveBranch] = useState<string>("Army");

  return (
    <div className="bg-cream">
      {/* ================================================================= */}
      {/* HERO SECTION                                                       */}
      {/* ================================================================= */}
      <section className="relative overflow-hidden bg-charcoal">
        {/* Subtle military pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D4AF37' fill-opacity='1'%3E%3Cpath d='M20 0l4 8h-8l4-8zm0 40l-4-8h8l-4 8zM0 20l8-4v8l-8-4zm40 0l-8 4v-8l8 4z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Gold accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left: Content */}
            <motion.div
              className="space-y-8 text-center lg:text-left"
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
            >
              <motion.div variants={fadeInUp}>
                <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 text-sm font-medium text-gold">
                  <Medal className="h-4 w-4" />
                  Loved by 2,000+ Military Families
                </div>
              </motion.div>

              <motion.h1
                className="font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
                variants={fadeInUp}
              >
                Honor Your Pet&apos;s{" "}
                <span className="text-gold">Service</span>
              </motion.h1>

              <motion.p
                className="text-lg font-medium text-gold/80 italic"
                variants={fadeInUp}
              >
                Transform your pet into a decorated military hero
              </motion.p>

              <motion.p
                className="mx-auto max-w-lg text-lg text-white/60 lg:mx-0"
                variants={fadeInUp}
              >
                Upload a photo of your pet and we&apos;ll create a stunning
                military portrait in the uniform of any branch. The perfect gift
                for veterans, active duty families, and anyone who loves their
                country and their pet.
              </motion.p>

              <motion.div
                className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start"
                variants={fadeInUp}
              >
                <Link href="/order/upload">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gold hover:bg-gold-light text-charcoal text-base font-semibold px-8 py-6 gap-2"
                  >
                    Create Your Pet&apos;s Portrait
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#styles">
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto text-base px-8 py-6 border-gold/30 text-gold hover:bg-gold/10 hover:text-gold"
                  >
                    See Military Styles
                  </Button>
                </a>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                className="flex flex-wrap justify-center gap-6 text-sm text-white/50 lg:justify-start"
                variants={fadeInUp}
              >
                <span className="flex items-center gap-1.5">
                  <span className="text-gold">&#9733;</span> 4.9/5 Rating
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-gold">&#10003;</span> Satisfaction
                  Guarantee
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="text-gold">&#9829;</span> Veteran Owned
                </span>
              </motion.div>
            </motion.div>

            {/* Right: Before/After showcase */}
            <motion.div
              className="relative mx-auto h-[420px] w-full max-w-md sm:h-[480px] lg:h-[520px] lg:max-w-none"
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              {/* Before card */}
              <div className="absolute left-0 top-6 z-10 w-[55%] -rotate-6 transition-transform duration-500 hover:-rotate-3 hover:scale-105">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border-2 border-gold/30 bg-charcoal shadow-xl shadow-black/20">
                  <Image
                    src="/portraits/military-general/before.webp"
                    alt="Original pet photo before military portrait transformation"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 45vw, 280px"
                    priority
                  />
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-charcoal shadow-sm">
                      Before
                    </span>
                  </div>
                </div>
              </div>

              {/* Sparkle connector */}
              <div className="absolute left-[46%] top-[45%] z-20 -translate-x-1/2 -translate-y-1/2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold shadow-lg">
                  <Medal className="h-5 w-5 text-charcoal" />
                </div>
              </div>

              {/* After card */}
              <div className="absolute right-0 top-0 z-[15] w-[55%] rotate-3 transition-transform duration-500 hover:rotate-0 hover:scale-105">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border-2 border-gold/30 bg-charcoal shadow-xl shadow-gold/10">
                  <Image
                    src="/portraits/military-general/after.webp"
                    alt="Pet transformed into a decorated military general portrait"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 45vw, 280px"
                    priority
                  />
                  <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center rounded-full bg-gold/90 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white shadow-sm">
                      After
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-charcoal/70 to-transparent p-4 pt-8">
                    <p className="font-serif text-sm font-semibold text-white drop-shadow-md">
                      &ldquo;The General&rdquo;
                    </p>
                  </div>
                </div>
              </div>

              {/* Price badge */}
              <div className="absolute -top-3 right-0 z-30 rounded-2xl bg-gold px-4 py-2 shadow-lg rotate-6">
                <p className="text-sm font-bold text-charcoal">From $29</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* SOCIAL PROOF BAR                                                   */}
      {/* ================================================================= */}
      <section className="border-y border-gold/10 bg-cream-dark/60 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-center gap-6 text-center text-sm text-charcoal/60 sm:gap-10">
            <span className="flex items-center gap-2 font-medium">
              <Medal className="h-4 w-4 text-gold" />
              2,000+ Military Portraits Sold
            </span>
            <span className="hidden sm:inline text-charcoal/20">|</span>
            <span className="flex items-center gap-2 font-medium">
              <Star className="h-4 w-4 text-gold fill-gold" />
              4.9/5 Average Rating
            </span>
            <span className="hidden sm:inline text-charcoal/20">|</span>
            <span className="flex items-center gap-2 font-medium">
              <Shield className="h-4 w-4 text-gold" />
              100% Satisfaction Guarantee
            </span>
            <span className="hidden sm:inline text-charcoal/20">|</span>
            <span className="flex items-center gap-2 font-medium">
              <Truck className="h-4 w-4 text-gold" />
              Free Shipping
            </span>
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* ALL 6 MILITARY BRANCHES                                            */}
      {/* ================================================================= */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center space-y-4 mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="font-serif text-3xl font-bold text-charcoal sm:text-4xl">
              Every Branch. Every Uniform.
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-charcoal/60">
              Your pet in the uniform of the branch that means the most to your
              family. All six branches available with authentic uniform details.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {BRANCHES.map((branch) => (
              <motion.button
                key={branch.name}
                onClick={() => setActiveBranch(branch.name)}
                className={`group relative rounded-xl p-5 text-center transition-all duration-300 ${
                  activeBranch === branch.name
                    ? "bg-charcoal text-white shadow-lg scale-105"
                    : "bg-cream/80 text-charcoal hover:bg-cream hover:shadow-md border border-border/40"
                }`}
                variants={scaleIn}
              >
                <div
                  className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
                    activeBranch === branch.name
                      ? "bg-gold/20 text-gold"
                      : "bg-royal/10 text-royal group-hover:bg-royal/15"
                  }`}
                >
                  {branch.icon}
                </div>
                <h3
                  className={`text-sm font-semibold ${
                    activeBranch === branch.name
                      ? "text-white"
                      : "text-charcoal"
                  }`}
                >
                  {branch.name}
                </h3>
                <p
                  className={`mt-1.5 text-[11px] leading-snug ${
                    activeBranch === branch.name
                      ? "text-white/60"
                      : "text-charcoal/50"
                  }`}
                >
                  {branch.description}
                </p>
                {activeBranch === branch.name && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gold rotate-45" />
                )}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* MILITARY STYLE SHOWCASE                                            */}
      {/* ================================================================= */}
      <section id="styles" className="bg-cream py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center space-y-4 mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="font-serif text-3xl font-bold text-charcoal sm:text-4xl">
              Choose Your Pet&apos;s Rank
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-charcoal/60">
              From decorated generals to fearless pilots. Every portrait is
              hand-crafted with authentic military detail.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {MILITARY_STYLES.map((style) => (
              <motion.div key={style.id} variants={scaleIn}>
                <Link
                  href={`/styles/${style.slug}`}
                  className="group relative block overflow-hidden rounded-xl bg-white shadow-sm border border-border/40 hover:shadow-lg hover:border-gold/30 transition-all duration-300"
                >
                  <div className="aspect-[3/4] relative overflow-hidden">
                    <Image
                      src={style.previewImage}
                      alt={`${style.name} military pet portrait style`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 25vw"
                    />
                    {style.popular && (
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-gold text-charcoal text-[10px] font-bold">
                          Popular
                        </Badge>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-white">
                        View Details <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-charcoal">
                      {style.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-[10px] ${
                              i < Math.round(style.rating)
                                ? "text-gold"
                                : "text-charcoal/20"
                            }`}
                          >
                            &#9733;
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] font-medium text-charcoal/50">
                        {style.rating} ({style.reviewCount.toLocaleString()})
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-10 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Link href="/styles">
              <Button
                variant="outline"
                className="border-royal/20 text-royal hover:bg-royal/5 gap-2"
              >
                Browse All 20+ Styles <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* HOW IT WORKS                                                       */}
      {/* ================================================================= */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center space-y-4 mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="font-serif text-3xl font-bold text-charcoal sm:text-4xl">
              Three Steps to a Masterpiece
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-charcoal/60">
              From photo to portrait in 24-48 hours
            </p>
          </motion.div>

          <motion.div
            className="grid gap-8 sm:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {[
              {
                icon: Upload,
                title: "Upload Your Photo",
                description:
                  "Send us a clear photo of your pet. Head shots work best. Any breed, any species.",
                step: 1,
              },
              {
                icon: Palette,
                title: "Pick Your Style & Branch",
                description:
                  "Choose a military portrait style and specify the branch. We'll handle the uniform details.",
                step: 2,
              },
              {
                icon: Package,
                title: "Receive Your Masterpiece",
                description:
                  "Get a digital proof in 24-48 hours. Canvas and framed prints ship within 5-7 days.",
                step: 3,
              },
            ].map((step, i, arr) => (
              <motion.div
                key={step.step}
                className="relative text-center group"
                variants={fadeInUp}
              >
                {/* Connector line */}
                {i < arr.length - 1 && (
                  <div className="hidden sm:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gold/30" />
                )}

                <div className="relative space-y-4">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-charcoal/5 border border-gold/20 group-hover:bg-gold/10 transition-colors">
                    <step.icon className="h-8 w-8 text-royal" />
                  </div>
                  <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-xs font-bold text-charcoal sm:left-1/2 sm:ml-6 sm:-top-1 sm:right-auto">
                    {step.step}
                  </span>
                  <h3 className="text-lg font-semibold text-charcoal">
                    {step.title}
                  </h3>
                  <p className="text-sm text-charcoal/60 leading-relaxed max-w-xs mx-auto">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.div
            className="mt-14 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Link href="/order/upload">
              <Button
                size="lg"
                className="bg-royal hover:bg-royal-dark text-white text-base px-8 py-6 gap-2"
              >
                Create Your Pet&apos;s Portrait
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* TESTIMONIALS                                                       */}
      {/* ================================================================= */}
      <section className="bg-cream py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center space-y-4 mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="font-serif text-3xl font-bold text-charcoal sm:text-4xl">
              Trusted by Military Families
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-charcoal/60">
              Real stories from veterans, active duty families, and proud
              military pet parents
            </p>
          </motion.div>

          <motion.div
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={staggerContainer}
          >
            {MILITARY_TESTIMONIALS.map((testimonial, i) => (
              <motion.div
                key={i}
                className="rounded-xl border border-border/40 bg-white p-6 space-y-4 hover:shadow-md transition-shadow"
                variants={fadeInUp}
              >
                <div className="flex items-start justify-between">
                  <Quote className="h-6 w-6 text-gold/40" />
                  <span className="rounded-full bg-charcoal/10 px-2.5 py-0.5 text-[11px] font-medium text-charcoal">
                    {testimonial.branch}
                  </span>
                </div>
                <p className="text-sm text-charcoal/70 leading-relaxed italic">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>
                <div className="flex items-center gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, j) => (
                    <Star
                      key={j}
                      className="h-4 w-4 fill-gold text-gold"
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3 border-t border-border/40 pt-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-semibold text-charcoal">
                        {testimonial.name}
                      </p>
                      <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-green-500" />
                    </div>
                    <p className="text-xs text-charcoal/50">
                      {testimonial.petName} the {testimonial.petType} &middot;{" "}
                      {testimonial.relationship}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* GIFT BANNER (Military-themed)                                      */}
      {/* ================================================================= */}
      <section className="bg-charcoal py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex flex-col items-center gap-8 text-center lg:flex-row lg:text-left lg:justify-between"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-4 py-1.5 text-sm font-medium text-gold">
                <Medal className="h-4 w-4" />
                #1 Gift for Military Families
              </div>
              <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
                The Gift That Honors Service{" "}
                <br className="hidden sm:inline" />
                and Celebrates Family
              </h2>
              <p className="text-lg text-white/60 max-w-xl">
                70% of our military portraits are purchased as gifts for
                veterans, retirees, and active duty families. Add gift wrapping
                and a personalized note to make it unforgettable.
              </p>
            </div>
            <Link href="/order/upload">
              <Button
                size="lg"
                className="bg-gold hover:bg-gold-light text-charcoal text-base font-semibold px-8 py-6 gap-2"
              >
                Send a Gift <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* PRICING                                                            */}
      {/* ================================================================= */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center space-y-4 mb-16"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="font-serif text-3xl font-bold text-charcoal sm:text-4xl">
              Simple, Honest Pricing
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-charcoal/60">
              Museum-quality portraits at prices that won&apos;t break the bank.
              Free shipping on all physical prints.
            </p>
          </motion.div>

          <motion.div
            className="grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
          >
            {PRICING_TIERS.map((tier) => (
              <motion.div
                key={tier.name}
                className={`relative rounded-2xl p-6 text-center transition-shadow ${
                  tier.popular
                    ? "bg-charcoal text-white shadow-xl ring-2 ring-gold scale-105"
                    : "bg-cream/50 border border-border/40 hover:shadow-md"
                }`}
                variants={scaleIn}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gold text-charcoal text-xs font-bold px-3">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="space-y-4">
                  <h3
                    className={`text-lg font-semibold ${
                      tier.popular ? "text-white" : "text-charcoal"
                    }`}
                  >
                    {tier.name}
                  </h3>

                  <div className="flex items-baseline justify-center gap-1">
                    <span
                      className={`text-4xl font-bold ${
                        tier.popular ? "text-gold" : "text-charcoal"
                      }`}
                    >
                      {tier.price}
                    </span>
                    {tier.originalPrice && (
                      <span
                        className={`text-lg line-through ${
                          tier.popular ? "text-white/40" : "text-charcoal/40"
                        }`}
                      >
                        {tier.originalPrice}
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-sm ${
                      tier.popular ? "text-white/60" : "text-charcoal/60"
                    }`}
                  >
                    {tier.description}
                  </p>

                  <ul className="space-y-2.5 text-left">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle
                          className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
                            tier.popular ? "text-gold" : "text-green-500"
                          }`}
                        />
                        <span
                          className={`text-sm ${
                            tier.popular ? "text-white/80" : "text-charcoal/70"
                          }`}
                        >
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/order/upload" className="block pt-2">
                    <Button
                      className={`w-full gap-2 ${
                        tier.popular
                          ? "bg-gold hover:bg-gold-light text-charcoal font-semibold"
                          : "bg-royal hover:bg-royal-dark text-white"
                      }`}
                    >
                      {tier.cta} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* FAQ                                                                */}
      {/* ================================================================= */}
      <section className="bg-cream py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center space-y-4 mb-14"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeInUp}
          >
            <h2 className="font-serif text-3xl font-bold text-charcoal sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-charcoal/60">
              Everything you need to know about military pet portraits
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeInUp}
          >
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="border-b border-border/40"
                >
                  <AccordionTrigger className="text-left text-base font-semibold text-charcoal hover:text-royal hover:no-underline py-5">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-charcoal/70 leading-relaxed pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* TRUST BADGES                                                       */}
      {/* ================================================================= */}
      <section className="bg-cream-dark py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
            {[
              {
                icon: Shield,
                title: "100% Satisfaction Guarantee",
                description: "Love it or get a full refund",
              },
              {
                icon: Truck,
                title: "Free Shipping",
                description: "On all canvas and framed prints",
              },
              {
                icon: RotateCcw,
                title: "Free Revisions",
                description: "One free revision included",
              },
              {
                icon: Medal,
                title: "Veteran Approved",
                description: "Trusted by military families",
              },
            ].map((badge) => (
              <div
                key={badge.title}
                className="flex items-center gap-3 text-center sm:text-left"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-royal/10">
                  <badge.icon className="h-5 w-5 text-royal" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal">
                    {badge.title}
                  </p>
                  <p className="text-xs text-charcoal/50">
                    {badge.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================= */}
      {/* FINAL CTA                                                          */}
      {/* ================================================================= */}
      <section className="bg-charcoal py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center space-y-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={staggerContainer}
          >
            <motion.h2
              className="font-serif text-3xl font-bold text-white sm:text-4xl lg:text-5xl"
              variants={fadeInUp}
            >
              Ready to Honor Your Pet&apos;s{" "}
              <span className="text-gold">Service?</span>
            </motion.h2>
            <motion.p
              className="mx-auto max-w-2xl text-lg text-white/60"
              variants={fadeInUp}
            >
              Upload a photo and create a stunning military portrait in minutes.
              Digital proofs delivered in 24-48 hours. 100% satisfaction
              guaranteed.
            </motion.p>
            <motion.div
              className="flex flex-col gap-3 sm:flex-row sm:justify-center"
              variants={fadeInUp}
            >
              <Link href="/order/upload">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gold hover:bg-gold-light text-charcoal text-base font-semibold px-10 py-6 gap-2"
                >
                  Create Your Pet&apos;s Portrait
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
            <motion.div
              className="flex flex-wrap justify-center gap-6 text-sm text-white/40"
              variants={fadeInUp}
            >
              <span>Starting at $29</span>
              <span className="text-white/20">|</span>
              <span>Free Shipping</span>
              <span className="text-white/20">|</span>
              <span>24-48 Hour Delivery</span>
              <span className="text-white/20">|</span>
              <span>Money-Back Guarantee</span>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
