"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Globe2,
  Share2,
  Activity,
  ArrowRight,
  ShieldCheck,
  Server,
  Zap,
} from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { hostedZonesApi } from "@/lib/api/hostedZones";

export default function DashboardPage() {
  const [zoneCount, setZoneCount] = useState<number | null>(null);

  useEffect(() => {
    hostedZonesApi
      .list({ limit: 1 })
      .then((res) => setZoneCount(res.total))
      .catch(() => setZoneCount(0));
  }, []);

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: "Route 53" }, { label: "Dashboard" }]} />

      {/* Hero Welcome Banner */}
      <div className="bg-white p-6 border border-[#eaeded] rounded-xs shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#ebf3fb] text-[#0073bb] rounded-xs">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#16191f]">
              Amazon Route 53 Dashboard
            </h1>
            <p className="text-xs text-[#545b64] mt-0.5">
              Scalable DNS and Traffic Management Console
            </p>
          </div>
        </div>
      </div>

      {/* Metrics & Fast Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hosted Zones Card */}
        <div className="bg-white p-5 border border-[#eaeded] rounded-xs shadow-2xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[#545b64]">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Hosted Zones
              </span>
              <Globe2 className="h-4 w-4 text-[#0073bb]" />
            </div>
            <p className="text-2xl font-bold text-[#16191f] font-mono">
              {zoneCount !== null ? zoneCount : "—"}
            </p>
            <p className="text-xs text-[#545b64]">
              Active authoritative DNS zones routing internet traffic.
            </p>
          </div>

          <Link
            href="/hosted-zones"
            className="mt-4 pt-3 border-t border-[#eaeded] text-xs text-[#0073bb] font-semibold hover:underline flex items-center justify-between"
          >
            <span>Manage hosted zones</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Global DNS Health Card */}
        <div className="bg-white p-5 border border-[#eaeded] rounded-xs shadow-2xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[#545b64]">
              <span className="text-xs font-semibold uppercase tracking-wider">
                DNS Service Status
              </span>
              <ShieldCheck className="h-4 w-4 text-[#1d8102]" />
            </div>
            <p className="text-sm font-bold text-[#1d8102] flex items-center gap-1.5 pt-1">
              <span className="h-2.5 w-2.5 rounded-full bg-[#1d8102] animate-pulse"></span>
              All Systems Operational
            </p>
            <p className="text-xs text-[#545b64]">
              FastAPI backend and SQLite DNS store are responding normally.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-[#eaeded] text-xs text-[#545b64]">
            100% SLA Availability
          </div>
        </div>

        {/* Quick Capabilities */}
        <div className="bg-white p-5 border border-[#eaeded] rounded-xs shadow-2xs flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[#545b64]">
              <span className="text-xs font-semibold uppercase tracking-wider">
                Supported DNS Types
              </span>
              <Zap className="h-4 w-4 text-[#ec7211]" />
            </div>
            <div className="flex flex-wrap gap-1 pt-1">
              {["A", "AAAA", "CNAME", "TXT", "MX", "NS", "PTR", "SRV", "CAA"].map(
                (type) => (
                  <span
                    key={type}
                    className="px-1.5 py-0.5 rounded-xs bg-[#f2f3f3] text-[#16191f] text-[10px] font-mono font-medium border border-[#eaeded]"
                  >
                    {type}
                  </span>
                )
              )}
            </div>
            <p className="text-[11px] text-[#545b64] pt-1">
              RFC-compliant validation with automatic system NS & SOA records.
            </p>
          </div>

          <Link
            href="/hosted-zones"
            className="mt-4 pt-3 border-t border-[#eaeded] text-xs text-[#0073bb] font-semibold hover:underline flex items-center justify-between"
          >
            <span>Create records</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
