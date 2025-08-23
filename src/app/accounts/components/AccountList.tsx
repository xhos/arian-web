"use client";

import { Button } from "@/components/ui/button";
import type { Account } from "@/gen/arian/v1/account_pb";
import { AccountType } from "@/gen/arian/v1/enums_pb";

interface AccountListProps {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onDelete: (accountId: bigint) => void;
  getAccountTypeName: (type: AccountType) => string;
  isLoading: boolean;
}

export default function AccountList({
  accounts,
  onEdit,
  onDelete,
  getAccountTypeName,
  isLoading,
}: AccountListProps) {
  const formatBalance = (anchorBalance?: {
    currencyCode?: string;
    units?: string;
    nanos?: number;
  }) => {
    if (!anchorBalance?.units) return "—";
    const amount = parseFloat(anchorBalance.units);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: anchorBalance.currencyCode || "USD",
    }).format(amount);
  };

  const formatDate = (timestamp?: { seconds?: string; nanos?: number }) => {
    if (!timestamp?.seconds) return "—";
    return new Date(parseInt(timestamp.seconds) * 1000).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      {accounts.map((account) => (
        <div key={account.id.toString()} className="tui-border p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium">{account.name}</h3>
                {account.alias && (
                  <span className="text-xs tui-muted bg-muted px-2 py-1 rounded">
                    {account.alias}
                  </span>
                )}
              </div>
              <div className="text-sm tui-muted">
                {account.bank} • {getAccountTypeName(account.type)}
              </div>
            </div>

            <div className="text-right">
              <div className="text-lg font-mono mb-1">{formatBalance(account.anchorBalance)}</div>
              <div className="text-xs tui-muted">anchor balance</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            <div>
              <div className="tui-muted text-xs mb-1">created</div>
              <div>{formatDate(account.createdAt)}</div>
            </div>
            <div>
              <div className="tui-muted text-xs mb-1">updated</div>
              <div>{formatDate(account.updatedAt)}</div>
            </div>
            <div>
              <div className="tui-muted text-xs mb-1">anchor date</div>
              <div>{formatDate(account.anchorDate)}</div>
            </div>
            <div>
              <div className="tui-muted text-xs mb-1">id</div>
              <div className="font-mono">#{account.id.toString()}</div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => onEdit(account)} disabled={isLoading}>
              edit
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(account.id)}
              className="text-red-500 hover:bg-red-500/10 border-red-500/50"
              disabled={isLoading}
            >
              delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
