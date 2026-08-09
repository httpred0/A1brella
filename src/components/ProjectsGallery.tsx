import { galleryProjects } from "@/lib/data";
import { ProjectCard } from "./ProjectCard";
import { Reveal } from "./Reveal";

/* Horizontal row of small thumbnails with generous white space,
   each drifting at its own vertical offset like the reference. */
const offsets = ["mt-0", "mt-10", "mt-4", "mt-12", "mt-6", "mt-2"];

export function ProjectsGallery() {
  return (
    <section
      id="projects"
      className="scroll-mt-10 bg-background px-2 py-20 sm:px-3 md:py-28"
    >
      {/* mobile: draggable side carousel (native scroll + snap);
          md+: the editorial wrapped row */}
      {/* pb-8 absorbs the Reveal's 24px entry translate of offscreen
          cards, otherwise the track gains a stray vertical scroll */}
      <div className="scrollbar-hide flex snap-x items-start gap-x-6 overflow-x-auto overflow-y-hidden pb-8 md:flex-wrap md:justify-between md:gap-x-8 md:gap-y-14 md:overflow-visible md:pb-0">
        {galleryProjects.map((project, i) => (
          <Reveal
            key={project.title}
            delay={i * 0.08}
            className="shrink-0 snap-start"
          >
            <ProjectCard project={project} offsetClass={offsets[i % offsets.length]} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
