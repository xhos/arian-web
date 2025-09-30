"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";

export interface SortableItemProps {
  id: string;
  name: string;
  color: string;
  depth: number;
  parentId: string | null;
  index: number;
}

export function SortableItem({ id, name, color, depth }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    marginLeft: `${depth * 32}px`,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative flex items-center gap-3 p-4 rounded-lg border transition-all
        ${
          isDragging
            ? "opacity-50 scale-105 shadow-lg z-50"
            : "tui-border tui-background hover:shadow-md"
        }
      `}
      {...attributes}
    >
      {/* Drag Handle */}
      <div
        className="flex flex-col gap-1 cursor-grab hover:opacity-70 transition-opacity p-2 -m-2 rounded"
        {...listeners}
      >
        <div className="w-2 h-1 bg-current opacity-30 rounded-full" />
        <div className="w-2 h-1 bg-current opacity-30 rounded-full" />
        <div className="w-2 h-1 bg-current opacity-30 rounded-full" />
      </div>

      {/* Color Indicator */}
      <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />

      {/* Content */}
      <div className="flex-1 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="font-medium tui-foreground">{name}</span>
          <span className="text-xs tui-muted">depth: {depth}</span>
        </div>

        {/* Actions */}
        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs hover:bg-red-500/20 hover:text-red-600"
          >
            ✕
          </Button>
        </div>
      </div>

      {/* Depth indicator line */}
      {depth > 0 && (
        <div
          className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"
          style={{ marginLeft: `${(depth - 1) * 32}px` }}
        />
      )}
    </div>
  );
}
