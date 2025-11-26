import { cn } from "@/lib/utils";

export const PageContainer = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("min-h-screen", className)} {...props}>
    {children}
  </div>
);

export const PageContent = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mx-auto max-w-7xl px-6 py-8", className)} {...props}>
    {children}
  </div>
);

export const DashboardPageContent = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("mx-auto max-w-[1600px] px-6 py-8", className)} {...props}>
    {children}
  </div>
);

export const PageHeader = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <header className={cn("mb-8", className)} {...props}>
    {children}
  </header>
);

export const PageHeaderWithTitle = ({
  title,
  subtitle,
  actions,
  className,
  ...props
}: {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => (
  <PageHeader className={className} {...props}>
    <div className="flex items-center justify-between">
      <h1
        className="tracking-tight"
        style={{ fontFamily: 'var(--font-lora), serif', fontSize: '28px', fontWeight: 600, lineHeight: 1.2 }}
      >
        {title}
      </h1>
      {actions && <ActionBar>{actions}</ActionBar>}
    </div>
    {subtitle && (
      <div style={{ fontSize: '13px', fontWeight: 400, letterSpacing: '0.1px' }} className="text-muted-foreground mt-2">
        {subtitle}
      </div>
    )}
  </PageHeader>
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
