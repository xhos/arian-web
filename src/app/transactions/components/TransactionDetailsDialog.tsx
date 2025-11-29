import type { Transaction } from "@/gen/arian/v1/transaction_pb";
import { formatAmount, formatCurrency, formatTime } from "@/lib/utils/transaction";
import { VStack, HStack, Muted, Caption } from "@/components/lib";
import { Badge } from "@/components/ui/badge";
import { getCategoryDisplayName } from "@/lib/utils/category";
import { getCategoryTextColor } from "@/lib/color-utils";

interface TransactionDetailsDialogProps {
  transaction: Transaction;
}

export function TransactionDetailsDialog({ transaction }: TransactionDetailsDialogProps) {
  const amount = formatAmount(transaction.txAmount);
  const formattedAmount = formatCurrency(amount, transaction.txAmount?.currencyCode);

  return (
    <VStack spacing="lg" className="w-full">
      {/* Header with amount and time */}
      <VStack spacing="md" align="start">
        <div>
          <div className="text-2xl font-semibold">
            {formattedAmount}
          </div>
          <Muted size="sm">{formatTime(transaction.txDate)}</Muted>
        </div>
      </VStack>

      {/* Description & Merchant */}
      <VStack spacing="xs" align="start">
        <Caption>DESCRIPTION</Caption>
        <div className="text-sm">{transaction.description || "—"}</div>
      </VStack>

      {transaction.merchant && transaction.description !== transaction.merchant && (
        <VStack spacing="xs" align="start">
          <Caption>MERCHANT</Caption>
          <div className="text-sm">{transaction.merchant}</div>
        </VStack>
      )}

      {/* Category */}
      {transaction.category?.slug && (
        <VStack spacing="xs" align="start">
          <Caption>CATEGORY</Caption>
          <Badge
            variant="outline"
            className="text-xs border-0"
            style={{
              backgroundColor: transaction.category.color,
              color: getCategoryTextColor(transaction.category.slug),
            }}
          >
            {getCategoryDisplayName(transaction.category.slug)}
          </Badge>
        </VStack>
      )}

      {/* User Notes */}
      {transaction.userNotes && (
        <VStack spacing="xs" align="start">
          <Caption>NOTES</Caption>
          <div className="text-sm italic">{transaction.userNotes}</div>
        </VStack>
      )}

      {/* Additional Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border">
        {transaction.balanceAfter && (
          <VStack spacing="xs" align="start">
            <Caption>BALANCE</Caption>
            <div className="font-mono text-sm">
              {formatCurrency(
                formatAmount(transaction.balanceAfter),
                transaction.balanceAfter?.currencyCode
              )}
            </div>
          </VStack>
        )}

        {transaction.exchangeRate && (
          <VStack spacing="xs" align="start">
            <Caption>EXCHANGE RATE</Caption>
            <div className="font-mono text-sm">{transaction.exchangeRate}</div>
          </VStack>
        )}

        {transaction.foreignAmount && (
          <VStack spacing="xs" align="start">
            <Caption>FOREIGN AMOUNT</Caption>
            <div className="font-mono text-sm">
              {formatCurrency(
                formatAmount(transaction.foreignAmount),
                transaction.foreignAmount?.currencyCode
              )}
            </div>
          </VStack>
        )}

        {transaction.receiptId && (
          <VStack spacing="xs" align="start">
            <Caption>RECEIPT</Caption>
            <div className="font-mono text-sm">#{transaction.receiptId.toString()}</div>
          </VStack>
        )}
      </div>

      {/* Timestamps */}
      <HStack spacing="lg" justify="between" className="pt-2 text-[11px]">
        <Muted size="xs">
          {transaction.createdAt?.seconds &&
            `created ${new Date(Number(transaction.createdAt.seconds) * 1000).toLocaleString()}`}
        </Muted>
        <Muted size="xs">
          {transaction.updatedAt?.seconds &&
            `updated ${new Date(Number(transaction.updatedAt.seconds) * 1000).toLocaleString()}`}
        </Muted>
      </HStack>
    </VStack>
  );
}
