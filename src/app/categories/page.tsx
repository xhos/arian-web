"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { create } from "@bufbuild/protobuf";
import { categoryClient } from "@/lib/grpc-client";
import {
  ListCategoriesRequestSchema,
  CreateCategoryRequestSchema,
  UpdateCategoryRequestSchema,
  DeleteCategoryRequestSchema,
} from "@/gen/arian/v1/category_services_pb";
import { useUserId } from "@/hooks/useSession";
import type { Category } from "@/gen/arian/v1/category_pb";

// Import our new components
import { CategoryTree } from "./components/CategoryTree";
import { CategoryForm } from "./components/CategoryForm";
import { DeleteConfirmationDialog } from "./components/DeleteConfirmationDialog";

// Import utilities
import { buildCategoryTree, generateRandomColor, type PendingChange } from "./utils/categoryUtils";

export default function CategoriesPage() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    data: categories = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["categories", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated");

      const request = create(ListCategoriesRequestSchema, { userId });
      const response = await categoryClient.listCategories(request);
      return response.categories;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const categoryTree = useMemo(() => {
    // Apply pending changes to create a preview of the new state
    const categoriesWithPendingChanges = categories.map((category) => {
      const pendingChange = pendingChanges.find((change) => change.categoryId === category.id);
      if (pendingChange) {
        return { ...category, slug: pendingChange.newSlug };
      }
      return category;
    });

    return buildCategoryTree(categoriesWithPendingChanges);
  }, [categories, pendingChanges]);

  const handleCategoryMove = (newChanges: PendingChange[]) => {
    // Update pending changes, removing any existing changes for affected categories
    const affectedCategoryIds = new Set(newChanges.map((change) => change.categoryId));
    const filteredExistingChanges = pendingChanges.filter(
      (change) => !affectedCategoryIds.has(change.categoryId)
    );

    setPendingChanges([...filteredExistingChanges, ...newChanges]);
  };

  const handleCreateCategory = async (name: string) => {
    const request = create(CreateCategoryRequestSchema, {
      slug: name,
      color: generateRandomColor(),
    });

    await categoryClient.createCategory(request);
    await queryClient.invalidateQueries({ queryKey: ["categories", userId] });
  };

  const handleSaveChanges = async () => {
    if (pendingChanges.length === 0) return;

    setIsSaving(true);
    try {
      for (const change of pendingChanges) {
        const request = create(UpdateCategoryRequestSchema, {
          id: change.categoryId,
          slug: change.newSlug,
          updateMask: { paths: ["slug"] },
        });
        await categoryClient.updateCategory(request);
      }

      await queryClient.invalidateQueries({ queryKey: ["categories", userId] });
      setPendingChanges([]);
    } catch (error) {
      console.error("Failed to save changes:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setPendingChanges([]);
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      // Remove any pending changes for this category and its children
      const categorySlug = categoryToDelete.slug;
      const updatedChanges = pendingChanges.filter((change) => {
        const changeCategory = categories.find((c) => c.id === change.categoryId);
        return changeCategory && !changeCategory.slug.startsWith(categorySlug);
      });
      setPendingChanges(updatedChanges);

      // Delete category via API
      const request = create(DeleteCategoryRequestSchema, {
        id: categoryToDelete.id,
      });
      await categoryClient.deleteCategory(request);

      await queryClient.invalidateQueries({ queryKey: ["categories", userId] });
      setCategoryToDelete(null);
    } catch (error) {
      console.error("Failed to delete category:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDelete = () => {
    setCategoryToDelete(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 tui-background">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-lg mb-8 tui-foreground">arian // categories</h1>
          <div className="text-sm tui-muted">Loading categories...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 tui-background">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-lg mb-8 tui-foreground">arian // categories</h1>
          <div className="text-sm text-red-600">Error loading categories: {error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 tui-background">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg tui-foreground">arian // categories</h1>
            <div className="flex items-center gap-3">
              {pendingChanges.length > 0 && (
                <>
                  <span className="text-xs text-yellow-400">
                    {pendingChanges.length} pending change{pendingChanges.length === 1 ? "" : "s"}
                  </span>
                  <Button
                    onClick={handleDiscardChanges}
                    size="sm"
                    variant="outline"
                    className="text-xs h-8"
                  >
                    discard
                  </Button>
                  <Button
                    onClick={handleSaveChanges}
                    size="sm"
                    disabled={isSaving}
                    className="text-xs h-8"
                  >
                    {isSaving ? "saving..." : "save changes"}
                  </Button>
                </>
              )}
            </div>
          </div>

          <CategoryForm onCreateCategory={handleCreateCategory} />
        </header>

        <CategoryTree
          categoryTree={categoryTree}
          categories={categories}
          pendingChanges={pendingChanges}
          onCategoryMove={handleCategoryMove}
          onDelete={handleDeleteCategory}
        />

        <DeleteConfirmationDialog
          category={categoryToDelete}
          categories={categories}
          isDeleting={isDeleting}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      </div>
    </div>
  );
}
