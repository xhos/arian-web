import { cn } from "@/lib/utils";
import { DataCard } from "@/components/data-display";

export const TransactionCard = DataCard;

export const DayHeader = ({
  children,
  selectable,
  className,
  ...props
}: {
  selectable?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex items-center justify-between py-3 px-4 rounded-lg transition-colors",
      selectable && "hover:bg-muted/30 cursor-pointer select-none",
      className
    )}
    {...props}
  >
    {children}
  </div>
);
