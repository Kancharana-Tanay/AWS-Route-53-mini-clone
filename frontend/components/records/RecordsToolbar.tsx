"use client";

import React from "react";
import { Plus, Edit2, Trash2, RefreshCw, Filter } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { DNSRecord, RecordType } from "@/lib/types";

export interface RecordsToolbarProps {
  selectedRecords: DNSRecord[];
  search: string;
  onSearchChange: (search: string) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  onCreateRecord: () => void;
  onEditRecord: (record: DNSRecord) => void;
  onDeleteRecord: (record: DNSRecord) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

const FILTER_TYPES = [
  "ALL",
  "A",
  "AAAA",
  "CNAME",
  "TXT",
  "MX",
  "NS",
  "PTR",
  "SRV",
  "CAA",
  "SOA",
];

export function RecordsToolbar({
  selectedRecords,
  search,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  onCreateRecord,
  onEditRecord,
  onDeleteRecord,
  onRefresh,
  isRefreshing = false,
}: RecordsToolbarProps) {
  const selectedCount = selectedRecords.length;
  const singleSelected = selectedCount === 1 ? selectedRecords[0] : null;
  const isSystemRecord = singleSelected?.is_system_record ?? false;

  // AWS Contextual toolbar action rules:
  // 0 selected: Edit disabled, Delete disabled
  // Exactly 1 selected: Edit enabled (if not system), Delete enabled (if not system)
  // > 1 selected: Edit disabled, Delete disabled
  const canEdit = selectedCount === 1 && !isSystemRecord;
  const canDelete = selectedCount === 1 && !isSystemRecord;

  return (
    <div className="flex flex-col gap-3 p-4 bg-white border border-[#eaeded] rounded-t-xs">
      {/* Top Bar: Action Buttons and Contextual Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Create record */}
          <Button variant="primary" size="sm" onClick={onCreateRecord}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Create record
          </Button>

          {/* Edit record */}
          <Button
            variant="secondary"
            size="sm"
            disabled={!canEdit}
            onClick={() => singleSelected && onEditRecord(singleSelected)}
            title={
              selectedCount === 0
                ? "Select a record to edit"
                : selectedCount > 1
                ? "Select only one record to edit"
                : isSystemRecord
                ? "System records (NS/SOA) cannot be edited"
                : "Edit selected record"
            }
          >
            <Edit2 className="h-3.5 w-3.5 mr-1" />
            Edit record
          </Button>

          {/* Delete record */}
          <Button
            variant="secondary"
            size="sm"
            disabled={!canDelete}
            onClick={() => singleSelected && onDeleteRecord(singleSelected)}
            className={canDelete ? "text-[#d13212] hover:bg-[#fdf2f2] border-[#d13212]/40" : ""}
            title={
              selectedCount === 0
                ? "Select a record to delete"
                : selectedCount > 1
                ? "Select only one record to delete"
                : isSystemRecord
                ? "System records (NS/SOA) cannot be deleted"
                : "Delete selected record"
            }
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete record
          </Button>
        </div>

        {/* Refresh button & Selection count indicator */}
        <div className="flex items-center gap-3 text-xs text-[#545b64]">
          {selectedCount > 0 && (
            <span className="font-medium bg-[#ebf3fb] text-[#0073bb] px-2 py-0.5 rounded-xs border border-[#a0c7e4]">
              {selectedCount} record{selectedCount > 1 ? "s" : ""} selected
            </span>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            isLoading={isRefreshing}
            aria-label="Refresh records list"
            title="Refresh"
            className="h-8 w-8"
          >
            <RefreshCw className="h-3.5 w-3.5 text-[#545b64]" />
          </Button>
        </div>
      </div>

      {/* Bottom Bar: Search & Type Filter */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[#eaeded]">
        {/* Search */}
        <div className="flex-1 min-w-[200px] max-w-sm">
          <SearchInput
            value={search}
            onChange={onSearchChange}
            placeholder="Filter by record name..."
          />
        </div>

        {/* Type Filter */}
        <div className="flex items-center gap-1.5 text-xs text-[#545b64]">
          <Filter className="h-3.5 w-3.5 text-[#68707f]" />
          <span>Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value)}
            className="h-8 rounded-xs border border-[#aab7b8] bg-white px-2 py-1 text-xs text-[#16191f] focus:outline-none focus:border-[#0073bb]"
          >
            {FILTER_TYPES.map((t) => (
              <option key={t} value={t === "ALL" ? "" : t}>
                {t === "ALL" ? "All record types" : `${t} record`}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
