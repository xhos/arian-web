import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { ConditionBuilder, type UICondition } from "./ConditionBuilder";
import { FIELD_OPTIONS, TX_DIRECTION_OPTIONS } from "./rule-dialog-constants";
import type { Category } from "@/gen/arian/v1/category_pb";

// Common layout wrapper for steps
function StepLayout({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6">{children}</div>;
}

interface Step1Props {
  ruleName: string;
  onRuleNameChange: (name: string) => void;
  onNext?: () => void;
}

export function Step1({ ruleName, onRuleNameChange, onNext }: Step1Props) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && ruleName.trim() && onNext) {
      e.preventDefault();
      onNext();
    }
  };

  return (
    <StepLayout>
      <div>
        <Label htmlFor="ruleName" className="text-base font-medium">
          Rule Name
        </Label>
        <Input
          id="ruleName"
          value={ruleName}
          onChange={(e) => onRuleNameChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Coffee Shop Purchases"
          className="mt-2"
        />
      </div>
    </StepLayout>
  );
}

interface Step2Props {
  logic: "AND" | "OR";
  conditions: UICondition[];
  onLogicChange: (logic: "AND" | "OR") => void;
  onUpdateCondition: (index: number, updates: Partial<UICondition>) => void;
  onRemoveCondition: (index: number) => void;
  onAddCondition: () => void;
  onNext?: () => void;
  canProceed?: boolean;
}

export function Step2({
  logic,
  conditions,
  onLogicChange,
  onUpdateCondition,
  onRemoveCondition,
  onAddCondition,
  onNext,
  canProceed,
}: Step2Props) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && canProceed && onNext && !isInputFocused()) {
      e.preventDefault();
      onNext();
    }
  };

  const isInputFocused = () => {
    const activeElement = document.activeElement;
    return (
      activeElement &&
      (activeElement.tagName === "INPUT" ||
        activeElement.tagName === "TEXTAREA" ||
        activeElement.getAttribute("contenteditable") === "true")
    );
  };

  return (
    <div onKeyDown={handleKeyDown}>
      <StepLayout>
        <div className="space-y-6">
          {/* Logic selector */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <Label className="text-base font-medium mb-3 block">Apply this rule when:</Label>
            <RadioGroup value={logic} onValueChange={onLogicChange} className="space-y-3">
              <div className="flex items-start gap-3">
                <RadioGroupItem value="AND" id="all-conditions" className="mt-1" />
                <div>
                  <Label htmlFor="all-conditions" className="font-medium cursor-pointer">
                    ALL conditions are met
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Transaction must match all conditions below
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RadioGroupItem value="OR" id="any-conditions" className="mt-1" />
                <div>
                  <Label htmlFor="any-conditions" className="font-medium cursor-pointer">
                    ANY condition is met
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Transaction matches any single condition below
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Conditions */}
          <div className="space-y-4">
            {conditions.map((condition, index) => (
              <ConditionBuilder
                key={index}
                condition={condition}
                index={index}
                logic={logic}
                showRemove={conditions.length > 1}
                onUpdate={(updates) => onUpdateCondition(index, updates)}
                onRemove={() => onRemoveCondition(index)}
              />
            ))}

            <Button type="button" variant="outline" onClick={onAddCondition} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Another Condition
            </Button>
          </div>
        </div>
      </StepLayout>
    </div>
  );
}

interface Step3Props {
  selectedCategoryId: string;
  categories: Category[];
  onCategoryChange: (categoryId: string) => void;
}

export function Step3({ selectedCategoryId, categories, onCategoryChange }: Step3Props) {
  return (
    <StepLayout>
      <div>
        <Label htmlFor="category" className="text-base font-medium">
          Target Category
        </Label>
        <Select value={selectedCategoryId} onValueChange={onCategoryChange}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id.toString()} value={category.id.toString()}>
                {category.slug}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-2">
          All transactions matching your conditions will be automatically categorized here.
        </p>
      </div>
    </StepLayout>
  );
}

interface Step4Props {
  ruleName: string;
  selectedCategoryId: string;
  categories: Category[];
  conditions: UICondition[];
  logic: "AND" | "OR";
  priorityOrder: number;
  applyToExisting: boolean;
  onPriorityChange: (priority: number) => void;
  onApplyToExistingChange: (apply: boolean) => void;
}

export function Step4({
  ruleName,
  selectedCategoryId,
  categories,
  conditions,
  logic,
  priorityOrder,
  applyToExisting,
  onPriorityChange,
  onApplyToExistingChange,
}: Step4Props) {
  const selectedCategory = categories.find((c) => c.id.toString() === selectedCategoryId);

  const validConditions = conditions.filter((condition) => {
    // Check for chip-based conditions
    if (condition.chips && condition.chips.length > 0) {
      return true;
    }
    // Check for contains_any with values
    if (condition.operator === "contains_any") {
      return condition.values && condition.values.length > 0;
    }
    // Check for between operator
    if (condition.operator === "between") {
      return condition.min_value !== undefined && condition.max_value !== undefined;
    }
    // Check for regular conditions with value
    return condition.value !== undefined && condition.value !== "";
  });

  return (
    <StepLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Rule Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Rule Name</Label>
              <p className="font-medium">{ruleName}</p>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Target Category</Label>
              <Badge variant="outline" className="mt-1">
                {selectedCategory?.slug}
              </Badge>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Conditions</Label>
              <div className="text-sm space-y-1 mt-1">
                {validConditions.map((condition, index) => (
                  <div key={index} className="flex items-center gap-1">
                    {index > 0 && <span className="text-muted-foreground">{logic}</span>}
                    <span>
                      {FIELD_OPTIONS.find((f) => f.value === condition.field)?.label}{" "}
                      {condition.operator}{" "}
                      {condition.chips && condition.chips.length > 0
                        ? `[${condition.chips.join(", ")}]`
                        : condition.operator === "contains_any"
                          ? `[${condition.values?.join(", ")}]`
                          : condition.operator === "between"
                            ? `${condition.min_value} - ${condition.max_value}`
                            : condition.field === "tx_direction"
                              ? TX_DIRECTION_OPTIONS.find((t) => t.value === condition.value)?.label
                              : `"${condition.value}"`}
                      {condition.case_sensitive && " (case sensitive)"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="applyToExisting">Apply to existing transactions</Label>
              <p className="text-xs text-muted-foreground mt-1">
                Retroactively apply this rule to existing transactions that match the conditions
              </p>
            </div>
            <Switch
              id="applyToExisting"
              checked={applyToExisting}
              onCheckedChange={onApplyToExistingChange}
            />
          </div>

          <div>
            <Label htmlFor="priority">Priority Order</Label>
            <Input
              id="priority"
              type="number"
              value={priorityOrder}
              onChange={(e) => onPriorityChange(parseInt(e.target.value) || 1)}
              min={1}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-1">Lower numbers have higher priority</p>
          </div>
        </div>
      </div>
    </StepLayout>
  );
}
