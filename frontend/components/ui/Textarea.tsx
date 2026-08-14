import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  helperText?: string;
  label?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, helperText, label, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold text-[#16191f]"
          >
            {label} {props.required && <span className="text-[#d13212]">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          ref={ref}
          className={cn(
            "flex w-full rounded-xs border bg-white px-2.5 py-1.5 text-xs font-mono text-[#16191f] shadow-2xs transition-colors",
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

Textarea.displayName = "Textarea";
