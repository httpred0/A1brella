import { LOGO_LETTERS, LOGO_VIEWBOX } from "./logo-data";

/* A1BRELLA wordmark. Original artwork supplied by the studio;
   fills use currentColor so the logo adapts to its context. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox={LOGO_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="A1BRELLA"
    >
      {LOGO_LETTERS.map((letter, i) => (
        <path key={i} d={letter.d} fill="currentColor" />
      ))}
    </svg>
  );
}
