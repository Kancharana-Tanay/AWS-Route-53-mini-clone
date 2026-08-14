"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Globe, User, LogOut, ChevronDown, Bell, Search, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export function TopNav() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-10 bg-[#232f3e] text-white flex items-center justify-between px-4 z-40 select-none">
      {/* Left: AWS Logo & Service Name */}
      <div className="flex items-center gap-4">
        <Link
          href="/hosted-zones"
          className="flex items-center gap-2 text-white hover:text-[#ff9900] transition-colors"
        >
          <div className="flex h-6 w-6 items-center justify-center rounded-xs bg-[#ff9900] text-[#232f3e] font-black text-xs">
            R53
          </div>
          <span className="text-xs font-bold tracking-tight flex items-center gap-1.5">
            AWS Route 53
            <span className="text-[10px] font-normal text-slate-400 border border-slate-600 px-1 py-0.2 rounded-xs">
              Console
            </span>
          </span>
        </Link>
      </div>

      {/* Center: Global Search Bar mock */}
      <div className="hidden md:flex items-center max-w-md w-full mx-6">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-1.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            readOnly
            placeholder="Search resources, services, and docs (Alt+S)"
            className="h-6 w-full rounded-xs bg-[#16191f] pl-8 pr-3 text-[11px] text-slate-300 placeholder:text-slate-400 border border-slate-700 focus:outline-none cursor-default"
          />
        </div>
      </div>

      {/* Right: Region & User session */}
      <div className="flex items-center gap-3 text-xs">
        {/* Region */}
        <div className="hidden sm:flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer px-2 py-1">
          <Globe className="h-3.5 w-3.5 text-[#ff9900]" />
          <span className="text-[11px]">Global (Route 53)</span>
        </div>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-xs hover:bg-[#16191f] text-slate-200 hover:text-white transition-colors cursor-pointer"
          >
            <div className="h-4.5 w-4.5 rounded-full bg-slate-600 flex items-center justify-center text-[10px] font-bold">
              {user?.username?.[0]?.toUpperCase() || "A"}
            </div>
            <span className="text-[11px] font-medium">{user?.username || "admin"}</span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-52 bg-white text-[#16191f] rounded-xs shadow-md border border-[#d5dbdb] py-1 z-50 animate-in fade-in-50 duration-100">
              <div className="px-3 py-2 border-b border-[#eaeded]">
                <p className="text-xs font-semibold">{user?.username}</p>
                <p className="text-[11px] text-[#545b64]">{user?.email}</p>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-[#1d8102]">
                  <ShieldCheck className="h-3 w-3" />
                  <span>Authenticated Session</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="w-full text-left px-3 py-2 text-xs text-[#d13212] hover:bg-[#fdf2f2] flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
