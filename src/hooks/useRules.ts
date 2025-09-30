import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { ruleClient } from "@/lib/grpc-client";
import { create } from "@bufbuild/protobuf";
import { ListRulesRequestSchema } from "@/gen/arian/v1/rule_services_pb";
import { useUserId } from "./useSession";

export function useRules() {
  const userId = useUserId();

  const {
    data: rules = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["rules", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated");

      const request = create(ListRulesRequestSchema, { userId });
      const response = await ruleClient.listRules(request);
      return response.rules;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  const activeRules = useMemo(() => {
    return rules.filter((rule) => rule.isActive);
  }, [rules]);

  const rulesByCategory = useMemo(() => {
    const map = new Map<string, typeof rules>();
    rules.forEach((rule) => {
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
  };
}
