"use client";

import React from "react";
import { Check, X, ArrowRight, Info, Zap } from "lucide-react";

interface IntentCardProps {
  intent_summary: string;
  proposed_action: string;
  confidence: number; // 0 to 1
  source: string;
}

const IntentCard: React.FC<IntentCardProps> = ({
  intent_summary,
  proposed_action,
  confidence,
  source,
}) => {
  const confidencePercentage = Math.round(confidence * 100);

  return (
    <div className="group relative bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-xl transition-all hover:border-indigo-500/50 hover:shadow-indigo-500/10 overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-indigo-500/10 blur-3xl group-hover:bg-indigo-500/20 transition-colors" />

      {/* Header & Source */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          <Info className="w-3 h-3" />
          {source}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-400">
          <Zap className="w-3 h-3 fill-current" />
          {confidencePercentage}% Match
        </div>
      </div>

      {/* Intent Summary */}
      <h3 className="text-lg font-semibold text-white mb-2 leading-snug">
        {intent_summary}
      </h3>

      {/* Action Divider */}
      <div className="flex items-center gap-3 my-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <ArrowRight className="w-4 h-4 text-slate-600" />
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Proposed Action */}
      <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 mb-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1">
          Suggested Action
        </p>
        <p className="text-white font-medium">{proposed_action}</p>
      </div>

      {/* Confidence Bar */}
      <div className="space-y-2 mb-6">
        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase">
          <span>Confidence</span>
          <span>{confidencePercentage}%</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full transition-all duration-1000 ease-out"
            style={{ width: `${confidencePercentage}%` }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all active:scale-95">
          <Check className="w-4 h-4" /> Approve
        </button>
        <button className="flex items-center justify-center w-12 h-10 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/50 text-slate-400 hover:text-red-400 rounded-xl transition-all active:scale-95">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default IntentCard;
