import { editorialProject } from "@/lib/data";
import { AsciiArt } from "./AsciiArt";
import { Reveal } from "./Reveal";

/* About: looping code-art piece on the left, studio text on the right. */
export function EditorialGrid() {
  const p = editorialProject;
  return (
    <section
      id="about"
      className="scroll-mt-10 bg-foreground px-2 py-16 text-background sm:px-3 md:py-24"
    >
      <div className="grid grid-cols-1 items-start gap-10 md:grid-cols-12">
        {/* borderless — the art bleeds straight into the dark section;
            art and text each take half the width */}
        <Reveal className="md:col-span-6">
          <AsciiArt />
        </Reveal>
        <Reveal delay={0.15} className="md:col-span-6">
          <h2 className="display text-4xl sm:text-5xl">{p.title}</h2>
          <p className="mt-6 max-w-lg font-mono text-[10px] leading-[1.7] text-background/80">
            {p.description}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
