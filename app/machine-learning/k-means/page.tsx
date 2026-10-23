import { Metadata } from "next";
import { KMeansVisualizer } from "@/components/ml/KMeansVisualizer";

export const metadata: Metadata = {
  title: "K-Means Visualizer | ThinkViz Machine Learning",
  description:
    "Interactive two-dimensional K-Means clustering demonstration. Observe centroid initialization, Euclidean point assignment, arithmetic mean updates, and WCSS convergence.",
};

export default function KMeansPage() {
  return (
    <div className="w-full min-h-[calc(100dvh-64px)] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#090B0E] text-[#F8FAFC]">
      <KMeansVisualizer />
    </div>
  );
}
