"use client";

import * as React from "react";
import { DNSRecord } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";

export interface RecordsTableProps {
  records: DNSRecord[];
  isLoading: boolean;
  selectedRecordIds: Set<number>;
  onToggleSelectRecord: (recordId: number) => void;
  onToggleSelectAll: () => void;
  isSearchOrFilterActive?: boolean;
  onClearFilters?: () => void;
  onCreateRecord?: () => void;
}

export function RecordsTable({
  records,
  isLoading,
  selectedRecordIds,
  onToggleSelectRecord,
  onToggleSelectAll,
  isSearchOrFilterActive,
  onClearFilters,
  onCreateRecord,
}: RecordsTableProps) {
  if (isLoading) {
    return <LoadingState rows={6} />;
  }

  if (records.length === 0) {
    if (isSearchOrFilterActive) {
      return (
        <EmptyState
          title="No matching records"
          description="No DNS records match the current search or type filter criteria."
          isSearchEmpty
          onClearSearch={onClearFilters}
        />
      );
    }
    return (
      <EmptyState
        title="No records found"
        description="This hosted zone currently does not have any user records."
        actionLabel="Create record"
        onAction={onCreateRecord}
      />
    );
  }

  const allSelected =
    records.length > 0 && records.every((r) => selectedRecordIds.has(r.id));
  const someSelected =
    records.some((r) => selectedRecordIds.has(r.id)) && !allSelected;

  return (
    <div className="bg-white border-x border-b border-[#eaeded] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[#16191f]">
          <thead className="bg-[#fafafa] border-b border-[#eaeded] text-[#545b64] font-bold select-none">
            <tr>
              <th scope="col" className="w-10 px-3 py-2.5 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={onToggleSelectAll}
                  aria-label="Select all records on this page"
                  className="h-3.5 w-3.5 rounded-xs border-[#aab7b8] text-[#ec7211] focus:ring-[#0073bb] cursor-pointer"
                />
              </th>
              <th scope="col" className="px-4 py-2.5">
                Record name
              </th>
              <th scope="col" className="px-4 py-2.5">
                Type
              </th>
              <th scope="col" className="px-4 py-2.5">
                Routing policy
              </th>
              <th scope="col" className="px-4 py-2.5">
                Value / Route traffic to
              </th>
              <th scope="col" className="px-4 py-2.5">
                TTL (seconds)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#eaeded]">
            {records.map((rec) => {
              const isSelected = selectedRecordIds.has(rec.id);

              return (
                <tr
                  key={rec.id}
                  onClick={() => onToggleSelectRecord(rec.id)}
                  className={`hover:bg-[#f2f8fc] transition-colors cursor-pointer ${
                    isSelected ? "bg-[#ebf3fb]" : ""
                  }`}
                >
                  {/* Selection Checkbox */}
                  <td
                    className="px-3 py-3 text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onToggleSelectRecord(rec.id)}
                      aria-label={`Select record ${rec.name}`}
                      className="h-3.5 w-3.5 rounded-xs border-[#aab7b8] text-[#ec7211] focus:ring-[#0073bb] cursor-pointer"
                    />
                  </td>

                  {/* Record Name */}
                  <td className="px-4 py-3 font-semibold font-mono text-[#16191f] whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <span>{rec.name}</span>
                      {rec.is_system_record && (
                        <Badge variant="system" title="Default AWS system-generated record">
                          System
                        </Badge>
                      )}
                    </div>
                  </td>

                  {/* Type */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Badge variant={getBadgeVariantForType(rec.type)}>
                      {rec.type}
                    </Badge>
                  </td>

                  {/* Routing Policy */}
                  <td className="px-4 py-3 text-[#545b64] whitespace-nowrap">
                    {rec.routing_policy === "SIMPLE" ? "Simple" : rec.routing_policy}
                  </td>

                  {/* Values */}
                  <td className="px-4 py-3 font-mono text-[11px] text-[#16191f] max-w-md">
                    {rec.values.length === 1 ? (
                      <div className="truncate" title={rec.values[0]}>
                        {rec.values[0]}
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        {rec.values.map((val, idx) => (
                          <div key={idx} className="truncate" title={val}>
                            {val}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* TTL */}
                  <td className="px-4 py-3 text-[#545b64] font-mono whitespace-nowrap">
                    {rec.ttl}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function getBadgeVariantForType(
  type: string
): "blue" | "green" | "gray" | "warning" | "default" {
  switch (type) {
    case "A":
    case "AAAA":
      return "blue";
    case "CNAME":
      return "green";
    case "MX":
    case "TXT":
      return "warning";
    case "NS":
    case "SOA":
      return "gray";
    default:
      return "default";
  }
}
