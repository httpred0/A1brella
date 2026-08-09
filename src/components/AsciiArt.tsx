"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/* Looping ASCII art: the studio's own words dissolving into
   computation. Layered sine waves sweep a character grid — each cell
   renders empty space, a letter of the source text, or dense glyph
   noise depending on the local wave intensity. Deterministic at t=0
   so SSR and hydration agree; the loop starts client-side. */

const COLS = 80;
const ROWS = 32;
const DENSE = "#@%&8WM0";

const SOURCE = (
  "A1BRELLA is an AI-driven creative studio building intelligent " +
  "products autonomous agents and generative brand systems We work " +
  "where design meets machine intelligence treating models data and " +
  "interaction as raw creative material "
).repeat(4);

/* cheap deterministic per-cell hash, stable across renders */
function hash(x: number, y: number) {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967295;
}

function field(x: number, y: number, t: number) {
  const v =
    Math.sin(x * 0.31 + t) * 0.5 +
    Math.sin(y * 0.23 - t * 0.7) * 0.35 +
    Math.sin((x + y) * 0.17 + t * 1.3) * 0.4 +
    Math.sin(Math.sqrt((x - COLS / 2) ** 2 + (y - ROWS / 2) ** 2) * 0.35 - t) *
      0.45;
  return v / 1.7 / 2 + 0.5; // normalize to ~0..1
}

/* Fluid abstract field: coordinates are domain-warped by slow waves
   (marble-like swirl), then three metaballs drift through the grid on
   lissajous orbits, merging and splitting. Intensity maps to an ASCII
   brightness ramp. `ASPECT` corrects for character cells being ~2.2x
   taller than wide so the blobs read as round, not squashed. */
const ASPECT = 2.2;

function fluid(x: number, y: number, t: number) {
  // domain warp — the swirl
  const wx =
    x +
    5.5 * Math.sin(y * 0.13 + t * 0.7) +
    3 * Math.sin((x + y) * 0.07 - t * 0.45);
  const wy = y + 4.5 * Math.cos(x * 0.11 - t * 0.55);

  // metaballs on lissajous orbits
  const orbits: Array<[number, number, number]> = [
    [Math.sin(t * 0.6) * 0.28, Math.cos(t * 0.43) * 0.3, 62],
    [Math.cos(t * 0.5 + 2) * 0.3, Math.sin(t * 0.71 + 1) * 0.26, 55],
    [Math.sin(t * 0.32 + 4) * 0.22, Math.cos(t * 0.9 + 3) * 0.33, 46],
  ];
  let blob = 0;
  for (const [ox, oy, mass] of orbits) {
    const dx = wx - (COLS / 2 + ox * COLS);
    const dy = (wy - (ROWS / 2 + oy * ROWS)) * ASPECT;
    blob += mass / (dx * dx + dy * dy + 14);
  }

  // gentle interference ripple over everything
  const wave = Math.sin(wx * 0.22 + t) * Math.sin(wy * 0.27 - t * 0.8);

  return blob * 0.55 + (wave + 1) * 0.28;
}

/* Hybrid rendering: the fluid field shapes the composition, but the
   matter inside the shapes is the studio's own text — empty space at
   low intensity, words at the body, dense glyphs at the hot core. */
function renderFrame(t: number): string[] {
  const rows: string[] = [];
  for (let y = 0; y < ROWS; y++) {
    let row = "";
    for (let x = 0; x < COLS; x++) {
      const v = fluid(x, y, t) + (hash(x, y) - 0.5) * 0.06; // dither
      if (v < 0.3) {
        row += " ";
      } else if (v < 0.6) {
        row += SOURCE[(y * COLS + x) % SOURCE.length];
      } else if (v < 0.78) {
        const ch = SOURCE[(y * COLS + x + 7) % SOURCE.length];
        row += ch === " " ? "." : ch;
      } else {
        row += DENSE[Math.floor(hash(x, y) * DENSE.length)];
      }
    }
    rows.push(row);
  }
  return rows;
}

/* Single-line variant of the same dissolve: one row of the studio's
   words surfacing and sinking in the wave field. */
export function AsciiLine({
  chars = 160,
  className = "",
}: {
  chars?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const render = (t: number) => {
    let row = "";
    for (let x = 0; x < chars; x++) {
      const v = field(x, 7, t);
      const h = hash(x, 7);
      if (v < 0.34) row += " ";
      else if (v < 0.66) row += SOURCE[x % SOURCE.length];
      else if (v < 0.82) row += SOURCE[(x + 7) % SOURCE.length] === " " ? "." : SOURCE[(x + 7) % SOURCE.length];
      else row += DENSE[Math.floor(h * DENSE.length)];
    }
    return row;
  };
  const [line, setLine] = useState(() => render(0));

  useEffect(() => {
    if (reduce) return;
    let t = 0;
    const id = setInterval(() => {
      t += 0.045;
      setLine(render(t));
    }, 90);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce, chars]);

  return (
    <div
      aria-hidden
      className={`select-none overflow-hidden whitespace-pre font-mono text-[9px] leading-none tracking-[0.08em] ${className}`}
    >
      {line}
    </div>
  );
}

export function AsciiArt() {
  const reduce = useReducedMotion();
  const [frame, setFrame] = useState<string[]>(() => renderFrame(0));

  useEffect(() => {
    if (reduce) return;
    let t = 0;
    const id = setInterval(() => {
      t += 0.035;
      setFrame(renderFrame(t));
    }, 66); // ~15fps with small steps: fluid, not stroboscopic
    return () => clearInterval(id);
  }, [reduce]);

  return (
    // mobile: the 80 columns span the full width inside the section's
    // lateral padding (vw font keeps the fit on any device)
    <div aria-hidden className="select-none overflow-hidden">
      <pre className="font-mono text-[1.9vw] leading-[1.35] tracking-[0.02em] text-background/65 sm:text-[10px] sm:tracking-[0.08em]">
        {frame.join("\n")}
      </pre>
    </div>
  );
}
