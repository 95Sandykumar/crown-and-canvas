"use client";

import { useEffect, useRef, useState } from "react";
import { Users, Image as ImageIcon, Star, Palette } from "lucide-react";

interface StatItem {
  icon: React.ReactNode;
  value: number;
  suffix: string;
  label: string;
}

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1800;
          const startTime = performance.now();

          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };

          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

const STATS: StatItem[] = [
  {
    icon: <Users className="h-5 w-5" />,
    value: 10000,
    suffix: "+",
    label: "Happy Pet Parents",
  },
  {
    icon: <ImageIcon className="h-5 w-5" />,
    value: 50000,
    suffix: "+",
    label: "Portraits Created",
  },
  {
    icon: <Star className="h-5 w-5" />,
    value: 4.9,
    suffix: "/5",
    label: "Average Rating",
  },
  {
    icon: <Palette className="h-5 w-5" />,
    value: 20,
    suffix: "+",
    label: "Portrait Styles",
  },
];

export function SocialProofBar() {
  return (
    <section className="border-y border-gold/10 bg-cream-dark/60 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 sm:gap-8 lg:grid-cols-4">
          {STATS.map((stat, i) => (
            <div key={i} className="flex items-center gap-3 justify-center">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-royal/10 text-royal">
                {stat.icon}
              </div>
              <div>
                <p className="text-xl font-bold text-charcoal sm:text-2xl">
                  {stat.label === "Average Rating" ? (
                    // Don't animate the decimal rating — show it directly
                    <span className="tabular-nums">{stat.value}{stat.suffix}</span>
                  ) : (
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  )}
                </p>
                <p className="text-xs text-charcoal/50 sm:text-sm">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
