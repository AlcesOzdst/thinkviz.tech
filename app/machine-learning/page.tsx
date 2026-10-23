import Link from "next/link";
import { Metadata } from "next";
import {
  GitFork,
  TrendingUp,
  Grid,
  ArrowRight,
  Sparkles,
  Layers,
  Activity,
  Cpu,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Machine Learning Suite | ThinkViz Architectural Platform",
  description:
    "Interactive, mathematically grounded suite of foundational machine learning algorithms, continuous regression modeling, and classification telemetry instruments.",
};

const ML_MODULES = [
  {
    moduleId: "MODULE 01",
    title: "K-Means Visualizer",
    category: "Unsupervised Spatial Clustering",
    description:
      "Observe deterministic Euclidean partitioning, iterative centroid migration via arithmetic mean updates, and real-time Within-Cluster Sum of Squares (WCSS) convergence.",
    href: "/machine-learning/k-means",
    icon: GitFork,
    accentColor: "sky",
    colorHex: "#38BDF8",
    telemetry: [
      { label: "Partitioning", value: "Euclidean Voronoi" },
      { label: "Optimization", value: "WCSS Minimization" },
      { label: "Seeding", value: "K-Means++ & PRNG" },
    ],
    tags: ["Clustering", "Centroids", "Elbow Method", "WCSS"],
  },
  {
    moduleId: "MODULE 02",
    title: "Regression Playground",
    category: "Supervised Parametric Modeling",
    description:
      "Fit linear and degree 1–5 polynomial curves through exact least-squares normal equations solved via Gaussian elimination with partial pivoting. Inspect residual stems and train/test splits.",
    href: "/machine-learning/regression",
    icon: TrendingUp,
    accentColor: "emerald",
    colorHex: "#10B981",
    telemetry: [
      { label: "Solver", value: "Gaussian Elimination" },
      { label: "Loss Function", value: "OLS / MSE" },
      { label: "Degrees", value: "Degree 1 through 5" },
    ],
    tags: ["Ordinary Least Squares", "Polynomial", "MSE & MAE", "R² Score"],
  },
  {
    moduleId: "MODULE 03",
    title: "Confusion Matrix Simulator",
    category: "Classification Performance Telemetry",
    description:
      "Tactile 2×2 classification matrix with continuous fluid sliders, real-time population distribution breakdown, interactive formula tracing, and zero-denominator safety guards.",
    href: "/machine-learning/confusion-matrix",
    icon: Grid,
    accentColor: "amber",
    colorHex: "#F59E0B",
    telemetry: [
      { label: "Architecture", value: "2x2 Binary Matrix" },
      { label: "Telemetry", value: "5 Harmonic Metrics" },
      { label: "Traceability", value: "Interactive Formulas" },
    ],
    tags: ["Precision", "Recall", "Specificity", "F1-Score"],
  },
];

export default function MachineLearningPage() {
  return (
    <div className="w-full min-h-[calc(100dvh-64px)] py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 bg-[#090B0E] text-[#F8FAFC]">
      
      {/* CoreNode AI Command Center Header Banner */}
      <div className="relative p-6 sm:p-10 rounded-3xl bg-[#0A0E17] border border-white/10 shadow-2xl overflow-hidden">
        {/* Subtle Crosshairs */}
        <div className="absolute top-3 left-4 text-xs font-mono text-white/20 select-none">+</div>
        <div className="absolute top-3 right-4 text-xs font-mono text-white/20 select-none">+</div>
        <div className="absolute bottom-3 left-4 text-xs font-mono text-white/20 select-none">+</div>
        <div className="absolute bottom-3 right-4 text-xs font-mono text-white/20 select-none">+</div>

        <div className="space-y-4 max-w-4xl relative z-10">
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs font-mono font-bold text-sky-400 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              THINKVIZ ML SUITE // ARCHITECTURAL TELEMETRY
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[#111722] border border-white/10 text-xs font-mono text-slate-400">
              3 ACTIVE INSTRUMENTS
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-mono">
            Machine Learning Instruments
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-3xl">
            Mathematically authentic, client-side interactive laboratories. Directly manipulate hyperparameters, fit continuous polynomial curves via Gaussian elimination, and trace error trade-offs in real time with zero server latency.
          </p>
        </div>
      </div>

      {/* 3 Modular CoreNode Architectural Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {ML_MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <Link
              key={mod.href}
              href={mod.href}
              className="group p-6 sm:p-7 rounded-3xl bg-[#0A0E17] hover:bg-[#111722] border border-white/10 hover:border-white/25 transition-all duration-300 flex flex-col justify-between space-y-6 shadow-2xl hover:-translate-y-1 relative overflow-hidden"
            >
              {/* Corner Crosshairs */}
              <div className="absolute top-2.5 right-3 text-[10px] font-mono text-white/15 select-none">+</div>

              <div className="space-y-5">
                {/* Module Index & Icon */}
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner"
                      style={{
                        backgroundColor: `${mod.colorHex}15`,
                        borderColor: `${mod.colorHex}35`,
                        color: mod.colorHex,
                      }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold tracking-widest text-slate-400 uppercase block">
                        {mod.moduleId}
                      </span>
                      <span className="text-xs font-mono text-slate-300">
                        {mod.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight group-hover:text-sky-300 transition-colors">
                    {mod.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {mod.description}
                  </p>
                </div>

                {/* Telemetry Architecture Specs */}
                <div className="p-3.5 rounded-2xl bg-[#070A0F] border border-white/5 space-y-2 font-mono text-xs">
                  {mod.telemetry.map((t) => (
                    <div key={t.label} className="flex items-center justify-between text-slate-400">
                      <span>{t.label}:</span>
                      <strong className="text-slate-200">{t.value}</strong>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Tags & Action CTA */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                <div className="flex flex-wrap items-center gap-1.5">
                  {mod.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#111722] border border-white/10 text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-mono font-bold text-sky-400 flex items-center gap-1.5 group-hover:text-sky-300 transition-colors">
                    LAUNCH {mod.moduleId} <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase">
                    INTERACTIVE STAGE
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
