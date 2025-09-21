"use client";

import { Button } from "@/components/ui/button";
import type { Category } from "@/gen/arian/v1/category_pb";

interface DeleteConfirmationDialogProps {
  category: Category | null;
  categories: Category[];
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function getDisplayName(slug: string): string {
  const parts = slug.split('.');
  return parts[parts.length - 1];
}

export function DeleteConfirmationDialog({
  category,
  categories,
  isDeleting,
  onConfirm,
  onCancel
}: DeleteConfirmationDialogProps) {
  if (!category) return null;

  const childCount = categories.filter(c =>
    c.slug.startsWith(category.slug + '.')
  ).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-md p-6 max-w-md w-full shadow-xl">
        <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-gray-100">
          Delete Category
        </h3>

        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            Are you sure you want to delete the category:
          </p>
          <div className="flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
              {getDisplayName(category.slug)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              ({category.slug})
            </span>
          </div>

          {childCount > 0 && (
            <p className="text-amber-600 dark:text-amber-400 text-sm mt-3">
              ⚠️ This will also delete {childCount} child categor{childCount === 1 ? 'y' : 'ies'}
            </p>
          )}
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isDeleting}
            size="sm"
            className="h-10 px-4 rounded-md"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            size="sm"
            className="h-10 px-4 rounded-md"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}