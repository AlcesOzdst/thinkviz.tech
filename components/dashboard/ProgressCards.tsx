"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, Clock } from "lucide-react";
import { ALGORITHMS } from "@/data/algorithms";

interface ProgressCardsProps {
  progressRecords: any[];
}

export function ProgressCards({ progressRecords }: ProgressCardsProps) {
  if (!progressRecords || progressRecords.length === 0) {
    return (
      <div className="w-full p-10 rounded-xl bg-[#15181D]/50 border border-[#292E36] border-dashed text-center">
        <h3 className="text-lg font-medium text-[#737C89] mb-2">Algorithm Progress Tracking</h3>
        <p className="text-[#737C89] text-sm max-w-md mx-auto">
          You haven't completed any algorithm visualizations yet. Head to the Explorer, pick an algorithm, and watch the simulation to the end to earn a completion badge!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {progressRecords.map((record) => {
        const algo = ALGORITHMS.find(a => a.id === record.algorithmId);
        if (!algo) return null;

        const minutes = Math.floor(record.timeSpentSeconds / 60);
        const seconds = record.timeSpentSeconds % 60;
        const timeString = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

        return (
          <div key={record.id} className="p-6 rounded-xl bg-[#15181D] border border-[#292E36] flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CheckCircle2 size={64} className="text-[#20C997]" />
            </div>
            
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 size={18} className="text-[#20C997]" />
              <span className="text-xs font-semibold uppercase tracking-wider text-[#20C997]">Completed</span>
            </div>
            
            <h3 className="font-semibold text-[#F1F3F5] text-lg mb-1 relative z-10">
              {algo.name}
            </h3>
            
            <p className="text-xs text-[#737C89] mb-6 relative z-10">
              {algo.category}
            </p>
            
            <div className="flex items-center gap-4 mt-auto border-t border-[#292E36] pt-4 relative z-10">
              <div className="flex items-center gap-1.5 text-xs text-[#A7AFBB]">
                <Clock size={14} className="text-[#737C89]" />
                <span>Time: {timeString}</span>
              </div>
              <Link 
                href={`/algorithms/${algo.id}`}
                className="ml-auto text-xs font-medium text-[#6C8CFF] hover:text-[#5A7BEF] transition-colors"
              >
                Revisit &rarr;
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
