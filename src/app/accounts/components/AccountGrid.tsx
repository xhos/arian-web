"use client";

import { useMemo } from "react";
import type { Account } from "@/gen/arian/v1/account_pb";
import { AccountType } from "@/gen/arian/v1/enums_pb";
import { VStack, Muted } from "@/components/lib";
import AccountCard from "./AccountCard";

interface AccountGridProps {
  accounts: Account[];
  selectedFilter: string | null;
  getAccountTypeName: (type: AccountType) => string;
  onAccountClick: (account: Account) => void;
  onEdit?: (account: Account) => void;
  onDelete?: (account: Account) => void;
  onSetAnchor?: (account: Account) => void;
}

interface GroupedAccounts {
  [key: string]: Account[];
}

export default function AccountGrid({
  accounts,
  selectedFilter,
  getAccountTypeName,
  onAccountClick,
  onEdit,
  onDelete,
  onSetAnchor,
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
      <VStack spacing="xs" align="center" className="py-12">
        <Muted size="sm">No accounts found</Muted>
        <Muted size="xs">Accounts matching your filter criteria will appear here</Muted>
      </VStack>
    );
  }

  return (
    <VStack spacing="2xl">
      {Object.entries(groupedAccounts).map(([groupName, groupAccounts]) => (
        <VStack key={groupName} spacing="md">
          {selectedFilter && (
            <Muted size="sm" className="uppercase text-xs border-b border-border pb-2">
              {groupName}
            </Muted>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupAccounts.map((account) => (
              <AccountCard
                key={account.id.toString()}
                account={account}
                getAccountTypeName={getAccountTypeName}
                onClick={() => onAccountClick(account)}
                onEdit={onEdit}
                onDelete={onDelete}
                onSetAnchor={onSetAnchor}
              />
            ))}
          </div>
        </VStack>
      ))}
    </VStack>
  );
}
