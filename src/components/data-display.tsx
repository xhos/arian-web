import { cn } from "@/lib/utils";
import { Card, CardContent } from "./ui/card";
import { MetaText, MonoText } from "./ui/typography";

export const Amount = ({
  value,
  variant = "neutral",
  className,
  ...props
}: {
  value: string | number;
  variant?: "positive" | "negative" | "neutral";
} & React.HTMLAttributes<HTMLSpanElement>) => {
  const variantStyles = {
    positive: "text-green-600 dark:text-green-500",
    negative: "text-red-600 dark:text-red-500",
    neutral: "",
  };

  return (
    <MonoText className={cn("font-semibold", variantStyles[variant], className)} {...props}>
      {value}
    </MonoText>
  );
};

export const ErrorMessage = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "p-3 text-sm font-mono text-destructive border border-destructive/50 rounded-lg bg-destructive/5",
      className
    )}
    {...props}
  >
    {children}
  </div>
);

export const LoadingCard = ({ message = "Loading..." }: { message?: string }) => (
  <Card>
    <CardContent className="py-12 text-center">
      <MetaText>{message}</MetaText>
    </CardContent>
  </Card>
);

export const EmptyState = ({ title, description }: { title: string; description?: string }) => (
  <Card>
    <CardContent className="py-12 text-center space-y-2">
      <MetaText className="block">{title}</MetaText>
      {description && <MetaText className="block text-xs">{description}</MetaText>}
    </CardContent>
  </Card>
);

export const DataCard = ({
  selected,
  children,
  className,
  ...props
}: {
  selected?: boolean;
} & React.HTMLAttributes<HTMLDivElement>) => (
  <Card
    className={cn(
      "relative transition-colors duration-150 cursor-pointer",
      selected && "bg-primary/5 border-primary/30 shadow-sm",
      className
    )}
    {...props}
  >
    {selected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-lg" />}
    {children}
  </Card>
);
