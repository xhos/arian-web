"use client";

import { useState, useRef, forwardRef, useImperativeHandle, useCallback } from "react";
import type { Transaction } from "@/gen/arian/v1/transaction_pb";
import { TransactionDirection, CategorizationStatus } from "@/gen/arian/v1/enums_pb";
import { useTransactions } from "@/hooks/useTransactions";
import { useAccounts } from "@/hooks/useAccounts";
import { Collapse } from "@/components/Collapse";

interface TransactionCardsProps {
  accountId?: bigint;
}

interface DailyTransactionGroup {
  date: string;
  displayDate: string;
  transactions: Transaction[];
  totalIn: number;
  totalOut: number;
  netAmount: number;
}

const TransactionCards = forwardRef<{ refresh: () => void }, TransactionCardsProps>(
  ({ accountId }, ref) => {
    const { transactions, isLoading, isLoadingMore, error, hasMore, refresh, loadMore } = useTransactions(accountId);
    const { getAccountDisplayName, getAccountFullName } = useAccounts();
    const [expandedTransaction, setExpandedTransaction] = useState<bigint | null>(null);
    const observerRef = useRef<IntersectionObserver | null>(null);

    const formatAmount = (amount?: { currencyCode?: string; currency_code?: string; units?: string; nanos?: number }) => {
      if (!amount?.units) return 0;
      return parseFloat(amount.units) + (amount.nanos || 0) / 1e9;
    };

    const formatCurrency = (amount: number, currencyCode = "USD") => {
      const isValidCurrency = currencyCode && currencyCode.length === 3 && /^[A-Z]{3}$/.test(currencyCode);
      const finalCurrencyCode = isValidCurrency ? currencyCode : "USD";
      
      try {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: finalCurrencyCode,
        }).format(amount);
      } catch {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amount);
      }
    };

    const formatDate = (timestamp?: { seconds?: string; nanos?: number } | string) => {
      let date: Date;
      
      if (!timestamp) return { date: "", displayDate: "" };
      
      if (typeof timestamp === 'string') {
        date = new Date(timestamp);
      } else if (timestamp.seconds) {
        date = new Date(parseInt(timestamp.seconds) * 1000);
      } else {
        return { date: "", displayDate: "" };
      }
      
      if (isNaN(date.getTime())) {
        return { date: "", displayDate: "" };
      }
      
      const now = new Date();
      const isCurrentYear = date.getFullYear() === now.getFullYear();
      
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const isCurrentWeek = date >= startOfWeek && date <= endOfWeek;
      
      let displayOptions: Intl.DateTimeFormatOptions = {
        weekday: "long",
        month: "long", 
        day: "numeric"
      };
      
      if (!isCurrentYear) {
        displayOptions.year = "numeric";
      }
      
      if (isCurrentWeek) {
        displayOptions = { weekday: "long" };
      }
      
      return {
        date: date.toISOString().split('T')[0],
        displayDate: date.toLocaleDateString("en-US", displayOptions)
      };
    };

    const getDirectionDisplay = (direction: TransactionDirection) => {
      const normalizedDirection = typeof direction === 'string' 
        ? TransactionDirection[direction as keyof typeof TransactionDirection] 
        : direction;
        
      if (normalizedDirection === TransactionDirection.DIRECTION_INCOMING) {
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
        case CategorizationStatus.CATEGORIZATION_UNSPECIFIED:
          return { text: "unspecified", className: "tui-muted" };
        default:
          return { text: "unknown", className: "tui-muted" };
      }
    };

    const groupTransactionsByDay = useCallback((transactions: Transaction[]) => {
      const groups: { [key: string]: DailyTransactionGroup } = {};

      transactions.forEach((transaction) => {
        const { date, displayDate } = formatDate(transaction.txDate);
        if (!date) return;

        if (!groups[date]) {
          groups[date] = {
            date,
            displayDate,
            transactions: [],
            totalIn: 0,
            totalOut: 0,
            netAmount: 0,
          };
        }

        groups[date].transactions.push(transaction);

        const amount = formatAmount(transaction.txAmount);
        const normalizedDirection = typeof transaction.direction === 'string' 
          ? TransactionDirection[transaction.direction as keyof typeof TransactionDirection] 
          : transaction.direction;
          
        if (normalizedDirection === TransactionDirection.DIRECTION_INCOMING) {
          groups[date].totalIn += amount;
        } else {
          groups[date].totalOut += amount;
        }
        groups[date].netAmount = groups[date].totalIn - groups[date].totalOut;
      });

      return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
    }, []);

    const lastGroupElementCallback = useCallback(
      (node: HTMLDivElement) => {
        if (isLoadingMore) return;
        if (observerRef.current) observerRef.current.disconnect();

        observerRef.current = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
            loadMore();
          }
        });

        if (node) observerRef.current.observe(node);
      },
      [hasMore, isLoadingMore, loadMore]
    );

    const toggleTransactionExpansion = useCallback((transactionId: bigint) => {
      setExpandedTransaction(prev => prev === transactionId ? null : transactionId);
    }, []);

    useImperativeHandle(ref, () => ({ refresh }));

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

    const groupedTransactions = groupTransactionsByDay(transactions);

    if (groupedTransactions.length === 0) {
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
      <div className="space-y-6">
        {groupedTransactions.map((group, groupIndex) => {
          const isLast = groupIndex === groupedTransactions.length - 1;
          
          return (
            <div
              key={group.date}
              ref={isLast ? lastGroupElementCallback : undefined}
              className="space-y-3"
            >
              <div className="flex items-center justify-between py-2">
                <div>
                  <h3 className="text-sm font-medium">{group.displayDate}</h3>
                  <div className="text-xs tui-muted">
                    {group.transactions.length} transaction{group.transactions.length !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono">
                    <span className="text-green-500">+{formatCurrency(group.totalIn)}</span>
                    {" / "}
                    <span className="text-red-500">-{formatCurrency(group.totalOut)}</span>
                  </div>
                  <div className={`text-xs font-mono ${group.netAmount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    net: {formatCurrency(group.netAmount)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {group.transactions.map((transaction) => {
                  const directionInfo = getDirectionDisplay(transaction.direction);
                  const categoryInfo = getCategorizationStatusDisplay(transaction.categorizationStatus);
                  const amount = formatAmount(transaction.txAmount);
                  const isExpanded = expandedTransaction === transaction.id;

                  return (
                    <div key={transaction.id.toString()}>
                      <div className="tui-border hover:bg-muted/5 transition-colors">
                        <div
                          className="p-4 cursor-pointer"
                          onClick={() => toggleTransactionExpansion(transaction.id)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium truncate">
                                {transaction.description || transaction.merchant || "Unknown transaction"}
                              </h4>
                              {transaction.merchant && transaction.description !== transaction.merchant && (
                                <div className="text-xs tui-muted mt-1 truncate">
                                  {transaction.merchant}
                                </div>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <div className={`text-lg font-mono ${directionInfo.className}`}>
                                {directionInfo.symbol}{formatCurrency(amount).replace("-", "")}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              {transaction.accountId && (
                                <span className="tui-muted truncate">
                                  {getAccountDisplayName(transaction.accountId, transaction.accountName)}
                                </span>
                              )}
                              {transaction.category?.label && (
                                <>
                                  {transaction.accountId && <span className="tui-muted">•</span>}
                                  <span className="px-2 py-1 rounded tui-border">
                                    {transaction.category.label}
                                  </span>
                                </>
                              )}
                              {transaction.categorizationStatus === CategorizationStatus.CATEGORIZATION_MANUAL ||
                               transaction.categorizationStatus === CategorizationStatus.CATEGORIZATION_AUTO ||
                               transaction.categorizationStatus === CategorizationStatus.CATEGORIZATION_VERIFIED ? (
                                <>
                                  {(transaction.accountId || transaction.category?.label) && <span className="tui-muted">•</span>}
                                  <span className={categoryInfo.className}>
                                    {categoryInfo.text}
                                  </span>
                                </>
                              ) : null}
                            </div>
                            <div className="font-mono tui-muted">
                              {(() => {
                                let date: Date;
                                if (typeof transaction.txDate === 'string') {
                                  date = new Date(transaction.txDate);
                                } else if (transaction.txDate?.seconds) {
                                  date = new Date(parseInt(transaction.txDate.seconds) * 1000);
                                } else {
                                  return "—";
                                }
                                return date.toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                });
                              })()}
                            </div>
                          </div>
                        </div>
                      </div>

                      <Collapse open={isExpanded} duration={200} easing="ease-out">
                        <div className="tui-border border-t-0 px-4 pb-4 pt-4 bg-muted/2">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-xs tui-muted uppercase tracking-wider mb-2">Transaction Details</div>
                              <div className="space-y-2">
                                <div>
                                  <span className="tui-muted">ID:</span>
                                  <span className="ml-2 font-mono">#{transaction.id.toString()}</span>
                                </div>
                                <div>
                                  <span className="tui-muted">Account:</span>
                                  <span className="ml-2">{getAccountFullName(transaction.accountId, transaction.accountName)}</span>
                                </div>
                                {transaction.merchant && (
                                  <div>
                                    <span className="tui-muted">Merchant:</span>
                                    <span className="ml-2">{transaction.merchant}</span>
                                  </div>
                                )}
                                {(transaction.category?.name || transaction.category?.label) && (
                                  <div>
                                    <span className="tui-muted">Category:</span>
                                    <span className="ml-2">{transaction.category.name || transaction.category.label}</span>
                                  </div>
                                )}
                                {(transaction.categorizationStatus === CategorizationStatus.CATEGORIZATION_MANUAL ||
                                  transaction.categorizationStatus === CategorizationStatus.CATEGORIZATION_AUTO ||
                                  transaction.categorizationStatus === CategorizationStatus.CATEGORIZATION_VERIFIED) && (
                                  <div>
                                    <span className="tui-muted">Categorization:</span>
                                    <span className={`ml-2 ${categoryInfo.className}`}>{categoryInfo.text}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <div className="space-y-2">
                                {transaction.userNotes && (
                                  <div>
                                    <span className="tui-muted">Notes:</span>
                                    <span className="ml-2">{transaction.userNotes}</span>
                                  </div>
                                )}
                                {transaction.balanceAfter && (
                                  <div>
                                    <span className="tui-muted">Balance After:</span>
                                    <span className="ml-2 font-mono">{formatCurrency(formatAmount(transaction.balanceAfter))}</span>
                                  </div>
                                )}
                                {transaction.receiptId && (
                                  <div>
                                    <span className="tui-muted">Receipt ID:</span>
                                    <span className="ml-2 font-mono">#{transaction.receiptId.toString()}</span>
                                  </div>
                                )}
                                {transaction.foreignAmount && (
                                  <div>
                                    <span className="tui-muted">Foreign Amount:</span>
                                    <span className="ml-2 font-mono">{formatCurrency(formatAmount(transaction.foreignAmount))}</span>
                                  </div>
                                )}
                                {transaction.exchangeRate && (
                                  <div>
                                    <span className="tui-muted">Exchange Rate:</span>
                                    <span className="ml-2 font-mono">{transaction.exchangeRate}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {transaction.suggestions && transaction.suggestions.length > 0 && (
                            <div className="mt-4">
                              <div className="text-xs tui-muted uppercase tracking-wider mb-2">Suggestions</div>
                              <div className="flex flex-wrap gap-1">
                                {transaction.suggestions.map((suggestion, index) => (
                                  <span key={index} className="px-2 py-1 text-xs tui-border rounded">
                                    {suggestion}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {(transaction.createdAt?.seconds || transaction.updatedAt?.seconds) && (
                            <div className="mt-4 text-xs tui-muted">
                              <div className="flex justify-between">
                                {transaction.createdAt?.seconds && (
                                  <span>Created: {new Date(parseInt(transaction.createdAt.seconds) * 1000).toLocaleString()}</span>
                                )}
                                {transaction.updatedAt?.seconds && (
                                  <span>Updated: {new Date(parseInt(transaction.updatedAt.seconds) * 1000).toLocaleString()}</span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </Collapse>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {isLoadingMore && (
          <div className="p-4 text-center text-sm tui-muted border-t border-border">
            loading more...
          </div>
        )}

        {!hasMore && groupedTransactions.length > 0 && (
          <div className="p-4 text-center text-xs tui-muted border-t border-border">
            all transactions loaded
          </div>
        )}
      </div>
    );
  }
);

TransactionCards.displayName = "TransactionCards";

export default TransactionCards;