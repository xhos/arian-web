import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { rulesApi, type CreateRuleInput, type UpdateRuleInput } from "@/lib/api/rules";
import { useUserId } from "./useSession";

export function useRules() {
  const userId = useUserId();

  const {
    data: rules = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["rules", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated");
      return rulesApi.list(userId);
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const activeRules = useMemo(() => {
    return rules.filter((rule) => rule.isActive);
  }, [rules]);

  const rulesByCategory = useMemo(() => {
    const map = new Map<string, typeof rules>();
    rules.forEach((rule) => {
      if (!rule.categoryId) return;
      const categoryId = rule.categoryId.toString();
      if (!map.has(categoryId)) {
        map.set(categoryId, []);
      }
      map.get(categoryId)!.push(rule);
    });
    return map;
  }, [rules]);

  const rulesMap = useMemo(() => {
    const map = new Map<string, (typeof rules)[0]>();
    rules.forEach((rule) => {
      map.set(rule.ruleId, rule);
    });
    return map;
  }, [rules]);

  return {
    rules,
    activeRules,
    rulesByCategory,
    rulesMap,
    isLoading,
    error,
    refetch,
  };
}

export function useCreateRule() {
  const userId = useUserId();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: CreateRuleInput) => {
      if (!userId) throw new Error("User not authenticated");
      return rulesApi.create(userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
    },
  });

  return {
    createRule: mutation.mutate,
    createRuleAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

export function useUpdateRule() {
  const userId = useUserId();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ ruleId, data }: { ruleId: string; data: UpdateRuleInput }) => {
      if (!userId) throw new Error("User not authenticated");
      return rulesApi.update(userId, ruleId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
    },
  });

  return {
    updateRule: mutation.mutate,
    updateRuleAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

export function useDeleteRule() {
  const userId = useUserId();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (ruleId: string) => {
      if (!userId) throw new Error("User not authenticated");
      return rulesApi.delete(userId, ruleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rules"] });
    },
  });

  return {
    deleteRule: mutation.mutate,
    deleteRuleAsync: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
