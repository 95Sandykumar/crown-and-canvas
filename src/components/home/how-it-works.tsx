import { Upload, Palette, Package } from "lucide-react";

const steps = [
  {
    icon: Upload,
    title: "Upload Your Photo",
    description: "Send us a clear photo of your pet. Head shots or close-ups work best.",
    step: 1,
  },
  {
    icon: Palette,
    title: "Choose Your Style",
    description: "Pick from 20+ royal portrait styles — Renaissance, Military, Royalty, and more.",
    step: 2,
  },
  {
    icon: Package,
    title: "Receive Your Masterpiece",
    description: "Get a digital proof in 24-48 hours. Canvas and framed prints ship within 5-7 days.",
    step: 3,
  },
];

export function HowItWorks() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="font-serif text-3xl font-bold text-charcoal sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-charcoal/60">
            Three simple steps to transform your pet into royalty
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.step} className="relative text-center group">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="hidden sm:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gold/30" />
              )}

              <div className="relative space-y-4">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-cream border border-gold/20 group-hover:bg-gold/10 transition-colors">
                  <step.icon className="h-8 w-8 text-royal" />
                </div>
                <span className="absolute -top-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-gold text-xs font-bold text-charcoal sm:left-1/2 sm:ml-6 sm:-top-1 sm:right-auto">
                  {step.step}
                </span>
                <h3 className="text-lg font-semibold text-charcoal">{step.title}</h3>
                <p className="text-sm text-charcoal/60 leading-relaxed max-w-xs mx-auto">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
