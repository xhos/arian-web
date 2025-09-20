"use client";

import type { Account } from "@/gen/arian/v1/account_pb";
import { AccountType } from "@/gen/arian/v1/enums_pb";
import { wagonBold } from "@/fonts/wagon";

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
    
    const unitsAmount = parseFloat(balance.units?.toString() || '0');
    const nanosAmount = (balance.nanos || 0) / 1e9;
    const totalAmount = unitsAmount + nanosAmount;
    
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: balance.currencyCode || account.mainCurrency || "USD",
    }).format(totalAmount);
  };

  const getCardStyle = (colors: string[]) => {
    return {
      background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 50%, ${colors[2]} 100%)`
    };
  };

  const getTextColor = (colors: string[]) => {
    // Calculate average luminance to determine text color
    const getLuminance = (hex: string) => {
      const r = parseInt(hex.slice(1, 3), 16) / 255;
      const g = parseInt(hex.slice(3, 5), 16) / 255;
      const b = parseInt(hex.slice(5, 7), 16) / 255;
      
      const sR = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
      const sG = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
      const sB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
      
      return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
    };

    const avgLuminance = colors.reduce((sum, color) => sum + getLuminance(color), 0) / colors.length;
    return avgLuminance > 0.5 ? '#000000' : '#ffffff';
  };

  const textColor = getTextColor(account.colors);

  return (
    <div
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl p-6 cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ 
        aspectRatio: "1.586/1",
        color: textColor,
        ...getCardStyle(account.colors),
        boxShadow: "0 25px 50px rgba(0, 0, 0, 0.25)"
      }}
    >
      {/* Stylistic background bank name */}
      <div 
        className={`absolute pointer-events-none select-none overflow-hidden ${wagonBold.className}`}
        style={{
          color: `${textColor}10`,
          fontSize: '12rem',
          lineHeight: '1',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
          zIndex: 0,
          bottom: '-3.2rem',
          left: '-1.3rem'
        }}
      >
        {account.bank}
      </div>

      {/* Card content */}
      <div className="relative h-full flex flex-col justify-between z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="text-sm font-bold uppercase tracking-wider">
              {account.bank}
            </div>
            <div className="text-xs opacity-80 uppercase tracking-wide mt-1">
              {getAccountTypeName(account.type)}
            </div>
          </div>
          <div className="text-lg font-extrabold uppercase tracking-widest relative">
            {account.alias || account.name}
            <div 
              className="absolute bottom-[-2px] left-0 w-full h-0.5 opacity-60"
              style={{ backgroundColor: textColor }}
            />
          </div>
        </div>

        {/* Middle spacer */}
        <div className="flex-1"></div>

        {/* Balance */}
        <div className="text-right">
          <div className="text-2xl font-bold">
            {formatBalance(account.balance)}
          </div>
        </div>
      </div>
    </div>
  );
}