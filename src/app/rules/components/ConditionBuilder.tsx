import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { ChipList } from "./ChipList";
import {
  FIELD_OPTIONS,
  STRING_OPERATOR_OPTIONS,
  NUMERIC_OPERATOR_OPTIONS,
  TX_DIRECTION_OPTIONS,
} from "./rule-dialog-constants";
import { STRING_FIELDS, NUMERIC_FIELDS, type FieldName } from "@/lib/rules";

export interface UICondition {
  field: FieldName;
  operator: string;
  value?: string | number;
  values?: string[];
  min_value?: number;
  max_value?: number;
  case_sensitive?: boolean;
  chips?: string[];
  currentInput?: string;
}

interface ConditionBuilderProps {
  condition: UICondition;
  index: number;
  logic: "AND" | "OR";
  showRemove: boolean;
  onUpdate: (updates: Partial<UICondition>) => void;
  onRemove: () => void;
}

const isStringField = (field: FieldName) => STRING_FIELDS.includes(field);
const isNumericField = (field: FieldName) => NUMERIC_FIELDS.includes(field);

const getOperatorOptions = (field: FieldName) => {
  return isStringField(field) ? STRING_OPERATOR_OPTIONS : NUMERIC_OPERATOR_OPTIONS;
};

export function ConditionBuilder({
  condition,
  index,
  logic,
  showRemove,
  onUpdate,
  onRemove,
}: ConditionBuilderProps) {
  const handleAddChip = () => {
    if (!condition.currentInput?.trim()) return;

    const newChips = [...(condition.chips || []), condition.currentInput.trim()];
    onUpdate({
      chips: newChips,
      values: newChips,
      currentInput: "",
    });
  };

  const handleRemoveChip = (chipIndex: number) => {
    const newChips = condition.chips!.filter((_, i) => i !== chipIndex);
    onUpdate({
      chips: newChips,
      values: newChips,
    });
  };

  const handleFieldChange = (value: FieldName) => {
    const operators = getOperatorOptions(value);
    onUpdate({
      field: value,
      operator: operators[0].value,
      value: "",
      values: undefined,
      min_value: undefined,
      max_value: undefined,
      case_sensitive: false,
      chips: [],
      currentInput: "",
    });
  };

  const handleOperatorChange = (value: string) => {
    onUpdate({
      operator: value,
      value: "",
      values: undefined,
      min_value: undefined,
      max_value: undefined,
      chips: [],
      currentInput: "",
    });
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Natural language connector */}
        <div className="flex items-center justify-between">
          <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium">
            {index === 0 ? "IF" : logic}
          </span>
          {showRemove && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemove}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Condition builder controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={condition.field} onValueChange={handleFieldChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FIELD_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={condition.operator} onValueChange={handleOperatorChange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {getOperatorOptions(condition.field).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Value inputs */}
          {condition.operator === "between" ? (
            <>
              <Input
                type="number"
                value={condition.min_value || ""}
                onChange={(e) => onUpdate({ min_value: parseFloat(e.target.value) || undefined })}
                placeholder="min"
                className="w-16"
              />
              <span className="text-sm text-muted-foreground">and</span>
              <Input
                type="number"
                value={condition.max_value || ""}
                onChange={(e) => onUpdate({ max_value: parseFloat(e.target.value) || undefined })}
                placeholder="max"
                className="w-16"
              />
            </>
          ) : condition.field === "tx_direction" ? (
            <Select
              value={condition.value?.toString() || ""}
              onValueChange={(value) => onUpdate({ value: parseInt(value) })}
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="direction" />
              </SelectTrigger>
              <SelectContent>
                {TX_DIRECTION_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : isNumericField(condition.field) ? (
            <Input
              type="number"
              value={condition.value || ""}
              onChange={(e) => onUpdate({ value: parseFloat(e.target.value) || undefined })}
              placeholder="Enter amount"
              className="w-48"
            />
          ) : (
            <>
              <Input
                type="text"
                value={condition.currentInput || ""}
                onChange={(e) => onUpdate({ currentInput: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && condition.currentInput?.trim()) {
                    e.preventDefault();
                    handleAddChip();
                  }
                }}
                placeholder="Enter value"
                className="w-48"
              />
              <Button
                type="button"
                size="sm"
                disabled={!condition.currentInput?.trim()}
                onClick={handleAddChip}
              >
                Add
              </Button>
            </>
          )}
        </div>

        {/* Chips display */}
        {condition.chips && condition.chips.length > 0 && (
          <ChipList chips={condition.chips} onRemoveChip={handleRemoveChip} />
        )}

        {/* Case sensitivity option */}
        {isStringField(condition.field) && condition.operator !== "regex" && (
          <div className="flex items-center gap-2">
            <Switch
              id={`case-sensitive-${index}`}
              checked={condition.case_sensitive || false}
              onCheckedChange={(checked) => onUpdate({ case_sensitive: checked })}
            />
            <Label htmlFor={`case-sensitive-${index}`} className="text-sm text-muted-foreground">
              Case sensitive
            </Label>
          </div>
        )}
      </div>
    </Card>
  );
}
