"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { RotateCcw, Check, X, Info, Zap, ArrowRight } from "lucide-react";

interface IntentCardData {
  id: string;
  intent_summary: string;
  proposed_action: string;
  confidence: number;
  source: string;
}

const MOCK_INTENTS: IntentCardData[] = [
  {
    id: "1",
    intent_summary: "Meeting request from Alex regarding Q1 goals",
    proposed_action: "Create calendar event for Friday 2 PM",
    confidence: 0.91,
    source: "Email",
  },
  {
    id: "2",
    intent_summary: "Professor emailed about study group",
    proposed_action: "Schedule study session in Library",
    confidence: 0.87,
    source: "Gmail",
  },
  {
    id: "3",
    intent_summary: "Slack message: 'Need help with the slide deck'",
    proposed_action: "Create 'Help with slides' task in Linear",
    confidence: 0.78,
    source: "Slack",
  },
  {
    id: "4",
    intent_summary: "Flight confirmation for Paris",
    proposed_action: "Add flight details to TripIt",
    confidence: 0.99,
    source: "Email",
  },
];

const SwipeCard = ({
  data,
  active,
  onSwipe,
  isProcessing,
}: {
  data: IntentCardData;
  active: boolean;
  onSwipe: (direction: "left" | "right") => void;
  isProcessing: boolean;
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const bg = useTransform(
    x,
    [-150, 0, 150],
    ["rgba(239, 68, 68, 0.1)", "rgba(15, 23, 42, 1)", "rgba(34, 197, 94, 0.1)"]
  );

  const handleDragEnd = (_: any, info: any) => {
    if (isProcessing) return;
    if (info.offset.x > 100) {
      onSwipe("right");
    } else if (info.offset.x < -100) {
      onSwipe("left");
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity, backgroundColor: bg }}
      drag={active && !isProcessing ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: isProcessing ? 1 : 1.05 }}
      className={`absolute inset-0 w-full h-full bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col justify-between ${
        isProcessing ? "cursor-wait opacity-50" : "cursor-grab active:cursor-grabbing"
      } touch-none`}
    >
      <div>
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <Info className="w-3 h-3" />
            {data.source}
          </div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-400">
            <Zap className="w-3 h-3 fill-current" />
            {Math.round(data.confidence * 100)}% Match
          </div>
        </div>

        <h3 className="text-2xl font-bold text-white mb-4 leading-tight">
          {data.intent_summary}
        </h3>

        <div className="flex items-center gap-3 my-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <ArrowRight className="w-5 h-5 text-slate-600" />
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">
            Suggested Action
          </p>
          <p className="text-white text-lg font-medium">{data.proposed_action}</p>
        </div>
      </div>

      {isProcessing ? (
        <div className="flex items-center justify-center gap-3 text-indigo-400 font-medium">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          >
            <RotateCcw className="w-5 h-5" />
          </motion.div>
          Processing Intent...
        </div>
      ) : (
        <div className="flex justify-between items-center text-slate-500 text-sm font-medium">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-red-500">
              <X className="w-4 h-4" />
            </div>
            Swipe Left to Reject
          </div>
          <div className="flex items-center gap-2 text-right">
            Swipe Right to Approve
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-green-500">
              <Check className="w-4 h-4" />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default function SwipeDeck() {
  const [cards, setCards] = useState<IntentCardData[]>(MOCK_INTENTS);
  const [history, setHistory] = useState<IntentCardData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSwipe = async (direction: "left" | "right") => {
    const swipedCard = cards[cards.length - 1];

    if (direction === "right") {
      setIsProcessing(true);
      try {
        // 1. Route to best agent
        const routeRes = await fetch("/api/route-intent", {
          method: "POST",
          body: JSON.stringify({ intent_summary: swipedCard.intent_summary }),
        });
        const { agents } = await routeRes.json();
        const bestAgent = agents[0];

        if (bestAgent) {
          showToast(`Executing via ${bestAgent.name}...`, "info");

          // 2. Execute agent
          const executeRes = await fetch("/api/execute-agent", {
            method: "POST",
            body: JSON.stringify({ agent_name: bestAgent.name, intent: swipedCard }),
          });
          const result = await executeRes.json();

          if (result.status === "success") {
            showToast(result.message, "success");
          }
        }
      } catch (error) {
        console.error("Execution failed:", error);
        showToast("Failed to execute action", "info");
      } finally {
        setIsProcessing(false);
      }
    }

    setHistory([...history, swipedCard]);
    setCards((prev) => prev.slice(0, -1));
  };

  const undo = () => {
    if (history.length === 0) return;
    const lastCard = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setCards((prev) => [...prev, lastCard]);
  };

  const reset = () => {
    setCards(MOCK_INTENTS);
    setHistory([]);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-4 h-[600px]">
      <div className="relative w-full h-full perspective-1000">
        <AnimatePresence>
          {cards.length > 0 ? (
            cards.map((card, index) => (
              <SwipeCard
                key={card.id}
                data={card}
                active={index === cards.length - 1}
                onSwipe={handleSwipe}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/50 border border-dashed border-white/10 rounded-3xl p-8 text-center"
            >
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6">
                <Check className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">All Caught Up!</h3>
              <p className="text-slate-400 mb-8">No more intents to process at the moment.</p>
              <button
                onClick={reset}
                className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-semibold transition-colors"
              >
                Refresh Deck
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={undo}
          disabled={history.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-white/10 rounded-2xl text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          Undo
        </button>
      </div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 z-50 border ${
              toast.type === "success"
                ? "bg-green-500/10 border-green-500/20 text-green-400"
                : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
            }`}
          >
            {toast.type === "success" ? (
              <Check className="w-4 h-4" />
            ) : (
              <RotateCcw className="w-4 h-4 animate-spin" />
            )}
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
