"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ALGORITHMS, CATEGORIES } from "@/data/algorithms";

export default function AlgorithmsExplorerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");

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

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-[#F1F3F5] mb-2">
          Algorithm Explorer
        </h1>
        <p className="text-sm text-[#A7AFBB] max-w-2xl leading-relaxed">
          Search and filter artificial intelligence algorithms. Select any algorithm to open its interactive step-by-step visualization page.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-4 mb-8 p-5 rounded-xl bg-[#15181D] border border-[#292E36]">
        <div className="relative">
          <input
            type="text"
            placeholder="Search algorithms by name or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg bg-[#0D0F12] border border-[#292E36] px-4 py-2.5 pl-10 text-sm text-[#F1F3F5] placeholder-[#737C89] focus:border-[#6C8CFF] focus:outline-none"
          />
          <svg
            className="absolute left-3.5 top-3 h-4 w-4 text-[#737C89]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#292E36]">
          {/* Category pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[#737C89] font-medium mr-1">Category:</span>
            <button
              onClick={() => setSelectedCategory("All")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedCategory === "All"
                  ? "bg-[#6C8CFF] text-white"
                  : "bg-[#1B1F25] text-[#A7AFBB] hover:text-[#F1F3F5]"
              }`}
            >
              All ({ALGORITHMS.length})
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedCategory === cat.name
                    ? "bg-[#6C8CFF] text-white"
                    : "bg-[#1B1F25] text-[#A7AFBB] hover:text-[#F1F3F5]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#737C89] font-medium">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
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
              className="flex flex-col justify-between rounded-xl bg-[#15181D] border border-[#292E36] p-6 hover:border-[#3B424E] transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="rounded bg-[#1B1F25] px-2.5 py-0.5 text-xs text-[#A7AFBB]">
                    {algo.category}
                  </span>
                  <span className="text-xs text-[#737C89]">
                    {algo.difficulty}
                  </span>
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
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#1B1F25] py-2.5 text-xs font-medium text-[#F1F3F5] hover:bg-[#6C8CFF] hover:text-white transition-all"
              >
                <span>Launch visualization</span>
                <span>→</span>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-xl bg-[#15181D] border border-[#292E36]">
          <p className="text-sm font-semibold text-[#F1F3F5]">No matching algorithms found</p>
          <p className="text-xs text-[#737C89] mt-1">Try resetting filters or adjusting search terms.</p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("All");
              setSelectedDifficulty("All");
            }}
            className="mt-4 px-4 py-2 rounded-lg bg-[#1B1F25] text-xs text-[#6C8CFF] hover:bg-[#292E36]"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}
