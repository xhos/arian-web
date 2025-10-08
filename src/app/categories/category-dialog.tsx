"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";
import type { Category } from "@/gen/arian/v1/category_pb";

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  onSave: (slug: string, color: string) => Promise<void>;
  title: string;
}

export function CategoryDialog({
  open,
  onOpenChange,
  category,
  onSave,
  title,
}: CategoryDialogProps) {
  const [slug, setSlug] = React.useState("");
  const [color, setColor] = React.useState("#3b82f6");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      if (category) {
        setSlug(category.slug);
        setColor(category.color);
      } else {
        setSlug("");
        setColor("#3b82f6");
      }
      setError(null);
    }
  }, [category, open]);

  const handleColorInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    const startsWithHash = value.startsWith("#");
    const isEmpty = value === "";

    if (startsWithHash) {
      setColor(value);
    } else if (isEmpty) {
      setColor("#");
    } else {
      setColor("#" + value.replace(/^#+/, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const slugPattern = /^[^.]+(\.[^.]+)*$/;
    const isValidSlugFormat = slugPattern.test(slug);
    if (!isValidSlugFormat) {
      setError("Invalid slug format. Use dot notation (e.g., food.groceries)");
      return;
    }

    const isValidLength = slug.length >= 1 && slug.length <= 100;
    if (!isValidLength) {
      setError("Slug must be between 1 and 100 characters");
      return;
    }

    const colorPattern = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;
    const isValidColor = colorPattern.test(color);
    if (!isValidColor) {
      setError("Invalid color format. Use hex format (#RGB or #RRGGBB)");
      return;
    }

    setIsLoading(true);
    try {
      await onSave(slug, color);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="food.groceries"
                disabled={isLoading}
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Use dots to create hierarchy: <code className="text-xs">parent.child</code>
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="color">Color</Label>
              <div className="flex gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      disabled={isLoading}
                      className="h-10 w-20 cursor-pointer rounded border flex-shrink-0"
                      style={{ backgroundColor: color }}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3">
                    <HexColorPicker color={color} onChange={setColor} />
                  </PopoverContent>
                </Popover>
                <Input
                  value={color || "#"}
                  onChange={handleColorInputChange}
                  placeholder="#3b82f6"
                  disabled={isLoading}
                  className="font-mono"
                  maxLength={7}
                />
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded p-2">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
