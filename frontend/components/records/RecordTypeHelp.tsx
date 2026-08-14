import React from "react";
import { RecordType } from "@/lib/types";

export function RecordTypeHelp({ type }: { type: RecordType }) {
  switch (type) {
    case "A":
      return (
        <div className="text-[11px] text-[#545b64] space-y-1">
          <p className="font-semibold text-[#16191f]">A Record (IPv4 Address)</p>
          <p>Enter one IPv4 address per line (e.g. 192.0.2.1). In Route 53, multiple IP addresses route traffic in round-robin fashion.</p>
        </div>
      );
    case "AAAA":
      return (
        <div className="text-[11px] text-[#545b64] space-y-1">
          <p className="font-semibold text-[#16191f]">AAAA Record (IPv6 Address)</p>
          <p>Enter one IPv6 address per line (e.g. 2001:0db8:85a3:0000:0000:8a2e:0370:7334).</p>
        </div>
      );
    case "CNAME":
      return (
        <div className="text-[11px] text-[#545b64] space-y-1">
          <p className="font-semibold text-[#16191f]">CNAME Record (Canonical Name)</p>
          <p>Enter exactly one canonical hostname (e.g. target.example.org). Cannot be created at the zone apex and cannot coexist with other records.</p>
        </div>
      );
    case "TXT":
      return (
        <div className="text-[11px] text-[#545b64] space-y-1">
          <p className="font-semibold text-[#16191f]">TXT Record (Text)</p>
          <p>Each line represents one TXT value (e.g. SPF, DKIM, or verification tokens like v=spf1 include:_spf.google.com ~all).</p>
        </div>
      );
    case "MX":
      return (
        <div className="text-[11px] text-[#545b64] space-y-1">
          <p className="font-semibold text-[#16191f]">MX Record (Mail Exchange)</p>
          <p>Format: <code>priority hostname</code> (e.g. <code>10 mail.example.com</code>). Enter one per line.</p>
        </div>
      );
    case "NS":
      return (
        <div className="text-[11px] text-[#545b64] space-y-1">
          <p className="font-semibold text-[#16191f]">NS Record (Name Server)</p>
          <p>Enter nameserver hostnames (one per line, e.g. ns1.example.com).</p>
        </div>
      );
    case "PTR":
      return (
        <div className="text-[11px] text-[#545b64] space-y-1">
          <p className="font-semibold text-[#16191f]">PTR Record (Pointer)</p>
          <p>Enter reverse lookup target hostnames (one per line, e.g. host.example.com).</p>
        </div>
      );
    case "SRV":
      return (
        <div className="text-[11px] text-[#545b64] space-y-1">
          <p className="font-semibold text-[#16191f]">SRV Record (Service Locator)</p>
          <p>Format: <code>priority weight port target</code> (e.g. <code>10 5 443 api.example.com</code>).</p>
        </div>
      );
    case "CAA":
      return (
        <div className="text-[11px] text-[#545b64] space-y-1">
          <p className="font-semibold text-[#16191f]">CAA Record (Certification Authority Authorization)</p>
          <p>Format: <code>flags tag &quot;value&quot;</code> (e.g. <code>0 issue &quot;letsencrypt.org&quot;</code>).</p>
        </div>
      );
    default:
      return null;
  }
}
