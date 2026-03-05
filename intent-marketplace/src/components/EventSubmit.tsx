"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, CheckCircle2, AlertCircle, Loader2, ChevronDown } from "lucide-react";

const SOURCES = ["Email", "Gmail", "Slack", "Note", "SMS", "Meeting", "Other"];

type SubmitState = "idle" | "loading" | "success" | "error";

interface SubmitResult {
  status: string;
  event_id?: string;
  queued?: number;
  error?: string;
}

export default function EventSubmit() {
  const [source, setSource] = useState("Email");
  const [text, setText] = useState("");
  const [state, setState] = useState<SubmitState>("idle");
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || state === "loading") return;

    setState("loading");
    setResult(null);

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, text: text.trim() }),
      });
      const data: SubmitResult = await res.json();

      if (!res.ok) {
        setState("error");
        setResult(data);
        return;
      }

      setState("success");
      setResult(data);
      setText("");

      // Auto-reset after 4 s so the user can submit again
      setTimeout(() => {
        setState("idle");
        setResult(null);
      }, 4000);
    } catch {
      setState("error");
      setResult({ status: "network_error", error: "Could not reach the server" });
    }
  };

  const charLimit = 600;
  const remaining = charLimit - text.length;

  return (
    <div className="w-full max-w-md mx-auto mb-8">
      {/* Collapsible header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-white/70 backdrop-blur-sm border border-slate-200 hover:border-indigo-200 rounded-2xl text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-all shadow-sm group"
      >
          <span className="flex items-center gap-2">
          <Send className="w-4 h-4 text-indigo-500" />
          Submit a New Event
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleSubmit}
              className="mt-2 bg-white/70 backdrop-blur-lg border border-slate-200 rounded-2xl p-5 flex flex-col gap-4 shadow-sm"
            >
              {/* Source picker */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Source
                </label>
                <div className="flex flex-wrap gap-2">
                  {SOURCES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSource(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        source === s
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-sm shadow-indigo-200"
                          : "bg-white border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Event Text
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, charLimit))}
                  placeholder="Paste an email, slack message, reminder, or any context you want the AI to act on…"
                  rows={4}
                  disabled={state === "loading"}
                  className="w-full bg-white/80 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all disabled:opacity-50"
                />
                <p
                  className={`text-right text-[10px] ${
                    remaining < 50 ? "text-amber-500" : "text-slate-400"
                  }`}
                >
                  {remaining} chars remaining
                </p>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={!text.trim() || state === "loading"}
                className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-sm font-bold transition-colors"
              >
                {state === "loading" ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending…
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send to Pipeline
                  </>
                )}
              </button>

              {/* Feedback banner */}
              <AnimatePresence>
                {result && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex items-start gap-3 px-4 py-3 rounded-xl text-sm border ${
                      state === "success"
                        ? "bg-green-50 border-green-200 text-green-700"
                        : "bg-red-50 border-red-200 text-red-600"
                    }`}
                  >
                    {state === "success" ? (
                      <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    )}
                    <div>
                      {state === "success" ? (
                        <>
                          <p className="font-semibold">Event received!</p>
                          <p className="text-xs text-green-600/70 mt-0.5">
                              The AI is extracting intent in the background. Your card will
                              appear below momentarily.
                            </p>
                            {result.event_id && (
                              <p className="text-[10px] font-mono text-green-600/50 mt-1">
                              id: {result.event_id}
                            </p>
                          )}
                        </>
                      ) : (
                        <p>{result.error ?? "Something went wrong"}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
