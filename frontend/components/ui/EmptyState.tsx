import * as React from "react";
import { LucideIcon, FolderSearch, Plus } from "lucide-react";
import { Button } from "./Button";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  isSearchEmpty?: boolean;
  onClearSearch?: () => void;
}

export function EmptyState({
  icon: Icon = FolderSearch,
  title,
  description,
  actionLabel,
  onAction,
  isSearchEmpty = false,
  onClearSearch,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-[#eaeded] rounded-xs">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f2f3f3] text-[#545b64] mb-3">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-[#16191f]">{title}</h3>
      <p className="mt-1 text-xs text-[#545b64] max-w-sm">{description}</p>
      
      <div className="mt-4 flex gap-2">
        {isSearchEmpty && onClearSearch && (
          <Button variant="secondary" size="sm" onClick={onClearSearch}>
            Clear search filters
          </Button>
        )}
        {actionLabel && onAction && (
          <Button variant="primary" size="sm" onClick={onAction}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
