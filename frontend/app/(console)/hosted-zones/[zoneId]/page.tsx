"use client";

import React, { useState, useEffect, useCallback, use, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Globe2, ArrowLeft, Layers } from "lucide-react";
import Link from "next/link";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Pagination } from "@/components/ui/Pagination";
import { ErrorState, LoadingState } from "@/components/ui/LoadingState";
import { RecordsToolbar } from "@/components/records/RecordsToolbar";
import { RecordsTable } from "@/components/records/RecordsTable";
import { DnsRecordDialog } from "@/components/records/DnsRecordDialog";
import { DeleteRecordDialog } from "@/components/records/DeleteRecordDialog";
import { hostedZonesApi } from "@/lib/api/hostedZones";
import { recordsApi } from "@/lib/api/records";
import { HostedZone, DNSRecord } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ zoneId: string }>;
}

function HostedZoneDetailContent({ zoneId }: { zoneId: number }) {

  const router = useRouter();
  const searchParams = useSearchParams();

  const searchQuery = searchParams.get("search") || "";
  const typeFilter = searchParams.get("type") || "";
  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const limitParam = parseInt(searchParams.get("limit") || "20", 10);

  const [zone, setZone] = useState<HostedZone | null>(null);
  const [records, setRecords] = useState<DNSRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [isLoadingZone, setIsLoadingZone] = useState(true);
  const [isLoadingRecords, setIsLoadingRecords] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Selection state (IDs of selected records)
  const [selectedRecordIds, setSelectedRecordIds] = useState<Set<number>>(
    new Set()
  );

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DNSRecord | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<DNSRecord | null>(null);

  // Sync URL parameters
  const updateUrlParams = useCallback(
    (newParams: {
      search?: string;
      type?: string;
      page?: number;
      limit?: number;
    }) => {
      const sp = new URLSearchParams(searchParams.toString());

      if (newParams.search !== undefined) {
        if (newParams.search) {
          sp.set("search", newParams.search);
        } else {
          sp.delete("search");
        }
        sp.set("page", "1");
      }

      if (newParams.type !== undefined) {
        if (newParams.type) {
          sp.set("type", newParams.type);
        } else {
          sp.delete("type");
        }
        sp.set("page", "1");
      }

      if (newParams.page !== undefined) {
        sp.set("page", newParams.page.toString());
      }

      if (newParams.limit !== undefined) {
        sp.set("limit", newParams.limit.toString());
        sp.set("page", "1");
      }

      router.push(`/hosted-zones/${zoneId}?${sp.toString()}`);
    },
    [router, searchParams, zoneId]
  );

  // Fetch zone details
  const fetchZone = useCallback(async () => {
    try {
      const z = await hostedZonesApi.getById(zoneId);
      setZone(z);
    } catch (err: any) {
      setError(err?.message || "Hosted zone not found.");
    } finally {
      setIsLoadingZone(false);
    }
  }, [zoneId]);

  // Fetch records
  const fetchRecords = useCallback(async () => {
    try {
      const res = await recordsApi.listByZone(zoneId, {
        search: searchQuery || undefined,
        type: typeFilter || undefined,
        page: pageParam,
        limit: limitParam,
      });

      setRecords(res.items);
      setTotal(res.total);
      setTotalPages(res.total_pages);
      // Clear selection on page or data change
      setSelectedRecordIds(new Set());
    } catch (err: any) {
      setError(err?.message || "Failed to load DNS records.");
    } finally {
      setIsLoadingRecords(false);
      setIsRefreshing(false);
    }
  }, [zoneId, searchQuery, typeFilter, pageParam, limitParam]);

  useEffect(() => {
    setIsLoadingZone(true);
    fetchZone();
  }, [fetchZone]);

  useEffect(() => {
    setIsLoadingRecords(true);
    fetchRecords();
  }, [fetchRecords]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchZone();
    fetchRecords();
  };

  // Selection handlers
  const handleToggleSelectRecord = (id: number) => {
    setSelectedRecordIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (records.every((r) => selectedRecordIds.has(r.id))) {
      setSelectedRecordIds(new Set());
    } else {
      setSelectedRecordIds(new Set(records.map((r) => r.id)));
    }
  };

  const selectedRecords = records.filter((r) => selectedRecordIds.has(r.id));

  if (isLoadingZone) {
    return <LoadingState rows={4} />;
  }

  if (error || !zone) {
    return (
      <div className="space-y-4">
        <Breadcrumbs
          items={[
            { label: "Route 53", href: "/dashboard" },
            { label: "Hosted zones", href: "/hosted-zones" },
            { label: `Zone #${zoneId}` },
          ]}
        />
        <ErrorState
          title="Hosted zone unavailable"
          message={error || "The requested hosted zone does not exist."}
          onRetry={handleRefresh}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Route 53", href: "/dashboard" },
          { label: "Hosted zones", href: "/hosted-zones" },
          { label: zone.name },
        ]}
      />

      {/* Zone Details Summary Header */}
      <div className="bg-white p-5 border border-[#eaeded] rounded-xs shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eaeded] pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/hosted-zones"
              className="p-1 rounded-xs hover:bg-[#eaeded] text-[#545b64] hover:text-[#16191f] transition-colors"
              aria-label="Back to hosted zones list"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-[#0073bb]" />
                <h1 className="text-lg font-bold text-[#16191f] font-mono">
                  {zone.name}
                </h1>
              </div>
              <p className="text-xs text-[#545b64] mt-0.5">
                {zone.comment || "No description provided for this hosted zone."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-[#545b64]">
            <div className="flex items-center gap-1.5">
              <Layers className="h-4 w-4 text-[#0073bb]" />
              <span>
                Total records:{" "}
                <strong className="text-[#16191f] font-mono">{total}</strong>
              </span>
            </div>
            <div>
              <span>Created: </span>
              <strong className="text-[#16191f]">
                {formatDate(zone.created_at)}
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Records Section */}
      <div className="space-y-0 shadow-2xs">
        {/* Contextual Toolbar */}
        <RecordsToolbar
          selectedRecords={selectedRecords}
          search={searchQuery}
          onSearchChange={(val) => updateUrlParams({ search: val })}
          typeFilter={typeFilter}
          onTypeFilterChange={(val) => updateUrlParams({ type: val })}
          onCreateRecord={() => setIsCreateOpen(true)}
          onEditRecord={(record) => setEditingRecord(record)}
          onDeleteRecord={(record) => setDeletingRecord(record)}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
        />

        {/* Records Table */}
        <RecordsTable
          records={records}
          isLoading={isLoadingRecords}
          selectedRecordIds={selectedRecordIds}
          onToggleSelectRecord={handleToggleSelectRecord}
          onToggleSelectAll={handleToggleSelectAll}
          isSearchOrFilterActive={!!searchQuery || !!typeFilter}
          onClearFilters={() => updateUrlParams({ search: "", type: "" })}
          onCreateRecord={() => setIsCreateOpen(true)}
        />

        {/* Pagination */}
        {!isLoadingRecords && total > 0 && (
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

      {/* Create Record Dialog */}
      {zone && (
        <DnsRecordDialog
          zone={zone}
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
          onSuccess={() => {
            fetchZone();
            fetchRecords();
          }}
        />
      )}

      {/* Edit Record Dialog */}
      {zone && editingRecord && (
        <DnsRecordDialog
          zone={zone}
          record={editingRecord}
          open={!!editingRecord}
          onOpenChange={(open) => !open && setEditingRecord(null)}
          onSuccess={() => {
            setEditingRecord(null);
            fetchRecords();
          }}
        />
      )}

      {/* Delete Record Dialog */}
      <DeleteRecordDialog
        record={deletingRecord}
        open={!!deletingRecord}
        onOpenChange={(open) => !open && setDeletingRecord(null)}
        onSuccess={() => {
          setDeletingRecord(null);
          fetchZone();
          fetchRecords();
        }}
      />
    </div>
  );
}

export default function HostedZoneDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const zoneId = parseInt(resolvedParams.zoneId, 10);

  return (
    <Suspense fallback={<LoadingState rows={6} />}>
      <HostedZoneDetailContent zoneId={zoneId} />
    </Suspense>
  );
}
