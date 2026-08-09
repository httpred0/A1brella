"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useReducedMotion } from "framer-motion";
import { LOGO_LETTERS, LOGO_VIEWBOX } from "./logo-data";

/* Wordmark with the same typographic glitch as the hero heading:
   letters occasionally flicker into another typeface. The swap happens
   INSIDE the fixed SVG viewBox — the original path is hidden and a
   <text> glyph paints in its place — so the layout cannot shift. */

const BASELINE = 18.2; // letters sit on this baseline in viewBox units
const FONT_SIZE = 22; // cap height ≈ the wordmark's letter height

const VARIANTS: CSSProperties[] = [
  { fontFamily: "var(--font-plex-mono), monospace", fontWeight: 500 },
  { fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" },
  { fontFamily: "var(--font-plex-mono), monospace", fontWeight: 400 },
];

export function GlitchLogo({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [glitched, setGlitched] = useState<ReadonlyMap<number, number>>(new Map());

  useEffect(() => {
    if (reduce) return;
    let alive = true;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const scheduleBurst = () => {
      timers.push(
        setTimeout(() => {
          if (!alive) return;
          const candidates = LOGO_LETTERS.map((_, i) => i);
          const count = 1 + Math.floor(Math.random() * 2);
          const indices: number[] = [];
          while (indices.length < count && candidates.length) {
            indices.push(
              candidates.splice(Math.floor(Math.random() * candidates.length), 1)[0],
            );
          }
          let flicks = 3 + Math.floor(Math.random() * 3);
          const flick = () => {
            if (!alive) return;
            if (flicks-- <= 0) {
              setGlitched(new Map());
              scheduleBurst();
              return;
            }
            setGlitched(
              new Map(indices.map((i) => [i, Math.floor(Math.random() * VARIANTS.length)])),
            );
            timers.push(setTimeout(flick, 55 + Math.random() * 70));
          };
          flick();
        }, 2500 + Math.random() * 6000),
      );
    };
    scheduleBurst();

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
    };
  }, [reduce]);

  return (
    <svg
      viewBox={LOGO_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="A1BRELLA"
    >
      {LOGO_LETTERS.map((letter, i) => {
        const variant = glitched.get(i);
        return variant === undefined ? (
          <path key={i} d={letter.d} fill="currentColor" />
        ) : (
          <text
            key={i}
            x={letter.cx}
            y={BASELINE}
            textAnchor="middle"
            fontSize={FONT_SIZE}
            fill="currentColor"
            style={VARIANTS[variant]}
          >
            {letter.ch}
          </text>
        );
      })}
    </svg>
  );
}
