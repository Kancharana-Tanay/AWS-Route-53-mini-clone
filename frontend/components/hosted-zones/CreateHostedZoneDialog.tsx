"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { hostedZonesApi } from "@/lib/api/hostedZones";
import { ApiClientError } from "@/lib/api/client";

const createZoneSchema = z.object({
  name: z
    .string()
    .min(1, "Domain name is required")
    .max(253, "Domain name cannot exceed 253 characters")
    .regex(
      /^(?!-)[A-Za-z0-9-_]+(\.[A-Za-z0-9-_]+)*\.[A-Za-z]{2,}$|^[a-zA-Z0-9_-]+$/,
      "Please enter a valid domain name (e.g. example.com or internal.net)"
    ),
  comment: z.string().max(500, "Comment cannot exceed 500 characters").optional(),
});

type CreateZoneFormData = z.infer<typeof createZoneSchema>;

export interface CreateHostedZoneDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateHostedZoneDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateHostedZoneDialogProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateZoneFormData>({
    resolver: zodResolver(createZoneSchema),
    defaultValues: {
      name: "",
      comment: "",
    },
  });

  const onSubmit = async (data: CreateZoneFormData) => {
    setIsSubmitting(true);
    try {
      const newZone = await hostedZonesApi.create({
        name: data.name.trim(),
        comment: data.comment?.trim() || null,
      });

      toast.success(`Hosted zone '${newZone.name}' created successfully`);
      reset();
      onOpenChange(false);

      if (onSuccess) {
        onSuccess();
      }

      // Navigate to the newly created hosted zone
      router.push(`/hosted-zones/${newZone.id}`);
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to create hosted zone");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Create hosted zone"
      description="A hosted zone contains DNS records that define how you want to route traffic for your domain."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Domain name"
          required
          placeholder="example.com"
          helperText="Enter the fully qualified domain name (e.g. example.com)"
          error={errors.name?.message}
          {...register("name")}
        />

        <Textarea
          label="Description / Comment"
          placeholder="e.g. Production web application zone"
          helperText="Optional notes about this hosted zone (up to 500 characters)"
          rows={3}
          error={errors.comment?.message}
          {...register("comment")}
        />

        <div className="p-3 bg-[#f2f3f3] border border-[#eaeded] rounded-xs text-[11px] text-[#545b64] space-y-1">
          <p className="font-semibold text-[#16191f]">System Records Provisioning</p>
          <p>
            When created, Route 53 automatically provisions authoritative <strong>NS</strong> and <strong>SOA</strong> system records for this zone.
          </p>
        </div>

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
            Create hosted zone
          </Button>
        </div>
      </form>
    </Modal>
  );
}
