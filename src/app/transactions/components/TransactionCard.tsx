import { HStack } from "@/components/lib";
import { cn } from "@/lib/utils";

export const DayHeader = ({
  children,
  selectable,
  className,
  ...props
}: {
  selectable?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) => (
  <HStack
    justify="between"
    align="center"
    className={cn(
      "py-3 px-4 transition-colors",
      selectable && "hover:bg-muted/30 cursor-pointer select-none",
      className
    )}
    {...props}
  >
    {children}
  </HStack>
);
