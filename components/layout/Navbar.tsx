"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#292E36] bg-[#0D0F12]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <img src="/logo.jpg" alt="ThinkViz Logo" className="h-8 w-8 object-contain" />
          <span className="text-lg font-semibold tracking-tight text-[#F1F3F5]">
            Think<span className="text-[#6C8CFF]">Viz</span>
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#A7AFBB]">
          <Link
            href="/algorithms"
            className="transition-colors hover:text-[#F1F3F5]"
          >
            Explore Algorithms
          </Link>
          <a
            href="#categories"
            className="transition-colors hover:text-[#F1F3F5]"
          >
            Categories
          </a>
          <a
            href="#how-it-works"
            className="transition-colors hover:text-[#F1F3F5]"
          >
            How It Works
          </a>
          <a
            href="#featured"
            className="transition-colors hover:text-[#F1F3F5]"
          >
            Featured
          </a>
        </nav>

        {/* Dashboard Link (Always visible now) */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/dashboard" className="text-sm font-medium text-[#A7AFBB] hover:text-[#F1F3F5] transition-colors">
            Dashboard
          </Link>
          
          <Link
            href="/algorithms"
            className="inline-flex items-center justify-center rounded-lg bg-[#6C8CFF] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#5A7BEF]"
          >
            Launch Visualizer
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden rounded-lg p-2 text-[#A7AFBB] hover:bg-[#1B1F25] hover:text-[#F1F3F5]"
          aria-label="Toggle Navigation Menu"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-[#292E36] bg-[#15181D] px-4 pt-2 pb-4 space-y-3 text-sm">
          <Link
            href="/algorithms"
            className="block px-3 py-2 rounded-md font-medium text-[#A7AFBB] hover:bg-[#1B1F25] hover:text-[#F1F3F5]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Explore Algorithms
          </Link>
          <a
            href="#categories"
            className="block px-3 py-2 rounded-md font-medium text-[#A7AFBB] hover:bg-[#1B1F25] hover:text-[#F1F3F5]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Categories
          </a>
          <a
            href="#how-it-works"
            className="block px-3 py-2 rounded-md font-medium text-[#A7AFBB] hover:bg-[#1B1F25] hover:text-[#F1F3F5]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            How It Works
          </a>
          
          <div className="flex flex-col gap-4 mt-6 pt-6 border-t border-[#292E36]">
            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-medium text-[#F1F3F5]"
            >
              Dashboard
            </Link>
          </div>

          <Link
            href="/algorithms"
            className="block w-full text-center mt-2 rounded-lg bg-[#6C8CFF] py-2 font-medium text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Launch Visualizer
          </Link>
        </div>
      )}
    </header>
  );
}
