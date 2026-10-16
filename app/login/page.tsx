"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  KeyRound,
  Sparkles,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { loginWithCredentialsAction } from "@/app/actions/dms";

const DEMO_PRESETS = [
  {
    role: "Admin",
    email: "admin@thinkviz.tech",
    badge: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    desc: "Platform governance and security audit",
  },
  {
    role: "Educator",
    email: "educator@thinkviz.tech",
    badge: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    desc: "Curriculum and benchmark curation",
  },
  {
    role: "Student",
    email: "student@thinkviz.tech",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    desc: "Problem sets and AI workspace",
  },
  {
    role: "Researcher",
    email: "researcher@thinkviz.tech",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    desc: "TSP matrix benchmarks and synthesis",
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/data-center";

  const [isLoading, setIsLoading] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPresets, setShowPresets] = useState(false);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      setErrorMsg("Please enter your email address.");
      return;
    }
    if (!passwordInput.trim()) {
      setErrorMsg("Please enter your password.");
      return;
    }
    try {
      setIsLoading(true);
      setErrorMsg(null);
      const res = await loginWithCredentialsAction(emailInput, passwordInput);
      if (res.success) {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please verify your credentials.");
      setIsLoading(false);
    }
  };

  const fillPreset = (email: string) => {
    setEmailInput(email);
    setPasswordInput("");
    setErrorMsg(null);
  };

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
          <img src="/logo.jpg" alt="ThinkViz Logo" className="h-10 w-10 object-contain rounded-lg" />
          <span className="text-2xl font-bold tracking-tight text-[#F1F3F5]">
            Think<span className="text-[#6C8CFF]">Viz</span>
          </span>
        </Link>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F1F3F5]">
          Sign In to Data Center
        </h1>
        <p className="text-xs text-[#A7AFBB] max-w-sm mx-auto">
          Authenticate to manage datasets, collaborative projects, AI syntheses, and institutional governance.
        </p>
      </div>

      {/* Public Visualizer Access Notice Banner */}
      <div className="p-3.5 rounded-xl bg-[#181C22] border border-[#292E36] flex items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-[#6C8CFF] shrink-0 mt-0.5" />
          <p className="text-[#A7AFBB] text-[11px] leading-tight">
            Algorithm visualizers are completely public. No login required to visualize.
          </p>
        </div>
        <Link
          href="/algorithms"
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#111418] hover:bg-[#1F242D] border border-[#292E36] text-[#6C8CFF] hover:text-white text-[11px] font-medium shrink-0 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Explore
        </Link>
      </div>

      {/* Main Authentication Form */}
      <div className="bg-[#15181D] border border-[#292E36] rounded-2xl p-6 sm:p-7 shadow-2xl space-y-5">
        {errorMsg && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-400 text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[#A7AFBB] mb-1.5">Email Address</label>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="name@organization.edu"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full bg-[#111418] text-xs text-[#F1F3F5] px-3.5 py-2.5 rounded-lg border border-[#292E36] focus:border-[#6C8CFF] focus:ring-1 focus:ring-[#6C8CFF] outline-none transition-all placeholder:text-[#525A67]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#A7AFBB] mb-1.5">Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-[#111418] text-xs text-[#F1F3F5] px-3.5 py-2.5 rounded-lg border border-[#292E36] focus:border-[#6C8CFF] focus:ring-1 focus:ring-[#6C8CFF] outline-none transition-all placeholder:text-[#525A67]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-[#6C8CFF] hover:bg-[#5A7BEF] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-md mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Verifying Credentials...
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" /> Sign In
              </>
            )}
          </button>
        </form>

        {/* Collapsible Demo / Evaluator Credentials Section */}
        <div className="pt-3 border-t border-[#292E36]/60">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="w-full text-center text-[11px] text-[#717885] hover:text-[#A7AFBB] flex items-center justify-center gap-1 transition-colors"
          >
            <span>{showPresets ? "Hide Demo Accounts" : "Show Evaluator Demo Accounts"}</span>
          </button>

          {showPresets && (
            <div className="mt-3 space-y-2">
              <p className="text-[10px] text-[#717885] text-center">
                Select a role to autofill its account email into the sign in form.
              </p>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_PRESETS.map((p) => (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => fillPreset(p.email)}
                    className="p-2 rounded-lg bg-[#111418] border border-[#292E36] hover:border-[#6C8CFF]/50 text-left transition-colors flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-[11px] font-semibold text-[#F1F3F5]">{p.role}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono border ${p.badge}`}>
                        {p.role.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[10px] text-[#6C8CFF] font-mono truncate">{p.email}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Return Link */}
      <div className="text-center text-xs text-[#717885]">
        <span>ThinkViz Intelligence Platform • </span>
        <Link href="/" className="text-[#A7AFBB] hover:text-[#6C8CFF] transition-colors">
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0D0F12] text-[#F1F3F5] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-xs text-[#717885]">Loading authentication portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
