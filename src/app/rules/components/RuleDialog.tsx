"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, ArrowLeft } from "lucide-react";
import type { Rule } from "@/gen/arian/v1/rule_pb";
import type { Category } from "@/gen/arian/v1/category_pb";
import {
  createRuleBuilder,
  validateRule,
  type TransactionRule,
  type StringOperator,
  type NumericOperator,
  type FieldName,
  STRING_FIELDS,
  NUMERIC_FIELDS,
} from "@/lib/rules";

// Components
import { StepIndicator } from "./StepIndicator";
import { Step1, Step2, Step3, Step4 } from "./RuleSteps";
import type { UICondition } from "./ConditionBuilder";
import { STEP_LABELS } from "./rule-dialog-constants";

interface RuleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ruleData: {
    ruleName: string;
    categoryId: bigint;
    conditions: TransactionRule;
    isActive: boolean;
    priorityOrder: number;
    applyToExisting: boolean;
  }) => void;
  categories: Category[];
  rule?: Rule | null;
  title: string;
  submitText: string;
  isLoading: boolean;
}

const DEFAULT_CONDITION: UICondition = {
  field: "merchant",
  operator: "contains",
  value: "",
  case_sensitive: false,
};

export function RuleDialog({
  isOpen,
  onClose,
  onSubmit,
  categories,
  rule,
  title,
  submitText,
  isLoading,
}: RuleDialogProps) {
  const [step, setStep] = useState(1);
  const [ruleName, setRuleName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [logic, setLogic] = useState<"AND" | "OR">("AND");
  const [uiConditions, setUIConditions] = useState<UICondition[]>([DEFAULT_CONDITION]);
  const [priorityOrder, setPriorityOrder] = useState(1);
  const [applyToExisting, setApplyToExisting] = useState(false);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (isOpen) {
      if (rule) {
        // Editing existing rule
        setRuleName(rule.ruleName);
        setSelectedCategoryId(rule.categoryId.toString());
        setPriorityOrder(rule.priorityOrder);

        // Parse existing conditions
        try {
          const existingRule = rule.conditions as unknown as TransactionRule;
          console.log("Parsing existing rule conditions:", rule.conditions);
          console.log("Parsed as TransactionRule:", existingRule);

          if (existingRule?.logic && existingRule?.conditions) {
            setLogic(existingRule.logic);
            const uiConds: UICondition[] = existingRule.conditions.map((condition) => {
              const uiCondition: UICondition = {
                field: condition.field,
                operator: condition.operator,
                case_sensitive: "case_sensitive" in condition ? condition.case_sensitive : false,
              };

              // Handle different value types
              if ("value" in condition && condition.value !== undefined) {
                uiCondition.value = condition.value;
              }

              if ("values" in condition && condition.values && Array.isArray(condition.values)) {
                uiCondition.values = condition.values;
                uiCondition.chips = condition.values; // Convert values to chips for UI
              }

              if ("min_value" in condition && condition.min_value !== undefined) {
                uiCondition.min_value = condition.min_value;
              }

              if ("max_value" in condition && condition.max_value !== undefined) {
                uiCondition.max_value = condition.max_value;
              }

              return uiCondition;
            });
            console.log("Converted UI conditions:", uiConds);
            setUIConditions(uiConds);
          } else {
            console.log("No valid logic/conditions found, using defaults");
            setLogic("AND");
            setUIConditions([DEFAULT_CONDITION]);
          }
        } catch (error) {
          console.error("Error parsing conditions:", error);
          setLogic("AND");
          setUIConditions([DEFAULT_CONDITION]);
        }
      } else {
        // Creating new rule
        setRuleName("");
        setSelectedCategoryId("");
        setLogic("AND");
        setUIConditions([DEFAULT_CONDITION]);
        setPriorityOrder(1);
        setApplyToExisting(false);
      }
      setStep(1);
    }
  }, [isOpen, rule]);

  // Condition management
  const addCondition = () => {
    setUIConditions((prev) => [...prev, { ...DEFAULT_CONDITION }]);
  };

  const removeCondition = (index: number) => {
    setUIConditions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, updates: Partial<UICondition>) => {
    setUIConditions((prev) =>
      prev.map((condition, i) => (i === index ? { ...condition, ...updates } : condition))
    );
  };

  // Validation helpers
  const isValidCondition = (condition: UICondition): boolean => {
    if (condition.chips && condition.chips.length > 0) return true;
    if (condition.operator === "between") {
      return condition.min_value !== undefined && condition.max_value !== undefined;
    }
    if (condition.field === "tx_direction") {
      return condition.value !== undefined;
    }
    return condition.value !== undefined && condition.value !== "";
  };

  const canProceedStep1 = ruleName.trim() !== "";
  const canProceedStep2 = uiConditions.some(isValidCondition);
  const canProceedStep3 = selectedCategoryId !== "";
  const canSubmit = canProceedStep1 && canProceedStep2 && canProceedStep3;

  // Submit handler
  const handleSubmit = () => {
    const builder = createRuleBuilder(logic);
    const validConditions = uiConditions.filter(isValidCondition);

    validConditions.forEach((condition) => {
      const isStringField = STRING_FIELDS.includes(condition.field);

      if (isStringField) {
        if (condition.chips && condition.chips.length > 0) {
          builder.addStringCondition(
            condition.field as Extract<
              FieldName,
              "merchant" | "tx_desc" | "account_type" | "account_name" | "bank" | "currency"
            >,
            "contains_any" as StringOperator,
            undefined,
            {
              values: condition.chips,
              case_sensitive: condition.case_sensitive,
            }
          );
        } else {
          builder.addStringCondition(
            condition.field as Extract<
              FieldName,
              "merchant" | "tx_desc" | "account_type" | "account_name" | "bank" | "currency"
            >,
            condition.operator as StringOperator,
            condition.value as string,
            { case_sensitive: condition.case_sensitive }
          );
        }
      } else if (NUMERIC_FIELDS.includes(condition.field)) {
        if (condition.operator === "between") {
          builder.addNumericCondition(
            condition.field as Extract<FieldName, "amount" | "tx_direction">,
            condition.operator as NumericOperator,
            undefined,
            {
              min_value: condition.min_value,
              max_value: condition.max_value,
            }
          );
        } else {
          builder.addNumericCondition(
            condition.field as Extract<FieldName, "amount" | "tx_direction">,
            condition.operator as NumericOperator,
            condition.value as number
          );
        }
      }
    });

    try {
      const rule = builder.build();
      const validation = validateRule(rule);

      if (!validation.isValid) {
        const firstError = validation.errors[0];
        alert(`Validation Error: ${firstError.message}`);
        return;
      }

      onSubmit({
        ruleName,
        categoryId: BigInt(selectedCategoryId),
        conditions: rule,
        isActive: true, // Always active for new rules
        priorityOrder,
        applyToExisting,
      });
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : "Unknown error occurred"}`);
    }
  };

  const getStepValidation = () => {
    return {
      1: canProceedStep1,
      2: canProceedStep2,
      3: canProceedStep3,
    };
  };

  const stepValidation = getStepValidation();
  const canProceed = stepValidation[step as keyof typeof stepValidation] ?? true;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {step === 1 && "Name the rule"}
            {step === 2 && "Define the conditions that trigger this rule"}
            {step === 3 && "Choose which category to assign matching transactions"}
            {step === 4 && "Review the rule"}
          </DialogDescription>
        </DialogHeader>

        <StepIndicator steps={STEP_LABELS} currentStep={step} />

        <div className="flex-1 overflow-y-auto px-1">
          {step === 1 && (
            <Step1
              ruleName={ruleName}
              onRuleNameChange={setRuleName}
              onNext={() => canProceedStep1 && setStep(2)}
            />
          )}
          {step === 2 && (
            <Step2
              logic={logic}
              conditions={uiConditions}
              onLogicChange={setLogic}
              onUpdateCondition={updateCondition}
              onRemoveCondition={removeCondition}
              onAddCondition={addCondition}
              onNext={() => canProceedStep2 && setStep(3)}
              canProceed={canProceedStep2}
            />
          )}
          {step === 3 && (
            <Step3
              selectedCategoryId={selectedCategoryId}
              categories={categories}
              onCategoryChange={setSelectedCategoryId}
            />
          )}
          {step === 4 && (
            <Step4
              ruleName={ruleName}
              selectedCategoryId={selectedCategoryId}
              categories={categories}
              conditions={uiConditions}
              logic={logic}
              priorityOrder={priorityOrder}
              applyToExisting={applyToExisting}
              onPriorityChange={setPriorityOrder}
              onApplyToExistingChange={setApplyToExisting}
            />
          )}
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <div>
              {step > 1 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} disabled={isLoading}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              {step < 4 ? (
                <Button onClick={() => setStep(step + 1)} disabled={isLoading || !canProceed}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={isLoading || !canSubmit}>
                  {isLoading ? "Saving..." : submitText}
                </Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
