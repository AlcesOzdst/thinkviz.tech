"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { getCurrentUserAction, logoutAction } from "@/app/actions/dms";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const pathname = usePathname();

  useEffect(() => {
    getCurrentUserAction().then(setCurrentUser).catch(() => setCurrentUser(null));
  }, [pathname]);

  const handleNavbarLogout = async () => {
    try {
      await logoutAction();
      setCurrentUser(null);
      window.location.href = "/";
    } catch (e) {
      window.location.href = "/";
    }
  };

  const categoriesHref = pathname === "/" ? "#categories" : "/algorithms#categories";
  const howItWorksHref = pathname === "/algorithms" ? "/algorithms#how-it-works" : "/#how-it-works";
  const featuredHref = pathname === "/" ? "#featured" : "/algorithms?filter=featured";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#232B36] bg-[#090B0E]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <img src="/logo.jpg" alt="ThinkViz Logo" className="h-8 w-8 object-contain" />
          <span className="text-lg font-semibold tracking-tight text-[#F8FAFC]">
            Think<span className="text-sky-400">Viz</span>
          </span>
        </Link>

        {/* Desktop Navigation Links (Cleanly spaced, responsive) */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-[#94A3B8]">
          <Link
            href="/algorithms"
            className={`transition-colors hover:text-[#F8FAFC] shrink-0 ${
              pathname === "/algorithms" ? "text-white font-semibold" : ""
            }`}
          >
            Explore Algorithms
          </Link>
          <Link
            href="/data-center"
            className={`transition-colors hover:text-sky-400 shrink-0 flex items-center gap-1.5 ${
              pathname?.startsWith("/data-center") ? "text-sky-400 font-semibold" : ""
            }`}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            Data Center
          </Link>
          <Link
            href={categoriesHref}
            className="transition-colors hover:text-[#F8FAFC] shrink-0"
          >
            Categories
          </Link>
          <Link
            href={howItWorksHref}
            className="transition-colors hover:text-[#F8FAFC] shrink-0 hidden xl:inline-block"
          >
            Architecture
          </Link>
          <Link
            href={featuredHref}
            className="transition-colors hover:text-[#F8FAFC] shrink-0 hidden xl:inline-block"
          >
            Featured
          </Link>
        </nav>

        {/* User Session & Visualizer CTA (Calibrated zone with left border divider) */}
        <div className="hidden sm:flex items-center gap-3 shrink-0 pl-4 border-l border-[#232B36]">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-[#94A3B8] hover:text-[#F8FAFC] transition-colors px-2 py-1"
          >
            Dashboard
          </Link>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <Link
                href="/data-center"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#12161D] border border-[#232B36] hover:border-[#6C8CFF]/50 transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-[#6C8CFF] text-white flex items-center justify-center text-[10px] font-semibold">
                  {currentUser.name.charAt(0)}
                </span>
                <span className="text-xs font-medium text-[#F8FAFC] max-w-[100px] truncate">{currentUser.name}</span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#090B0E] border border-[#232B36] text-[#6C8CFF]">
                  {currentUser.role}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleNavbarLogout}
                className="p-1.5 rounded-lg text-[#828E9E] hover:text-red-400 hover:bg-[#1A202A] transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-[#232B36] bg-[#12161D] px-3 py-1.5 text-xs font-medium text-[#F8FAFC] hover:bg-[#1A202A] hover:border-[#6C8CFF]/50 transition-colors"
            >
              Sign In
            </Link>
          )}

          <Link
            href="/algorithms"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-sky-950/40 transition-all hover:from-sky-400 hover:to-blue-500 active:scale-[0.98]"
          >
            Launch Visualizer
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden rounded-lg p-2 text-[#94A3B8] hover:bg-[#1A202A] hover:text-[#F8FAFC]"
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
        <div className="lg:hidden border-b border-[#292E36] bg-[#15181D] px-4 pt-2 pb-4 space-y-3 text-sm">
          <Link
            href="/algorithms"
            className="block px-3 py-2 rounded-md font-medium text-[#A7AFBB] hover:bg-[#1B1F25] hover:text-[#F1F3F5]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Explore Algorithms
          </Link>
          <Link
            href="/data-center"
            className="block px-3 py-2 rounded-md font-medium text-[#A7AFBB] hover:bg-[#1B1F25] hover:text-[#F1F3F5]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Data Center
          </Link>
          <Link
            href={categoriesHref}
            className="block px-3 py-2 rounded-md font-medium text-[#A7AFBB] hover:bg-[#1B1F25] hover:text-[#F1F3F5]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Categories
          </Link>
          <Link
            href={howItWorksHref}
            className="block px-3 py-2 rounded-md font-medium text-[#A7AFBB] hover:bg-[#1B1F25] hover:text-[#F1F3F5]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            How It Works
          </Link>
          <Link
            href={featuredHref}
            className="block px-3 py-2 rounded-md font-medium text-[#A7AFBB] hover:bg-[#1B1F25] hover:text-[#F1F3F5]"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Featured
          </Link>
          
          <div className="flex flex-col gap-4 mt-6 pt-6 border-t border-[#292E36]">
            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-sm font-medium text-[#F1F3F5]"
            >
              Dashboard
            </Link>

            {currentUser ? (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#181C22] border border-[#292E36]">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#6C8CFF] text-white flex items-center justify-center text-xs font-semibold">
                    {currentUser.name.charAt(0)}
                  </span>
                  <div>
                    <span className="text-xs font-medium text-[#F1F3F5] block">{currentUser.name}</span>
                    <span className="text-[10px] font-mono text-[#6C8CFF] uppercase">{currentUser.role}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleNavbarLogout();
                  }}
                  className="text-xs text-red-400 hover:text-red-300 font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block text-center py-2 rounded-lg bg-[#181C22] border border-[#292E36] text-xs font-medium text-[#F1F3F5]"
              >
                Sign In to Data Center
              </Link>
            )}
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
