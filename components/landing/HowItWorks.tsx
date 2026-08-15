export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Select an algorithm",
      description:
        "Choose from graph search, heuristic pathfinding, local optimization, or adversarial game decision trees.",
    },
    {
      number: "02",
      title: "Step through execution",
      description:
        "Pause, step forward or backward, and inspect active nodes, priority queues, and line-by-line pseudocode.",
    },
    {
      number: "03",
      title: "Analyze metrics",
      description:
        "Track nodes visited, cost functions, memory bounds, and execution state in real time.",
    },
  ];

  return (
    <section id="how-it-works" className="py-16 bg-[#0D0F12] border-y border-[#292E36]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-xs font-semibold text-[#6C8CFF] mb-2">
            Learning Methodology
          </h2>
          <p className="text-3xl font-bold tracking-tight text-[#F1F3F5]">
            How ThinkViz works
          </p>
          <p className="mt-3 text-sm text-[#A7AFBB] leading-relaxed">
            Designed for intuition. Move beyond static diagrams and step through algorithms dynamically.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="p-6 rounded-xl bg-[#15181D] border border-[#292E36]"
            >
              <div className="text-xs font-mono text-[#6C8CFF] font-semibold mb-3">
                STEP {step.number}
              </div>
              <h3 className="text-lg font-semibold text-[#F1F3F5] mb-2">
                {step.title}
              </h3>
              <p className="text-xs text-[#A7AFBB] leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
