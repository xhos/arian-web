import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ChipListProps {
  chips: string[];
  onRemoveChip: (index: number) => void;
}

export function ChipList({ chips, onRemoveChip }: ChipListProps) {
  if (!chips || chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip, index) => (
        <Badge key={index} variant="secondary" className="flex items-center gap-1">
          {chip}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onRemoveChip(index)}
            className="ml-1 h-4 w-4 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
    </div>
  );
}
