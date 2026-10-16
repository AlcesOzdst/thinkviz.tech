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
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6C8CFF] mb-2 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Visualizer Catalog</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#F1F3F5] mb-2">
            Algorithm Explorer
          </h1>
          <p className="text-sm text-[#A7AFBB] max-w-2xl leading-relaxed">
            Search, categorize, and filter artificial intelligence algorithms. Select any algorithm to launch its live step-by-step visualizer.
          </p>
        </div>

        {/* View Mode Tabs: All Algorithms vs Featured */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#15181D] border border-[#292E36] self-start md:self-auto">
          <button
            type="button"
            onClick={() => {
              handleFeaturedToggle(false);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              !onlyFeatured
                ? "bg-[#6C8CFF] text-white shadow-sm"
                : "text-[#A7AFBB] hover:text-white"
            }`}
          >
            All Algorithms ({ALGORITHMS.length})
          </button>
          <button
            type="button"
            onClick={() => {
              handleFeaturedToggle(true);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              onlyFeatured
                ? "bg-[#6C8CFF] text-white shadow-sm"
                : "text-[#A7AFBB] hover:text-white"
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFeatured ? "fill-white text-white" : "text-[#E5A83B]"}`} />
            Featured ({featuredTotal})
          </button>
        </div>
      </div>

      {/* "How It Works" Section (Only shown when explicitly requested) */}
      {showHowItWorks && (
        <section
          id="how-it-works"
          className="scroll-mt-24 rounded-2xl bg-[#15181D] border border-[#292E36] p-6 transition-all"
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#292E36]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-[#6C8CFF]/15 text-[#6C8CFF]">
                <Play className="w-4 h-4 fill-current" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#F1F3F5]">How ThinkViz Visualizers Work</h2>
                <p className="text-xs text-[#717885]">Intuitive three-step workflow to master search and optimization models</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowHowItWorks(false)}
              className="text-xs text-[#717885] hover:text-white px-2.5 py-1 rounded-lg bg-[#111418] border border-[#292E36] transition-colors"
            >
              Close Guide
            </button>
          </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#292E36]">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#6C8CFF]/15 text-[#6C8CFF] mb-2">
              STEP 01
            </span>
            <h3 className="text-sm font-semibold text-[#F1F3F5] mb-1">Select and Configure</h3>
            <p className="text-[#A7AFBB] leading-relaxed text-[11px]">
              Choose an algorithm, adjust heuristic parameters (Manhattan, Euclidean), and generate custom obstacle mazes or TSP coordinate matrices.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#292E36]">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#10B981]/15 text-[#10B981] mb-2">
              STEP 02
            </span>
            <h3 className="text-sm font-semibold text-[#F1F3F5] mb-1">Control Execution</h3>
            <p className="text-[#A7AFBB] leading-relaxed text-[11px]">
              Use Play, Pause, Step Forward, and Step Backward controls to trace node evaluations, priority queues, and line-by-line pseudocode highlighting.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0D0F12] border border-[#292E36]">
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[#E5A83B]/15 text-[#E5A83B] mb-2">
              STEP 03
            </span>
            <h3 className="text-sm font-semibold text-[#F1F3F5] mb-1">Analyze Telemetry</h3>
            <p className="text-[#A7AFBB] leading-relaxed text-[11px]">
              Monitor visited node counts, effective path cost, memory consumption, and algorithmic time complexity in real time.
            </p>
          </div>
        </div>
      </section>
      )}

      {/* Featured Banner (if onlyFeatured filter active) */}
      {onlyFeatured && (
        <div id="featured" className="scroll-mt-24 p-4 rounded-xl bg-gradient-to-r from-[#1E1B4B]/60 to-[#181C22] border border-purple-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
              <Star className="w-4 h-4 fill-purple-300 text-purple-300" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-[#F1F3F5]">Viewing Featured Core Algorithms</h2>
              <p className="text-[11px] text-[#A7AFBB]">
                Foundational curriculum models including A* Search, Genetic TSP, and Minimax Game Trees.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => handleFeaturedToggle(false)}
            className="text-xs text-[#6C8CFF] hover:underline shrink-0"
          >
            Show All Algorithms ({ALGORITHMS.length})
          </button>
        </div>
      )}

      {/* Search & Categories Filter Bar */}
      <div id="categories" className="scroll-mt-24 space-y-4 p-5 rounded-xl bg-[#15181D] border border-[#292E36]">
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search algorithms by name, keyword, or problem domain (e.g. A*, TSP, heuristic, minimax)..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full rounded-lg bg-[#0D0F12] border border-[#292E36] px-4 py-2.5 pl-10 text-sm text-[#F1F3F5] placeholder-[#737C89] focus:border-[#6C8CFF] focus:outline-none"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-[#737C89]" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#292E36]">
          {/* Category pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#737C89] font-medium mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Category:
            </span>
            <button
              type="button"
              onClick={() => handleCategorySelect("All")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedCategory === "All"
                  ? "bg-[#6C8CFF] text-white shadow-sm"
                  : "bg-[#1B1F25] text-[#A7AFBB] hover:text-[#F1F3F5]"
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
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    isSelected
                      ? "bg-[#6C8CFF] text-white shadow-sm"
                      : "bg-[#1B1F25] text-[#A7AFBB] hover:text-[#F1F3F5]"
                  }`}
                >
                  {cat.name} ({cat.algorithmCount})
                </button>
              );
            })}
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#737C89] font-medium flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" /> Difficulty:
            </span>
            <select
              value={selectedDifficulty}
              onChange={(e) => handleDifficultySelect(e.target.value)}
              className="rounded-lg bg-[#0D0F12] border border-[#292E36] px-3 py-1.5 text-xs text-[#F1F3F5] focus:border-[#6C8CFF] focus:outline-none"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAlgorithms.map((algo) => (
            <div
              key={algo.id}
              className="flex flex-col justify-between rounded-xl bg-[#15181D] border border-[#292E36] p-6 hover:border-[#6C8CFF]/50 transition-all group"
            >
              <div>
                {/* Header tags */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="rounded bg-[#1B1F25] px-2.5 py-0.5 text-xs text-[#A7AFBB] border border-[#292E36]">
                    {algo.category}
                  </span>
                  <div className="flex items-center gap-2">
                    {algo.featured && (
                      <span className="flex items-center gap-1 text-[10px] font-medium text-[#E5A83B] bg-[#E5A83B]/10 px-2 py-0.5 rounded border border-[#E5A83B]/20">
                        <Star className="w-2.5 h-2.5 fill-current" /> Featured
                      </span>
                    )}
                    <span className="text-xs text-[#737C89]">
                      {algo.difficulty}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-[#F1F3F5] group-hover:text-[#6C8CFF] transition-colors mb-2">
                  {algo.name} <span className="text-xs text-[#737C89]">({algo.shortName})</span>
                </h3>

                <p className="text-xs text-[#A7AFBB] leading-relaxed mb-5">
                  {algo.description}
                </p>

                {/* Complexities */}
                <div className="grid grid-cols-2 gap-2 mb-6 text-xs font-mono">
                  <div className="p-2 rounded bg-[#0D0F12] border border-[#292E36]">
                    <span className="text-[#737C89] block text-[10px] font-sans">TIME</span>
                    <span className="text-[#F1F3F5]">{algo.timeComplexity}</span>
                  </div>
                  <div className="p-2 rounded bg-[#0D0F12] border border-[#292E36]">
                    <span className="text-[#737C89] block text-[10px] font-sans">SPACE</span>
                    <span className="text-[#F1F3F5]">{algo.spaceComplexity}</span>
                  </div>
                </div>
              </div>

              <Link
                href={`/algorithms/${algo.id}`}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#1B1F25] py-2.5 text-xs font-medium text-[#F1F3F5] hover:bg-[#6C8CFF] hover:text-white transition-all shadow-sm"
              >
                <span>Launch Interactive Visualizer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-xl bg-[#15181D] border border-[#292E36] space-y-3">
          <p className="text-sm font-semibold text-[#F1F3F5]">No matching algorithms found</p>
          <p className="text-xs text-[#737C89]">
            No algorithms match the current category and filter criteria.
          </p>
          <button
            type="button"
            onClick={resetAllFilters}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1B1F25] text-xs text-[#6C8CFF] hover:bg-[#292E36] font-medium transition-colors"
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
