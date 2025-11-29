"use client";

import type { Transaction } from "@/gen/arian/v1/transaction_pb";
import { Badge } from "@/components/ui/badge";
import {
  formatAmount,
  formatCurrency,
  formatTime,
  getDirectionDisplay,
  getCategorizationStatus,
  getMerchantStatus,
} from "@/lib/utils/transaction";
import { getCategoryDisplayName } from "@/lib/utils/category";
import { getCategoryTextColor } from "@/lib/color-utils";
import { Amount, Muted } from "@/components/lib";
import { HStack, VStack, Card } from "@/components/lib";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { FileText, Edit, Trash2, Copy } from "lucide-react";

interface TransactionItemProps {
  transaction: Transaction;
  isSelected: boolean;
  onSelect: (id: bigint, index: number, event: React.MouseEvent) => void;
  globalIndex: number;
  getAccountDisplayName: (accountId: bigint, accountName?: string) => string;
  onEdit?: (transaction: Transaction) => void;
  onDelete?: (transaction: Transaction) => void;
  onViewDetails?: (transaction: Transaction) => void;
}

export function TransactionItem({
  transaction,
  isSelected,
  onSelect,
  globalIndex,
  getAccountDisplayName,
  onEdit,
  onDelete,
  onViewDetails,
}: TransactionItemProps) {
  const handleClick = (event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey) {
      event.preventDefault();
      onSelect(transaction.id, globalIndex, event);
    }
  };

  const handleCopyMerchant = () => {
    const merchantName = transaction.merchant || transaction.description || "";
    navigator.clipboard.writeText(merchantName);
  };

  const directionInfo = getDirectionDisplay(transaction.direction);
  const categoryInfo = getCategorizationStatus(transaction);
  const merchantInfo = getMerchantStatus(transaction);
  const amount = formatAmount(transaction.txAmount);
  const formattedAmount = formatCurrency(amount, transaction.txAmount?.currencyCode);

  return (
    <div className="relative">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <Card
            variant={isSelected ? "elevated" : "default"}
            padding="sm"
            interactive
            onClick={handleClick}
            className={cn(isSelected && "ring-1 ring-primary")}
          >
            <HStack spacing="xl" justify="between">
              {/* Left: Description & Category */}
              <VStack spacing="sm" align="start" className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">
                  {transaction.description || transaction.merchant || "Unknown transaction"}
                </div>

                <HStack spacing="sm" align="center" className="flex-wrap gap-2">
                  {transaction.merchant && transaction.description !== transaction.merchant && (
                    <>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Muted size="xs" className="truncate cursor-help">
                              {transaction.merchant}
                            </Muted>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{merchantInfo.text}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Muted size="xs">•</Muted>
                    </>
                  )}

                  {transaction.category?.slug && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant="outline"
                            className="text-xs border-0 cursor-help"
                            style={{
                              backgroundColor: transaction.category.color,
                              color: getCategoryTextColor(transaction.category.slug),
                            }}
                          >
                            {getCategoryDisplayName(transaction.category.slug)}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{categoryInfo.text}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </HStack>
              </VStack>

              {/* Right: Amount & Account/Time */}
              <VStack spacing="sm" align="end" className="shrink-0">
                <Amount
                  value={parseFloat(formattedAmount.replace(/[^0-9.-]/g, ''))}
                  variant={directionInfo.label === "in" ? "positive" : "negative"}
                  className="text-lg"
                />

                <VStack spacing="xs" align="end">
                  {transaction.accountId && (
                    <Muted size="xs">
                      {getAccountDisplayName(transaction.accountId, transaction.accountName)}
                    </Muted>
                  )}
                  <Muted size="xs">{formatTime(transaction.txDate)}</Muted>
                </VStack>
              </VStack>
            </HStack>
          </Card>
        </ContextMenuTrigger>

        <ContextMenuContent>
          {onViewDetails && (
            <ContextMenuItem onClick={() => onViewDetails(transaction)}>
              <FileText className="mr-2 h-4 w-4" />
              Details
            </ContextMenuItem>
          )}
          {onEdit && (
            <ContextMenuItem onClick={() => onEdit(transaction)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </ContextMenuItem>
          )}
          <ContextMenuItem onClick={handleCopyMerchant}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Name
          </ContextMenuItem>
          {onDelete && (
            <ContextMenuItem onClick={() => onDelete(transaction)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>
    </div>
  );
}
