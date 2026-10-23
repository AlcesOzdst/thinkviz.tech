"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  KeyRound,
  Sparkles,
  ArrowLeft,
  Loader2,
  Shield,
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
    <div className="w-full max-w-md space-y-6 font-mono">
      {/* Brand Header */}
      <div className="text-center space-y-3">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
          <img src="/logo.jpg" alt="ThinkViz Logo" className="h-10 w-10 object-contain rounded-xl border border-white/10" />
          <span className="text-2xl font-mono font-bold tracking-tight text-white">
            Think<span className="text-sky-400">Viz</span>
          </span>
        </Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#111722] border border-white/10 text-[10px] text-sky-400 font-bold uppercase tracking-widest">
          SYS // AUTHENTICATION PORTAL
        </div>
        <h1 className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-white">
          Sign In to Data Center
        </h1>
        <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
          Authenticate to manage datasets, collaborative projects, AI syntheses, and institutional governance.
        </p>
      </div>

      {/* Public Visualizer Access Notice Banner */}
      <div className="p-4 rounded-2xl bg-[#0A0E17] border border-white/10 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <p className="text-slate-400 text-xs leading-tight">
            Algorithm visualizers are completely public. No login required to visualize.
          </p>
        </div>
        <Link
          href="/algorithms"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111722] hover:bg-[#1A2230] border border-white/10 text-sky-400 hover:text-white text-xs font-bold shrink-0 transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Explore</span>
        </Link>
      </div>

      {/* Main Authentication Form */}
      <div className="bg-[#0A0E17] border border-white/10 rounded-3xl p-7 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Corner Crosshairs */}
        <div className="absolute top-3 left-3 text-xs font-mono text-white/20 select-none">+</div>
        <div className="absolute top-3 right-3 text-xs font-mono text-white/20 select-none">+</div>
        <div className="absolute bottom-3 left-3 text-xs font-mono text-white/20 select-none">+</div>
        <div className="absolute bottom-3 right-3 text-xs font-mono text-white/20 select-none">+</div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 text-center font-bold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="name@organization.edu"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full bg-[#111722] text-xs font-mono text-white px-4 py-3 rounded-2xl border border-white/10 focus:border-sky-400/60 focus:outline-none transition-all placeholder:text-slate-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full bg-[#111722] text-xs font-mono text-white px-4 py-3 rounded-2xl border border-white/10 focus:border-sky-400/60 focus:outline-none transition-all placeholder:text-slate-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all disabled:opacity-50 shadow-lg shadow-sky-950/40 mt-3 active:scale-[0.98]"
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
        <div className="pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="w-full text-center text-xs font-mono text-slate-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors uppercase tracking-wider"
          >
            <span>{showPresets ? "Hide Demo Accounts" : "Show Evaluator Demo Accounts"}</span>
          </button>

          {showPresets && (
            <div className="mt-4 space-y-3">
              <p className="text-[10px] text-slate-500 text-center uppercase tracking-wider">
                Select a role to autofill its account email into the sign in form.
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {DEMO_PRESETS.map((p) => (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => fillPreset(p.email)}
                    className="p-3 rounded-2xl bg-[#111722] border border-white/10 hover:border-sky-400/40 text-left transition-all flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <span className="text-xs font-bold text-white group-hover:text-sky-300">{p.role}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${p.badge}`}>
                        {p.role.toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[10px] text-sky-400 font-mono truncate">{p.email}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Return Link */}
      <div className="text-center text-xs text-slate-500">
        <span>ThinkViz Intelligence Platform • </span>
        <Link href="/" className="text-slate-400 hover:text-white transition-colors">
          Return to Home
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#070A0F] text-slate-200 flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-xs text-slate-500 font-mono">Loading authentication portal...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
