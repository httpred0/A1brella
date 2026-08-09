import { Logo } from "./Logo";

const navLinks = [
  { label: "PROJECTS", href: "#projects" },
  { label: "ABOUT", href: "#about" },
];

export function Navigation() {
  return (
    <header className="sticky top-0 z-50 bg-foreground text-background">
      <nav className="flex items-center justify-between px-3 py-2 font-mono text-[11px] tracking-[0.08em] sm:text-xs">
        <a href="#" aria-label="A1BRELLA Studio — home" className="shrink-0">
          <Logo className="h-3 w-auto text-background transition-opacity duration-300 hover:opacity-70 sm:h-3.5" />
        </a>

        <div className="flex gap-6 sm:gap-10">
          {navLinks.map(({ label, href }) => (
            <a key={label} href={href} className="link-line">
              {label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}
