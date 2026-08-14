"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { hostedZonesApi } from "@/lib/api/hostedZones";
import { HostedZone } from "@/lib/types";
import { ApiClientError } from "@/lib/api/client";

const editZoneSchema = z.object({
  comment: z.string().max(500, "Comment cannot exceed 500 characters").optional(),
});

type EditZoneFormData = z.infer<typeof editZoneSchema>;

export interface EditHostedZoneDialogProps {
  zone: HostedZone | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditHostedZoneDialog({
  zone,
  open,
  onOpenChange,
  onSuccess,
}: EditHostedZoneDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditZoneFormData>({
    resolver: zodResolver(editZoneSchema),
    defaultValues: {
      comment: zone?.comment || "",
    },
  });

  useEffect(() => {
    if (zone) {
      reset({
        comment: zone.comment || "",
      });
    }
  }, [zone, reset]);

  if (!zone) return null;

  const onSubmit = async (data: EditZoneFormData) => {
    setIsSubmitting(true);
    try {
      await hostedZonesApi.update(zone.id, {
        comment: data.comment?.trim() || null,
      });

      toast.success(`Hosted zone '${zone.name}' updated`);
      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to update hosted zone");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit hosted zone details"
      description="Update comment and metadata for this hosted zone. Domain name cannot be modified."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            label="Domain name"
            value={zone.name}
            disabled
            helperText="Hosted zone domain names cannot be renamed."
          />
        </div>

        <Textarea
          label="Description / Comment"
          placeholder="e.g. Production web application zone"
          rows={3}
          error={errors.comment?.message}
          {...register("comment")}
        />

        <div className="flex justify-end gap-2 pt-4 border-t border-[#eaeded]">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
