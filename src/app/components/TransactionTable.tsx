"use client";

import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import { authClient } from "@/lib/auth-client";
import type { Transaction } from "@/gen/arian/v1/transaction_pb";
import { TransactionDirection, CategorizationStatus } from "@/gen/arian/v1/enums_pb";
import type { Cursor } from "@/gen/arian/v1/common_pb";

interface TransactionTableProps {
  accountId?: bigint;
}

const TransactionTable = forwardRef<{ refresh: () => void }, TransactionTableProps>(
  ({ accountId }, ref) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState("");
    const [hasMore, setHasMore] = useState(true);
    const [nextCursor, setNextCursor] = useState<Cursor | null>(null);
    const observerRef = useRef<IntersectionObserver>();

    const formatAmount = (amount?: { 
      currencyCode?: string; 
      currency_code?: string; 
      units?: string; 
      nanos?: number;
    }) => {
      if (!amount?.units) return "—";
      const value = parseFloat(amount.units) + (amount.nanos || 0) / 1e9;
      const currencyCode = amount.currencyCode || amount.currency_code || "USD";
      
      try {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: currencyCode,
        }).format(value);
      } catch (error) {
        // Fallback for invalid currency codes
        console.warn(`Invalid currency code: ${currencyCode}`, error);
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(value);
      }
    };

    const formatDate = (timestamp?: { seconds?: string; nanos?: number }) => {
      if (!timestamp?.seconds) return "—";
      return new Date(parseInt(timestamp.seconds) * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    };

    const getDirectionDisplay = (direction: TransactionDirection) => {
      if (direction === TransactionDirection.DIRECTION_INCOMING) {
        return { symbol: "+", className: "text-green-500", label: "in" };
      }
      return { symbol: "-", className: "text-red-500", label: "out" };
    };

    const getCategorizationStatusDisplay = (status: CategorizationStatus) => {
      switch (status) {
        case CategorizationStatus.CATEGORIZATION_MANUAL:
          return { text: "manual", className: "tui-accent" };
        case CategorizationStatus.CATEGORIZATION_AUTO:
          return { text: "auto", className: "text-blue-500" };
        case CategorizationStatus.CATEGORIZATION_VERIFIED:
          return { text: "verified", className: "text-green-500" };
        case CategorizationStatus.CATEGORIZATION_NONE:
          return { text: "none", className: "tui-muted" };
        default:
          return { text: "unknown", className: "tui-muted" };
      }
    };

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

    const lastTransactionElementCallback = useCallback(
      (node: HTMLTableRowElement) => {
        if (isLoadingMore) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
            loadTransactions(nextCursor, true);
          }
        });

        if (node) observerRef.current.observe(node);
      },
      [hasMore, isLoadingMore, nextCursor, loadTransactions]
    );

    const refresh = useCallback(() => {
      setTransactions([]);
      setNextCursor(null);
      setHasMore(true);
      loadTransactions();
    }, [loadTransactions]);

    useImperativeHandle(ref, () => ({
      refresh,
    }));

    useEffect(() => {
      loadTransactions();
      return () => {
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      };
    }, [accountId, loadTransactions]);

    if (isLoading) {
      return (
        <div className="text-center p-8">
          <div className="text-sm tui-muted">loading transactions...</div>
        </div>
      );
    }

    if (error) {
      return <div className="p-4 text-sm font-mono text-red-600 tui-border">{error}</div>;
    }

    if (transactions.length === 0) {
      return (
        <div className="tui-border p-8 text-center">
          <div className="text-sm tui-muted mb-2">No transactions yet</div>
          <div className="text-xs tui-muted">
            {accountId
              ? "No transactions found for this account"
              : "Connect your accounts to start tracking transactions"}
          </div>
        </div>
      );
    }

    return (
      <div className="tui-border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="tui-border-b">
              <tr>
                <th className="text-left p-3 tui-muted font-normal">date</th>
                <th className="text-left p-3 tui-muted font-normal">description</th>
                <th className="text-left p-3 tui-muted font-normal">merchant</th>
                <th className="text-left p-3 tui-muted font-normal">category</th>
                <th className="text-left p-3 tui-muted font-normal">account</th>
                <th className="text-right p-3 tui-muted font-normal">amount</th>
                <th className="text-center p-3 tui-muted font-normal">status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, index) => {
                const directionInfo = getDirectionDisplay(transaction.direction);
                const categoryInfo = getCategorizationStatusDisplay(
                  transaction.categorizationStatus
                );
                const isLast = index === transactions.length - 1;

                return (
                  <tr
                    key={transaction.id.toString()}
                    ref={isLast ? lastTransactionElementCallback : undefined}
                    className="tui-border-b hover:bg-muted/5 transition-colors cursor-pointer"
                    onClick={() => window.open(`/transaction/${transaction.id}`, "_blank")}
                  >
                    <td className="p-3 font-mono text-xs">{formatDate(transaction.txDate)}</td>
                    <td className="p-3 max-w-48">
                      <div className="truncate" title={transaction.description}>
                        {transaction.description || "—"}
                      </div>
                    </td>
                    <td className="p-3 max-w-32">
                      <div className="truncate" title={transaction.merchant}>
                        {transaction.merchant || "—"}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-24" title={transaction.category?.name}>
                          {transaction.category?.name || "—"}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 max-w-24">
                      <div className="truncate text-xs" title={transaction.accountName}>
                        {transaction.accountName || "—"}
                      </div>
                    </td>
                    <td className="p-3 text-right font-mono">
                      <span className={directionInfo.className}>
                        {directionInfo.symbol}
                        {formatAmount(transaction.txAmount).replace("-", "")}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-xs ${categoryInfo.className}`}>
                        {categoryInfo.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {isLoadingMore && (
          <div className="p-4 text-center text-sm tui-muted border-t border-border">
            loading more...
          </div>
        )}

        {!hasMore && transactions.length > 0 && (
          <div className="p-4 text-center text-xs tui-muted border-t border-border">
            all transactions loaded
          </div>
        )}
      </div>
    );
  }
);

TransactionTable.displayName = "TransactionTable";

export default TransactionTable;
