"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { useUserId } from "@/hooks/useSession";
import { useRules, useCreateRule, useUpdateRule, useDeleteRule } from "@/hooks/useRules";
import { useCategories } from "@/hooks/useCategories";
import { PageContainer, PageContent, PageHeaderWithTitle } from "@/components/ui/layout";
import type { Rule } from "@/gen/arian/v1/rule_pb";
import type { Category } from "@/gen/arian/v1/category_pb";
import type { TransactionRule } from "@/lib/rules";

import { RulesTable } from "./components/RulesTable";
import { RuleDialog } from "./components/RuleDialog";
import { DeleteRuleDialog } from "./components/DeleteRuleDialog";

export default function RulesPage() {
  const userId = useUserId();

  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<Rule | null>(null);

  const { rules, isLoading: rulesLoading, error: rulesError } = useRules();
  const { categories } = useCategories();

  const {
    createRule,
    isPending: isCreating,
    error: createError,
    reset: resetCreate,
  } = useCreateRule();

  const {
    updateRule,
    isPending: isUpdating,
    error: updateError,
    reset: resetUpdate,
  } = useUpdateRule();

  const { deleteRule, isPending: isDeleting } = useDeleteRule();

  const handleCreateRule = (ruleData: {
    ruleName: string;
    categoryId?: bigint;
    merchant?: string;
    conditions: TransactionRule;
    isActive: boolean;
    priorityOrder: number;
    applyToExisting: boolean;
  }) => {
    createRule(ruleData, {
      onSuccess: () => setIsCreateDialogOpen(false),
    });
  };

  const handleUpdateRule = (ruleData: {
    ruleName?: string;
    categoryId?: bigint;
    merchant?: string;
    conditions?: TransactionRule;
    isActive?: boolean;
    priorityOrder?: number;
  }) => {
    if (!selectedRule) return;
    updateRule(
      { ruleId: selectedRule.ruleId, data: ruleData },
      {
        onSuccess: () => {
          setIsEditDialogOpen(false);
          setSelectedRule(null);
        },
      }
    );
  };

  const handleDeleteRule = () => {
    if (!ruleToDelete) return;
    deleteRule(ruleToDelete.ruleId, {
      onSuccess: () => setRuleToDelete(null),
    });
  };

  const handleEditRule = (rule: Rule) => {
    setSelectedRule(rule);
    setIsEditDialogOpen(true);
  };

  const handleToggleActiveRule = (rule: Rule) => {
    updateRule({
      ruleId: rule.ruleId,
      data: {
        ruleName: rule.ruleName,
        categoryId: rule.categoryId,
        merchant: rule.merchant,
        conditions: rule.conditions as unknown as TransactionRule,
        isActive: !rule.isActive,
        priorityOrder: rule.priorityOrder,
      },
    });
  };

  const isOperationLoading = isCreating || isUpdating || isDeleting;

  const categoriesMap = useMemo(() => {
    return categories.reduce(
      (acc, category) => {
        acc[category.id.toString()] = category;
        return acc;
      },
      {} as Record<string, Category>
    );
  }, [categories]);

  if (!userId) {
    return (
      <PageContainer>
        <PageContent>
          <div className="text-sm text-muted-foreground">loading session...</div>
        </PageContent>
      </PageContainer>
    );
  }

  if (rulesLoading) {
    return (
      <PageContainer>
        <PageContent>
          <PageHeaderWithTitle title="rules" />
          <div className="text-sm text-muted-foreground">Loading rules...</div>
        </PageContent>
      </PageContainer>
    );
  }

  if (rulesError) {
    return (
      <PageContainer>
        <PageContent>
          <PageHeaderWithTitle title="rules" />
          <div className="text-sm text-destructive">Error loading rules: {rulesError.message}</div>
        </PageContent>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageContent>
        <PageHeaderWithTitle title="rules" />

        <RulesTable
          rules={rules}
          categories={categoriesMap}
          onEditRule={handleEditRule}
          onDeleteRule={setRuleToDelete}
          onToggleActive={handleToggleActiveRule}
          onCreateNew={() => setIsCreateDialogOpen(true)}
          isLoading={isOperationLoading}
        />

        <RuleDialog
          isOpen={isCreateDialogOpen}
          onClose={() => {
            setIsCreateDialogOpen(false);
            resetCreate();
          }}
          onSubmit={handleCreateRule}
          categories={categories}
          title="Create rule"
          submitText="Create rule"
          isLoading={isCreating}
          error={createError?.message}
        />

        <RuleDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedRule(null);
            resetUpdate();
          }}
          onSubmit={handleUpdateRule}
          categories={categories}
          rule={selectedRule}
          title="Edit Rule"
          submitText="Update Rule"
          isLoading={isUpdating}
          error={updateError?.message}
        />

        <DeleteRuleDialog
          rule={ruleToDelete}
          onClose={() => setRuleToDelete(null)}
          onConfirm={handleDeleteRule}
          isLoading={isDeleting}
        />
      </PageContent>
    </PageContainer>
  );
}
