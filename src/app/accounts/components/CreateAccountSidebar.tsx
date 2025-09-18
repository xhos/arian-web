"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { AccountType } from "@/gen/arian/v1/enums_pb";

interface CreateAccountSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { 
    name: string; 
    bank: string; 
    type: AccountType; 
    alias?: string; 
    anchorBalance: { currencyCode: string; units: string; nanos: number } 
  }) => void;
  isLoading: boolean;
}

export default function CreateAccountSidebar({
  isOpen,
  onClose,
  onCreate,
  isLoading,
}: CreateAccountSidebarProps) {
  const [formData, setFormData] = useState({
    name: '',
    bank: '',
    type: AccountType.ACCOUNT_CHEQUING,
    alias: '',
    initialBalance: '0',
    currency: 'USD'
  });

  const handleSubmit = () => {
    const createData = {
      name: formData.name,
      bank: formData.bank,
      type: formData.type,
      alias: formData.alias || undefined,
      anchorBalance: {
        currencyCode: formData.currency,
        units: parseFloat(formData.initialBalance || '0').toString(),
        nanos: Math.round((parseFloat(formData.initialBalance || '0') % 1) * 1e9)
      }
    };
    
    onCreate(createData);
    
    // Reset form
    setFormData({
      name: '',
      bank: '',
      type: AccountType.ACCOUNT_CHEQUING,
      alias: '',
      initialBalance: '0',
      currency: 'USD'
    });
  };

  const handleCancel = () => {
    // Reset form
    setFormData({
      name: '',
      bank: '',
      type: AccountType.ACCOUNT_CHEQUING,
      alias: '',
      initialBalance: '0',
      currency: 'USD'
    });
    onClose();
  };

  const isValid = formData.name && formData.bank && formData.initialBalance;

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40"
        onClick={handleCancel}
      />
      
      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-96 bg-tui-background tui-border-l z-50 overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-mono">add account</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              className="text-tui-muted hover:text-tui-foreground"
            >
              ✕
            </Button>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* Account Info */}
            <div>
              <h3 className="text-sm font-mono text-tui-muted mb-3">account info</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-tui-muted block mb-1">display name</label>
                  <Input
                    value={formData.alias}
                    onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                    placeholder="Display name (optional)"
                    className="text-sm h-8"
                  />
                </div>
                
                <div>
                  <label className="text-xs text-tui-muted block mb-1">internal name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Internal name"
                    className="text-sm h-8"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-xs text-tui-muted block mb-1">bank</label>
                  <Input
                    value={formData.bank}
                    onChange={(e) => setFormData({ ...formData, bank: e.target.value })}
                    placeholder="Bank name"
                    className="text-sm h-8"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-xs text-tui-muted block mb-1">type</label>
                  <Select 
                    value={formData.type.toString()}
                    onChange={(e) => setFormData({ ...formData, type: parseInt(e.target.value) as AccountType })}
                    className="text-sm h-8"
                  >
                    <option value={AccountType.ACCOUNT_CHEQUING}>Chequing</option>
                    <option value={AccountType.ACCOUNT_SAVINGS}>Savings</option>
                    <option value={AccountType.ACCOUNT_CREDIT_CARD}>Credit Card</option>
                    <option value={AccountType.ACCOUNT_INVESTMENT}>Investment</option>
                    <option value={AccountType.ACCOUNT_OTHER}>Other</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Initial Balance */}
            <div>
              <h3 className="text-sm font-mono text-tui-muted mb-3">initial balance</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-tui-muted block mb-1">starting balance</label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.initialBalance}
                      onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                      placeholder="0.00"
                      className="text-sm h-8"
                      required
                    />
                    <Select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="text-sm h-8 w-20"
                    >
                      <option value="USD">USD</option>
                      <option value="CAD">CAD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="JPY">JPY</option>
                    </Select>
                  </div>
                  <div className="text-xs text-tui-muted mt-1">
                    Enter the current balance of this account
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div>
              <h3 className="text-sm font-mono text-tui-muted mb-3">create</h3>
              <div className="space-y-2">
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={isLoading || !isValid}
                  className="w-full justify-start"
                >
                  create account
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="w-full justify-start"
                >
                  cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}