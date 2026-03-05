"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { RotateCcw, Check, X, Info, Zap, AlertTriangle, ShieldCheck } from "lucide-react";

interface IntentCardData {
  id: string;
  intent_summary: string;
  proposed_action: string;
  confidence: number;
  reasoning: string;
  source: string;
}

const SwipeCard = ({
  data,
  active,
  onSwipe,
  isProcessing,
  showDoubleConfirm,
}: {
  data: IntentCardData;
  active: boolean;
  onSwipe: (direction: "left" | "right") => void;
  isProcessing: boolean;
  showDoubleConfirm: boolean;
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const bg = useTransform(
    x,
    [-150, 0, 150],
    ["rgba(239, 68, 68, 0.12)", "rgba(255, 255, 255, 0.72)", "rgba(34, 197, 94, 0.12)"]
  );

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (isProcessing || showDoubleConfirm) return;
    if (info.offset.x > 100) onSwipe("right");
    else if (info.offset.x < -100) onSwipe("left");
  };

  return (
    <motion.div
      style={{ x, rotate, opacity, backgroundColor: bg }}
      drag={active && !isProcessing && !showDoubleConfirm ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: isProcessing || showDoubleConfirm ? 1 : 1.05 }}
      className={`absolute inset-0 w-full h-full backdrop-blur-xl border border-white/60 rounded-3xl p-8 shadow-2xl shadow-slate-200/50 flex flex-col justify-between ${
        isProcessing ? "cursor-wait" : showDoubleConfirm ? "cursor-default" : "cursor-grab active:cursor-grabbing"
      } touch-none`}
    >
      <div className="overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100/80 border border-slate-200/60 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <Info className="w-3 h-3" /> {data.source}
          </div>
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${data.confidence < 0.6 ? 'text-amber-500' : 'text-indigo-600'}`}>
            {data.confidence < 0.6 ? <AlertTriangle className="w-3 h-3" /> : <Zap className="w-3 h-3 fill-current" />}
            {Math.round(data.confidence * 100)}% Match
          </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-3 leading-tight">{data.intent_summary}</h3>
        <div className="mb-4">
          <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1">
            <span className="text-slate-400">Confidence</span>
            <span className={data.confidence < 0.6 ? 'text-amber-500' : 'text-indigo-600'}>{Math.round(data.confidence * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${data.confidence < 0.6 ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-gradient-to-r from-indigo-400 to-violet-500'}`}
              style={{ width: `${Math.round(data.confidence * 100)}%` }}
            />
          </div>
        </div>
        <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-5 mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 mb-2">Suggested Action</p>
          <p className="text-slate-800 text-lg font-semibold">{data.proposed_action}</p>
        </div>
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Why this action?</p>
          <p className="text-slate-500 text-sm italic leading-relaxed">&ldquo;{data.reasoning}&rdquo;</p>
        </div>
      </div>
      <div className="mt-6">
        {isProcessing ? (
          <div className="flex items-center justify-center gap-3 text-indigo-600 font-medium">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <RotateCcw className="w-5 h-5" />
            </motion.div> Processing...
          </div>
        ) : showDoubleConfirm ? (
          <div className="flex flex-col gap-3">
            <div className="text-center text-amber-400 text-xs font-semibold mb-1 flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Low Confidence - Are you sure?
            </div>
            <div className="flex gap-2">
              <button onClick={() => onSwipe("right")} className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-white font-bold rounded-xl text-sm transition-colors shadow-sm">Confirm</button>
              <button onClick={() => onSwipe("left")} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-colors">Cancel</button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center text-slate-500 text-sm font-medium">
            <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full border border-red-100 bg-red-50 flex items-center justify-center text-red-500"><X className="w-4 h-4" /></div> Reject</div>
            <div className="flex items-center gap-2 text-right">Approve <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${data.confidence < 0.6 ? 'text-amber-500 bg-amber-50 border-amber-100' : 'text-green-600 bg-green-50 border-green-100'}`}><Check className="w-4 h-4" /></div></div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/** UUID v4 pattern — distinguishes real DB intents from fallback mock IDs */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function SwipeDeck() {
  const [cards, setCards] = useState<IntentCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "info" } | null>(null);

  const fetchIntents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/intents");
      const data = await res.json();
      setCards(data.cards || []);
    } catch (err) {
      console.error("Failed to fetch intents:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchIntents();
  }, []);

  // Real-time: push new intents from the event worker via SSE
  useEffect(() => {
    const evtSource = new EventSource("/api/intents/stream");

    evtSource.onmessage = (e) => {
      try {
        const card: IntentCardData = JSON.parse(e.data);
        setCards((prev) => {
          // Avoid duplicates
          if (prev.some((c) => c.id === card.id)) return prev;
          return [card, ...prev];
        });
      } catch {
        // ignore malformed SSE frames
      }
    };

    evtSource.onerror = () => {
      // Browser will auto-reconnect; no extra handling needed
    };

    return () => evtSource.close();
  }, []);

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSwipe = async (direction: "left" | "right") => {
    const swipedCard = cards[cards.length - 1];
    if (!swipedCard) return;

    if (direction === "right") {
      if (swipedCard.confidence < 0.6 && !pendingConfirm) {
        setPendingConfirm(true);
        return;
      }

      setIsProcessing(true);
      setPendingConfirm(false);
      try {
        if (UUID_RE.test(swipedCard.id)) {
          // ── New path: DB-backed intent ──────────────────────────────────
          showToast("Processing intent…", "info");
          const executeRes = await fetch("/api/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ intent_id: swipedCard.id }),
          });
          const result = await executeRes.json();
          if (result.status === "success") {
            showToast(result.message ?? "Action completed", "success");
          } else {
            showToast(result.message ?? "Action failed", "info");
          }
        } else {
          // ── Legacy path: mock / fallback cards ─────────────────────────
          await fetch(`/api/intents/${swipedCard.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "approved" }),
          });

          const routeRes = await fetch("/api/route-intent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ intent_summary: swipedCard.intent_summary }),
          });
          const { agents } = await routeRes.json();
          const bestAgent = agents[0];

          if (bestAgent) {
            showToast(`Executing via ${bestAgent.name}…`, "info");
            const executeRes = await fetch("/api/execute-agent", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ agent_name: bestAgent.name, intent: swipedCard }),
            });
            const result = await executeRes.json();
            if (result.status === "success") showToast(result.message, "success");
          }
        }
      } catch {
        showToast("Failed to process action", "info");
      } finally {
        setIsProcessing(false);
      }
    } else {
      // Swipe left — reject
      try {
        await fetch(`/api/intents/${swipedCard.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "rejected" }),
        });
      } catch (e) {
        console.error("Rejection failed:", e);
      }
    }

    setCards((prev) => prev.slice(0, -1));
    setPendingConfirm(false);
  };

  if (loading) return <div className="h-[650px] flex items-center justify-center text-slate-400 text-sm">Loading Intents...</div>;

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto p-4 h-[650px]">
      <div className="relative w-full h-full perspective-1000">
        <AnimatePresence>
          {cards.length > 0 ? (
            cards.map((card, index) => (
              <SwipeCard
                key={card.id}
                data={card}
                active={index === cards.length - 1}
                onSwipe={handleSwipe}
                isProcessing={isProcessing && index === cards.length - 1}
                showDoubleConfirm={pendingConfirm && index === cards.length - 1}
              />
            ))
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-lg border border-dashed border-slate-200 rounded-3xl p-8 text-center shadow-sm">
              <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center mb-6"><ShieldCheck className="w-8 h-8 text-indigo-500" /></div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Inbox Secured</h3>
              <p className="text-slate-500 mb-8">All intents have been processed and stored in the database.</p>
              <button onClick={fetchIntents} className="px-6 py-3 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-all">Reload Feed</button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-4 mt-8">
        <button onClick={fetchIntents} disabled={isProcessing} className="flex items-center gap-2 px-6 py-3 bg-white/70 hover:bg-white border border-slate-200 hover:border-indigo-200 rounded-2xl text-slate-500 hover:text-slate-900 transition-all shadow-sm text-sm font-medium">
          <RotateCcw className="w-4 h-4" /> Refresh
        </button>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3 z-50 border backdrop-blur-lg ${toast.type === "success" ? "bg-white/80 border-green-200 text-green-700" : "bg-white/80 border-indigo-200 text-indigo-700"}`}>
            {toast.type === "success" ? <Check className="w-4 h-4" /> : <RotateCcw className="w-4 h-4 animate-spin" />}
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
