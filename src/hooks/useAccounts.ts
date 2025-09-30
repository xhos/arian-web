import { useQuery } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { accountClient } from "@/lib/grpc-client";
import { create } from "@bufbuild/protobuf";
import { ListAccountsRequestSchema } from "@/gen/arian/v1/account_services_pb";
import { useUserId } from "./useSession";

export function useAccounts() {
  const userId = useUserId();

  const { data: accounts = [] } = useQuery({
    queryKey: ["accounts", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User not authenticated");

      const request = create(ListAccountsRequestSchema, { userId });
      const response = await accountClient.listAccounts(request);
      return response.accounts;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });

  const accountsMap = useMemo(() => {
    const map = new Map<string, { name: string; alias?: string }>();
    accounts.forEach((account) => {
      map.set(account.id.toString(), {
        name: account.name,
        alias: account.alias,
      });
    });
    return map;
  }, [accounts]);

  const getAccountDisplayName = useCallback(
    (accountId: bigint, fallbackName?: string) => {
      const accountInfo = accountsMap.get(accountId.toString());
      if (accountInfo) {
        return accountInfo.alias || accountInfo.name;
      }
      return fallbackName || `Account #${accountId}`;
    },
    [accountsMap]
  );

  const getAccountFullName = useCallback(
    (accountId: bigint, fallbackName?: string) => {
      const accountInfo = accountsMap.get(accountId.toString());
      if (accountInfo) {
        const parts = [];
        if (accountInfo.name) parts.push(accountInfo.name);
        if (accountInfo.alias) parts.push(`(${accountInfo.alias})`);
        return parts.join(" ") || `Account #${accountId}`;
      }
      return fallbackName || `Account #${accountId}`;
    },
    [accountsMap]
  );

  return {
    accounts,
    accountsMap,
    getAccountDisplayName,
    getAccountFullName,
  };
}
