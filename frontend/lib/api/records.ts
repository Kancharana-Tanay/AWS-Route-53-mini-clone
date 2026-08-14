import { apiClient } from "./client";
import {
  DNSRecord,
  DNSRecordCreateInput,
  DNSRecordUpdateInput,
  PaginatedResponse,
  RecordType,
} from "../types";

export interface ListRecordsParams {
  search?: string;
  type?: RecordType | string;
  page?: number;
  limit?: number;
}

export const recordsApi = {
  listByZone: async (
    zoneId: number,
    params: ListRecordsParams = {}
  ): Promise<PaginatedResponse<DNSRecord>> => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.type) query.set("type", params.type);
    if (params.page) query.set("page", params.page.toString());
    if (params.limit) query.set("limit", params.limit.toString());

    const queryString = query.toString();
    const endpoint = `/api/hosted-zones/${zoneId}/records${queryString ? `?${queryString}` : ""}`;
    return apiClient<PaginatedResponse<DNSRecord>>(endpoint, {
      method: "GET",
    });
  },

  getById: async (recordId: number): Promise<DNSRecord> => {
    return apiClient<DNSRecord>(`/api/records/${recordId}`, {
      method: "GET",
    });
  },

  create: async (
    zoneId: number,
    data: DNSRecordCreateInput
  ): Promise<DNSRecord> => {
    return apiClient<DNSRecord>(`/api/hosted-zones/${zoneId}/records`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (
    recordId: number,
    data: DNSRecordUpdateInput
  ): Promise<DNSRecord> => {
    return apiClient<DNSRecord>(`/api/records/${recordId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (recordId: number): Promise<void> => {
    return apiClient<void>(`/api/records/${recordId}`, {
      method: "DELETE",
    });
  },
};
