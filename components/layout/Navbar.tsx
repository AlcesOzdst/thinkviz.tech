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
            className={`transition-colors hover:text-[#F1F3F5] ${
              pathname === "/algorithms" ? "text-[#F1F3F5] font-semibold" : ""
            }`}
          >
            Explore Algorithms
          </Link>
          <Link
            href="/data-center"
            className={`transition-colors hover:text-[#F1F3F5] flex items-center gap-1.5 ${
              pathname?.startsWith("/data-center") ? "text-[#6C8CFF] font-semibold" : ""
            }`}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#6C8CFF]"></span>
            Data Center
          </Link>
          <Link
            href={categoriesHref}
            className="transition-colors hover:text-[#F1F3F5]"
          >
            Categories
          </Link>
          <Link
            href={howItWorksHref}
            className="transition-colors hover:text-[#F1F3F5]"
          >
            How It Works
          </Link>
          <Link
            href={featuredHref}
            className="transition-colors hover:text-[#F1F3F5]"
          >
            Featured
          </Link>
        </nav>

        {/* User Session & Visualizer CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/dashboard" className="text-sm font-medium text-[#A7AFBB] hover:text-[#F1F3F5] transition-colors">
            Dashboard
          </Link>

          {currentUser ? (
            <div className="flex items-center gap-2">
              <Link
                href="/data-center"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#181C22] border border-[#292E36] hover:border-[#6C8CFF]/50 transition-colors"
              >
                <span className="w-5 h-5 rounded-full bg-[#6C8CFF] text-white flex items-center justify-center text-[10px] font-semibold">
                  {currentUser.name.charAt(0)}
                </span>
                <span className="text-xs font-medium text-[#F1F3F5] max-w-[100px] truncate">{currentUser.name}</span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#111418] border border-[#292E36] text-[#6C8CFF]">
                  {currentUser.role}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleNavbarLogout}
                className="p-1.5 rounded-lg text-[#717885] hover:text-red-400 hover:bg-[#181C22] transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-[#292E36] bg-[#181C22] px-3 py-1.5 text-xs font-medium text-[#F1F3F5] hover:bg-[#1F242D] hover:border-[#6C8CFF]/50 transition-colors"
            >
              Sign In
            </Link>
          )}

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
