"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap, LayoutDashboard, Layers } from "lucide-react";

const links = [
  { href: "/", label: "Home", icon: <Zap className="w-4 h-4" /> },
  { href: "/intents", label: "Intent Feed", icon: <Layers className="w-4 h-4" /> },
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
      <div className="w-full max-w-2xl flex items-center justify-between bg-white/70 backdrop-blur-xl rounded-full shadow-lg shadow-slate-200/50 border border-white/60 px-5 py-2.5">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 tracking-tight">
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-xs font-black text-white shadow-md shadow-indigo-300/50">I</div>
          IntentOS
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {links.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  active
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                {icon}
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
