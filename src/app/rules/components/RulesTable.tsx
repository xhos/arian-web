"use client";

import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2, Target } from "lucide-react";
import type { Rule } from "@/gen/arian/v1/rule_pb";
import type { Category } from "@/gen/arian/v1/category_pb";
import type { TransactionRule } from "@/lib/rules";

interface RulesTableProps {
  rules: Rule[];
  categories: Record<string, Category>;
  onEditRule: (rule: Rule) => void;
  onDeleteRule: (rule: Rule) => void;
  onToggleActive: (rule: Rule) => void;
  isLoading: boolean;
}

export function RulesTable({
  rules,
  categories,
  onEditRule,
  onDeleteRule,
  onToggleActive,
  isLoading,
}: RulesTableProps) {
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

  const getRuleSourceBadge = (source: string) => {
    switch (source) {
      case "user_created":
        return <Badge variant="default">User</Badge>;
      case "ai_suggested":
        return <Badge variant="secondary">AI Suggested</Badge>;
      case "ai_approved":
        return <Badge variant="outline">AI Approved</Badge>;
      default:
        return <Badge variant="outline">{source}</Badge>;
    }
  };

  const getCategoryName = (categoryId: bigint) => {
    const category = categories[categoryId.toString()];
    return category ? category.slug : `Unknown (${categoryId})`;
  };

  const formatTimestamp = (timestamp: unknown) => {
    if (!timestamp) return "Never";

    try {
      const date = new Date(timestamp.seconds * 1000);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return "Invalid date";
    }
  };

  if (rules.length === 0) {
    return (
      <div className="tui-border rounded-lg p-8 text-center">
        <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div className="text-sm tui-muted mb-2">No rules yet</div>
        <div className="text-xs tui-muted">
          Create your first rule to automatically categorize transactions
        </div>
      </div>
    );
  }

  return (
    <div className="tui-border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Conditions</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Applied</TableHead>
            <TableHead>Last Applied</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Active</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rules.map((rule, index) => (
            <TableRow key={rule.ruleId} className={index === rules.length - 1 ? "border-b-0" : ""}>
              <TableCell className="font-mono text-sm">{rule.ruleName}</TableCell>
              <TableCell>
                <Badge variant="outline" className="font-mono text-xs">
                  {getCategoryName(rule.categoryId)}
                </Badge>
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-xs tui-muted">
                {formatConditionsPreview(rule.conditions)}
              </TableCell>
              <TableCell>{getRuleSourceBadge(rule.ruleSource)}</TableCell>
              <TableCell className="text-sm">{rule.timesApplied} times</TableCell>
              <TableCell className="text-xs tui-muted">
                {formatTimestamp(rule.lastAppliedAt)}
              </TableCell>
              <TableCell className="text-sm">{rule.priorityOrder}</TableCell>
              <TableCell>
                <Switch
                  checked={rule.isActive}
                  onCheckedChange={() => onToggleActive(rule)}
                  disabled={isLoading}
                />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditRule(rule)} disabled={isLoading}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeleteRule(rule)}
                      disabled={isLoading}
                      className="text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
