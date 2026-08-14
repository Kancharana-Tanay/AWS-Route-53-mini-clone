import React from "react";
import { Activity } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export default function HealthChecksPage() {
  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[{ label: "Route 53", href: "/dashboard" }, { label: "Health checks" }]}
      />

      <div className="bg-white p-6 border border-[#eaeded] rounded-xs shadow-2xs">
        <div className="flex items-center gap-3 border-b border-[#eaeded] pb-4">
          <div className="p-2 bg-[#ebf3fb] text-[#0073bb] rounded-xs">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#16191f]">Route 53 Health Checks</h1>
            <p className="text-xs text-[#545b64]">
              Monitor web applications, HTTP/HTTPS endpoints, and calculate failover health.
            </p>
          </div>
        </div>

        <div className="py-16 text-center text-xs text-[#545b64] max-w-md mx-auto space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f2f3f3] text-[#545b64]">
            <Activity className="h-6 w-6" />
          </div>
          <h2 className="text-sm font-semibold text-[#16191f]">Health Check Monitoring Coming Soon</h2>
          <p>
            Automated health probes from multiple AWS regions will be integrated to support automated DNS failover routing.
          </p>
        </div>
      </div>
    </div>
  );
}
