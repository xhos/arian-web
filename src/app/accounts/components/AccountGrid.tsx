"use client";

import { useMemo } from "react";
import type { Account } from "@/gen/arian/v1/account_pb";
import { AccountType } from "@/gen/arian/v1/enums_pb";
import AccountCard from "./AccountCard";

interface AccountGridProps {
  accounts: Account[];
  selectedFilter: string | null;
  getAccountTypeName: (type: AccountType) => string;
  onAccountClick: (account: Account) => void;
}

interface GroupedAccounts {
  [key: string]: Account[];
}

export default function AccountGrid({
  accounts,
  selectedFilter,
  getAccountTypeName,
  onAccountClick,
}: AccountGridProps) {
  const groupedAccounts = useMemo(() => {
    if (!selectedFilter) {
      return { "All Accounts": accounts };
    }

    const grouped: GroupedAccounts = {};

    accounts.forEach((account) => {
      let groupKey: string;

      if (selectedFilter === "type") {
        groupKey = getAccountTypeName(account.type);
      } else if (selectedFilter === "bank") {
        groupKey = account.bank;
      } else {
        groupKey = "All Accounts";
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(account);
    });

    // Sort groups alphabetically
    const sortedGrouped: GroupedAccounts = {};
    Object.keys(grouped)
      .sort()
      .forEach((key) => {
        sortedGrouped[key] = grouped[key];
      });

    return sortedGrouped;
  }, [accounts, selectedFilter, getAccountTypeName]);

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-sm tui-muted mb-2">No accounts found</div>
        <div className="text-xs tui-muted">
          Accounts matching your filter criteria will appear here
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Object.entries(groupedAccounts).map(([groupName, groupAccounts]) => (
        <div key={groupName}>
          {selectedFilter && (
            <div className="mb-4">
              <h3 className="text-sm font-mono text-tui-muted uppercase tracking-wide border-b border-tui-border pb-2">
                {groupName}
              </h3>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-10">
            {groupAccounts.map((account) => (
              <AccountCard
                key={account.id.toString()}
                account={account}
                getAccountTypeName={getAccountTypeName}
                onClick={() => onAccountClick(account)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}