import type { Transaction } from "@/gen/arian/v1/transaction_pb";
import { Badge } from "@/components/ui/badge";
import { formatAmount, formatCurrency } from "@/lib/utils/transaction";
import { MonoText } from "@/components/ui/typography";
import { InfoRow } from "@/components/ui/layout";

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

  const hasAnyDetails = hasUserNotes || hasBalanceAfter || hasReceiptId || hasForeignAmount || hasExchangeRate || hasSuggestions;

  return (
    <div className="pt-4 pb-4">
      {hasAnyDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1.5 text-sm mb-4">
          {transaction.userNotes && (
            <InfoRow label="User Notes">
              {transaction.userNotes}
            </InfoRow>
          )}

          {transaction.balanceAfter && (
            <InfoRow label="Balance After">
              <MonoText>
                {formatCurrency(
                  formatAmount(transaction.balanceAfter),
                  transaction.balanceAfter?.currencyCode
                )}
              </MonoText>
            </InfoRow>
          )}

          {transaction.receiptId && (
            <InfoRow label="Receipt ID">
              <MonoText>#{transaction.receiptId.toString()}</MonoText>
            </InfoRow>
          )}

          {transaction.foreignAmount && (
            <InfoRow label="Foreign Amount">
              <MonoText>
                {formatCurrency(
                  formatAmount(transaction.foreignAmount),
                  transaction.foreignAmount?.currencyCode
                )}
              </MonoText>
            </InfoRow>
          )}

          {transaction.exchangeRate && (
            <InfoRow label="Exchange Rate">
              <MonoText>{transaction.exchangeRate}</MonoText>
            </InfoRow>
          )}

          {transaction.suggestions && transaction.suggestions.length > 0 && (
            <div className="md:col-span-2">
              <InfoRow label="Suggestions">
                <div className="flex flex-wrap gap-2">
                  {transaction.suggestions.map((suggestion, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {suggestion}
                    </Badge>
                  ))}
                </div>
              </InfoRow>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between text-[11px] text-muted-foreground/50">
        {transaction.createdAt?.seconds && (
          <span>
            created: {new Date(Number(transaction.createdAt.seconds) * 1000).toLocaleString()}
          </span>
        )}
        {transaction.updatedAt?.seconds && (
          <span>
            updated: {new Date(Number(transaction.updatedAt.seconds) * 1000).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}
