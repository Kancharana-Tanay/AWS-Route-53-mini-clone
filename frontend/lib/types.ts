export type RecordType =
  | "A"
  | "AAAA"
  | "CNAME"
  | "TXT"
  | "MX"
  | "NS"
  | "PTR"
  | "SRV"
  | "CAA"
  | "SOA";

export type RoutingPolicy = "SIMPLE";

export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string | null;
  is_active: boolean;
}

export interface HostedZone {
  id: number;
  name: string;
  comment?: string | null;
  record_count?: number;
  created_at: string;
  updated_at: string;
}

export interface HostedZoneCreateInput {
  name: string;
  comment?: string | null;
}

export interface HostedZoneUpdateInput {
  comment?: string | null;
}

export interface DNSRecord {
  id: number;
  hosted_zone_id: number;
  name: string;
  type: RecordType;
  values: string[];
  ttl: number;
  routing_policy: RoutingPolicy;
  is_system_record: boolean;
  created_at: string;
  updated_at: string;
}

export interface DNSRecordCreateInput {
  name: string;
  type: RecordType;
  values: string[];
  ttl: number;
  routing_policy?: RoutingPolicy;
}

export interface DNSRecordUpdateInput {
  values?: string[];
  ttl?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ApiError {
  detail: string | { loc: (string | number)[]; msg: string; type: string }[];
}
