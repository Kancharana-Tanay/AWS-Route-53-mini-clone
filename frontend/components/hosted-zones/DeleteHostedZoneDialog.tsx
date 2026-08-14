"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { hostedZonesApi } from "@/lib/api/hostedZones";
import { HostedZone } from "@/lib/types";
import { ApiClientError } from "@/lib/api/client";

export interface DeleteHostedZoneDialogProps {
  zone: HostedZone | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteHostedZoneDialog({
  zone,
  open,
  onOpenChange,
  onSuccess,
}: DeleteHostedZoneDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!zone) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await hostedZonesApi.delete(zone.id);
      toast.success(`Hosted zone '${zone.name}' deleted successfully`);
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to delete hosted zone");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete hosted zone"
      confirmLabel="Delete zone"
      isDanger
      isLoading={isDeleting}
      onConfirm={handleDelete}
      description={`Are you sure you want to delete hosted zone '${zone.name}'?`}
    >
      <div className="text-xs text-[#545b64] space-y-2 py-1">
        <p>
          Deleting this hosted zone will permanently delete all <strong>{zone.record_count ?? "all"}</strong> associated DNS records (including A, CNAME, MX, and system NS/SOA records).
        </p>
        <p className="text-[#d13212] font-semibold">
          This action is immediate and cannot be undone.
        </p>
      </div>
    </ConfirmDialog>
  );
}
