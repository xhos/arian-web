"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import type { Category } from "@/gen/arian/v1/category_pb";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";

export interface CategoryRow {
  category: Category;
  level: number;
  displayName: string;
  parentSlug: string | null;
}

export const createColumns = (
  onEdit: (category: Category) => void,
  onDelete: (category: Category) => void,
  isFiltered: boolean,
  onColorChange?: (category: Category, color: string) => void
): ColumnDef<CategoryRow>[] => [
  {
    accessorKey: "displayName",
    header: "Name",
    cell: ({ row }) => {
      const indentationPixels = isFiltered ? 0 : row.original.level * 20;
      return (
        <span className="font-medium capitalize" style={{ marginLeft: `${indentationPixels}px` }}>
          {row.original.displayName}
        </span>
      );
    },
  },
  {
    accessorKey: "category.slug",
    id: "slug",
    header: "Slug",
    cell: ({ row }) => <span className="font-mono text-sm">{row.original.category.slug}</span>,
  },
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ row }) => {
      const categoryColor = row.original.category.color;

      const ColorCell = () => {
        const [localColor, setLocalColor] = React.useState(categoryColor);
        const [open, setOpen] = React.useState(false);
        const originalColorRef = React.useRef(categoryColor);

        const handleOpenChange = (isOpen: boolean) => {
          const colorHasChanged = localColor !== originalColorRef.current;
          const shouldSaveColor = !isOpen && colorHasChanged;

          if (shouldSaveColor) {
            onColorChange?.(row.original.category, localColor);
          }
          setOpen(isOpen);
        };

        return (
          <div className="flex items-center gap-2">
            <Popover open={open} onOpenChange={handleOpenChange}>
              <PopoverTrigger asChild>
                <button
                  className="h-6 w-6 rounded border cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: localColor }}
                  onClick={(e) => e.stopPropagation()}
                />
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" onClick={(e) => e.stopPropagation()}>
                <HexColorPicker color={localColor} onChange={setLocalColor} />
              </PopoverContent>
            </Popover>
            <span className="font-mono text-xs">{localColor}</span>
          </div>
        );
      };

      return <ColorCell />;
    },
    size: 120,
  },
];
