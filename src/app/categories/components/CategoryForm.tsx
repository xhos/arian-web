"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CategoryFormProps {
  onCreateCategory: (name: string) => Promise<void>;
}

export function CategoryForm({ onCreateCategory }: CategoryFormProps) {
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async () => {
    if (!newCategoryName.trim()) return;

    setIsCreating(true);
    try {
      await onCreateCategory(newCategoryName.trim().toLowerCase());
      setNewCategoryName("");
    } finally {
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="flex gap-3 mb-6">
      <Input
        value={newCategoryName}
        onChange={(e) => setNewCategoryName(e.target.value)}
        placeholder="Category name (e.g., 'Food.Restaurants' for nested)"
        className="flex-1 text-sm font-mono h-10 rounded-md"
        onKeyDown={handleKeyDown}
      />
      <Button
        onClick={handleSubmit}
        disabled={isCreating || !newCategoryName.trim()}
        size="sm"
        className="h-10 px-4 rounded-md"
      >
        {isCreating ? "creating..." : "add category"}
      </Button>
    </div>
  );
}