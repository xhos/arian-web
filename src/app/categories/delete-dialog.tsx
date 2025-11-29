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
import { AlertCircle } from "lucide-react";
import { VStack } from "@/components/lib";
import type { Category } from "@/gen/arian/v1/category_pb";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: Category | null;
  childCount: number;
  onConfirm: () => Promise<void>;
}

export function DeleteDialog({
  open,
  onOpenChange,
  category,
  childCount,
  onConfirm,
}: DeleteDialogProps) {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Delete Category
          </DialogTitle>
        </DialogHeader>
        <VStack spacing="sm" className="py-4">
          <div className="bg-muted rounded p-3">
            <span className="font-medium font-mono">{category.slug}</span>
          </div>
          {childCount > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded p-3">
              <p className="text-sm text-destructive font-medium">
                This will also delete {childCount} child categor{childCount === 1 ? "y" : "ies"}.
              </p>
            </div>
          )}
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
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
