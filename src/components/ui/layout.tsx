import { cn } from "@/lib/utils";

export const PageContainer = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("min-h-screen p-8", className)} {...props}>
    {children}
  </div>
);

export const PageContent = ({ children, className, maxWidth = "1800px", ...props }: React.HTMLAttributes<HTMLDivElement> & { maxWidth?: string }) => (
  <div className={cn("mx-auto", className)} style={{ maxWidth }} {...props}>
    {children}
  </div>
);

export const PageHeader = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <header className={cn("mb-8", className)} {...props}>
    {children}
  </header>
);

export const ActionBar = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center gap-2", className)} {...props}>
    {children}
  </div>
);

export const InfoGrid = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-2", className)} {...props}>
    {children}
  </div>
);

export const InfoRow = ({
  label,
  children,
  className,
  ...props
}: {
  label: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex gap-4", className)} {...props}>
    <span className="text-sm text-muted-foreground min-w-[120px] shrink-0">{label}</span>
    <div className="flex-1">{children}</div>
  </div>
);

export const Stat = ({
  label,
  value,
  className,
  ...props
}: {
  label: string;
  value: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex justify-between items-center", className)} {...props}>
    <span className="text-sm text-muted-foreground">{label}</span>
    <div>{value}</div>
  </div>
);
