import type { Transaction } from "@/gen/arian/v1/transaction_pb";
import { Badge } from "@/components/ui/badge";
import { formatAmount, formatCurrency } from "@/lib/utils/transaction";
import { Card, VStack, HStack, Muted, Caption, Text } from "@/components/lib";

interface TransactionDetailsProps {
  transaction: Transaction;
}

export function TransactionDetails({ transaction }: TransactionDetailsProps) {
  const hasUserNotes = !!transaction.userNotes;
  const hasBalanceAfter = !!transaction.balanceAfter;
  const hasReceiptId = !!transaction.receiptId;
  const hasForeignAmount = !!transaction.foreignAmount;
  const hasExchangeRate = !!transaction.exchangeRate;
  const hasSuggestions = transaction.suggestions && transaction.suggestions.length > 0;

  const hasAnyDetails =
    hasUserNotes ||
    hasBalanceAfter ||
    hasReceiptId ||
    hasForeignAmount ||
    hasExchangeRate ||
    hasSuggestions;

  return (
    <Card variant="subtle" padding="sm">
      <VStack spacing="md">
        {/* Main Details Grid */}
        {hasAnyDetails && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transaction.userNotes && (
              <VStack spacing="xs" align="start">
                <Caption>USER NOTES</Caption>
                <Muted size="sm">{transaction.userNotes}</Muted>
              </VStack>
            )}

            {transaction.balanceAfter && (
              <VStack spacing="xs" align="start">
                <Caption>BALANCE AFTER</Caption>
                <Text size="sm" className="font-mono">
                  {formatCurrency(
                    formatAmount(transaction.balanceAfter),
                    transaction.balanceAfter?.currencyCode
                  )}
                </Text>
              </VStack>
            )}

            {transaction.receiptId && (
              <VStack spacing="xs" align="start">
                <Caption>RECEIPT ID</Caption>
                <Text size="sm" className="font-mono">#{transaction.receiptId.toString()}</Text>
              </VStack>
            )}

            {transaction.foreignAmount && (
              <VStack spacing="xs" align="start">
                <Caption>FOREIGN AMOUNT</Caption>
                <Text size="sm" className="font-mono">
                  {formatCurrency(
                    formatAmount(transaction.foreignAmount),
                    transaction.foreignAmount?.currencyCode
                  )}
                </Text>
              </VStack>
            )}

            {transaction.exchangeRate && (
              <VStack spacing="xs" align="start">
                <Caption>EXCHANGE RATE</Caption>
                <Text size="sm" className="font-mono">{transaction.exchangeRate}</Text>
              </VStack>
            )}

            {hasSuggestions && (
              <div className="md:col-span-2">
                <VStack spacing="xs" align="start" className="w-full">
                  <Caption>SUGGESTIONS</Caption>
                  <HStack spacing="sm" className="flex-wrap gap-2">
                    {transaction.suggestions!.map((suggestion, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {suggestion}
                      </Badge>
                    ))}
                  </HStack>
                </VStack>
              </div>
            )}
          </div>
        )}

        {/* Metadata Footer */}
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
    </Card>
  );
}
