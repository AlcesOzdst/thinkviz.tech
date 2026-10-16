"use client";

import Link from "next/link";
import { Plus, UploadCloud, Sparkles, Database } from "lucide-react";

interface DmsHeaderProps {
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export function DmsHeader({ title, description, actions }: DmsHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#292E36]">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono uppercase tracking-wider text-[#6C8CFF]">
            Data Center
          </span>
          <span className="text-[#404754]">•</span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#6C8CFF]/15 text-[#6C8CFF] border border-[#6C8CFF]/30">
            Release 2 (v2.0)
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#F1F3F5]">{title}</h1>
        <p className="text-sm text-[#A7AFBB] mt-1">{description}</p>
      </div>

      {actions && <div className="flex items-center gap-2.5 flex-wrap">{actions}</div>}
    </div>
  );
}
