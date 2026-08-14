import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "link";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "secondary",
      size = "sm",
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0073bb] focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer";

    const variantStyles = {
      primary:
        "bg-[#ec7211] hover:bg-[#eb5f07] active:bg-[#dd5a05] text-white border border-[#ec7211] shadow-xs",
      secondary:
        "bg-white hover:bg-[#f2f3f3] active:bg-[#eaeded] text-[#16191f] border border-[#aab7b8] shadow-xs",
      danger:
        "bg-[#d13212] hover:bg-[#b02509] active:bg-[#901e07] text-white border border-[#d13212] shadow-xs",
      ghost:
        "bg-transparent hover:bg-slate-100 text-[#16191f] border border-transparent",
      outline:
        "bg-transparent hover:bg-slate-50 text-[#0073bb] border border-[#0073bb]",
      link:
        "bg-transparent text-[#0073bb] hover:underline p-0 h-auto border-none",
    };

    const sizeStyles = {
      sm: "h-8 px-3 text-xs rounded-xs gap-1.5",
      md: "h-9 px-4 text-sm rounded-xs gap-2",
      lg: "h-10 px-5 text-sm rounded-xs gap-2",
      icon: "h-8 w-8 rounded-xs",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-0.5 mr-1.5 h-3.5 w-3.5 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
