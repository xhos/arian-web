"use client";

import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";

interface TransactionSummaryProps {
  accountId?: bigint;
}

export default function TransactionSummary({ accountId }: TransactionSummaryProps) {
  const [summary, setSummary] = useState({
    totalCount: 0,
    balance: "$0.00",
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadSummary = useCallback(async () => {
    try {
      setIsLoading(true);
      const session = await authClient.getSession();
      const userId = session.data?.user?.id;

      if (!userId) return;

      const requestBody: {
        userId: string;
        limit: number;
        accountId?: string;
      } = {
        userId,
        limit: 1, // We just need the total count from the first request
      };

      if (accountId) {
        requestBody.accountId = accountId.toString();
      }

      const response = await fetch("/api/arian.v1.TransactionService/ListTransactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) return;

      const data = await response.json();
      setSummary({
        totalCount: data.totalCount || 0,
        balance: "$0.00", // Could be calculated from account balances
      });
    } catch {
      // Ignore errors, just show default values
    } finally {
      setIsLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    loadSummary();
  }, [accountId, loadSummary]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-4 text-sm tui-muted">
        <span>loading summary...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 text-sm tui-muted">
      <span>total: {summary.totalCount.toLocaleString()} transactions</span>
    </div>
  );
}
