"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Star, CheckCircle } from "lucide-react";
import { CUSTOMER_PHOTOS } from "@/data/customer-photos";

export function CustomerGallery() {
  return (
    <section className="bg-cream/40 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl space-y-4 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-royal/10 px-3 py-1 text-xs font-medium text-royal">
            <CheckCircle className="h-3.5 w-3.5" />
            Real orders, delivered
          </span>
          <h2 className="font-serif text-3xl font-bold text-charcoal sm:text-4xl">
            Real Pets. Real Portraits. Real Homes.
          </h2>
          <p className="text-lg text-charcoal/60">
            Actual portraits we created and delivered, photographed by their proud pet parents.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-5">
          {CUSTOMER_PHOTOS.map((photo, i) => (
            <motion.figure
              key={photo.image}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 5) * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="group relative overflow-hidden rounded-2xl border border-border/40 bg-white shadow-sm"
            >
              <div className="relative aspect-[9/16] w-full overflow-hidden">
                <Image
                  src={photo.image}
                  alt={`${photo.petType} beside their ${photo.styleName} portrait`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent p-4 pt-10">
                  <div className="mb-1 flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="h-3.5 w-3.5 fill-gold text-gold" />
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-white">
                    {photo.styleName}
                  </p>
                  <p className="text-xs text-white/70">{photo.petType}</p>
                </div>
              </div>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
