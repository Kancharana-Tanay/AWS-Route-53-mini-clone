"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  maxWidth = "lg",
}: ModalProps) {
  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  }[maxWidth];

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-150" />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 w-full translate-x-[-50%] translate-y-[-50%] rounded-sm bg-white p-0 shadow-lg border border-[#d5dbdb] focus:outline-none",
            "max-h-[90vh] flex flex-col",
            maxWidthClass
          )}
        >
          <div className="flex items-center justify-between border-b border-[#eaeded] px-6 py-4 bg-[#fafafa]">
            <div>
              <DialogPrimitive.Title className="text-sm font-bold text-[#16191f]">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="text-xs text-[#545b64] mt-0.5">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            <DialogPrimitive.Close asChild>
              <button
                type="button"
                className="rounded-xs p-1 text-[#545b64] hover:bg-[#eaeded] hover:text-[#16191f] transition-colors focus:outline-none focus:ring-1 focus:ring-[#0073bb] cursor-pointer"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            </DialogPrimitive.Close>
          </div>
          <div className="px-6 py-5 overflow-y-auto">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
