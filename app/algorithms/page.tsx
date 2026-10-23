"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ALGORITHMS, CATEGORIES } from "@/data/algorithms";
import {
  Search,
  Star,
  SlidersHorizontal,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Layers,
  Check,
} from "lucide-react";

function AlgorithmsExplorerContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read initial query params
  const paramCategory = searchParams.get("category");
  const paramFilter = searchParams.get("filter");
  const paramDifficulty = searchParams.get("difficulty");
  const paramSearch = searchParams.get("search") || searchParams.get("q") || "";

  // Resolve matching category (case-insensitive name or slug match)
  const resolvedCategory = useMemo(() => {
    if (!paramCategory || paramCategory.toLowerCase() === "all") return "All";
    const found = CATEGORIES.find(
      (c) =>
        c.name.toLowerCase() === paramCategory.toLowerCase() ||
        c.slug.toLowerCase() === paramCategory.toLowerCase()
    );
    return found ? found.name : "All";
  }, [paramCategory]);

  const [searchQuery, setSearchQuery] = useState(paramSearch);
  const [selectedCategory, setSelectedCategory] = useState<string>(resolvedCategory);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>(paramDifficulty || "All");
  const [onlyFeatured, setOnlyFeatured] = useState<boolean>(
    paramFilter === "featured" || searchParams.get("featured") === "true"
  );
  const [showHowItWorks, setShowHowItWorks] = useState<boolean>(
    searchParams.get("tab") === "how-it-works"
  );

  // Synchronize state when URL search params change externally
  useEffect(() => {
    setSelectedCategory(resolvedCategory);
    setOnlyFeatured(paramFilter === "featured" || searchParams.get("featured") === "true");
    if (paramDifficulty) setSelectedDifficulty(paramDifficulty);
    if (searchParams.get("tab") === "how-it-works") setShowHowItWorks(true);
  }, [resolvedCategory, paramFilter, paramDifficulty, searchParams]);

  // Handle URL updates smoothly without full reloads
  const updateUrlParams = (updates: {
    category?: string;
    filter?: string | null;
    difficulty?: string;
    search?: string;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    if (updates.category !== undefined) {
      if (updates.category === "All") params.delete("category");
      else params.set("category", updates.category);
    }

    if (updates.filter !== undefined) {
      if (!updates.filter) params.delete("filter");
      else params.set("filter", updates.filter);
    }

    if (updates.difficulty !== undefined) {
      if (updates.difficulty === "All") params.delete("difficulty");
      else params.set("difficulty", updates.difficulty);
    }

    if (updates.search !== undefined) {
      if (!updates.search.trim()) {
        params.delete("search");
        params.delete("q");
      } else {
        params.set("search", updates.search.trim());
      }
    }

    const query = params.toString();
    const newPath = query ? `${pathname}?${query}` : pathname;
    router.replace(newPath, { scroll: false });
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    // If a specific category was clicked, clear onlyFeatured to prevent 0-match collisions
    if (categoryName !== "All" && onlyFeatured) {
      setOnlyFeatured(false);
      updateUrlParams({ category: categoryName, filter: null });
    } else {
      updateUrlParams({ category: categoryName });
    }
  };

  const handleFeaturedToggle = (featured: boolean) => {
    setOnlyFeatured(featured);
    updateUrlParams({ filter: featured ? "featured" : null });
  };

  const handleDifficultySelect = (difficulty: string) => {
    setSelectedDifficulty(difficulty);
    updateUrlParams({ difficulty });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    updateUrlParams({ search: query });
  };

  const resetAllFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedDifficulty("All");
    setOnlyFeatured(false);
    setShowHowItWorks(false);
    router.replace(pathname, { scroll: false });
  };

  // Filtered algorithms list
  const filteredAlgorithms = useMemo(() => {
    return ALGORITHMS.filter((algo) => {
      const matchesSearch =
        algo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        algo.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        algo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        algo.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "All" || algo.category === selectedCategory;

      const matchesDifficulty =
        selectedDifficulty === "All" || algo.difficulty === selectedDifficulty;

      const matchesFeatured = !onlyFeatured || algo.featured;

      return matchesSearch && matchesCategory && matchesDifficulty && matchesFeatured;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty, onlyFeatured]);

  const featuredTotal = useMemo(() => ALGORITHMS.filter((a) => a.featured).length, []);

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-sky-400 mb-2 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>01 // ALGORITHM EXPLORER &amp; CATALOG</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-mono font-bold tracking-tight text-white mb-2">
            Algorithm Explorer
          </h1>
          <p className="text-xs sm:text-sm font-mono text-slate-400 max-w-2xl leading-relaxed">
            Search, categorize, and filter artificial intelligence algorithms. Select any solver kernel to launch its live step-by-step state machine.
          </p>
        </div>

        {/* View Mode Tabs: All Algorithms vs Featured */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0A0E17] border border-white/10 self-start md:self-auto font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              handleFeaturedToggle(false);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all ${
              !onlyFeatured
                ? "bg-[#1A2230] text-white border border-sky-400/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Solvers ({ALGORITHMS.length})
          </button>
          <button
            type="button"
            onClick={() => {
              handleFeaturedToggle(true);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase flex items-center gap-2 transition-all ${
              onlyFeatured
                ? "bg-[#1A2230] text-white border border-amber-400/40 shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFeatured ? "fill-amber-400 text-amber-400" : "text-amber-400"}`} />
            Featured ({featuredTotal})
          </button>
        </div>
      </div>

      {/* "How It Works" Section (Only shown when explicitly requested) */}
      {showHowItWorks && (
        <section
          id="how-it-works"
          className="scroll-mt-24 rounded-3xl bg-[#0A0E17] border border-white/10 p-7 transition-all shadow-xl relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30">
                <Play className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h2 className="text-sm font-mono font-bold text-white">How ThinkViz Visualizers Work</h2>
                <p className="text-xs font-mono text-slate-400">Three-step workflow to master search and optimization models</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowHowItWorks(false)}
              className="text-xs font-mono text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-[#111722] border border-white/10 transition-colors uppercase"
            >
              Close Guide
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-mono">
            <div className="p-5 rounded-2xl bg-[#111722] border border-white/10">
              <span className="inline-block px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-sky-500/10 text-sky-300 border border-sky-500/30 mb-3">
                01 // CONFIGURE
              </span>
              <h3 className="text-sm font-mono font-bold text-white mb-2">Select and Parameterize</h3>
              <p className="text-slate-400 leading-relaxed text-xs">
                Choose an algorithm, adjust heuristic parameters (Manhattan, Euclidean), and generate custom obstacle mazes or TSP coordinate matrices.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#111722] border border-white/10">
              <span className="inline-block px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 mb-3">
                02 // EXECUTE
              </span>
              <h3 className="text-sm font-mono font-bold text-white mb-2">Control Execution</h3>
              <p className="text-slate-400 leading-relaxed text-xs">
                Use Play, Pause, Step Forward, and Step Backward controls to trace node evaluations, priority queues, and line-by-line pseudocode highlighting.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#111722] border border-white/10">
              <span className="inline-block px-2.5 py-1 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 mb-3">
                03 // TELEMETRY
              </span>
              <h3 className="text-sm font-mono font-bold text-white mb-2">Analyze Telemetry</h3>
              <p className="text-slate-400 leading-relaxed text-xs">
                Monitor visited node counts, effective path cost, memory consumption, and algorithmic time complexity in real time.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Featured Banner (if onlyFeatured filter active) */}
      {onlyFeatured && (
        <div id="featured" className="scroll-mt-24 p-5 rounded-2xl bg-[#0A0E17] border border-amber-500/30 flex items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">Viewing Featured Core Algorithms</h2>
              <p className="text-xs text-slate-400">
                Foundational curriculum models including A* Search, Genetic TSP, and Minimax Game Trees.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleFeaturedToggle(false)}
            className="text-xs text-sky-400 hover:text-sky-300 shrink-0 uppercase tracking-wider font-bold"
          >
            Show All Algorithms ({ALGORITHMS.length})
          </button>
        </div>
      )}

      {/* Search & Categories Filter Bar */}
      <div id="categories" className="scroll-mt-24 space-y-5 p-6 rounded-3xl bg-[#0A0E17] border border-white/10 shadow-2xl relative overflow-hidden">
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search algorithms by name, keyword, or problem domain (e.g. A*, TSP, heuristic, minimax)..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-2xl bg-[#111722] border border-white/10 px-5 py-3 pl-11 text-xs font-mono text-white placeholder-slate-500 focus:border-sky-400/60 focus:outline-none transition-colors"
          />
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/5 font-mono">
          {/* Category pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 font-bold mr-1 flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
              <Layers className="w-3.5 h-3.5 text-sky-400" /> Category:
            </span>
            <button
              type="button"
              onClick={() => handleCategorySelect("All")}
              className={`px-3.5 py-1.5 rounded-xl font-mono text-xs transition-all ${
                selectedCategory === "All"
                  ? "bg-[#1A2230] text-white border border-sky-400/40 font-bold"
                  : "bg-[#111722] text-slate-400 hover:text-white border border-white/10"
              }`}
            >
              All ({ALGORITHMS.length})
            </button>
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => handleCategorySelect(cat.name)}
                  className={`px-3.5 py-1.5 rounded-xl font-mono text-xs transition-all ${
                    isSelected
                      ? "bg-[#1A2230] text-white border border-sky-400/40 font-bold"
                      : "bg-[#111722] text-slate-400 hover:text-white border border-white/10"
                  }`}
                >
                  {cat.name} ({cat.algorithmCount})
                </button>
              );
            })}
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400 uppercase text-[10px] tracking-wider font-bold flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" /> Difficulty:
            </span>
            <select
              value={selectedDifficulty}
              onChange={(e) => handleDifficultySelect(e.target.value)}
              className="rounded-xl bg-[#111722] border border-white/10 px-3 py-1.5 text-xs text-white focus:border-sky-400/60 focus:outline-none"
            >
              <option value="All">All difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Algorithm Cards Grid */}
      {filteredAlgorithms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAlgorithms.map((algo) => (
            <div
              key={algo.id}
              className="flex flex-col justify-between rounded-3xl bg-[#0A0E17] border border-white/10 p-7 hover:border-white/20 transition-all group shadow-xl relative overflow-hidden"
            >
              {/* Corner Crosshair */}
              <div className="absolute top-3 right-3 text-xs font-mono text-white/20 select-none">+</div>

              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-4 border-b border-white/5 pb-3">
                  <span className="rounded-full bg-[#111722] border border-white/10 px-3 py-1 text-[10px] font-mono font-bold text-slate-300 uppercase tracking-wider">
                    {algo.category}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    {algo.featured && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/30">
                        <Star className="w-2.5 h-2.5 fill-current" /> Featured
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                      {algo.difficulty}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-mono font-bold text-white group-hover:text-sky-300 transition-colors mb-2">
                  {algo.name} <span className="text-xs text-slate-400 font-normal">({algo.shortName})</span>
                </h3>

                <p className="text-xs font-mono text-slate-400 leading-relaxed mb-6">
                  {algo.description}
                </p>

                {/* Complexities */}
                <div className="grid grid-cols-2 gap-2.5 mb-6 text-xs font-mono">
                  <div className="p-3 rounded-2xl bg-[#111722] border border-white/10">
                    <span className="text-slate-400 block text-[9px] font-mono font-bold uppercase tracking-widest">TIME</span>
                    <span className="text-white font-bold mt-0.5 block">{algo.timeComplexity}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-[#111722] border border-white/10">
                    <span className="text-slate-400 block text-[9px] font-mono font-bold uppercase tracking-widest">SPACE</span>
                    <span className="text-white font-bold mt-0.5 block">{algo.spaceComplexity}</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/algorithms/${algo.id}`}
                className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#111722] hover:bg-sky-500 hover:text-white border border-white/10 py-3 text-xs font-mono font-bold text-slate-300 transition-all uppercase tracking-wider shadow-sm active:scale-[0.98]"
              >
                <span>Launch Solver Kernel</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-3xl bg-[#0A0E17] border border-white/10 space-y-4 font-mono">
          <p className="text-sm font-bold text-white uppercase tracking-wider">No matching algorithms found</p>
          <p className="text-xs text-slate-400">
            No algorithms match the current category and filter criteria.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#111722] text-xs text-sky-400 hover:text-white border border-white/10 font-bold uppercase tracking-wider transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All Filters
          </button>
        </div>
      )}

    </div>
  );
}

export default function AlgorithmsExplorerPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-xs text-[#737C89]">Loading algorithms catalog...</div>}>
      <AlgorithmsExplorerContent />
    </Suspense>
  );
}
