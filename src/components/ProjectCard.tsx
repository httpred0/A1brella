import Image from "next/image";
import { Project } from "@/lib/data";

/* Small editorial thumbnail: image, category, title. Hover = zoom + underline. */
export function ProjectCard({
  project,
  offsetClass = "",
  widthClass = "w-[36vw] sm:w-28 md:w-32",
}: {
  project: Project;
  offsetClass?: string;
  widthClass?: string;
}) {
  const external = !!project.href;
  return (
    <a
      href={project.href ?? "#"}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={`group block shrink-0 ${widthClass} ${offsetClass}`}
    >
      <div className={`relative ${project.ratio} w-full overflow-hidden bg-neutral-200`}>
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="160px"
          className="object-cover grayscale transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06]"
        />
        <div className="absolute inset-0 bg-foreground/0 transition-colors duration-500 group-hover:bg-foreground/5" />
      </div>
      <div className="mt-2 font-mono text-[9px] leading-[1.5] tracking-[0.1em]">
        <span className="block text-muted">{project.category}</span>
        <span className="link-line text-foreground transition-opacity duration-500 md:opacity-0 md:group-hover:opacity-100">
          {project.title}
        </span>
      </div>
    </a>
  );
}
