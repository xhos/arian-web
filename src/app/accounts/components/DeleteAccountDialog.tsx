"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { VStack, HStack, Text, Muted } from "@/components/lib";
import type { Account } from "@/gen/arian/v1/account_pb";
import { AccountType } from "@/gen/arian/v1/enums_pb";

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
  getAccountTypeName: (type: AccountType) => string;
  onConfirm: () => Promise<void>;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
  account,
  getAccountTypeName,
  onConfirm,
}: DeleteAccountDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete account:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!account) return null;

  const formatBalance = (balance?: {
    currencyCode?: string;
    units?: string | bigint;
    nanos?: number;
  }) => {
    if (!balance) return "$0.00";

    const unitsAmount = parseFloat(balance.units?.toString() || "0");
    const nanosAmount = (balance.nanos || 0) / 1e9;
    const totalAmount = unitsAmount + nanosAmount;

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: balance.currencyCode || account.mainCurrency || "USD",
    }).format(totalAmount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Delete Account
          </DialogTitle>
        </DialogHeader>
        <VStack spacing="md" className="py-4">
          <Text size="sm" color="muted">
            Are you sure you want to delete this account? This action cannot be undone.
          </Text>
          <VStack spacing="xs" className="tui-border rounded-lg p-3">
            <HStack spacing="md" justify="between">
              <Text size="sm" weight="medium">Account Name:</Text>
              <Text size="sm" className="font-mono">{account.name}</Text>
            </HStack>
            {account.alias && (
              <HStack spacing="md" justify="between">
                <Text size="sm" weight="medium">Alias:</Text>
                <Text size="sm" className="font-mono">{account.alias}</Text>
              </HStack>
            )}
            <HStack spacing="md" justify="between">
              <Text size="sm" weight="medium">Bank:</Text>
              <Text size="sm">{account.bank}</Text>
            </HStack>
            <HStack spacing="md" justify="between">
              <Text size="sm" weight="medium">Type:</Text>
              <Text size="sm">{getAccountTypeName(account.type)}</Text>
            </HStack>
            <HStack spacing="md" justify="between">
              <Text size="sm" weight="medium">Current Balance:</Text>
              <Text size="sm" className="font-mono">{formatBalance(account.balance)}</Text>
            </HStack>
          </VStack>
        </VStack>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : "Delete Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
