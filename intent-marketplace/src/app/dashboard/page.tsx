"use client";

import React, { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Zap, 
  Clock, 
  ArrowUpRight,
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
    : executions.filter(a => a.status === (filter === "Success" ? "success" : "failed"));

  const stats = [
    { label: "Total Executions", value: executions.length.toString(), icon: <Zap className="w-5 h-5 text-indigo-400" /> },
    { label: "Success", value: executions.filter(e => e.status === 'success').length.toString(), icon: <CheckCircle2 className="w-5 h-5 text-green-400" /> },
    { label: "Failed", value: executions.filter(e => e.status === 'failed').length.toString(), icon: <XCircle className="w-5 h-5 text-red-400" /> },
    { label: "Uptime", value: "99.9%", icon: <ArrowUpRight className="w-5 h-5 text-blue-400" /> },
  ];

  return (
    <div className="min-h-screen text-slate-900">
      {/* Page header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 sm:pt-8 pb-4 sm:pb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">Activity Dashboard</h1>
          <p className="text-slate-500 text-sm">Real-time execution logs from your database.</p>
        </div>
        <button
          onClick={fetchExecutions}
          className="p-2.5 bg-white/70 hover:bg-white border border-slate-200 hover:border-indigo-200 rounded-xl transition-all shadow-sm"
        >
          <RefreshCcw className={`w-5 h-5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-16">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="p-4 sm:p-6 bg-white/60 backdrop-blur-lg border border-white/70 rounded-2xl shadow-sm"
            >
              <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl w-fit mb-4 shadow-sm">{stat.icon}</div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* History Table */}
        <section className="bg-white/60 backdrop-blur-lg border border-white/70 rounded-3xl overflow-hidden shadow-sm">
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-900">Execution Logs</h2>
            <div className="flex gap-2">
              {["All", "Success", "Failed"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                    filter === f
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                      : "bg-slate-100 text-slate-500 hover:text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-10 sm:p-20 text-center text-slate-400">Loading history...</div>
            ) : (
              <table className="w-full min-w-[640px] text-left">
                <thead>
                  <tr className="text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                    <th className="px-3 sm:px-6 py-3 sm:py-4">Intent</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4">Agent</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4">Result</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4">Status</th>
                    <th className="px-3 sm:px-6 py-3 sm:py-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredActions.map((action) => (
                    <tr key={action.id} className="group hover:bg-indigo-50/30 transition-colors">
                      <td className="px-3 sm:px-6 py-3 sm:py-5">
                        <p className="text-sm font-medium text-slate-700 line-clamp-1">{action.intent_summary}</p>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-5 text-sm text-slate-600">{action.agent_name}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-5 text-xs text-slate-400 italic">{action.result_message}</td>
                      <td className="px-3 sm:px-6 py-3 sm:py-5">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                          action.status === "success"
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-red-50 border-red-200 text-red-600"
                        }`}>
                          {action.status}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-5 text-right text-slate-400 text-xs">
                        {new Date(action.executed_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {!loading && filteredActions.length === 0 && (
            <div className="p-10 sm:p-20 text-center text-slate-400">
              <Clock className="w-10 h-10 mx-auto mb-4 opacity-30" />
              <p>No executions found.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
