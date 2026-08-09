"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { heroWords, heroWordsMobile, codeStreams } from "@/lib/data";

const COLUMNS = 3;
const LINES_PER_COLUMN = 44;
const EDGE_LINES = 8; // lines at top/bottom that fade towards invisible
const GLYPHS = "abcdefghikmnopqrstuvwxyz0123456789#%&*+-=<>/\\|_$@!?";
const DECODE_HEAD = 6; // trailing chars still "resolving", matrix-style

/* A few lines per column are duplicated in white ABOVE the heading:
   invisible on the white page, they surface only where they cross the
   big black letters. */
const OVERLAY_LINES: number[][] = [
  [6, 18, 33],
  [10, 24, 38],
  [3, 27, 40],
];

function randomGlyphs(n: number) {
  let out = "";
  for (let i = 0; i < n; i++) {
    out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
  }
  return out;
}

const KEYWORDS = new Set([
  "const", "await", "def", "for", "if", "return", "yield", "export",
  "new", "assert", "from", "of", "class", "import", "default", "then",
]);

/* Grayscale "syntax highlighting": keywords darker, strings/comments
   lighter. `plain` renders solid white for the knockout overlay. */
function CodeLine({ text, plain = false }: { text: string; plain?: boolean }) {
  // fixed line height: an emptied line must keep its slot, otherwise
  // every line below it shifts up (layout shift)
  if (plain) {
    return <div className="h-[1.55em] overflow-hidden whitespace-pre">{text}</div>;
  }
  const isComment = /^\s*(\/\/|#)/.test(text);
  return (
    <div
      className={`h-[1.55em] overflow-hidden whitespace-pre ${isComment ? "opacity-30" : ""}`}
    >
      {text.split(/(\s+)/).map((token, i) => {
        let cls = "opacity-60";
        if (KEYWORDS.has(token)) cls = "opacity-90 text-foreground";
        else if (/["']/.test(token)) cls = "opacity-40";
        else if (/\d/.test(token)) cls = "opacity-75";
        return (
          <span key={i} className={cls}>
            {token}
          </span>
        );
      })}
    </div>
  );
}

type Writer = {
  target: string;
  progress: number;
  typing: boolean;
  wait: number;
};

type Twitch = {
  line: number;
  pos: number;
  glyph: string;
  ttl: number;
  mode: "morph" | "hide";
};

/* Per-line ambient state: a slow independent drift of opacity and a
   few-pixel positional shift, retargeted at random moments. */
type LineFx = { o: number; x: number; y: number };

/* A brief line spasm: hard position jolts + opacity flicker, no easing. */
type Spasm = { ttl: number; dx: number; dy: number; op: number };

/* Runs the matrix-style rewrite simulation for every column in one
   place so the gray base layer and the white knockout overlay always
   show identical text. */
function useCodeSimulation(pools: string[][]) {
  const reduce = useReducedMotion();
  const initial = useRef<string[][]>(
    pools.map((pool) =>
      Array.from({ length: LINES_PER_COLUMN }, (_, i) => pool[i % pool.length]),
    ),
  );
  const [columns, setColumns] = useState<string[][]>(initial.current);
  // one writer per column: types a fresh line at the top of the feed
  const writers = useRef<Writer[]>(
    pools.map((_, c) => ({
      target: "",
      progress: 0,
      typing: false,
      wait: 12 + c * 24,
    })),
  );
  // cascade shift: after a new line is inserted, the stack slides down
  const shifts = useRef<{ y: number; animate: boolean }[]>(
    pools.map(() => ({ y: 0, animate: false })),
  );
  const twitches = useRef<Twitch[][]>(pools.map(() => []));
  // line spasms: lineIdx -> current jolt, regenerated every tick
  const spasms = useRef<Map<number, Spasm>[]>(pools.map(() => new Map()));
  const lineFx = useRef<LineFx[][]>(
    pools.map(() =>
      Array.from({ length: LINES_PER_COLUMN }, () => ({ o: 0.85, x: 0, y: 0 })),
    ),
  );

  // authoritative feed state lives in a ref: the whole tick runs OUTSIDE
  // the setState updater, which must stay pure (StrictMode calls updaters
  // twice — mutating refs inside one corrupts the simulation)
  const feed = useRef<string[][]>(initial.current.map((arr) => [...arr]));

  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => {
      // ambient field: independently retarget each line's opacity/offset
      for (const fx of lineFx.current) {
        for (const f of fx) {
          if (Math.random() < 0.012) {
            f.o = 0.5 + Math.random() * 0.35; // breathe between 50% and 85%
            f.x = (Math.random() - 0.5) * 6; // shift a few pixels
            f.y = (Math.random() - 0.5) * 4;
          }
        }
      }

      const rendered = feed.current.map((lines, c) => {
        const pool = pools[c];

        // line spasms: age out, re-jolt survivors, occasionally start one
        const sp = spasms.current[c];
        for (const [idx, s] of sp) {
          if (--s.ttl <= 0) {
            sp.delete(idx);
          } else {
            s.dx = (Math.random() - 0.5) * 5; // hard jolt, no easing
            s.dy = (Math.random() - 0.5) * 3;
            s.op = Math.random() < 0.4 ? 0.2 : 0.95; // rapid flicker
          }
        }
        if (Math.random() < 0.055 && sp.size < 3) {
          sp.set(Math.floor(Math.random() * LINES_PER_COLUMN), {
            ttl: 4 + Math.floor(Math.random() * 7),
            dx: 0,
            dy: 0,
            op: 0.95,
          });
        }

        // character events: morph, disappear, appear — spawn, age, expire
        const tw = twitches.current[c];
        for (let i = tw.length - 1; i >= 0; i--) {
          if (--tw[i].ttl <= 0) tw.splice(i, 1);
          else if (tw[i].mode === "morph" && Math.random() < 0.5) {
            tw[i].glyph = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          }
        }
        if (Math.random() < 0.3) {
          const hide = Math.random() < 0.35;
          tw.push({
            line: Math.floor(Math.random() * LINES_PER_COLUMN),
            pos: Math.floor(Math.random() * 34),
            glyph: hide
              ? " "
              : GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
            ttl: 4 + Math.floor(Math.random() * 8),
            mode: hide ? "hide" : "morph",
          });
        }

        // cascade writer: new lines are born at the top of the feed,
        // the stack slides down, the oldest line falls off the bottom
        const w = writers.current[c];
        const sh = shifts.current[c];
        if (sh.y !== 0 && !sh.animate) {
          // phase B of the insert: release the compensating offset so
          // the whole column glides down by one line
          sh.animate = true;
          sh.y = 0;
        }
        if (w.typing) {
          // matrix decode: raw glyph head settles into the target
          w.progress += 2 + Math.floor(Math.random() * 3);
          const settled = Math.max(0, w.progress - DECODE_HEAD);
          const headLen =
            Math.min(w.progress, w.target.length) -
            Math.min(settled, w.target.length);
          lines[0] =
            w.target.slice(0, settled) + randomGlyphs(Math.max(0, headLen));
          if (settled >= w.target.length) {
            lines[0] = w.target;
            w.typing = false;
            w.wait = 10 + Math.floor(Math.random() * 35);
          }
        } else if (--w.wait <= 0) {
          // phase A of the insert: push an empty line on top, drop the
          // last one, and offset the stack up so nothing visually moves
          lines.unshift("");
          lines.pop();
          sh.y = -1.55;
          sh.animate = false;
          w.target = pool[Math.floor(Math.random() * pool.length)];
          w.progress = 0;
          w.typing = true;
        }

        // apply live glitches on top of the text (render copy only)
        return lines.map((line, i) => {
          let out = line;
          for (const t of tw) {
            if (t.line === i && t.pos < out.length) {
              out = out.slice(0, t.pos) + t.glyph + out.slice(t.pos + 1);
            }
          }
          return out;
        });
      });

      setColumns(rendered); // pure: precomputed value, no updater mutation
    }, 64);
    return () => clearInterval(id);
  }, [pools, reduce]);

  return {
    columns,
    fx: lineFx.current,
    shifts: shifts.current,
    writers: writers.current,
    spasms: spasms.current,
  };
}

/* Top/bottom edge fade: the first and last EDGE_LINES of a column ramp
   from nearly invisible up to full presence. */
function edgeFactor(i: number): number {
  const fromTop = (i + 1) / EDGE_LINES;
  const fromBottom = (LINES_PER_COLUMN - i) / EDGE_LINES;
  const t = Math.min(1, fromTop, fromBottom);
  return Math.pow(t, 1.6); // ease: stays near-invisible at the very edge
}

/* Inline style for one ambient line: smooth transitions carry each
   retarget so the drift feels alive, not stroboscopic. A spasm takes
   over with hard jolts and flicker — transitions off so it vibrates. */
function fxStyle(f: LineFx, edge: number, spasm?: Spasm): CSSProperties {
  if (spasm) {
    return {
      opacity: spasm.op * edge,
      transform: `translate(${f.x + spasm.dx}px, ${f.y + spasm.dy}px)`,
      transition: "none",
    };
  }
  return {
    opacity: f.o * edge,
    transform: `translate(${f.x}px, ${f.y}px)`,
    transition: "opacity 0.9s ease, transform 1.1s ease",
  };
}

/* Occasional typographic glitch on the display words: a couple of
   letters briefly flicker into another typeface (mono / serif italic)
   or shear out of place, then settle back. */
const GLITCH_VARIANTS: CSSProperties[] = [
  { fontFamily: "var(--font-plex-mono), monospace", fontWeight: 500 },
  { fontFamily: "Georgia, 'Times New Roman', serif", fontStyle: "italic" },
  { transform: "translateY(0.05em) skewX(-10deg)", opacity: 0.85 },
  { fontFamily: "var(--font-plex-mono), monospace", transform: "translateY(-0.04em)" },
];

function GlitchWord({ text }: { text: string }) {
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
          // pick 1-2 distinct letters (skip spaces)
          const candidates = [...text]
            .map((ch, i) => (ch === " " ? -1 : i))
            .filter((i) => i >= 0);
          const count = 1 + Math.floor(Math.random() * 2);
          const indices: number[] = [];
          while (indices.length < count && candidates.length) {
            const pick = candidates.splice(
              Math.floor(Math.random() * candidates.length),
              1,
            )[0];
            indices.push(pick);
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
              new Map(
                indices.map((i) => [
                  i,
                  Math.floor(Math.random() * GLITCH_VARIANTS.length),
                ]),
              ),
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
  }, [text, reduce]);

  return (
    <>
      {[...text].map((ch, i) =>
        glitched.has(i) ? (
          // the original glyph keeps holding its exact space (invisible),
          // the glitched one paints on top — layout never moves
          <span key={i} className="relative inline-block whitespace-pre">
            <span className="invisible">{ch}</span>
            <span
              aria-hidden
              className="absolute left-0 top-0"
              style={GLITCH_VARIANTS[glitched.get(i)!]}
            >
              {ch}
            </span>
          </span>
        ) : (
          <span key={i} className="inline-block whitespace-pre">
            {ch}
          </span>
        ),
      )}
    </>
  );
}

/* The layer's vertical center matches the heading block's center
   (bottom offset compensates the section's asymmetric padding), and
   each column centers its lines — so heading and code stay locked
   together on any viewport height. */
/* Desktop proportions are locked to the 1300px reference design:
   font (10px), gap (32px) and stagger (56px) are expressed in vw
   (x/1300*100), so the composition scales as one piece. Section
   padding is symmetric, so the layer needs no bottom compensation. */
const CODE_GRID =
  "absolute inset-0 grid grid-cols-2 gap-x-8 overflow-hidden md:grid-cols-3 md:gap-x-[2.46vw]";
const CODE_TEXT =
  "flex h-full flex-col justify-center font-mono text-[11px] leading-[1.55] tracking-tight sm:text-[10px] md:text-[0.7692vw]";

/* Deliberate diagonal stagger (vw, = 56px at 1300): first column sits
   highest, middle centered, last column lowest. */
const COLUMN_OFFSET = [-4.31, 0, 4.31];

/* Cascade slide wrapper: right after an insert the stack is offset up
   by one line (no transition), then released to glide down smoothly. */
function cascadeStyle(sh: { y: number; animate: boolean }): CSSProperties {
  return {
    transform: `translateY(${sh.y}em)`,
    transition: sh.animate
      ? "transform 0.48s cubic-bezier(0.22, 1, 0.36, 1)"
      : "none",
  };
}

function CodeLayer() {
  const { columns, fx, shifts, writers, spasms } = useCodeSimulation(
    codeStreams.slice(0, COLUMNS),
  );

  return (
    <>
      {/* gray base layer, behind the heading */}
      <div className={`${CODE_GRID} z-0`}>
        {columns.map((lines, c) => (
          <motion.div
            key={c}
            className={`h-full text-muted ${c === 2 ? "hidden md:block" : ""}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.6 + c * 0.15 }}
          >
            <div
              className={CODE_TEXT}
              style={{ transform: `translateY(${COLUMN_OFFSET[c]}vw)` }}
            >
              <div style={cascadeStyle(shifts[c])}>
                {lines.map((line, i) => {
                  const style = fxStyle(fx[c][i], edgeFactor(i), spasms[c].get(i));
                  // the freshly-writing line glows above the edge fade
                  if (i === 0 && writers[c].typing) {
                    style.opacity = Math.max(Number(style.opacity) || 0, 0.6);
                  }
                  return (
                    <div key={i} style={style}>
                      <CodeLine text={line} />
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* white knockout overlay: a few identical lines above the heading,
          visible only where they cross the black letterforms; mirrors the
          base layer's ambient drift and cascade so both stay glued */}
      <div aria-hidden className={`${CODE_GRID} pointer-events-none z-20`}>
        {columns.map((lines, c) => (
          <motion.div
            key={c}
            className={`h-full text-background ${c === 2 ? "hidden md:block" : ""}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.4, delay: 0.6 + c * 0.15 }}
          >
            <div
              className={CODE_TEXT}
              style={{ transform: `translateY(${COLUMN_OFFSET[c]}vw)` }}
            >
              <div style={cascadeStyle(shifts[c])}>
                {lines.map((line, i) => (
                  <div
                    key={i}
                    style={{
                      ...fxStyle(fx[c][i], edgeFactor(i), spasms[c].get(i)),
                      visibility: OVERLAY_LINES[c].includes(i)
                        ? "visible"
                        : "hidden",
                    }}
                  >
                    <CodeLine text={line} plain />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative isolate overflow-hidden bg-background px-2 sm:px-3">
      {/* mobile: full-viewport stage with the composition centered;
          desktop: equal air above and below */}
      <div className="relative flex min-h-[calc(100svh-33px)] flex-col justify-center py-14 md:block md:min-h-0 md:py-20">
        <CodeLayer />

        {/* Overlapping editorial typography — one readable line per word */}
        <h1 className="sr-only">
          A1BRELLA — AI studio building products for humans and machines
        </h1>
        {/* mobile composition: bigger type, "Humans &" / "Machines" */}
        <div aria-hidden className="relative z-10 md:hidden">
          {heroWordsMobile.map((word, i) => (
            <motion.div
              key={word.text}
              className="display whitespace-nowrap text-[20vw] text-foreground"
              style={{ marginLeft: word.left, lineHeight: 1.35 }}
              initial={{ opacity: 0, y: reduce ? 0 : 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 1.1,
                delay: 0.15 + i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <GlitchWord text={word.text} />
            </motion.div>
          ))}
        </div>

        {/* desktop composition: tight interlocking zigzag */}
        <div aria-hidden className="relative z-10 hidden md:block">
          {heroWords.map((word, i) => (
            <motion.div
              key={word.text}
              className="display whitespace-nowrap text-[11vw] text-foreground"
              style={{
                marginLeft: word.left,
                lineHeight: 0.66,
                marginTop: word.gapTop,
              }}
              initial={{ opacity: 0, y: reduce ? 0 : 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 1.1,
                delay: 0.15 + i * 0.12,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <GlitchWord text={word.text} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
