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
    <nav className="fixed top-0 inset-x-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 font-bold text-white tracking-tight">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-xs font-black">I</div>
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
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
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
