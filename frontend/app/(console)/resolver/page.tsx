import React from "react";
import { Network } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export default function ResolverPage() {
  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[{ label: "Route 53", href: "/dashboard" }, { label: "Resolver" }]}
      />

      <div className="bg-white p-6 border border-[#eaeded] rounded-xs shadow-2xs">
        <div className="flex items-center gap-3 border-b border-[#eaeded] pb-4">
          <div className="p-2 bg-[#ebf3fb] text-[#0073bb] rounded-xs">
            <Network className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#16191f]">Route 53 Resolver</h1>
            <p className="text-xs text-[#545b64]">
              Recursive DNS for VPCs, hybrid cloud environments, and DNS firewall filtering.
            </p>
          </div>
        </div>

        <div className="py-16 text-center text-xs text-[#545b64] max-w-md mx-auto space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f2f3f3] text-[#545b64]">
            <Network className="h-6 w-6" />
          </div>
          <h2 className="text-sm font-semibold text-[#16191f]">Resolver Endpoints Coming Soon</h2>
          <p>
            Inbound and outbound resolver endpoints for on-premises hybrid DNS integration will be supported in future releases.
          </p>
        </div>
      </div>
    </div>
  );
}
