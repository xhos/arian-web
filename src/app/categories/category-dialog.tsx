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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";
import { VStack, HStack, Caption, ErrorMessage, Text } from "@/components/lib";
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
          <VStack spacing="md" className="py-4">
            <VStack spacing="xs">
              <Caption>Slug</Caption>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                placeholder="food.groceries"
                disabled={isLoading}
                className="font-mono"
              />
              <Text size="xs" color="muted">
                Use dots to create hierarchy: <code className="font-mono text-xs">parent.child</code>
              </Text>
            </VStack>
            <VStack spacing="xs">
              <Caption>Color</Caption>
              <HStack spacing="sm">
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
                  id="color"
                  value={color || "#"}
                  onChange={handleColorInputChange}
                  placeholder="#3b82f6"
                  disabled={isLoading}
                  className="font-mono"
                  maxLength={7}
                />
              </HStack>
            </VStack>
            {error && <ErrorMessage>{error}</ErrorMessage>}
          </VStack>
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
