import { cn } from "@/lib/utils";

export const PageTitle = ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h1
    className={cn("tracking-tight", className)}
    style={{ fontFamily: 'var(--font-lora), serif', fontSize: '28px', fontWeight: 600, lineHeight: 1.2 }}
    {...props}
  >
    {children}
  </h1>
);

export const SectionTitle = ({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h2
    className={cn(className)}
    style={{ fontFamily: 'var(--font-lora), serif', fontSize: '20px', fontWeight: 500, lineHeight: 1.3 }}
    {...props}
  >
    {children}
  </h2>
);

export const MetaText = ({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn("text-muted-foreground", className)}
    style={{ fontSize: '13px', fontWeight: 400, letterSpacing: '0.1px' }}
    {...props}
  >
    {children}
  </span>
);

export const MonoText = ({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("font-mono", className)} {...props}>
    {children}
  </span>
);

export const NumericText = ({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn(className)}
    style={{ fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}
    {...props}
  >
    {children}
  </span>
);

export const SectionHeader = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("font-semibold text-muted-foreground uppercase tracking-wider", className)}
    style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.8px' }}
    {...props}
  >
    {children}
  </div>
);

export const SmallText = ({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span
    className={cn("text-muted-foreground", className)}
    style={{ fontSize: '12px', fontWeight: 400, lineHeight: 1.4 }}
    {...props}
  >
    {children}
  </span>
);

export const Emphasis = ({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <em className={cn("not-italic font-medium", className)} style={{ fontFamily: 'var(--font-lora), serif' }} {...props}>
    {children}
  </em>
);

export const EmphasisItalic = ({ children, className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <em className={cn("italic font-normal", className)} style={{ fontFamily: 'var(--font-lora), serif' }} {...props}>
    {children}
  </em>
);
