import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionsApi, type CreateTransactionInput, type UpdateTransactionInput } from "@/lib/api/transactions";
import type { Transaction } from "@/gen/arian/v1/transaction_pb";
import type { Cursor } from "@/gen/arian/v1/common_pb";
import { useMemo } from "react";
import { useUserId } from "./useSession";

interface UseTransactionsQueryOptions {
  accountId?: bigint;
  enabled?: boolean;
}

export function useTransactionsQuery({
  accountId,
  enabled = true,
}: UseTransactionsQueryOptions = {}) {
  const queryClient = useQueryClient();
  const userId = useUserId();

  // Infinite query for transactions with pagination
  const transactionsQuery = useInfiniteQuery({
    queryKey: ["transactions", accountId?.toString()],
    queryFn: async ({ pageParam }) => {
      if (!userId) throw new Error("User not authenticated");
      return transactionsApi.list({
        userId,
        limit: 50,
        accountId,
        cursor: pageParam,
      });
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    initialPageParam: undefined as Cursor | undefined,
  });

  // Flatten all pages into single transactions array
  const allTransactions = useMemo(() => {
    return transactionsQuery.data?.pages.flatMap((page) => page.transactions) ?? [];
  }, [transactionsQuery.data]);

  const hasNextPage = transactionsQuery.hasNextPage;
  const isFetchingNextPage = transactionsQuery.isFetchingNextPage;

  // Optimistic delete mutation
  const deleteTransactionsMutation = useMutation({
    mutationFn: async (transactionIds: bigint[]) => {
      if (!userId) throw new Error("User not authenticated");
      return transactionsApi.bulkDelete(userId, transactionIds);
    },
    onMutate: async (transactionIds) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["transactions", accountId?.toString()] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(["transactions", accountId?.toString()]);

      // Optimistically update the cache for infinite query
      queryClient.setQueryData(
        ["transactions", accountId?.toString()],
        (old: { pages?: Array<{ transactions: Transaction[] }> }) => {
          if (!old?.pages) return old;

          const idsToDelete = new Set(transactionIds.map((id) => id.toString()));

          return {
            ...old,
            pages: old.pages.map((page: { transactions: Transaction[] }) => ({
              ...page,
              transactions: page.transactions.filter(
                (t: Transaction) => !idsToDelete.has(t.id.toString())
              ),
            })),
          };
        }
      );

      // Return context with snapshot
      return { previousData };
    },
    onError: (err, transactionIds, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(["transactions", accountId?.toString()], context.previousData);
      }
    },
    onSuccess: () => {
      // Invalidate related queries to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-summary"] });
    },
  });

  // Create transaction mutation
  const createTransactionMutation = useMutation({
    mutationFn: async (formData: Omit<CreateTransactionInput, "userId">) => {
      if (!userId) throw new Error("User not authenticated");
      return transactionsApi.create({ ...formData, userId });
    },
    onSuccess: () => {
      // Invalidate and refetch transactions
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-summary"] });
    },
  });

  // Update transaction mutation
  const updateTransactionMutation = useMutation({
    mutationFn: async (formData: Omit<UpdateTransactionInput, "userId">) => {
      if (!userId) throw new Error("User not authenticated");
      return transactionsApi.update({ ...formData, userId });
    },
    onSuccess: () => {
      // Invalidate and refetch transactions
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      queryClient.invalidateQueries({ queryKey: ["transaction-summary"] });
    },
  });

  return {
    // Query state
    transactions: allTransactions,
    isLoading: transactionsQuery.isLoading,
    error: transactionsQuery.error,
    hasMore: hasNextPage,
    isLoadingMore: isFetchingNextPage,

    // Pagination
    loadMore: transactionsQuery.fetchNextPage,

    // Mutations
    deleteTransactions: deleteTransactionsMutation.mutate,
    isDeleting: deleteTransactionsMutation.isPending,
    deleteError: deleteTransactionsMutation.error,

    createTransaction: createTransactionMutation.mutateAsync,
    isCreating: createTransactionMutation.isPending,
    createError: createTransactionMutation.error,

    updateTransaction: updateTransactionMutation.mutateAsync,
    isUpdating: updateTransactionMutation.isPending,
    updateError: updateTransactionMutation.error,

    // Manual controls
    refetch: transactionsQuery.refetch,
    invalidate: () =>
      queryClient.invalidateQueries({ queryKey: ["transactions", accountId?.toString()] }),
  };
}
