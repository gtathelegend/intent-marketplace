"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Mail, Calendar, Slack, CheckCircle, Zap, Shield, Sparkles } from "lucide-react";

export default function Home() {
  const steps = [
    { title: "Context", description: "Your daily interactions (Email, Slack, Notes)", icon: <Mail className="w-6 h-6" /> },
    { title: "Intent Extraction", description: "AI identifies goals from your context", icon: <Sparkles className="w-6 h-6" /> },
    { title: "Suggested Actions", description: "Personalized task proposals", icon: <Zap className="w-6 h-6" /> },
    { title: "Swipe to Execute", description: "Complete tasks with a single action", icon: <CheckCircle className="w-6 h-6" /> },
  ];

  const intents = [
    { from: "Email from Professor", to: "Schedule study session", icon: <Mail className="text-blue-500" /> },
    { from: "Meeting Invite", to: "Add calendar event", icon: <Calendar className="text-green-500" /> },
    { from: "Slack Message", to: "Create task", icon: <Slack className="text-purple-500" /> },
  ];

  const agents = [
    { name: "Calendar Agent", desc: "Manages your schedule seamlessly.", icon: <Calendar className="w-10 h-10 text-green-500" /> },
    { name: "Research Agent", desc: "Deep dives into topics for you.", icon: <Sparkles className="w-10 h-10 text-blue-500" /> },
    { name: "Email Draft Agent", desc: "Writes perfectly tailored replies.", icon: <Mail className="w-10 h-10 text-indigo-500" /> },
    { name: "Task Manager Agent", desc: "Keeps your to-do list organized.", icon: <Shield className="w-10 h-10 text-red-500" /> },
  ];

  return (
    <div className="min-h-screen text-slate-900 font-sans selection:bg-indigo-200/60">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-200/60 via-violet-100/30 to-transparent -z-10 blur-3xl" />
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-200/60 rounded-full text-indigo-600 text-xs font-semibold mb-8 shadow-sm"
          >
            <Sparkles className="w-3 h-3" /> AI-Powered Intent Engine
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-br from-slate-900 via-indigo-800 to-violet-700"
          >
            Turn Your Intent Into <br /> Action Instantly
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            AI understands your emails, reminders, and context, and proposes intelligent actions executed by specialized agents.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={() => document.getElementById("agents")?.scrollIntoView({ behavior: "smooth" })}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-semibold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-indigo-300/40"
            >
              Discover Agents <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              href="/intents"
              className="px-8 py-4 bg-white/70 hover:bg-white backdrop-blur-sm border border-slate-200 hover:border-indigo-200 rounded-full font-semibold transition-all text-center text-slate-700 shadow-sm"
            >
              View My Intents
            </Link>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-3 text-slate-900">The Action Pipeline</h2>
            <p className="text-slate-500">Four steps from raw context to executed action.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {steps.map((step, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -6, scale: 1.02 }}
                className="relative p-8 bg-white/60 backdrop-blur-lg border border-white/70 rounded-2xl flex flex-col items-center text-center group shadow-sm hover:shadow-md hover:shadow-indigo-100/50 transition-all"
              >
                <div className="w-14 h-14 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-500 mb-6 group-hover:scale-110 transition-transform shadow-sm">
                  {step.icon}
                </div>
                <div className="absolute -top-3 -left-3 w-7 h-7 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-black shadow-md shadow-indigo-200">
                  {idx + 1}
                </div>
                <h3 className="text-lg font-bold mb-2 text-slate-900">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 translate-x-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="text-slate-300 w-5 h-5" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Example Intent Feed */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-3 text-slate-900">Intent Feed</h2>
            <p className="text-slate-500">Seamless transformations happening in real-time.</p>
          </div>
          <div className="space-y-4">
            {intents.map((intent, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-center justify-between p-6 bg-white/60 backdrop-blur-lg border border-white/70 rounded-2xl hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-50/80 transition-all shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl shadow-sm">{intent.icon}</div>
                  <span className="font-medium text-slate-700">{intent.from}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300" />
                <div className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-full text-sm font-semibold border border-indigo-100 shadow-sm">
                  {intent.to}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Agent Marketplace */}
      <section id="agents" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-3xl font-bold mb-3 text-slate-900">Agent Marketplace</h2>
              <p className="text-slate-500">Deploy specialized AI agents for any task.</p>
            </div>
            <button className="text-indigo-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all text-sm">
              Browse all <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map((agent, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ scale: 1.03, y: -4 }}
                className="p-8 bg-white/60 backdrop-blur-lg border border-white/70 rounded-3xl group cursor-pointer shadow-sm hover:shadow-lg hover:shadow-slate-200/60 transition-all"
              >
                <div className="mb-6 transform group-hover:scale-110 transition-transform">{agent.icon}</div>
                <h3 className="text-lg font-bold mb-2 text-slate-900">{agent.name}</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">{agent.desc}</p>
                <button className="w-full py-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-all">
                  Install Agent
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200/60 text-center text-slate-400 text-sm">
        <p>&copy; 2026 Intent → Action Marketplace. All rights reserved.</p>
      </footer>
    </div>
  );
}
