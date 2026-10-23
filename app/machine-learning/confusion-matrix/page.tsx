import { Metadata } from "next";
import { ConfusionMatrixSimulator } from "@/components/ml/ConfusionMatrixSimulator";

export const metadata: Metadata = {
  title: "Confusion Matrix Simulator | ThinkViz Machine Learning",
  description:
    "Interactive Binary Classification Confusion Matrix Simulator. Compute accuracy, precision, recall, specificity, and F1-score with zero-denominator safety.",
};

export default function ConfusionMatrixPage() {
  return (
    <div className="w-full min-h-[calc(100dvh-64px)] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#090B0E] text-[#F8FAFC]">
      <ConfusionMatrixSimulator />
    </div>
  );
}
