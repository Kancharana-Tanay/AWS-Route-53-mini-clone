import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "system" | "blue" | "green" | "gray" | "warning";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-[#eaeded] text-[#16191f] border-[#d5dbdb]",
    system: "bg-[#ebf3fb] text-[#0073bb] border-[#a0c7e4] font-medium",
    blue: "bg-[#e7f2fa] text-[#0972d3] border-[#a0c7e4]",
    green: "bg-[#e8f5e9] text-[#1d8102] border-[#81c784]",
    gray: "bg-[#f2f3f3] text-[#545b64] border-[#d5dbdb]",
    warning: "bg-[#fff8e1] text-[#8d6e63] border-[#ffe082]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded-xs text-[11px] font-mono border tracking-tight",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
