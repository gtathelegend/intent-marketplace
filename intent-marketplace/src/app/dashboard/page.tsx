"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  Search,
  RefreshCcw
} from "lucide-react";
import { motion } from "framer-motion";

interface Execution {
  id: string;
  status: string;
  result_message: string;
  executed_at: string;
  intent_summary: string;
  source_text: string;
  agent_name: string;
}

export default function DashboardPage() {
  const [executions, setExecutions] = useState<Execution[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  const fetchExecutions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/executions");
      const data = await res.json();
      setExecutions(data.executions || []);
    } catch (err) {
      console.error("Failed to fetch executions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExecutions();
  }, []);

  const filteredActions = filter === "All" 
    ? executions 
    : executions.filter(a => a.status === (filter === "Approved" ? "success" : "failed"));

  const stats = [
    { label: "Total Executions", value: executions.length.toString(), icon: <Zap className="w-5 h-5 text-indigo-400" /> },
    { label: "Success", value: executions.filter(e => e.status === 'success').length.toString(), icon: <CheckCircle2 className="w-5 h-5 text-green-400" /> },
    { label: "Failed", value: executions.filter(e => e.status === 'failed').length.toString(), icon: <XCircle className="w-5 h-5 text-red-400" /> },
    { label: "Uptime", value: "99.9%", icon: <ArrowUpRight className="w-5 h-5 text-blue-400" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-slate-900/50 hidden md:flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold">I</div>
          <span className="font-bold text-lg tracking-tight">IntentOS</span>
        </div>
        <nav className="space-y-2 flex-1">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/5 text-indigo-400 font-medium"><LayoutDashboard className="w-5 h-5" /> Dashboard</Link>
          <Link href="/intents" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"><Zap className="w-5 h-5" /> Intent Feed</Link>
          <Link href="/#agents" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"><User className="w-5 h-5" /> Agents</Link>
          <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"><Settings className="w-5 h-5" /> Home</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-1">Activity Dashboard</h1>
            <p className="text-slate-500 text-sm">Real-time execution logs from your database.</p>
          </div>
          <button onClick={fetchExecutions} className="p-2 hover:bg-white/5 rounded-xl transition-colors">
            <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="p-6 bg-slate-900 border border-white/5 rounded-3xl">
              <div className="p-2 bg-white/5 rounded-xl w-fit mb-4">{stat.icon}</div>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-bold">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* History Table */}
        <section className="bg-slate-900 border border-white/5 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-900/50">
            <h2 className="text-xl font-bold">Execution Logs</h2>
            <div className="flex gap-2">
              {["All", "Success", "Failed"].map((f) => (
                <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${filter === f ? "bg-indigo-600 text-white" : "bg-white/5 text-slate-400 hover:text-white"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
                <div className="p-20 text-center text-slate-500">Loading history...</div>
            ) : (
                <table className="w-full text-left">
                <thead>
                    <tr className="text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-white/5">
                    <th className="px-6 py-4">Intent</th>
                    <th className="px-6 py-4">Agent</th>
                    <th className="px-6 py-4">Result</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Timestamp</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {filteredActions.map((action) => (
                    <tr key={action.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-5">
                            <p className="text-sm font-medium text-slate-200 line-clamp-1">{action.intent_summary}</p>
                        </td>
                        <td className="px-6 py-5 text-sm text-slate-300">{action.agent_name}</td>
                        <td className="px-6 py-5 text-xs text-slate-400 italic">{action.result_message}</td>
                        <td className="px-6 py-5">
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                                action.status === "success" ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-red-500/10 border-red-500/20 text-red-400"
                            }`}>
                                {action.status}
                            </span>
                        </td>
                        <td className="px-6 py-5 text-right text-slate-500 text-xs">
                            {new Date(action.executed_at).toLocaleString()}
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            )}
          </div>
          
          {!loading && filteredActions.length === 0 && (
            <div className="p-20 text-center text-slate-500">
              <Clock className="w-10 h-10 mx-auto mb-4 opacity-20" />
              <p>No executions found.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
