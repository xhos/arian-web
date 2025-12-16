"use client";

import type { Account } from "@/gen/arian/v1/account_pb";
import { AccountType } from "@/gen/arian/v1/enums_pb";
import { Card, VStack, HStack, Muted, Caption, Text } from "@/components/lib";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Pencil, Trash2, Anchor } from "lucide-react";

interface AccountCardProps {
  account: Account;
  getAccountTypeName: (type: AccountType) => string;
  onClick: () => void;
  onEdit?: (account: Account) => void;
  onDelete?: (account: Account) => void;
  onSetAnchor?: (account: Account) => void;
}

export default function AccountCard({ account, getAccountTypeName, onClick, onEdit, onDelete, onSetAnchor }: AccountCardProps) {
  const formatBalance = (balance?: {
    currencyCode?: string;
    units?: string | bigint;
    nanos?: number;
  }) => {
    if (!balance) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: account.mainCurrency || "USD",
      }).format(0);
    }

    const unitsAmount = parseFloat(balance.units?.toString() || "0");
    const nanosAmount = (balance.nanos || 0) / 1e9;
    const totalAmount = unitsAmount + nanosAmount;

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: balance.currencyCode || account.mainCurrency || "USD",
    }).format(totalAmount);
  };

  const cardContent = (
    <Card variant="default" padding="md" interactive onClick={onClick}>
      <VStack spacing="md" align="start">
        <HStack spacing="md" justify="between" className="w-full">
          <VStack spacing="xs" align="start">
            <Caption>{account.bank}</Caption>
            <Text size="sm">{account.alias || account.name}</Text>
          </VStack>
          <Muted size="xs">{getAccountTypeName(account.type)}</Muted>
        </HStack>
        <Text weight="semibold" size="lg">{formatBalance(account.balance)}</Text>
      </VStack>
    </Card>
  );

  if (onEdit || onDelete || onSetAnchor) {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {cardContent}
        </ContextMenuTrigger>
        <ContextMenuContent>
          {onEdit && (
            <ContextMenuItem onClick={() => onEdit(account)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </ContextMenuItem>
          )}
          {onSetAnchor && (
            <ContextMenuItem onClick={() => onSetAnchor(account)}>
              <Anchor className="mr-2 h-4 w-4" />
              Set Anchor Balance
            </ContextMenuItem>
          )}
          {onDelete && (
            <ContextMenuItem onClick={() => onDelete(account)} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </ContextMenuItem>
          )}
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  return cardContent;
}
