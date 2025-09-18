"use client";

import { useState, useEffect } from "react";
import type { Account } from "@/gen/arian/v1/account_pb";
import { AccountType } from "@/gen/arian/v1/enums_pb";

interface AccountCardProps {
  account: Account;
  getAccountTypeName: (type: AccountType) => string;
  onClick: () => void;
}

export default function AccountCard({
  account,
  getAccountTypeName,
  onClick,
}: AccountCardProps) {
  const [balance, setBalance] = useState<{
    currencyCode: string;
    units: bigint;
    nanos: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await fetch("/api/arian.v1.AccountService/GetAccountBalance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: parseInt(account.id.toString()) }),
        });
        if (response.ok) {
          const data = await response.json();
          if (data.balance) {
            setBalance(data.balance);
          }
        }
      } catch (error) {
        console.warn(`Failed to fetch balance for account ${account.id}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalance();
  }, [account.id]);

  const formatBalance = (balance?: {
    currencyCode?: string;
    units?: string | bigint;
    nanos?: number;
  }) => {
    if (!balance?.units) return "—";
    
    const unitsAmount = parseFloat(balance.units.toString());
    const nanosAmount = (balance.nanos || 0) / 1e9;
    const totalAmount = unitsAmount + nanosAmount;
    
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: balance.currencyCode || "USD",
    }).format(totalAmount);
  };

  const getCardGradient = (type: AccountType) => {
    switch (type) {
      case AccountType.ACCOUNT_CREDIT_CARD:
        return "bg-gradient-to-br from-red-500 to-red-700";
      case AccountType.ACCOUNT_CHEQUING:
        return "bg-gradient-to-br from-blue-500 to-blue-700";
      case AccountType.ACCOUNT_SAVINGS:
        return "bg-gradient-to-br from-green-500 to-green-700";
      case AccountType.ACCOUNT_INVESTMENT:
        return "bg-gradient-to-br from-purple-500 to-purple-700";
      default:
        return "bg-gradient-to-br from-gray-500 to-gray-700";
    }
  };

  return (
    <div
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-xl p-6 text-white cursor-pointer
        transform transition-all duration-200 hover:scale-105 hover:shadow-lg
        ${getCardGradient(account.type)}
      `}
      style={{ aspectRatio: "1.6/1" }}
    >
      {/* Card pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-12 h-8 bg-white/20 rounded"></div>
        <div className="absolute bottom-4 left-4 w-8 h-8 bg-white/20 rounded-full"></div>
      </div>

      {/* Card content */}
      <div className="relative h-full flex flex-col justify-between">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs opacity-75 uppercase tracking-wide">
              {account.bank}
            </div>
            <div className="text-xs opacity-60 mt-1">
              {getAccountTypeName(account.type)}
            </div>
          </div>
        </div>

        {/* Account name */}
        <div className="flex-1 flex items-center">
          <div className="font-mono text-lg font-semibold truncate">
            {account.alias || account.name}
          </div>
        </div>

        {/* Balance */}
        <div className="text-right">
          <div className="font-mono text-xl font-bold">
            {isLoading ? "..." : formatBalance(balance || undefined)}
          </div>
        </div>
      </div>
    </div>
  );
}