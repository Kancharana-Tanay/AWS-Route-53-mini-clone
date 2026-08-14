"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { MoreVertical, Edit2, Trash2, Globe } from "lucide-react";
import { HostedZone } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { EditHostedZoneDialog } from "./EditHostedZoneDialog";
import { DeleteHostedZoneDialog } from "./DeleteHostedZoneDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";

export interface HostedZonesTableProps {
  zones: HostedZone[];
  isLoading: boolean;
  onRefresh: () => void;
  isSearchActive?: boolean;
  onClearSearch?: () => void;
  onCreateZone?: () => void;
}

interface MenuPosition {
  top: number;
  left: number;
}

export function HostedZonesTable({
  zones,
  isLoading,
  onRefresh,
  isSearchActive,
  onClearSearch,
  onCreateZone,
}: HostedZonesTableProps) {
  const [activeZone, setActiveZone] = useState<HostedZone | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const [mounted, setMounted] = useState(false);

  const [editingZone, setEditingZone] = useState<HostedZone | null>(null);
  const [deletingZone, setDeletingZone] = useState<HostedZone | null>(null);

  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeMenu = useCallback(() => {
    setActiveZone(null);
    setAnchorEl(null);
    setMenuPosition(null);
  }, []);

  const updatePosition = useCallback(() => {
    if (!anchorEl) return;

    const rect = anchorEl.getBoundingClientRect();

    // If anchor is scrolled completely out of viewport, close the menu
    if (
      rect.bottom < 0 ||
      rect.top > window.innerHeight ||
      rect.right < 0 ||
      rect.left > window.innerWidth
    ) {
      closeMenu();
      return;
    }

    const menuWidth = 144; // w-36 = 144px
    const menuHeight = 76; // estimated height of 2 items with padding
    const padding = 8;
    const gap = 4;

    let top = rect.bottom + gap;

    // If not enough space below, but enough space above, position above button
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow < menuHeight + padding && rect.top - menuHeight - gap > padding) {
      top = rect.top - menuHeight - gap;
    }

    // Align right edge of menu with right edge of button
    let left = rect.right - menuWidth;

    // Viewport horizontal boundary constraints
    if (left < padding) {
      left = padding;
    } else if (left + menuWidth > window.innerWidth - padding) {
      left = window.innerWidth - menuWidth - padding;
    }

    setMenuPosition({ top, left });
  }, [anchorEl, closeMenu]);

  // Recalculate position when anchor changes
  useEffect(() => {
    if (!anchorEl) return;
    updatePosition();
  }, [anchorEl, updatePosition]);

  // Handle outside clicks, Escape key, window resize, and scrolling
  useEffect(() => {
    if (!activeZone || !anchorEl) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenu();
      }
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        anchorEl &&
        !anchorEl.contains(target)
      ) {
        closeMenu();
      }
    };

    const handleScrollOrResize = () => {
      updatePosition();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("touchstart", handlePointerDown);
    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [activeZone, anchorEl, closeMenu, updatePosition]);

  if (isLoading) {
    return <LoadingState rows={6} />;
  }

  if (zones.length === 0) {
    if (isSearchActive) {
      return (
        <EmptyState
          title="No matching hosted zones"
          description="No hosted zones match your search query. Try refining your keywords or clear the filter."
          isSearchEmpty
          onClearSearch={onClearSearch}
        />
      );
    }
    return (
      <EmptyState
        title="No hosted zones"
        description="You do not have any hosted zones configured. Create a hosted zone to start routing DNS traffic."
        actionLabel="Create hosted zone"
        onAction={onCreateZone}
      />
    );
  }

  return (
    <>
      <div className="bg-white border border-[#eaeded] rounded-xs shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#16191f]">
            <thead className="bg-[#fafafa] border-b border-[#eaeded] text-[#545b64] font-bold select-none">
              <tr>
                <th scope="col" className="px-4 py-2.5">
                  Hosted zone name
                </th>
                <th scope="col" className="px-4 py-2.5">
                  Record count
                </th>
                <th scope="col" className="px-4 py-2.5">
                  Description / Comment
                </th>
                <th scope="col" className="px-4 py-2.5">
                  Created
                </th>
                <th scope="col" className="px-4 py-2.5 text-right w-16">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eaeded]">
              {zones.map((zone) => {
                const isMenuOpen = activeZone?.id === zone.id;

                return (
                  <tr
                    key={zone.id}
                    className="hover:bg-[#f2f8fc] transition-colors group"
                  >
                    <td className="px-4 py-3 font-medium">
                      <Link
                        href={`/hosted-zones/${zone.id}`}
                        className="text-[#0073bb] hover:underline font-semibold flex items-center gap-1.5"
                      >
                        <Globe className="h-3.5 w-3.5 text-[#545b64]" />
                        <span>{zone.name}</span>
                      </Link>
                    </td>

                    <td className="px-4 py-3 text-[#545b64]">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#f2f3f3] text-[#16191f] text-[11px] font-medium font-mono">
                        {zone.record_count ?? 0}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-[#545b64] max-w-xs truncate">
                      {zone.comment || "—"}
                    </td>

                    <td className="px-4 py-3 text-[#545b64] whitespace-nowrap">
                      {formatDate(zone.created_at)}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isMenuOpen) {
                            closeMenu();
                          } else {
                            setActiveZone(zone);
                            setAnchorEl(e.currentTarget);
                          }
                        }}
                        className={`p-1 rounded-xs text-[#545b64] hover:bg-[#eaeded] hover:text-[#16191f] transition-colors cursor-pointer ${
                          isMenuOpen ? "bg-[#eaeded] text-[#16191f]" : ""
                        }`}
                        aria-label={`Row actions for ${zone.name}`}
                        aria-haspopup="menu"
                        aria-expanded={isMenuOpen}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Portalled Contextual Actions Menu */}
      {mounted &&
        activeZone &&
        menuPosition &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
            }}
            className="z-50 w-36 bg-white rounded-xs shadow-md border border-[#d5dbdb] py-1 text-left"
            role="menu"
            aria-label="Hosted zone actions"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                const zone = activeZone;
                closeMenu();
                setEditingZone(zone);
              }}
              className="w-full px-3 py-1.5 text-xs text-[#16191f] hover:bg-[#f2f3f3] flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Edit2 className="h-3.5 w-3.5 text-[#545b64]" />
              Edit details
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                const zone = activeZone;
                closeMenu();
                setDeletingZone(zone);
              }}
              className="w-full px-3 py-1.5 text-xs text-[#d13212] hover:bg-[#fdf2f2] flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete zone
            </button>
          </div>,
          document.body
        )}

      {/* Edit Dialog */}
      <EditHostedZoneDialog
        zone={editingZone}
        open={!!editingZone}
        onOpenChange={(open) => !open && setEditingZone(null)}
        onSuccess={() => {
          setEditingZone(null);
          onRefresh();
        }}
      />

      {/* Delete Dialog */}
      <DeleteHostedZoneDialog
        zone={deletingZone}
        open={!!deletingZone}
        onOpenChange={(open) => !open && setDeletingZone(null)}
        onSuccess={() => {
          setDeletingZone(null);
          onRefresh();
        }}
      />
    </>
  );
}
