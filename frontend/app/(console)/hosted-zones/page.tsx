"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Plus, RefreshCw, Globe2 } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { Pagination } from "@/components/ui/Pagination";
import { ErrorState, LoadingState } from "@/components/ui/LoadingState";
import { HostedZonesTable } from "@/components/hosted-zones/HostedZonesTable";
import { CreateHostedZoneDialog } from "@/components/hosted-zones/CreateHostedZoneDialog";
import { hostedZonesApi } from "@/lib/api/hostedZones";
import { HostedZone } from "@/lib/types";

function HostedZonesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state
  const searchQuery = searchParams.get("search") || "";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const limitParam = parseInt(searchParams.get("limit") || "20", 10);

  const [zones, setZones] = useState<HostedZone[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Sync URL parameters
  const updateUrlParams = useCallback(
    (newParams: { search?: string; page?: number; limit?: number }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (newParams.search !== undefined) {
        if (newParams.search) {
          params.set("search", newParams.search);
        } else {
          params.delete("search");
        }
        // Reset to page 1 on search change
        params.set("page", "1");
      }

      if (newParams.page !== undefined) {
        params.set("page", newParams.page.toString());
      }

      if (newParams.limit !== undefined) {
        params.set("limit", newParams.limit.toString());
        params.set("page", "1");
      }

      router.push(`/hosted-zones?${params.toString()}`);
    },
    [router, searchParams]
  );

  const fetchZones = useCallback(async () => {
    setError(null);
    try {
      const response = await hostedZonesApi.list({
        search: searchQuery || undefined,
        page: pageParam,
        limit: limitParam,
      });

      setZones(response.items);
      setTotal(response.total);
      setTotalPages(response.total_pages);
    } catch (err: any) {
      setError(err?.message || "Failed to load hosted zones from server.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [searchQuery, pageParam, limitParam]);

  useEffect(() => {
    setIsLoading(true);
    fetchZones();
  }, [fetchZones]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchZones();
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Route 53", href: "/dashboard" },
          { label: "Hosted zones" },
        ]}
      />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 border border-[#eaeded] rounded-xs shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Globe2 className="h-5 w-5 text-[#0073bb]" />
            <h1 className="text-lg font-bold text-[#16191f]">Hosted zones</h1>
          </div>
          <p className="text-xs text-[#545b64] mt-1">
            Manage your DNS hosted zones and their resource records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            aria-label="Refresh hosted zones"
            title="Refresh"
            className="h-8 w-8"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#545b64]" />
          </Button>

          <Button
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Create hosted zone
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-3">
        {/* Toolbar with Search */}
        <div className="flex items-center justify-between gap-4 bg-white p-3 border border-[#eaeded] rounded-xs">
          <SearchInput
            value={searchQuery}
            onChange={(val) => updateUrlParams({ search: val })}
            placeholder="Search hosted zones by name or description..."
            className="max-w-md"
          />

          <div className="text-xs text-[#545b64]">
            <span>Total zones: </span>
            <strong className="text-[#16191f] font-mono">{total}</strong>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <ErrorState
            title="Unable to load hosted zones"
            message={error}
            onRetry={fetchZones}
          />
        )}

        {/* Hosted Zones Table */}
        {!error && (
          <div className="space-y-0">
            <HostedZonesTable
              zones={zones}
              isLoading={isLoading}
              onRefresh={fetchZones}
              isSearchActive={!!searchQuery}
              onClearSearch={() => updateUrlParams({ search: "" })}
              onCreateZone={() => setIsCreateModalOpen(true)}
            />

            {/* Pagination Controls */}
            {!isLoading && total > 0 && (
              <Pagination
                page={pageParam}
                limit={limitParam}
                total={total}
                totalPages={totalPages}
                onPageChange={(page) => updateUrlParams({ page })}
                onLimitChange={(limit) => updateUrlParams({ limit })}
              />
            )}
          </div>
        )}
      </div>

      {/* Create Hosted Zone Dialog */}
      <CreateHostedZoneDialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={fetchZones}
      />
    </div>
  );
}

export default function HostedZonesPage() {
  return (
    <Suspense fallback={<LoadingState rows={6} />}>
      <HostedZonesContent />
    </Suspense>
  );
}
