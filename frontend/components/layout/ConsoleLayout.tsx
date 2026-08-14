"use client";

import React from "react";
import { TopNav } from "./TopNav";
import { Sidebar } from "./Sidebar";
import { useAuth } from "@/lib/auth-context";

export function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2f3f3] flex flex-col">
        <TopNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2 text-xs text-[#545b64]">
            <svg
              className="animate-spin h-4 w-4 text-[#ec7211]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Verifying AWS Session...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f3f3] flex flex-col font-sans">
      <TopNav />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 bg-[#f2f3f3]">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
