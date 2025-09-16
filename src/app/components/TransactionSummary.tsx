"use client";

import { useQueryClient } from "@tanstack/react-query";

interface TransactionSummaryProps {
  accountId?: bigint;
}

export default function TransactionSummary({ accountId }: TransactionSummaryProps) {
  const queryClient = useQueryClient();
  
  // Get cached data without triggering a new query
  const transactionData = queryClient.getQueryData(["transactions", accountId?.toString()]);

  // Calculate total from cached transaction data
  const totalCount = (transactionData as any)?.pages 
    ? (transactionData as any).pages.reduce((total: number, page: any) => total + page.transactions.length, 0)
    : 0;

  return (
    <div className="flex items-center gap-4 text-sm tui-muted">
      <span>total: {totalCount.toLocaleString()} transactions loaded</span>
    </div>
  );
}
