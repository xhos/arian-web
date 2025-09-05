import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import type { Transaction } from "@/gen/arian/v1/transaction_pb";
import type { Cursor } from "@/gen/arian/v1/common_pb";

export function useTransactions(accountId?: bigint) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<Cursor | null>(null);

  const loadTransactions = useCallback(
    async (cursor?: Cursor | null, isLoadingMore = false) => {
      try {
        if (isLoadingMore) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
          setError("");
        }

        const session = await authClient.getSession();
        const userId = session.data?.user?.id;

        if (!userId) {
          setError("User not authenticated");
          return;
        }

        const requestBody: {
          userId: string;
          limit: number;
          accountId?: string;
          cursor?: Cursor;
        } = {
          userId,
          limit: 50,
        };

        if (accountId) {
          requestBody.accountId = accountId.toString();
        }

        if (cursor) {
          requestBody.cursor = cursor;
        }

        const response = await fetch("/api/arian.v1.TransactionService/ListTransactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`Failed to load transactions: ${response.statusText}`);
        }

        const data = await response.json();
        const newTransactions = data.transactions || [];

        if (isLoadingMore) {
          setTransactions((prev) => [...prev, ...newTransactions]);
        } else {
          setTransactions(newTransactions);
        }

        setNextCursor(data.nextCursor || null);
        setHasMore(!!data.nextCursor && newTransactions.length > 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load transactions");
        if (!isLoadingMore) {
          setTransactions([]);
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [accountId]
  );

  const refresh = useCallback(() => {
    setTransactions([]);
    setNextCursor(null);
    setHasMore(true);
    loadTransactions();
  }, [loadTransactions]);

  const loadMore = useCallback(() => {
    if (hasMore && !isLoadingMore) {
      loadTransactions(nextCursor, true);
    }
  }, [hasMore, isLoadingMore, nextCursor, loadTransactions]);

  useEffect(() => {
    loadTransactions();
  }, [accountId, loadTransactions]);

  return {
    transactions,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    refresh,
    loadMore,
  };
}