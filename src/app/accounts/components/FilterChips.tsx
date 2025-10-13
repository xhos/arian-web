"use client";

import { Button } from "@/components/ui/button";

interface FilterChipsProps {
  selectedFilter: string | null;
  onFilterChange: (filter: string | null) => void;
  availableTypes: string[];
  availableBanks: string[];
}

export default function FilterChips({ selectedFilter, onFilterChange }: FilterChipsProps) {
  const filterOptions = [
    { label: "All", value: null },
    { label: "Type", value: "type" },
    { label: "Bank", value: "bank" },
  ];

  return (
    <div className="flex gap-2">
      {filterOptions.map((option) => (
        <Button
          key={option.label}
          size="sm"
          variant={selectedFilter === option.value ? "default" : "outline"}
          onClick={() => onFilterChange(option.value)}
          className="text-xs"
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
