import { apiClient } from "./client";
import {
  HostedZone,
  HostedZoneCreateInput,
  HostedZoneUpdateInput,
  PaginatedResponse,
} from "../types";

export interface ListHostedZonesParams {
  search?: string;
  page?: number;
  limit?: number;
}

export const hostedZonesApi = {
  list: async (
    params: ListHostedZonesParams = {}
  ): Promise<PaginatedResponse<HostedZone>> => {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.page) query.set("page", params.page.toString());
    if (params.limit) query.set("limit", params.limit.toString());

    const queryString = query.toString();
    const endpoint = `/api/hosted-zones${queryString ? `?${queryString}` : ""}`;
    return apiClient<PaginatedResponse<HostedZone>>(endpoint, {
      method: "GET",
    });
  },

  getById: async (id: number): Promise<HostedZone> => {
    return apiClient<HostedZone>(`/api/hosted-zones/${id}`, {
      method: "GET",
    });
  },

  create: async (data: HostedZoneCreateInput): Promise<HostedZone> => {
    return apiClient<HostedZone>("/api/hosted-zones", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (
    id: number,
    data: HostedZoneUpdateInput
  ): Promise<HostedZone> => {
    return apiClient<HostedZone>(`/api/hosted-zones/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id: number): Promise<void> => {
    return apiClient<void>(`/api/hosted-zones/${id}`, {
      method: "DELETE",
    });
  },
};
