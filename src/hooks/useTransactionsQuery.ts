import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { transactionClient } from "@/lib/grpc-client";
import { create } from "@bufbuild/protobuf";
import { ListTransactionsRequestSchema } from "@/gen/arian/v1/transaction_services_pb";
import type { Transaction } from "@/gen/arian/v1/transaction_pb";
import type { Cursor } from "@/gen/arian/v1/common_pb";
import { useMemo } from "react";
import { useUserId } from "./useSession";

interface UseTransactionsQueryOptions {
  accountId?: bigint;
  enabled?: boolean;
}

export function useTransactionsQuery({ accountId, enabled = true }: UseTransactionsQueryOptions = {}) {
  const queryClient = useQueryClient();
  const userId = useUserId();

  // Infinite query for transactions with pagination
  const transactionsQuery = useInfiniteQuery({
    queryKey: ["transactions", accountId?.toString()],
    queryFn: async ({ pageParam }) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const request = create(ListTransactionsRequestSchema, {
        userId,
        limit: 50, // Reasonable page size
        accountId,
        cursor: pageParam || undefined,
      });

      const response = await transactionClient.listTransactions(request);
      return {
        transactions: response.transactions,
        nextCursor: response.nextCursor,
        hasMore: !!response.nextCursor && response.transactions.length > 0,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    enabled: enabled && !!userId,
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    initialPageParam: undefined as Cursor | undefined,
  });

  // Flatten all pages into single transactions array
  const allTransactions = useMemo(() => {
    return transactionsQuery.data?.pages.flatMap(page => page.transactions) ?? [];
  }, [transactionsQuery.data]);

  const hasNextPage = transactionsQuery.hasNextPage;
  const isFetchingNextPage = transactionsQuery.isFetchingNextPage;

  // Optimistic delete mutation
  const deleteTransactionsMutation = useMutation({
    mutationFn: async (transactionIds: bigint[]) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const response = await fetch(`/api/arian.v1.TransactionService/BulkDeleteTransactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          transaction_ids: transactionIds.map(id => parseInt(id.toString())),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to delete transactions: ${response.statusText}`);
      }

      return response.json();
    },
    onMutate: async (transactionIds) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["transactions", accountId?.toString()] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData(["transactions", accountId?.toString()]);

      // Optimistically update the cache for infinite query
      queryClient.setQueryData(["transactions", accountId?.toString()], (old: any) => {
        if (!old?.pages) return old;
        
        const idsToDelete = new Set(transactionIds.map(id => id.toString()));
        
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            transactions: page.transactions.filter((t: Transaction) => 
              !idsToDelete.has(t.id.toString())
            ),
          })),
        };
      });

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
    mutationFn: async (formData: any) => {
      if (!userId) {
        throw new Error("User not authenticated");
      }

      const requestBody = {
        user_id: userId,
        account_id: parseInt(formData.accountId.toString()),
        tx_date: formData.txDate.toISOString(),
        tx_amount: formData.txAmount,
        direction: formData.direction,
        description: formData.description,
        merchant: formData.merchant,
        user_notes: formData.userNotes,
        category_id: formData.categoryId ? parseInt(formData.categoryId.toString()) : undefined,
      };

      const response = await fetch("/api/arian.v1.TransactionService/CreateTransaction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create transaction: ${response.statusText}`);
      }

      return response.json();
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
    
    // Manual controls
    refetch: transactionsQuery.refetch,
    invalidate: () => queryClient.invalidateQueries({ queryKey: ["transactions", accountId?.toString()] }),
  };
}