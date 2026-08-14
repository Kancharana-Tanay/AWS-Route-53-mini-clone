"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { recordsApi } from "@/lib/api/records";
import { DNSRecord } from "@/lib/types";
import { ApiClientError } from "@/lib/api/client";

export interface DeleteRecordDialogProps {
  record: DNSRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteRecordDialog({
  record,
  open,
  onOpenChange,
  onSuccess,
}: DeleteRecordDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!record) return null;

  const handleDelete = async () => {
    if (record.is_system_record) {
      toast.error("System NS and SOA records cannot be deleted.");
      return;
    }

    setIsDeleting(true);
    try {
      await recordsApi.delete(record.id);
      toast.success(`Record '${record.name}' (${record.type}) deleted successfully`);
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to delete record");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete record"
      confirmLabel="Delete record"
      isDanger
      isLoading={isDeleting}
      onConfirm={handleDelete}
      description={`Are you sure you want to delete the ${record.type} record for '${record.name}'?`}
    >
      <div className="text-xs text-[#545b64] space-y-2 py-1">
        <div className="p-2.5 bg-[#fafafa] border border-[#eaeded] rounded-xs font-mono text-[11px] space-y-1">
          <p><span className="text-[#68707f]">Name:</span> {record.name}</p>
          <p><span className="text-[#68707f]">Type:</span> {record.type}</p>
          <p><span className="text-[#68707f]">Values:</span> {record.values.join(", ")}</p>
        </div>
        <p className="text-[#d13212] font-semibold">
          Traffic will no longer be routed to these endpoints. This action cannot be undone.
        </p>
      </div>
    </ConfirmDialog>
  );
}
