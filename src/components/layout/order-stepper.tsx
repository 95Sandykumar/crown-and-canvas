"use client";

import { Check } from "lucide-react";
import { ORDER_STEPS } from "@/lib/constants";
import type { OrderStep } from "@/types";

interface OrderStepperProps {
  currentStep: OrderStep;
}

export function OrderStepper({ currentStep }: OrderStepperProps) {
  const currentIndex = ORDER_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full py-4">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          {ORDER_STEPS.map((step, index) => {
            const isComplete = index < currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div key={step.id} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      isComplete
                        ? "bg-royal text-white"
                        : isCurrent
                        ? "bg-gold text-charcoal"
                        : "bg-cream-dark text-charcoal/40"
                    }`}
                  >
                    {isComplete ? <Check className="h-4 w-4" /> : step.step}
                  </div>
                  <span
                    className={`text-[11px] font-medium whitespace-nowrap ${
                      isCurrent ? "text-charcoal" : "text-charcoal/40"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < ORDER_STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 mb-5 transition-colors ${
                      index < currentIndex ? "bg-royal" : "bg-cream-dark"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
