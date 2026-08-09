# A1BRELLA

Editorial portfolio site for **A1BRELLA** — an AI-driven creative studio building intelligent products, autonomous agents, and generative brand systems.

Brutalist-minimal editorial design: huge overlapping display typography, a living code backdrop that endlessly writes and rewrites itself, procedural ASCII art, and a typographic glitch running through the headings and the wordmark.

## Stack

- [Next.js](https://nextjs.org) (App Router) + React + TypeScript
- Tailwind CSS
- Framer Motion

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # production build
npm start       # serve the production build
```

## Structure

```
src/
  app/
    layout.tsx        # fonts (Helvetica stack + IBM Plex Mono), metadata
    page.tsx          # section composition
    globals.css       # theme tokens, editorial utilities
    icon.svg          # favicon (the A1 cut of the wordmark)
  components/
    Navigation.tsx    # sticky black bar: wordmark + anchors
    Hero.tsx          # display type + live-code backdrop (see below)
    CategoryStrip.tsx # thin edge-to-edge label bands
    ProjectsGallery.tsx / ProjectCard.tsx  # thumbnails; drag carousel on mobile
    EditorialGrid.tsx # About section (dark) with the ASCII art
    AsciiArt.tsx      # procedural fluid ASCII field + single-line variant
    Logo.tsx / GlitchLogo.tsx / logo-data.ts  # wordmark, glitching variant
    Footer.tsx        # socials, giant glitching wordmark, legal row
    Reveal.tsx        # scroll-into-view reveal helper
  lib/
    data.ts           # all copy, hero compositions, projects, code pools
```

## The hero backdrop

Three columns of pseudo-code (agent orchestration / model training / infra logs) simulated in a single tick loop:

- **Cascade feed** — each column types a fresh line at the top, matrix-style (a head of random glyphs settles into the target text); the stack glides down and the oldest line falls off.
- **Ambient field** — every line independently breathes opacity and drifts a few pixels.
- **Spasms & twitches** — occasional hard position jolts with opacity flicker, plus single characters that morph, vanish, or appear.
- **Knockout overlay** — a few lines are duplicated in white above the heading, surfacing only where they cross the black letterforms.
- Desktop proportions are locked to a 1300px reference design (vw units); mobile gets its own full-viewport composition.

Everything respects `prefers-reduced-motion`, hydration-safe (deterministic SSR frames), and animates via `transform`/`opacity` only (no layout shift).

## Deploy

Static output — any Node host or [Vercel](https://vercel.com):

```bash
npm run build
```
