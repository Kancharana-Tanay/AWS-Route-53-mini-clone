import React from "react";
import { Share2 } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export default function TrafficPoliciesPage() {
  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[{ label: "Route 53", href: "/dashboard" }, { label: "Traffic policies" }]}
      />

      <div className="bg-white p-6 border border-[#eaeded] rounded-xs shadow-2xs">
        <div className="flex items-center gap-3 border-b border-[#eaeded] pb-4">
          <div className="p-2 bg-[#ebf3fb] text-[#0073bb] rounded-xs">
            <Share2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#16191f]">Traffic Policies</h1>
            <p className="text-xs text-[#545b64]">
              Visual traffic flow routing policies for complex geo, latency, and failover topologies.
            </p>
          </div>
        </div>

        <div className="py-16 text-center text-xs text-[#545b64] max-w-md mx-auto space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f2f3f3] text-[#545b64]">
            <Share2 className="h-6 w-6" />
          </div>
          <h2 className="text-sm font-semibold text-[#16191f]">Traffic Flow Feature Coming Soon</h2>
          <p>
            Complex routing policies (Weighted, Geolocation, Latency, and Failover) will be enabled in an upcoming release. Currently, Simple Routing is supported in Hosted Zones.
          </p>
        </div>
      </div>
    </div>
  );
}
