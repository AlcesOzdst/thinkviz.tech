import { Metadata } from "next";
import { RegressionPlayground } from "@/components/ml/RegressionPlayground";

export const metadata: Metadata = {
  title: "Regression Playground | ThinkViz Machine Learning",
  description:
    "Interactive Linear and Polynomial Regression Playground. Fit models via exact least-squares, inspect residuals, train/test generalization splits, MSE, MAE, and R².",
};

export default function RegressionPage() {
  return (
    <div className="w-full min-h-[calc(100dvh-64px)] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-[#090B0E] text-[#F8FAFC]">
      <RegressionPlayground />
    </div>
  );
}
