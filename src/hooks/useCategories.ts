import { useQuery } from "@tanstack/react-query";
import type { Category } from "@/gen/arian/v1/category_pb";
import { useMemo } from "react";

export function useCategories() {
  const { data: categories = [], isLoading, error } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/arian.v1.CategoryService/ListCategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 1000 }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch categories");
      }

      const data = await response.json();
      return (data.categories || []) as Category[];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const categoryMap = useMemo(() => {
    const map = new Map<string, Category>();
    categories.forEach((cat) => {
      map.set(cat.id.toString(), cat);
    });
    return map;
  }, [categories]);

  const getCategoryById = (categoryId: bigint | string) => {
    return categoryMap.get(categoryId.toString());
  };

  return {
    categories,
    categoryMap,
    getCategoryById,
    isLoading,
    error,
  };
}
