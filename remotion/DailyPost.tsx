import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

// ---------------------------------------------------------------------------
// Crown & Canvas — fixed daily reel template.
//
// Everything visual here is LOCKED. Day to day, only these props change:
//   question, answer, hook, cta, category, image, audioSrc
// The render worker (scripts/post-instagram.mjs) feeds one queue item in as
// inputProps; the Studio uses `dailyPostDefaults` below for live preview.
// ---------------------------------------------------------------------------

export type DailyPostProps = {
  question: string;
  answer: string;
  hook: string;
  cta: string;
  category: string;
  /** Public path like "/portraits/renaissance-king/after.webp". */
  image: string;
  /** Public path to a baked-in track, e.g. "audio/hook.mp3". "" = silent. */
  audioSrc: string;
};

export const dailyPostDefaults: DailyPostProps = {
  question: "Why does my dog tilt its head when I talk?",
  answer:
    "It helps them pinpoint your voice and read your tone. A head tilt means they're locked in on you.",
  hook: "Ever wondered why?",
  cta: "Follow @crownandcanvas for daily pet answers",
  category: "Behavior",
  image: "/portraits/renaissance-king/after.webp",
  audioSrc: "audio/hook.mp3",
};

// Brand palette (kept in sync with src/app/globals.css).
const GOLD = "#D4AF37";
const GOLD_LIGHT = "#F0D060";
const PURPLE = "#4A1D96";
const INK = "#1A1A2E";
const CREAM = "#FFF8E7";

const SERIF = "Georgia, 'Times New Roman', 'Playfair Display', serif";
const SANS =
  "'Helvetica Neue', Arial, system-ui, -apple-system, sans-serif";

/** staticFile() wants a path with no leading slash. */
const asset = (p: string) => staticFile(p.replace(/^\//, ""));

export const DailyPost: React.FC<DailyPostProps> = ({
  question,
  answer,
  hook,
  cta,
  category,
  image,
  audioSrc,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Slow Ken Burns zoom on the background portrait.
  const bgScale = interpolate(frame, [0, durationInFrames], [1.08, 1.22], {
    extrapolateRight: "clamp",
  });

  // Header drops in.
  const headerY = spring({ frame, fps, config: { damping: 200 } });
  const headerTranslate = interpolate(headerY, [0, 1], [-80, 0]);

  // Hook fades in early, then eases back as the question takes over.
  const hookOpacity = interpolate(
    frame,
    [10, 25, 70, 85],
    [0, 1, 1, 0.45],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Question springs up.
  const qSpring = spring({ frame, fps, delay: 22, config: { damping: 200 } });
  const qTranslate = interpolate(qSpring, [0, 1], [60, 0]);

  // Answer card reveals later.
  const aSpring = spring({ frame, fps, delay: 90, config: { damping: 200 } });
  const aTranslate = interpolate(aSpring, [0, 1], [80, 0]);

  // CTA bar slides up and gently pulses.
  const ctaSpring = spring({ frame, fps, delay: 120, config: { damping: 200 } });
  const ctaTranslate = interpolate(ctaSpring, [0, 1], [140, 0]);
  const ctaPulse =
    1 + 0.025 * Math.sin((frame / fps) * Math.PI * 2 * 0.8);

  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      {audioSrc ? <Audio src={asset(audioSrc)} volume={0.7} /> : null}

      {/* Background portrait + readability overlays */}
      <AbsoluteFill>
        <Img
          src={asset(image)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transform: `scale(${bgScale})`,
            filter: "blur(2px)",
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(26,26,46,0.82) 0%, rgba(26,26,46,0.45) 38%, rgba(26,26,46,0.55) 62%, rgba(26,26,46,0.92) 100%)",
        }}
      />

      {/* Brand header */}
      <div
        style={{
          position: "absolute",
          top: 90,
          width: "100%",
          textAlign: "center",
          transform: `translateY(${headerTranslate}px)`,
          opacity: headerY,
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 54,
            letterSpacing: 6,
            color: GOLD,
            fontWeight: 700,
          }}
        >
          CROWN &amp; CANVAS
        </div>
        <div
          style={{
            fontFamily: SANS,
            fontSize: 30,
            letterSpacing: 3,
            color: CREAM,
            marginTop: 8,
            opacity: 0.85,
          }}
        >
          @crownandcanvas
        </div>
      </div>

      {/* Category chip */}
      <Sequence from={12}>
        <div
          style={{
            position: "absolute",
            top: 320,
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontFamily: SANS,
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: INK,
              backgroundColor: GOLD,
              padding: "14px 34px",
              borderRadius: 999,
            }}
          >
            {category}
          </div>
        </div>
      </Sequence>

      {/* Hook */}
      <div
        style={{
          position: "absolute",
          top: 440,
          width: "100%",
          textAlign: "center",
          opacity: hookOpacity,
        }}
      >
        <span
          style={{
            fontFamily: SANS,
            fontSize: 40,
            fontStyle: "italic",
            color: GOLD_LIGHT,
          }}
        >
          {hook}
        </span>
      </div>

      {/* Question */}
      <div
        style={{
          position: "absolute",
          top: 560,
          left: 80,
          right: 80,
          textAlign: "center",
          transform: `translateY(${qTranslate}px)`,
          opacity: qSpring,
        }}
      >
        <div
          style={{
            fontFamily: SERIF,
            fontSize: 82,
            lineHeight: 1.12,
            fontWeight: 700,
            color: CREAM,
            textShadow: "0 4px 24px rgba(0,0,0,0.6)",
          }}
        >
          {question}
        </div>
      </div>

      {/* Answer card */}
      <div
        style={{
          position: "absolute",
          top: 1040,
          left: 80,
          right: 80,
          transform: `translateY(${aTranslate}px)`,
          opacity: aSpring,
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(255,248,231,0.96)",
            borderRadius: 36,
            border: `4px solid ${GOLD}`,
            padding: "52px 56px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
          }}
        >
          <div
            style={{
              fontFamily: SANS,
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: PURPLE,
              marginBottom: 18,
            }}
          >
            The answer
          </div>
          <div
            style={{
              fontFamily: SANS,
              fontSize: 52,
              lineHeight: 1.32,
              color: INK,
              fontWeight: 500,
            }}
          >
            {answer}
          </div>
        </div>
      </div>

      {/* CTA bar */}
      <div
        style={{
          position: "absolute",
          bottom: 120,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          transform: `translateY(${ctaTranslate}px) scale(${ctaPulse})`,
        }}
      >
        <div
          style={{
            fontFamily: SANS,
            fontSize: 44,
            fontWeight: 800,
            color: INK,
            background: `linear-gradient(90deg, ${GOLD} 0%, ${GOLD_LIGHT} 100%)`,
            padding: "30px 56px",
            borderRadius: 999,
            boxShadow: "0 14px 40px rgba(0,0,0,0.5)",
            textAlign: "center",
          }}
        >
          {cta}
        </div>
      </div>
    </AbsoluteFill>
  );
};
