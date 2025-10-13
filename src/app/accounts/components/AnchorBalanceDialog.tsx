"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Account } from "@/gen/arian/v1/account_pb";
import { format } from "date-fns";

interface AnchorBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  account: Account | null;
  onConfirm: (balance: { currencyCode: string; units: string; nanos: number }) => Promise<void>;
}

export function AnchorBalanceDialog({
  open,
  onOpenChange,
  account,
  onConfirm,
}: AnchorBalanceDialogProps) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && account) {
      if (account.anchorBalance) {
        const units = parseFloat(account.anchorBalance.units?.toString() || "0");
        const nanos = (account.anchorBalance.nanos || 0) / 1e9;
        setAmount((units + nanos).toString());
      } else {
        setAmount("");
      }
      setError(null);
    }
  }, [account, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!account) return;

    if (!amount || parseFloat(amount) < 0) {
      setError("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    try {
      await onConfirm({
        currencyCode: account.mainCurrency || "USD",
        units: Math.floor(parseFloat(amount)).toString(),
        nanos: Math.round((parseFloat(amount) % 1) * 1e9),
      });
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to set anchor balance");
    } finally {
      setIsLoading(false);
    }
  };

  if (!account) return null;

  const formatAnchorDate = () => {
    if (!account.anchorDate) return null;
    try {
      const date = new Date(Number(account.anchorDate.seconds) * 1000);
      return format(date, "PPP 'at' p");
    } catch {
      return null;
    }
  };

  const anchorDate = formatAnchorDate();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Set Anchor Balance</DialogTitle>
            <DialogDescription>
              Set the reference balance for <span className="font-mono font-medium">{account.name}</span> at a specific point in time. This is used to calculate running balances for transactions.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {anchorDate && (
              <div className="tui-border rounded-lg p-3 bg-muted/30">
                <div className="text-xs text-muted-foreground mb-1">Last anchor set</div>
                <div className="text-sm font-medium">{anchorDate}</div>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                disabled={isLoading}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label>Currency</Label>
              <div className="flex h-9 w-full items-center rounded-md border border-input bg-muted px-3 py-2 text-sm">
                {account.mainCurrency || "USD"}
              </div>
              <p className="text-xs text-muted-foreground">
                Currency is locked to the account&apos;s main currency
              </p>
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded p-2">
                {error}
              </p>
            )}
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
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Setting..." : "Set Anchor Balance"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
