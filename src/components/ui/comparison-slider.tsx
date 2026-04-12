"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";

interface ComparisonSliderProps {
  beforeImage: string;
  afterImage: string;
  alt: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  className?: string;
  imageClassName?: string;
  showLabels?: boolean;
  characterTitle?: string;
}

export function ComparisonSlider({
  beforeImage,
  afterImage,
  alt,
  fill = true,
  priority = false,
  sizes,
  className = "",
  imageClassName = "object-cover",
  showLabels = true,
  characterTitle,
}: ComparisonSliderProps) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  // Replace {name} with a sample name for previews
  const displayTitle = characterTitle?.replace("{name}", "Biscuit");

  const clamp = (value: number, min: number, max: number) =>
    Math.min(max, Math.max(min, value));

  const updatePosition = useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const newPos = clamp(
      ((clientX - rect.left) / rect.width) * 100,
      0,
      100
    );
    setPosition(newPos);
  }, []);

  // Mouse handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      isDragging.current = true;
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current) return;
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Touch handlers
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      isDragging.current = true;
      updatePosition(e.touches[0].clientX);
    },
    [updatePosition]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      updatePosition(e.touches[0].clientX);
    },
    [updatePosition]
  );

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Also allow clicking/tapping anywhere on the container to update position
  const handleContainerMouseDown = useCallback(
    (e: React.MouseEvent) => {
      isDragging.current = true;
      updatePosition(e.clientX);
    },
    [updatePosition]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const showAfterNameplate = position > 50;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full select-none touch-none ${className}`}
      onMouseDown={handleContainerMouseDown}
      style={{ cursor: "ew-resize" }}
      role="slider"
      aria-valuenow={Math.round(position)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Before/after comparison slider for ${alt}`}
    >
      {/* After image — full width, bottom layer */}
      <Image
        src={afterImage}
        alt={`${alt} — AI portrait`}
        fill={fill}
        priority={priority}
        sizes={sizes}
        className={imageClassName}
        draggable={false}
      />

      {/* Before image — clipped on the left */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <div className="absolute inset-0" style={{ width: fill ? "100%" : undefined }}>
          <Image
            src={beforeImage}
            alt={`${alt} — original photo`}
            fill={fill}
            priority={priority}
            sizes={sizes}
            className={imageClassName}
            draggable={false}
          />
        </div>
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 z-10 flex items-center justify-center"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Vertical line */}
        <div className="absolute inset-0 w-[2px] mx-auto bg-white/90 shadow-[0_0_4px_rgba(0,0,0,0.4)]" />

        {/* Handle circle */}
        <div
          className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-[0_2px_8px_rgba(0,0,0,0.4)]"
          style={{ cursor: "ew-resize" }}
        >
          <svg
            width="18"
            height="12"
            viewBox="0 0 18 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M5 1L1 6L5 11M13 1L17 6L13 11"
              stroke="#374151"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Before / After labels */}
      {showLabels && (
        <>
          {position > 10 && (
            <div className="absolute top-3 left-3 z-20 pointer-events-none">
              <span className="inline-flex items-center rounded-full bg-charcoal/70 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                Before
              </span>
            </div>
          )}
          {position < 90 && (
            <div
              className="absolute top-3 z-20 pointer-events-none"
              style={{ left: `calc(${position}% + 12px)` }}
            >
              <span className="inline-flex items-center rounded-full bg-gold/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white">
                After
              </span>
            </div>
          )}
        </>
      )}

      {/* Gold nameplate overlay — shown when after is dominant */}
      {characterTitle && showAfterNameplate && (
        <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center pointer-events-none">
          <div className="mx-3 mb-3 w-full">
            <div className="relative overflow-hidden rounded-md bg-gradient-to-r from-amber-900/90 via-yellow-800/90 to-amber-900/90 backdrop-blur-sm border border-gold/40 px-3 py-1.5 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-b from-gold/15 to-transparent" />
              <p className="relative text-center font-serif text-[11px] sm:text-xs font-semibold tracking-wide text-gold-light leading-tight">
                {displayTitle}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
