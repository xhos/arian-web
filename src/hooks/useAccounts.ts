import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";

export function useAccounts() {
  const [accountsMap, setAccountsMap] = useState<Map<string, { name: string; alias?: string }>>(new Map());

  const loadAccounts = useCallback(async () => {
    try {
      const session = await authClient.getSession();
      const userId = session.data?.user?.id;
      if (!userId) return;

      const response = await fetch("/api/arian.v1.AccountService/ListAccounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        const accounts = data.accounts || [];
        const map = new Map<string, { name: string; alias?: string }>();
        
        accounts.forEach((account: { id: { toString: () => string }; name: string; alias?: string }) => {
          map.set(account.id.toString(), {
            name: account.name,
            alias: account.alias
          });
        });
        
        setAccountsMap(map);
      }
    } catch (error) {
      console.warn('Failed to load accounts for transaction display:', error);
    }
  }, []);

  const getAccountDisplayName = useCallback((accountId: bigint, fallbackName?: string) => {
    const accountInfo = accountsMap.get(accountId.toString());
    if (accountInfo) {
      return accountInfo.alias || accountInfo.name;
    }
    return fallbackName || `Account #${accountId}`;
  }, [accountsMap]);

  const getAccountFullName = useCallback((accountId: bigint, fallbackName?: string) => {
    const accountInfo = accountsMap.get(accountId.toString());
    if (accountInfo) {
      const parts = [];
      if (accountInfo.name) parts.push(accountInfo.name);
      if (accountInfo.alias) parts.push(`(${accountInfo.alias})`);
      return parts.join(' ') || `Account #${accountId}`;
    }
    return fallbackName || `Account #${accountId}`;
  }, [accountsMap]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  return {
    accountsMap,
    getAccountDisplayName,
    getAccountFullName,
  };
}