"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import type { Rule } from "@/gen/arian/v1/rule_pb";
import type { TransactionRule } from "@/lib/rules";

interface DeleteRuleDialogProps {
  rule: Rule | null;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}

export function DeleteRuleDialog({ rule, onClose, onConfirm, isLoading }: DeleteRuleDialogProps) {
  if (!rule) return null;

  const formatConditionsPreview = (conditions: unknown): string => {
    if (!conditions || typeof conditions !== "object") return "";

    try {
      // Try new format first
      const rule = conditions as TransactionRule;
      if (rule.logic && rule.conditions && Array.isArray(rule.conditions)) {
        const condition = rule.conditions[0];
        if (condition) {
          let preview = `${condition.field} ${condition.operator}`;

          if ("value" in condition && condition.value !== undefined) {
            preview += ` "${condition.value}"`;
          } else if ("values" in condition && condition.values) {
            preview += ` [${condition.values.join(", ")}]`;
          } else if ("min_value" in condition && "max_value" in condition) {
            preview += ` ${condition.min_value}-${condition.max_value}`;
          }

          if (rule.conditions.length > 1) {
            preview += ` ${rule.logic} ...`;
          }

          return preview;
        }
      }

      // Fallback to old format
      const conditionsObj = conditions as Record<string, unknown>;
      if (conditionsObj.description) {
        return conditionsObj.description;
      }

      if (conditionsObj.triggers && Array.isArray(conditionsObj.triggers)) {
        const trigger = conditionsObj.triggers[0];
        if (trigger) {
          return `${trigger.field} ${trigger.operator} "${trigger.value}"`;
        }
      }

      return "Custom conditions";
    } catch {
      return "Invalid conditions";
    }
  };

  return (
    <AlertDialog open={!!rule} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Rule</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>Are you sure you want to delete this rule? This action cannot be undone.</p>
              <div className="p-3 bg-gray-50 rounded-lg space-y-2">
                <div>
                  <span className="text-sm font-medium">Rule Name:</span>
                  <span className="ml-2 text-sm font-mono">{rule.ruleName}</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Applied:</span>
                  <span className="ml-2 text-sm">{rule.timesApplied} times</span>
                </div>
                <div>
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={rule.isActive ? "default" : "secondary"} className="ml-2">
                    {rule.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm font-medium">Conditions:</span>
                  <div className="ml-2 text-xs text-gray-600 mt-1">
                    {formatConditionsPreview(rule.conditions)}
                  </div>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Deleting..." : "Delete Rule"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
