import { HeroAsymmetricBento } from "@/components/landing/HeroAsymmetricBento";
import { Categories } from "@/components/landing/Categories";
import { FeaturedAlgorithms } from "@/components/landing/FeaturedAlgorithms";
import { CallToAction } from "@/components/landing/CallToAction";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <HeroAsymmetricBento />
      <Categories />
      <FeaturedAlgorithms />
      <CallToAction />
    </div>
  );
}
