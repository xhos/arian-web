"use client";

import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { create, type JsonObject } from "@bufbuild/protobuf";
import { ruleClient, categoryClient } from "@/lib/grpc-client";
import {
  ListRulesRequestSchema,
  CreateRuleRequestSchema,
  UpdateRuleRequestSchema,
  DeleteRuleRequestSchema,
} from "@/gen/arian/v1/rule_services_pb";
import { ListCategoriesRequestSchema } from "@/gen/arian/v1/category_services_pb";
import { useUserId } from "@/hooks/useSession";
import type { Rule } from "@/gen/arian/v1/rule_pb";
import type { Category } from "@/gen/arian/v1/category_pb";

import { RulesTable } from "./components/RulesTable";
import { RuleDialog } from "./components/RuleDialog";
import { DeleteRuleDialog } from "./components/DeleteRuleDialog";
import type { TransactionRule } from "@/lib/rules";

export default function RulesPage() {
  const userId = useUserId();
  const queryClient = useQueryClient();

  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<Rule | null>(null);

  // Fetch rules
  const {
    data: rules = [],
    isLoading: rulesLoading,
    error: rulesError,
  } = useQuery({
    queryKey: ["rules", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated");

      const request = create(ListRulesRequestSchema, { userId });
      const response = await ruleClient.listRules(request);
      return response.rules;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Fetch categories for rule creation/editing
  const { data: categories = [] } = useQuery({
    queryKey: ["categories", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated");

      const request = create(ListCategoriesRequestSchema, { userId });
      const response = await categoryClient.listCategories(request);
      return response.categories;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Create rule mutation
  const createRuleMutation = useMutation({
    mutationFn: async (ruleData: {
      ruleName: string;
      categoryId?: bigint;
      merchant?: string;
      conditions: TransactionRule;
      isActive: boolean;
      priorityOrder: number;
      applyToExisting: boolean;
    }) => {
      if (!userId) throw new Error("User not authenticated");

      const request = create(CreateRuleRequestSchema, {
        userId,
        ruleName: ruleData.ruleName,
        categoryId: ruleData.categoryId,
        merchant: ruleData.merchant,
        conditions: ruleData.conditions as unknown as JsonObject,
        applyToExisting: ruleData.applyToExisting,
      });

      const response = await ruleClient.createRule(request);
      return response.rule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      setIsCreateDialogOpen(false);
    },
  });

  // Update rule mutation
  const updateRuleMutation = useMutation({
    mutationFn: async ({
      ruleId,
      ruleData,
    }: {
      ruleId: string;
      ruleData: {
        ruleName?: string;
        categoryId?: bigint;
        merchant?: string;
        conditions?: TransactionRule;
        isActive?: boolean;
        priorityOrder?: number;
      };
    }) => {
      if (!userId) throw new Error("User not authenticated");

      const updatePaths = [];
      if (ruleData.ruleName !== undefined) updatePaths.push("rule_name");
      if (ruleData.categoryId !== undefined) updatePaths.push("category_id");
      if (ruleData.merchant !== undefined) updatePaths.push("merchant");
      if (ruleData.conditions !== undefined) updatePaths.push("conditions");
      if (ruleData.isActive !== undefined) updatePaths.push("is_active");
      if (ruleData.priorityOrder !== undefined) updatePaths.push("priority_order");

      const { conditions, ...restRuleData } = ruleData;
      const request = create(UpdateRuleRequestSchema, {
        ruleId,
        userId,
        updateMask: { paths: updatePaths },
        ...restRuleData,
        ...(conditions && { conditions: conditions as unknown as JsonObject }),
      });

      const response = await ruleClient.updateRule(request);
      return response.rule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      setIsEditDialogOpen(false);
      setSelectedRule(null);
    },
  });

  // Delete rule mutation
  const deleteRuleMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      if (!userId) throw new Error("User not authenticated");

      const request = create(DeleteRuleRequestSchema, {
        ruleId,
        userId,
      });

      await ruleClient.deleteRule(request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
      setRuleToDelete(null);
    },
  });

  const handleCreateRule = (ruleData: {
    ruleName: string;
    categoryId?: bigint;
    merchant?: string;
    conditions: TransactionRule;
    isActive: boolean;
    priorityOrder: number;
    applyToExisting: boolean;
  }) => {
    createRuleMutation.mutate(ruleData);
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
    updateRuleMutation.mutate({ ruleId: selectedRule.ruleId, ruleData });
  };

  const handleDeleteRule = () => {
    if (!ruleToDelete) return;
    deleteRuleMutation.mutate(ruleToDelete.ruleId);
  };

  const handleEditRule = (rule: Rule) => {
    setSelectedRule(rule);
    setIsEditDialogOpen(true);
  };

  const handleToggleActiveRule = (rule: Rule) => {
    updateRuleMutation.mutate({
      ruleId: rule.ruleId,
      ruleData: {
        ruleName: rule.ruleName,
        categoryId: rule.categoryId,
        merchant: rule.merchant,
        conditions: rule.conditions as unknown as TransactionRule,
        isActive: !rule.isActive,
        priorityOrder: rule.priorityOrder,
      },
    });
  };

  const isOperationLoading =
    createRuleMutation.isPending || updateRuleMutation.isPending || deleteRuleMutation.isPending;

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
      <div className="min-h-screen p-6">
        <div className="text-sm tui-muted">loading session...</div>
      </div>
    );
  }

  if (rulesLoading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-mono mb-4">rules</h1>
          <div className="text-sm tui-muted">Loading rules...</div>
        </div>
      </div>
    );
  }

  if (rulesError) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-mono mb-4">rules</h1>
          <div className="text-sm text-red-600">Error loading rules: {rulesError.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-2xl font-mono mb-4">rules</h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm tui-muted">
              <span>total: {rules.length} rules</span>
              <span>active: {rules.filter((r) => r.isActive).length}</span>
            </div>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              size="sm"
              disabled={isOperationLoading}
            >
              create rule
            </Button>
          </div>
        </header>

        <RulesTable
          rules={rules}
          categories={categoriesMap}
          onEditRule={handleEditRule}
          onDeleteRule={setRuleToDelete}
          onToggleActive={handleToggleActiveRule}
          isLoading={isOperationLoading}
        />

        <RuleDialog
          isOpen={isCreateDialogOpen}
          onClose={() => {
            setIsCreateDialogOpen(false);
            createRuleMutation.reset();
          }}
          onSubmit={handleCreateRule}
          categories={categories}
          title="Create rule"
          submitText="Create rule"
          isLoading={createRuleMutation.isPending}
          error={createRuleMutation.error?.message}
        />

        <RuleDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setSelectedRule(null);
            updateRuleMutation.reset();
          }}
          onSubmit={handleUpdateRule}
          categories={categories}
          rule={selectedRule}
          title="Edit Rule"
          submitText="Update Rule"
          isLoading={updateRuleMutation.isPending}
          error={updateRuleMutation.error?.message}
        />

        <DeleteRuleDialog
          rule={ruleToDelete}
          onClose={() => setRuleToDelete(null)}
          onConfirm={handleDeleteRule}
          isLoading={deleteRuleMutation.isPending}
        />
      </div>
    </div>
  );
}
