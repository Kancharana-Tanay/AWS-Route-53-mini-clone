import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  helperText?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, helperText, label, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-[#16191f]"
          >
            {label} {props.required && <span className="text-[#d13212]">*</span>}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          ref={ref}
          className={cn(
            "flex h-8 w-full rounded-xs border bg-white px-2.5 py-1 text-xs text-[#16191f] shadow-2xs transition-colors",
            "border-[#aab7b8] placeholder:text-[#68707f]",
            "focus-visible:outline-none focus-visible:border-[#0073bb] focus-visible:ring-1 focus-visible:ring-[#0073bb]",
            "disabled:cursor-not-allowed disabled:bg-[#eaeded] disabled:text-[#68707f]",
            error && "border-[#d13212] focus-visible:border-[#d13212] focus-visible:ring-[#d13212]",
            className
          )}
          {...props}
        />
        {error && <p className="text-[11px] text-[#d13212] font-medium">{error}</p>}
        {!error && helperText && (
          <p className="text-[11px] text-[#545b64]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
