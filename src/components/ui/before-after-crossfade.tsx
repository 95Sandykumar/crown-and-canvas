"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeAfterCrossfadeProps {
  beforeImage: string;
  afterImage: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
  imageClassName?: string;
  interval?: number;
  showLabels?: boolean;
  staggerOffset?: number;
  characterTitle?: string;
}

export function BeforeAfterCrossfade({
  beforeImage,
  afterImage,
  alt,
  fill = true,
  priority = false,
  sizes,
  className = "",
  imageClassName = "object-cover",
  interval = 2000,
  showLabels = true,
  staggerOffset = 0,
  characterTitle,
}: BeforeAfterCrossfadeProps) {
  const [showAfter, setShowAfter] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const delay = setTimeout(() => {
      setStarted(true);
    }, staggerOffset);
    return () => clearTimeout(delay);
  }, [staggerOffset]);

  useEffect(() => {
    if (!started) return;
    const timer = setInterval(() => {
      setShowAfter((prev) => !prev);
    }, interval);
    return () => clearInterval(timer);
  }, [started, interval]);

  // For preview, replace {name} with a sample name
  const displayTitle = characterTitle?.replace("{name}", "Biscuit");

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* BEFORE layer */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: showAfter ? 0 : 1 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <Image
          src={beforeImage}
          alt={`${alt} - original photo`}
          fill={fill}
          priority={priority}
          sizes={sizes}
          className={imageClassName}
        />
      </motion.div>

      {/* AFTER layer */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: showAfter ? 1 : 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
      >
        <Image
          src={afterImage}
          alt={`${alt} - AI portrait`}
          fill={fill}
          priority={priority}
          sizes={sizes}
          className={imageClassName}
        />
      </motion.div>

      {/* Floating label */}
      {showLabels && (
        <motion.div
          className="absolute top-3 left-3 z-10"
          animate={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: -4 }}
          key={showAfter ? "after" : "before"}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <span className="inline-flex items-center rounded-full bg-charcoal/70 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
            {showAfter ? "After" : "Before"}
          </span>
        </motion.div>
      )}

      {/* Gold nameplate overlay — only on AFTER */}
      {characterTitle && (
        <AnimatePresence>
          {showAfter && (
            <motion.div
              className="absolute bottom-0 left-0 right-0 z-10 flex justify-center pointer-events-none"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
            >
              <div className="mx-3 mb-3 w-full">
                <div className="relative overflow-hidden rounded-md bg-gradient-to-r from-amber-900/90 via-yellow-800/90 to-amber-900/90 backdrop-blur-sm border border-gold/40 px-3 py-1.5 shadow-lg">
                  {/* Subtle inner shine */}
                  <div className="absolute inset-0 bg-gradient-to-b from-gold/15 to-transparent" />
                  <p className="relative text-center font-serif text-[11px] sm:text-xs font-semibold tracking-wide text-gold-light leading-tight">
                    {displayTitle}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
