"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Clock, 
  Calendar, 
  Mail, 
  Slack, 
  LayoutDashboard, 
  User, 
  Settings,
  ArrowUpRight,
  Search
} from "lucide-react";
import { motion } from "framer-motion";
import { getActionHistory } from "@/src/lib/actionHistory";
import type { ActionHistoryEntry } from "@/src/types/intent";

// Mock data for the dashboard
const ACTION_HISTORY = [
  {
    id: "1",
    intent: "Meeting request from Alex regarding Q1 goals",
    agent: "Calendar Agent",
    timestamp: "2026-03-05T10:30:00Z",
    status: "Approved",
    source: "Email",
    confidence: 0.91,
  },
  {
    id: "2",
    intent: "Professor emailed about study group",
    agent: "Calendar Agent",
    timestamp: "2026-03-05T09:15:00Z",
    status: "Approved",
    source: "Gmail",
    confidence: 0.87,
  },
  {
    id: "3",
    intent: "Slack message: 'Need help with the slide deck'",
    agent: "Task Agent",
    timestamp: "2026-03-05T08:45:00Z",
    status: "Rejected",
    source: "Slack",
    confidence: 0.78,
  },
  {
    id: "4",
    intent: "Flight confirmation for Paris",
    agent: "Research Agent",
    timestamp: "2026-03-04T22:10:00Z",
    status: "Approved",
    source: "Email",
    confidence: 0.99,
  },
  {
    id: "5",
    intent: "Buy milk soon",
    agent: "Task Agent",
    timestamp: "2026-03-04T18:05:00Z",
    status: "Approved",
    source: "Note",
    confidence: 0.55,
  },
];

const STATS = [
  { label: "Total Intents", value: "1,284", icon: <Zap className="w-5 h-5 text-indigo-400" />, change: "+12%" },
  { label: "Approved", value: "842", icon: <CheckCircle2 className="w-5 h-5 text-green-400" />, change: "+18%" },
  { label: "Rejected", value: "442", icon: <XCircle className="w-5 h-5 text-red-400" />, change: "-4%" },
  { label: "Avg. Confidence", value: "88%", icon: <ArrowUpRight className="w-5 h-5 text-blue-400" />, change: "+2%" },
];

export default function DashboardPage() {
  const [filter, setFilter] = useState("All");
  const [liveHistory, setLiveHistory] = useState<ActionHistoryEntry[]>([]);

  // Merge localStorage action history with static seed data on the client
  useEffect(() => {
    setLiveHistory(getActionHistory());
  }, []);

  // Combine live (real) history on top of static seed entries; deduplicate by id
  const mergedHistory = [
    ...liveHistory,
    ...ACTION_HISTORY.filter(
      (seed) => !liveHistory.some((live) => live.id === seed.id)
    ),
  ] as ActionHistoryEntry[];

  const filteredActions =
    filter === "All"
      ? mergedHistory
      : mergedHistory.filter((a) => a.status === filter);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-slate-900/50 hidden md:flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold">I</div>
          <span className="font-bold text-lg tracking-tight">IntentOS</span>
        </div>

        <nav className="space-y-2 flex-1">
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 text-indigo-400 font-medium">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </a>
          <a href="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            <Zap className="w-5 h-5" /> Intent Feed
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            <User className="w-5 h-5" /> Agents
          </a>
          <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
            <Settings className="w-5 h-5" /> Settings
          </a>
        </nav>

        <div className="mt-auto p-4 bg-indigo-600/10 border border-indigo-500/20 rounded-2xl">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Pro Plan</p>
          <p className="text-sm text-slate-300 mb-4">You have used 85% of your monthly intents.</p>
          <button className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold transition-colors">
            Upgrade Now
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-1">Activity Dashboard</h1>
            <p className="text-slate-500 text-sm">Monitor and audit your AI agent actions.</p>
          </div>
          <div className="flex gap-4">
            <div className="relative hidden sm:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search history..." 
                className="pl-10 pr-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
              />
            </div>
            <button className="px-4 py-2 bg-white text-slate-950 font-bold rounded-xl text-sm hover:bg-slate-200 transition-colors">
              Export Logs
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {STATS.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-slate-900 border border-white/5 rounded-3xl"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-white/5 rounded-xl">{stat.icon}</div>
                <span className={`text-xs font-bold ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                  {stat.change}
                </span>
              </div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* History Table */}
        <section className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
            <h2 className="text-xl font-bold">Action History</h2>
            <div className="flex gap-2">
              {["All", "Approved", "Rejected"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    filter === f 
                      ? "bg-indigo-600 text-white" 
                      : "bg-white/5 text-slate-400 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-white/5">
                  <th className="px-6 py-4">Intent & Source</th>
                  <th className="px-6 py-4">Agent Used</th>
                  <th className="px-6 py-4">Timestamp</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredActions.map((action) => (
                  <tr key={action.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400">
                          {action.source === "Email" || action.source === "Gmail" ? <Mail className="w-4 h-4" /> : 
                           action.source === "Slack" ? <Slack className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200 line-clamp-1">{action.intent}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{action.source}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          action.agent.includes("Calendar") ? "bg-green-500" : 
                          action.agent.includes("Task") ? "bg-indigo-500" : "bg-blue-500"
                        }`} />
                        <span className="text-sm text-slate-300">{action.agent}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-slate-400 text-sm">
                        <Calendar className="w-3 h-3" />
                        {new Date(action.timestamp).toLocaleDateString()}
                        <span className="text-slate-600">•</span>
                        {new Date(action.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                        action.status === "Approved" 
                          ? "bg-green-500/10 border-green-500/20 text-green-400" 
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}>
                        {action.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-xs font-bold text-slate-300">{Math.round(action.confidence * 100)}%</span>
                        <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${action.confidence > 0.8 ? 'bg-indigo-500' : 'bg-amber-500'}`}
                            style={{ width: `${action.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredActions.length === 0 && (
            <div className="p-20 text-center text-slate-500">
              <Clock className="w-10 h-10 mx-auto mb-4 opacity-20" />
              <p>No actions found for this filter.</p>
            </div>
          )}

          <div className="p-6 border-t border-white/5 bg-slate-900/50 flex justify-between items-center text-xs text-slate-500">
            <p>Showing {filteredActions.length} of {mergedHistory.length} entries</p>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 transition-colors" disabled>Previous</button>
              <button className="px-3 py-1 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 transition-colors" disabled>Next</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
