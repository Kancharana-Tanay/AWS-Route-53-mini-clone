"use client";

import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { RecordTypeHelp } from "./RecordTypeHelp";
import { recordsApi } from "@/lib/api/records";
import { HostedZone, DNSRecord, RecordType } from "@/lib/types";
import { ApiClientError } from "@/lib/api/client";

const USER_RECORD_TYPES: RecordType[] = [
  "A",
  "AAAA",
  "CNAME",
  "TXT",
  "MX",
  "NS",
  "PTR",
  "SRV",
  "CAA",
];

interface RecordFormData {
  name: string;
  type: RecordType;
  valueText: string;
  ttl: number;
  routing_policy: "SIMPLE";
}

const recordSchema: z.ZodType<RecordFormData> = z.object({
  name: z.string(),
  type: z.enum([
    "A",
    "AAAA",
    "CNAME",
    "TXT",
    "MX",
    "NS",
    "PTR",
    "SRV",
    "CAA",
    "SOA",
  ]),
  valueText: z.string().min(1, "At least one record value is required"),
  ttl: z.coerce
    .number()
    .int("TTL must be an integer")
    .positive("TTL must be greater than 0")
    .max(2147483647, "TTL exceeds maximum allowed value"),
  routing_policy: z.literal("SIMPLE"),
});

export interface DnsRecordDialogProps {
  zone: HostedZone;
  record?: DNSRecord | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DnsRecordDialog({
  zone,
  record,
  open,
  onOpenChange,
  onSuccess,
}: DnsRecordDialogProps) {
  const isEditing = !!record;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<RecordFormData>({
    resolver: zodResolver(recordSchema),
    defaultValues: {
      name: "",
      type: "A",
      valueText: "",
      ttl: 300,
      routing_policy: "SIMPLE",
    },
  });

  const selectedType = watch("type") as RecordType;
  const nameInput = watch("name");

  // Compute live preview of canonical FQDN
  const getFqdnPreview = () => {
    if (!nameInput || nameInput.trim() === "" || nameInput.trim() === "@") {
      return zone.name;
    }
    const clean = nameInput.trim();
    if (clean === zone.name || clean.endsWith(`.${zone.name}`)) {
      return clean;
    }
    return `${clean}.${zone.name}`;
  };

  useEffect(() => {
    if (record) {
      // Prepopulate form for editing
      reset({
        name: record.name === zone.name ? "" : record.name.replace(`.${zone.name}`, ""),
        type: record.type,
        valueText: record.values.join("\n"),
        ttl: record.ttl,
        routing_policy: "SIMPLE",
      });
    } else {
      reset({
        name: "",
        type: "A",
        valueText: "",
        ttl: 300,
        routing_policy: "SIMPLE",
      });
    }
  }, [record, zone, reset, open]);

  const onSubmit = async (data: RecordFormData) => {
    setIsSubmitting(true);

    // Split newline-separated textarea into string[]
    const valuesArray = data.valueText
      .split("\n")
      .map((v) => v.trim())
      .filter((v) => v.length > 0);

    if (valuesArray.length === 0) {
      toast.error("Please enter at least one value for the DNS record.");
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEditing && record) {
        await recordsApi.update(record.id, {
          values: valuesArray,
          ttl: data.ttl,
        });
        toast.success(`Record '${record.name}' updated successfully`);
      } else {
        await recordsApi.create(zone.id, {
          name: data.name.trim(),
          type: data.type,
          values: valuesArray,
          ttl: data.ttl,
          routing_policy: "SIMPLE",
        });
        toast.success(`Record created in zone '${zone.name}'`);
      }

      onOpenChange(false);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        toast.error(err.message);
      } else {
        toast.error(isEditing ? "Failed to update record" : "Failed to create record");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? `Edit record: ${record?.name}` : "Create record"}
      description={
        isEditing
          ? "Update values or TTL for this record."
          : `Create a new DNS record in hosted zone '${zone.name}'.`
      }
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Record Name */}
        <div>
          <label className="block text-xs font-semibold text-[#16191f] mb-1">
            Record name {!isEditing && <span className="text-[#d13212]">*</span>}
          </label>
          <div className="flex items-center">
            <input
              type="text"
              disabled={isEditing}
              placeholder="e.g. api, www, or leave empty for zone apex"
              className="flex h-8 w-full rounded-l-xs border border-r-0 border-[#aab7b8] bg-white px-2.5 py-1 text-xs text-[#16191f] focus:outline-none focus:border-[#0073bb] disabled:bg-[#eaeded] disabled:text-[#68707f]"
              {...register("name")}
            />
            <span className="inline-flex h-8 items-center rounded-r-xs border border-[#aab7b8] bg-[#f2f3f3] px-3 text-xs font-mono text-[#545b64] select-none">
              .{zone.name}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-[#545b64]">
            FQDN: <strong className="text-[#16191f] font-mono">{getFqdnPreview()}</strong>
          </p>
          {errors.name && <p className="text-[11px] text-[#d13212]">{errors.name.message}</p>}
        </div>

        {/* Record Type and TTL Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Record Type */}
          <div>
            <label className="block text-xs font-semibold text-[#16191f] mb-1">
              Record type {!isEditing && <span className="text-[#d13212]">*</span>}
            </label>
            <select
              disabled={isEditing}
              className="h-8 w-full rounded-xs border border-[#aab7b8] bg-white px-2 py-1 text-xs text-[#16191f] focus:outline-none focus:border-[#0073bb] disabled:bg-[#eaeded]"
              {...register("type")}
            >
              {USER_RECORD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t} - {getRecordTypeDescription(t)}
                </option>
              ))}
            </select>
          </div>

          {/* TTL */}
          <div>
            <Input
              label="TTL (Seconds)"
              type="number"
              required
              min={1}
              helperText="Common values: 60 (1m), 300 (5m), 3600 (1h), 86400 (1d)"
              error={errors.ttl?.message}
              {...register("ttl")}
            />
          </div>
        </div>

        {/* Routing Policy (Read-Only) */}
        <div>
          <Input
            label="Routing policy"
            value="Simple routing"
            disabled
            helperText="Currently only Simple routing is supported in this zone."
          />
        </div>

        {/* Value Textarea */}
        <div className="space-y-1.5">
          <Textarea
            label="Value / Route traffic to"
            required
            rows={5}
            placeholder={getValuePlaceholder(selectedType)}
            helperText="Enter one value per line. Do not use comma-separated values."
            error={errors.valueText?.message}
            {...register("valueText")}
          />

          {/* Contextual Type Help */}
          <div className="p-2.5 bg-[#f2f8fc] border border-[#d5e7f3] rounded-xs">
            <RecordTypeHelp type={selectedType} />
          </div>
        </div>

        {/* Modal Actions */}
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
            {isEditing ? "Save changes" : "Create records"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function getRecordTypeDescription(type: RecordType): string {
  switch (type) {
    case "A":
      return "Routes traffic to an IPv4 address";
    case "AAAA":
      return "Routes traffic to an IPv6 address";
    case "CNAME":
      return "Routes traffic to another domain name";
    case "TXT":
      return "Text record (SPF, verification, etc.)";
    case "MX":
      return "Routes mail to a mail server";
    case "NS":
      return "Delegates a hosted zone to an authoritative name server";
    case "PTR":
      return "Maps an IP address to a domain name";
    case "SRV":
      return "Defines the host and port for specific services";
    case "CAA":
      return "Specifies which Certificate Authorities can issue certificates";
    default:
      return type;
  }
}

function getValuePlaceholder(type: RecordType): string {
  switch (type) {
    case "A":
      return "192.0.2.1\n192.0.2.2";
    case "AAAA":
      return "2001:0db8:85a3:0000:0000:8a2e:0370:7334";
    case "CNAME":
      return "target.example.org";
    case "TXT":
      return "v=spf1 include:_spf.google.com ~all";
    case "MX":
      return "10 mail.example.com\n20 backup-mail.example.com";
    case "NS":
      return "ns1.example.com\nns2.example.com";
    case "PTR":
      return "host.example.com";
    case "SRV":
      return "10 5 443 api.example.com";
    case "CAA":
      return '0 issue "letsencrypt.org"';
    default:
      return "";
  }
}
