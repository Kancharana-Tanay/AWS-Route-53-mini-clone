"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe2,
  Share2,
  Activity,
  Network,
  Sliders,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Hosted Zones",
    href: "/hosted-zones",
    icon: Globe2,
    matchPrefix: true,
  },
  {
    name: "Traffic Policies",
    href: "/traffic-policies",
    icon: Share2,
  },
  {
    name: "Health Checks",
    href: "/health-checks",
    icon: Activity,
  },
  {
    name: "Resolver",
    href: "/resolver",
    icon: Network,
  },
  {
    name: "Profiles",
    href: "/profiles",
    icon: Sliders,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-[#ffffff] border-r border-[#eaeded] min-h-[calc(100vh-2.5rem)] flex flex-col justify-between select-none">
      <div>
        {/* Service Title */}
        <div className="px-4 py-3 border-b border-[#eaeded]">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#545b64]">
            Route 53
          </h2>
        </div>

        {/* Navigation links */}
        <nav className="py-2 space-y-0.5" aria-label="Sidebar navigation">
          {NAV_ITEMS.map((item) => {
            const isActive = item.matchPrefix
              ? pathname.startsWith(item.href)
              : pathname === item.href;

            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-2 text-xs transition-colors relative",
                  isActive
                    ? "bg-[#ebf3fb] text-[#0073bb] font-bold border-l-3 border-[#ec7211]"
                    : "text-[#16191f] hover:bg-[#f2f3f3] font-normal border-l-3 border-transparent"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 shrink-0",
                    isActive ? "text-[#0073bb]" : "text-[#545b64]"
                  )}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#eaeded] bg-[#fafafa] text-[11px] text-[#545b64]">
        <p className="font-semibold text-[#16191f]">AWS Route 53 Clone</p>
        <p className="text-[10px] mt-0.5">Authoritative DNS Management</p>
      </div>
    </aside>
  );
}
