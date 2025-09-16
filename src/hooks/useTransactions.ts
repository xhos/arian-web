import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { transactionClient } from "@/lib/grpc-client";
import { create } from "@bufbuild/protobuf";
import { ListTransactionsRequestSchema } from "@/gen/arian/v1/transaction_services_pb";
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

        const request = create(ListTransactionsRequestSchema, {
          userId,
          limit: 50,
          accountId,
          cursor: cursor || undefined,
        });

        const response = await transactionClient.listTransactions(request);

        if (isLoadingMore) {
          setTransactions((prev) => [...prev, ...response.transactions]);
        } else {
          setTransactions(response.transactions);
        }

        setNextCursor(response.nextCursor || null);
        setHasMore(!!response.nextCursor && response.transactions.length > 0);
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