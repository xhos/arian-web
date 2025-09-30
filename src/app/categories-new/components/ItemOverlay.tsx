"use client";

import { FlattenedItem } from "./SortableHierarchy";

interface ItemOverlayProps {
  id: string;
  items: FlattenedItem[];
}

export function ItemOverlay({ id, items }: ItemOverlayProps) {
  const item = items.find((item) => item.id === id);

  if (!item) return null;

  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border tui-border tui-background shadow-2xl opacity-95 transform scale-105">
      {/* Drag Handle */}
      <div className="flex flex-col gap-1 opacity-50 p-2 -m-2">
        <div className="w-2 h-1 bg-current rounded-full" />
        <div className="w-2 h-1 bg-current rounded-full" />
        <div className="w-2 h-1 bg-current rounded-full" />
      </div>

      {/* Color Indicator */}
      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />

      {/* Content */}
      <div className="flex items-center gap-3">
        <span className="font-medium tui-foreground">{item.name}</span>
        <span className="text-xs tui-muted">dragging...</span>
      </div>
    </div>
  );
}
