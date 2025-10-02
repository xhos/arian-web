import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, HelpCircle } from "lucide-react";
import { ConditionBuilder, type UICondition } from "./ConditionBuilder";
import { FIELD_OPTIONS, TX_DIRECTION_OPTIONS } from "./rule-dialog-constants";
import type { Category } from "@/gen/arian/v1/category_pb";

function StepLayout({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
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
          Name
        </Label>
        <Input
          id="ruleName"
          value={ruleName}
          onChange={(e) => onRuleNameChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., Groceries"
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
    <div onKeyDown={handleKeyDown} className="space-y-4">
      <div className="bg-muted/50 p-4 rounded-lg">
        <Label className="text-base font-medium mb-3 block">Apply this rule when:</Label>
        <RadioGroup value={logic} onValueChange={onLogicChange} className="space-y-3">
          <div className="flex items-start gap-3">
            <RadioGroupItem value="AND" id="all-conditions" className="mt-1" />
            <div>
              <Label htmlFor="all-conditions" className="font-medium cursor-pointer">
                ALL conditions are met
              </Label>
              <p className="text-xs text-muted-foreground">Transaction must match all conditions below</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <RadioGroupItem value="OR" id="any-conditions" className="mt-1" />
            <div>
              <Label htmlFor="any-conditions" className="font-medium cursor-pointer">
                ANY condition is met
              </Label>
              <p className="text-xs text-muted-foreground">Transaction matches any single condition below</p>
            </div>
          </div>
        </RadioGroup>
      </div>

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
  );
}

interface Step3Props {
  selectedCategoryId: string;
  merchantValue: string;
  categories: Category[];
  onCategoryChange: (categoryId: string) => void;
  onMerchantChange: (merchant: string) => void;
}

export function Step3({
  selectedCategoryId,
  merchantValue,
  categories,
  onCategoryChange,
  onMerchantChange,
}: Step3Props) {
  return (
    <div className="bg-muted/50 p-4 rounded-lg">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm">Apply category</span>
        <Select value={selectedCategoryId} onValueChange={onCategoryChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="select" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id.toString()} value={category.id.toString()}>
                {category.slug}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground">and/or</span>

        <span className="text-sm">merchant</span>
        <Input
          id="merchant"
          value={merchantValue}
          onChange={(e) => onMerchantChange(e.target.value)}
          placeholder="enter value"
          className="w-48"
        />
      </div>
    </div>
  );
}

interface Step4Props {
  ruleName: string;
  selectedCategoryId: string;
  merchantValue: string;
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
  merchantValue,
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
    if (condition.chips && condition.chips.length > 0) return true;
    if (condition.operator === "contains_any") {
      return condition.values && condition.values.length > 0;
    }
    if (condition.operator === "between") {
      return condition.min_value !== undefined && condition.max_value !== undefined;
    }
    return condition.value !== undefined && condition.value !== "";
  });

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">Name</Label>
            <p className="text-sm font-medium">{ruleName}</p>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">When</Label>
            <div className="text-sm space-y-1 mt-1">
              {validConditions.map((condition, index) => (
                <div key={index}>
                  {index > 0 && <span className="text-muted-foreground">{logic} </span>}
                  <span>
                    {FIELD_OPTIONS.find((f) => f.value === condition.field)?.label} {condition.operator}{" "}
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

          <div>
            <Label className="text-xs text-muted-foreground">Apply</Label>
            <div className="flex gap-2 mt-1 text-sm">
              {selectedCategory && (
                <span>category <Badge variant="outline" className="ml-1">{selectedCategory.slug}</Badge></span>
              )}
              {selectedCategory && merchantValue && <span className="text-muted-foreground">and</span>}
              {merchantValue && (
                <span>merchant <Badge variant="outline" className="ml-1">{merchantValue}</Badge></span>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Label htmlFor="applyToExisting">Apply to existing</Label>
          <Switch
            id="applyToExisting"
            checked={applyToExisting}
            onCheckedChange={onApplyToExistingChange}
          />
        </div>

        <div className="flex items-center gap-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Label htmlFor="priority" className="flex items-center gap-1 cursor-help">
                  Priority
                  <HelpCircle className="h-3 w-3 text-muted-foreground" />
                </Label>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs max-w-xs">
                  Lower numbers have higher priority. If priorities match, rules are applied alphabetically by name.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Input
            id="priority"
            type="number"
            value={priorityOrder}
            onChange={(e) => onPriorityChange(parseInt(e.target.value) || 1)}
            min={1}
            className="w-16 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
      </div>
    </div>
  );
}
