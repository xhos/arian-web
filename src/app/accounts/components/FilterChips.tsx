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
    { label: "all", value: null },
    { label: "type", value: "type" },
    { label: "bank", value: "bank" },
  ];

  return (
    <div className="flex gap-2 mb-6">
      {filterOptions.map((option) => (
        <Button
          key={option.label}
          size="sm"
          variant={selectedFilter === option.value ? "accent" : "outline"}
          onClick={() => onFilterChange(option.value)}
          className="text-xs"
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
