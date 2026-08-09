import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { CategoryStrip } from "@/components/CategoryStrip";
import { ProjectsGallery } from "@/components/ProjectsGallery";
import { EditorialGrid } from "@/components/EditorialGrid";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <CategoryStrip />
        <ProjectsGallery />
        <CategoryStrip items={["ON", "WHO", "WE", "ARE"]} dark />
        <EditorialGrid />
      </main>
      <Footer />
    </>
  );
}
