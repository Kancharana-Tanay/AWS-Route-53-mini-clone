import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex items-center gap-1 text-[11px] text-[#545b64] mb-3 select-none" aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <React.Fragment key={index}>
            {index > 0 && <ChevronRight className="h-3 w-3 text-[#aab7b8] shrink-0" />}
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="hover:text-[#0073bb] hover:underline transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-semibold text-[#16191f]" : ""}>
                {item.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
