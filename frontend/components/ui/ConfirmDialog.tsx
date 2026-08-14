"use client";

import * as React from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle } from "lucide-react";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  children?: React.ReactNode;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDanger = false,
  isLoading = false,
  onConfirm,
  children,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} maxWidth="md">
      <div className="space-y-4">
        {isDanger && (
          <div className="flex items-start gap-3 p-3 bg-[#fff8e1] border-l-4 border-[#d13212] rounded-xs">
            <AlertTriangle className="h-5 w-5 text-[#d13212] shrink-0 mt-0.5" />
            <div className="text-xs text-[#16191f]">
              <p className="font-semibold text-[#d13212]">Permanent Deletion Warning</p>
              <p className="mt-1">{description}</p>
            </div>
          </div>
        )}

        {!isDanger && description && (
          <p className="text-xs text-[#545b64]">{description}</p>
        )}

        {children}

        <div className="flex justify-end gap-2 pt-4 border-t border-[#eaeded]">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={isDanger ? "danger" : "primary"}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
