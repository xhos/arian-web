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
        <div className="py-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this account? This action cannot be undone.
          </p>
          <div className="tui-border rounded-lg p-3 space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Account Name:</span>
              <span className="text-sm font-mono">{account.name}</span>
            </div>
            {account.alias && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Alias:</span>
                <span className="text-sm font-mono">{account.alias}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm font-medium">Bank:</span>
              <span className="text-sm">{account.bank}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Type:</span>
              <span className="text-sm">{getAccountTypeName(account.type)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Current Balance:</span>
              <span className="text-sm font-mono">{formatBalance(account.balance)}</span>
            </div>
          </div>
        </div>
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
