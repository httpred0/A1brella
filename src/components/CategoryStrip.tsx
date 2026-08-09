import { categories } from "@/lib/data";

/* Thin divider band with tiny editorial labels spread edge-to-edge.
   Purely typographic — the labels are not links. Defaults to the main
   category phrase; pass `items` for variants and `dark` to sit on the
   dark sections. */
export function CategoryStrip({
  items = categories,
  dark = false,
}: {
  items?: string[];
  dark?: boolean;
}) {
  return (
    <div
      className={
        dark
          ? "border-y border-background/20 bg-foreground px-2 py-2 sm:px-3"
          : "border-y border-foreground/15 bg-background px-2 py-2 sm:px-3"
      }
    >
      <ul
        className={`flex flex-wrap justify-between gap-x-6 gap-y-1 font-mono text-[9px] tracking-[0.14em] sm:text-[10px] ${
          dark ? "text-background/70" : "text-foreground/70"
        }`}
      >
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
