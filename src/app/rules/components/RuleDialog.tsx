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
import { StepIndicator } from "./StepIndicator";
import { Step1, Step2, Step3, Step4 } from "./RuleSteps";
import type { UICondition } from "./ConditionBuilder";
import { STEP_LABELS } from "./rule-dialog-constants";

interface RuleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ruleData: {
    ruleName: string;
    categoryId?: bigint;
    merchant?: string;
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
  error?: string;
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
  error: externalError,
}: RuleDialogProps) {
  const [step, setStep] = useState(1);
  const [ruleName, setRuleName] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [merchantValue, setMerchantValue] = useState("");
  const [logic, setLogic] = useState<"AND" | "OR">("AND");
  const [uiConditions, setUIConditions] = useState<UICondition[]>([DEFAULT_CONDITION]);
  const [priorityOrder, setPriorityOrder] = useState(1);
  const [applyToExisting, setApplyToExisting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    setValidationError(null);

    if (rule) {
      setRuleName(rule.ruleName);
      setSelectedCategoryId(rule.categoryId?.toString() ?? "");
      setMerchantValue(rule.merchant ?? "");
      setPriorityOrder(rule.priorityOrder);

      try {
        const existingRule = rule.conditions as unknown as TransactionRule;
        if (existingRule?.logic && existingRule?.conditions) {
          setLogic(existingRule.logic);
          const uiConds: UICondition[] = existingRule.conditions.map((condition) => {
            const uiCondition: UICondition = {
              field: condition.field,
              operator: condition.operator,
              case_sensitive: "case_sensitive" in condition ? condition.case_sensitive : false,
            };

            if ("value" in condition && condition.value !== undefined) {
              uiCondition.value = condition.value;
            }
            if ("values" in condition && condition.values && Array.isArray(condition.values)) {
              uiCondition.values = condition.values;
              uiCondition.chips = condition.values;
            }
            if ("min_value" in condition && condition.min_value !== undefined) {
              uiCondition.min_value = condition.min_value;
            }
            if ("max_value" in condition && condition.max_value !== undefined) {
              uiCondition.max_value = condition.max_value;
            }
            return uiCondition;
          });
          setUIConditions(uiConds);
        } else {
          setLogic("AND");
          setUIConditions([DEFAULT_CONDITION]);
        }
      } catch {
        setLogic("AND");
        setUIConditions([DEFAULT_CONDITION]);
      }
    } else {
      setRuleName("");
      setSelectedCategoryId("");
      setMerchantValue("");
      setLogic("AND");
      setUIConditions([DEFAULT_CONDITION]);
      setPriorityOrder(1);
      setApplyToExisting(false);
    }
    setStep(1);
  }, [isOpen, rule]);

  const addCondition = () => setUIConditions((prev) => [...prev, { ...DEFAULT_CONDITION }]);
  const removeCondition = (index: number) => setUIConditions((prev) => prev.filter((_, i) => i !== index));
  const updateCondition = (index: number, updates: Partial<UICondition>) =>
    setUIConditions((prev) => prev.map((condition, i) => (i === index ? { ...condition, ...updates } : condition)));

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
  const canProceedStep3 = selectedCategoryId !== "" || merchantValue.trim() !== "";
  const canSubmit = canProceedStep1 && canProceedStep2 && canProceedStep3;

  const handleSubmit = () => {
    const builder = createRuleBuilder(logic);
    const validConditions = uiConditions.filter(isValidCondition);

    validConditions.forEach((condition) => {
      const isStringField = STRING_FIELDS.includes(condition.field);

      if (isStringField) {
        if (condition.chips && condition.chips.length > 0) {
          builder.addStringCondition(
            condition.field as Extract<FieldName, "merchant" | "tx_desc" | "account_type" | "account_name" | "bank" | "currency">,
            "contains_any" as StringOperator,
            undefined,
            { values: condition.chips, case_sensitive: condition.case_sensitive }
          );
        } else {
          builder.addStringCondition(
            condition.field as Extract<FieldName, "merchant" | "tx_desc" | "account_type" | "account_name" | "bank" | "currency">,
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
            { min_value: condition.min_value, max_value: condition.max_value }
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
      const transactionRule = builder.build();
      const validation = validateRule(transactionRule);

      if (!validation.isValid) {
        setValidationError(validation.errors[0].message);
        return;
      }

      setValidationError(null);
      onSubmit({
        ruleName,
        categoryId: selectedCategoryId ? BigInt(selectedCategoryId) : undefined,
        merchant: merchantValue || undefined,
        conditions: transactionRule,
        isActive: true,
        priorityOrder,
        applyToExisting,
      });
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : "Unknown error occurred");
    }
  };

  const stepValidation = { 1: canProceedStep1, 2: canProceedStep2, 3: canProceedStep3 };
  const canProceed = stepValidation[step as keyof typeof stepValidation] ?? true;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <div className="px-6 pt-6">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
        </div>

        <div className="px-6">
          <StepIndicator steps={STEP_LABELS} currentStep={step} />
        </div>

        <div className="flex-1 overflow-y-auto px-6">
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
              merchantValue={merchantValue}
              categories={categories}
              onCategoryChange={setSelectedCategoryId}
              onMerchantChange={setMerchantValue}
            />
          )}
          {step === 4 && (
            <Step4
              ruleName={ruleName}
              selectedCategoryId={selectedCategoryId}
              merchantValue={merchantValue}
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

        {(validationError || externalError) && (
          <div className="px-6">
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded p-2">
              {validationError || externalError}
            </div>
          </div>
        )}

        <div className="px-6 pb-6">
          <DialogFooter>
            <div className="flex justify-between w-full">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} disabled={isLoading}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
            <div className={step === 1 ? "flex gap-2 ml-auto" : "flex gap-2"}>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
