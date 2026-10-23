import Link from "next/link";
import { Metadata } from "next";
import {
  GitFork,
  TrendingUp,
  Grid,
  ArrowRight,
  Layers,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Machine Learning Tools | ThinkViz",
  description:
    "Interactive, mathematically grounded demonstrations of core machine learning algorithms and evaluation metrics.",
};

const ML_TOOLS = [
  {
    title: "K-Means Visualizer",
    subtitle: "Clustering & Vector Quantization",
    description:
      "Observe how data points are assigned to clusters and how centroids iteratively move to minimize within-cluster sum of squared errors.",
    href: "/machine-learning/k-means",
    icon: GitFork,
    color: "#6C8CFF",
    tags: ["Unsupervised", "Clustering", "Euclidean Distance", "WCSS"],
  },
  {
    title: "Regression Playground",
    subtitle: "Supervised Parametric Modeling",
    description:
      "Fit linear and polynomial regression models to data using exact least-squares and inspect predictions, residuals, and generalization errors.",
    href: "/machine-learning/regression",
    icon: TrendingUp,
    color: "#10B981",
    tags: ["Supervised", "Least Squares", "Polynomial Degree 1–5", "MSE / R²"],
  },
  {
    title: "Confusion Matrix Simulator",
    subtitle: "Classification Performance Evaluation",
    description:
      "Explore binary classification outcomes and see how accuracy, precision, recall, specificity, and F1-score are derived from real counts.",
    href: "/machine-learning/confusion-matrix",
    icon: Grid,
    color: "#F59E0B",
    tags: ["Evaluation", "Accuracy", "Precision", "Recall", "F1-Score"],
  },
];

export default function MachineLearningPage() {
  return (
    <div className="w-full min-h-[calc(100dvh-64px)] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 bg-[#090B0E] text-[#F8FAFC]">
      {/* Header Section */}
      <div className="p-6 sm:p-8 rounded-2xl bg-[#0E131D] border border-[#1E2638] space-y-3 relative overflow-hidden shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#6C8CFF]">
          <Sparkles className="w-4 h-4" />
          <span>Interactive Machine Learning Suite</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#F8FAFC]">
          Machine Learning Tools
        </h1>
        <p className="text-sm sm:text-base text-[#828E9E] max-w-3xl leading-relaxed">
          Interactive, mathematically grounded tools for understanding foundational machine learning algorithms, model fitting, and evaluation metrics through direct parameter manipulation and step-by-step visual execution.
        </p>
      </div>

      {/* 3 Concise Feature Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ML_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group p-6 rounded-2xl bg-[#0E131D] hover:bg-[#121824] border border-[#1E2638] hover:border-[#6C8CFF]/50 transition-all duration-200 flex flex-col justify-between space-y-6 shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:scale-[0.99]"
            >
              <div className="space-y-4">
                {/* Icon & Title Header */}
                <div className="flex items-center justify-between">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center border transition-all"
                    style={{
                      backgroundColor: `${tool.color}15`,
                      borderColor: `${tool.color}35`,
                      color: tool.color,
                    }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-mono text-[#828E9E] group-hover:text-[#F8FAFC] flex items-center gap-1 transition-colors">
                    Launch <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[#6C8CFF] block mb-1">
                    {tool.subtitle}
                  </span>
                  <h2 className="text-xl font-bold text-[#F8FAFC] tracking-tight group-hover:text-white transition-colors">
                    {tool.title}
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-[#828E9E] leading-relaxed">
                  {tool.description}
                </p>
              </div>

              {/* Tags Row */}
              <div className="flex flex-wrap items-center gap-1.5 pt-4 border-t border-[#1A2230]">
                {tool.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#090D14] border border-[#1A2230] text-[#94A3B8]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
