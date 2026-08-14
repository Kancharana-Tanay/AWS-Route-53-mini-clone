"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  className,
  debounceMs = 300,
}: SearchInputProps) {
  const [localValue, setLocalValue] = React.useState(value);

  // Sync internal state when external value changes
  React.useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Debounce the change propagation
  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue);
      }
    }, debounceMs);

    return () => clearTimeout(handler);
  }, [localValue, onChange, debounceMs, value]);

  const handleClear = () => {
    setLocalValue("");
    onChange("");
  };

  return (
    <div className={cn("relative flex items-center w-full max-w-sm", className)}>
      <Search className="absolute left-2.5 h-3.5 w-3.5 text-[#68707f] pointer-events-none" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-8 w-full rounded-xs border border-[#aab7b8] bg-white pl-8 pr-7 py-1 text-xs text-[#16191f] shadow-2xs transition-colors",
          "placeholder:text-[#68707f]",
          "focus-visible:outline-none focus-visible:border-[#0073bb] focus-visible:ring-1 focus-visible:ring-[#0073bb]"
        )}
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2 text-[#68707f] hover:text-[#16191f] p-0.5 rounded-xs focus:outline-none"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
