import * as React from "react";

export function LoadingState({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full bg-white border border-[#eaeded] rounded-xs overflow-hidden">
      <div className="h-10 bg-[#fafafa] border-b border-[#eaeded] flex items-center px-4">
        <div className="h-3.5 bg-slate-200 rounded-xs w-1/4 animate-pulse"></div>
      </div>
      <div className="divide-y divide-[#eaeded]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="h-3 bg-slate-200 rounded-xs w-1/3 animate-pulse"></div>
              <div className="h-2.5 bg-slate-100 rounded-xs w-1/4 animate-pulse"></div>
            </div>
            <div className="h-4 bg-slate-200 rounded-xs w-16 animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ErrorState({
  title = "Failed to load data",
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="p-8 text-center bg-white border border-[#d13212]/30 rounded-xs">
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#fdf2f2] text-[#d13212] mb-3">
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h3 className="text-sm font-semibold text-[#16191f]">{title}</h3>
      <p className="mt-1 text-xs text-[#d13212]">{message || "An unexpected error occurred."}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 px-3 py-1.5 text-xs font-medium text-[#0073bb] bg-white border border-[#aab7b8] rounded-xs hover:bg-[#f2f3f3]"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
