import { Hero } from "@/components/landing/Hero";
import { VisualizerPreview } from "@/components/landing/VisualizerPreview";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { Categories } from "@/components/landing/Categories";
import { FeaturedAlgorithms } from "@/components/landing/FeaturedAlgorithms";
import { CallToAction } from "@/components/landing/CallToAction";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <VisualizerPreview />
      <HowItWorks />
      <Categories />
      <FeaturedAlgorithms />
      <CallToAction />
    </div>
  );
}
