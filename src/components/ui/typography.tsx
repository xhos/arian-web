import { cn } from "@/lib/utils";

export const PageTitle = ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1 className={cn("text-xl font-semibold tracking-tight", className)} {...props}>
    {children}
  </h1>
);

export const SectionTitle = ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2 className={cn("text-lg font-semibold", className)} {...props}>
    {children}
  </h2>
);

export const MetaText = ({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("text-sm text-muted-foreground", className)} {...props}>
    {children}
  </span>
);

export const MonoText = ({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("font-mono", className)} {...props}>
    {children}
  </span>
);

export const SectionHeader = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("text-xs font-semibold text-muted-foreground uppercase tracking-wider", className)}
    {...props}
  >
    {children}
  </div>
);
