import React from "react";
import { Sliders } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

export default function ProfilesPage() {
  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[{ label: "Route 53", href: "/dashboard" }, { label: "Profiles" }]}
      />

      <div className="bg-white p-6 border border-[#eaeded] rounded-xs shadow-2xs">
        <div className="flex items-center gap-3 border-b border-[#eaeded] pb-4">
          <div className="p-2 bg-[#ebf3fb] text-[#0073bb] rounded-xs">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#16191f]">Route 53 Profiles</h1>
            <p className="text-xs text-[#545b64]">
              Manage DNS configuration profiles across multiple accounts and VPCs.
            </p>
          </div>
        </div>

        <div className="py-16 text-center text-xs text-[#545b64] max-w-md mx-auto space-y-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f2f3f3] text-[#545b64]">
            <Sliders className="h-6 w-6" />
          </div>
          <h2 className="text-sm font-semibold text-[#16191f]">Route 53 Profiles Coming Soon</h2>
          <p>
            Standardize DNS configurations across AWS accounts using shared profiles and automated VPC association.
          </p>
        </div>
      </div>
    </div>
  );
}
