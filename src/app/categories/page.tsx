"use client";

import * as React from "react";
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
import { DataTable } from "./data-table";
import { createColumns, type CategoryRow } from "./columns";
import { CategoryDialog } from "./category-dialog";
import { DeleteDialog } from "./delete-dialog";
import { toast } from "sonner";
import { PageContainer, PageContent, PageHeader } from "@/components/ui/layout";
import { PageTitle, MetaText } from "@/components/ui/typography";
import { LoadingCard, ErrorMessage } from "@/components/data-display";
import { getCategoryDisplayName, getParentSlug, getCategoryLevel } from "@/lib/utils/category";

function countChildren(categorySlug: string, categories: Category[]): number {
  return categories.filter((c) => c.slug.startsWith(categorySlug + ".")).length;
}

export default function CategoriesPage() {
  const userId = useUserId();
  const queryClient = useQueryClient();
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = React.useState<Category | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isFiltered, setIsFiltered] = React.useState(false);

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

  const categoryRows: CategoryRow[] = categories.map((category) => ({
    category,
    level: getCategoryLevel(category.slug),
    displayName: getCategoryDisplayName(category.slug),
    parentSlug: getParentSlug(category.slug),
  }));

  const handleCreateCategory = async (slug: string, color: string) => {
    try {
      const request = create(CreateCategoryRequestSchema, { slug, color });
      await categoryClient.createCategory(request);
      await queryClient.invalidateQueries({ queryKey: ["categories", userId] });
      toast.success("Category created");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isDuplicateSlug = errorMessage.includes("duplicate key") || errorMessage.includes("unique constraint");

      if (isDuplicateSlug) {
        toast.error("A category with this slug already exists");
      } else {
        toast.error("Failed to create category");
      }
      throw error;
    }
  };

  const handleUpdateCategory = async (slug: string, color: string) => {
    if (!editingCategory) return;

    try {
      const request = create(UpdateCategoryRequestSchema, {
        id: editingCategory.id,
        slug,
        color,
        updateMask: { paths: ["slug", "color"] },
      });

      await categoryClient.updateCategory(request);
      await queryClient.invalidateQueries({ queryKey: ["categories", userId] });
      toast.success("Category updated");
      setEditingCategory(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isDuplicateSlug = errorMessage.includes("duplicate key") || errorMessage.includes("unique constraint");

      if (isDuplicateSlug) {
        toast.error("A category with this slug already exists");
      } else {
        toast.error("Failed to update category");
      }
      throw error;
    }
  };

  const handleColorChange = async (category: Category, color: string) => {
    try {
      const request = create(UpdateCategoryRequestSchema, {
        id: category.id,
        slug: category.slug,
        color,
        updateMask: { paths: ["color"] },
      });

      await categoryClient.updateCategory(request);
      await queryClient.invalidateQueries({ queryKey: ["categories", userId] });
      toast.success("Color updated");
    } catch (error) {
      toast.error("Failed to update color");
      console.error("Failed to update category color:", error);
    }
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;

    try {
      const request = create(DeleteCategoryRequestSchema, {
        id: deletingCategory.id,
      });

      await categoryClient.deleteCategory(request);
      await queryClient.invalidateQueries({ queryKey: ["categories", userId] });
      toast.success("Category deleted");
      setDeletingCategory(null);
    } catch (error) {
      toast.error("Failed to delete category");
      console.error("Failed to delete category:", error);
      throw error;
    }
  };

  const columns = createColumns(setEditingCategory, setDeletingCategory, isFiltered, handleColorChange);

  if (isLoading) {
    return (
      <PageContainer>
        <PageContent maxWidth="1200px">
          <PageTitle className="mb-8">Categories</PageTitle>
          <LoadingCard message="Loading categories..." />
        </PageContent>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <PageContent maxWidth="1200px">
          <PageTitle className="mb-8">Categories</PageTitle>
          <ErrorMessage>Error loading categories: {error.message}</ErrorMessage>
        </PageContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageContent maxWidth="1200px">
        <PageHeader>
          <PageTitle className="mb-3">Categories</PageTitle>
          <MetaText className="block">
            Manage your transaction categories with hierarchical organization. Right-click rows for actions.
          </MetaText>
        </PageHeader>

        <DataTable
          columns={columns}
          data={categoryRows}
          onFilterChange={setIsFiltered}
          onEdit={(row) => setEditingCategory(row.category)}
          onDelete={(row) => setDeletingCategory(row.category)}
          onCreateNew={() => setIsCreateDialogOpen(true)}
        />

        <CategoryDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSave={handleCreateCategory}
          title="Create Category"
        />

        <CategoryDialog
          open={!!editingCategory}
          onOpenChange={(open) => !open && setEditingCategory(null)}
          category={editingCategory}
          onSave={handleUpdateCategory}
          title="Edit Category"
        />

        <DeleteDialog
          open={!!deletingCategory}
          onOpenChange={(open) => !open && setDeletingCategory(null)}
          category={deletingCategory}
          childCount={deletingCategory ? countChildren(deletingCategory.slug, categories) : 0}
          onConfirm={handleDeleteCategory}
        />
      </PageContent>
    </PageContainer>
  );
}
