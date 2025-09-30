"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SortableHierarchy } from "./components/SortableHierarchy";

interface TreeItem {
  id: string;
  name: string;
  color: string;
  children: TreeItem[];
}

const initialData: TreeItem[] = [
  {
    id: "1",
    name: "Food & Dining",
    color: "#ef4444",
    children: [
      { id: "1-1", name: "Restaurants", color: "#f87171", children: [] },
      { id: "1-2", name: "Groceries", color: "#fca5a5", children: [] },
      { id: "1-3", name: "Coffee", color: "#fecaca", children: [] },
    ],
  },
  {
    id: "2",
    name: "Transportation",
    color: "#3b82f6",
    children: [
      { id: "2-1", name: "Gas", color: "#60a5fa", children: [] },
      { id: "2-2", name: "Public Transit", color: "#93c5fd", children: [] },
    ],
  },
  {
    id: "3",
    name: "Entertainment",
    color: "#10b981",
    children: [
      { id: "3-1", name: "Movies", color: "#34d399", children: [] },
      { id: "3-2", name: "Gaming", color: "#6ee7b7", children: [] },
    ],
  },
  {
    id: "4",
    name: "Shopping",
    color: "#f59e0b",
    children: [],
  },
];

export default function CategoriesNewPage() {
  const [items, setItems] = useState<TreeItem[]>(initialData);

  const addRandomItem = () => {
    const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];
    const names = ["New Category", "Expenses", "Income", "Investment", "Savings"];

    const newItem: TreeItem = {
      id: `new-${Date.now()}`,
      name: names[Math.floor(Math.random() * names.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
      children: [],
    };

    setItems((prev) => [...prev, newItem]);
  };

  return (
    <div className="min-h-screen p-8 tui-background">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg tui-foreground">arian // categories-new</h1>
            <Button onClick={addRandomItem} size="sm" className="text-xs h-8">
              add random
            </Button>
          </div>
          <p className="text-sm tui-muted mb-4">
            Elegant @dnd-kit/sortable implementation with proper abstractions
          </p>
        </header>

        <SortableHierarchy items={items} onItemsChange={setItems} />
      </div>
    </div>
  );
}
