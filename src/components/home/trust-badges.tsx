import { Shield, Truck, RotateCcw, Lock } from "lucide-react";

const badges = [
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
    icon: Lock,
    title: "Secure Checkout",
    description: "SSL encrypted payments",
  },
];

export function TrustBadges() {
  return (
    <section className="bg-cream-dark py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {badges.map((badge) => (
            <div key={badge.title} className="flex items-center gap-3 text-center sm:text-left">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-royal/10">
                <badge.icon className="h-5 w-5 text-royal" />
              </div>
              <div>
                <p className="text-sm font-semibold text-charcoal">{badge.title}</p>
                <p className="text-xs text-charcoal/50">{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
