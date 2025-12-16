/**
 * Unified Card System
 *
 * Clean, composable card components without the verbose shadcn wrapper hell
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'outline' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

const variantClasses = {
  default: 'bg-card border border-border rounded-lg',
  subtle: 'bg-muted/30 border-0 rounded-lg',
  outline: 'bg-background border border-border rounded-lg',
  elevated: 'bg-card border border-border rounded-lg shadow-sm',
};

const paddingClasses = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  variant = 'default',
  padding = 'lg',
  interactive = false,
  title,
  description,
  action,
  className,
  children,
  ...props
}: CardProps) {
  const hasHeader = title || description || action;
  const contentPadding = hasHeader ? 'none' : padding;

  return (
    <div
      className={cn(
        variantClasses[variant],
        paddingClasses[contentPadding],
        interactive && 'transition-colors hover:bg-accent/5 cursor-pointer',
        'flex flex-col gap-6',
        className
      )}
      {...props}
    >
      {hasHeader && (
        <div className={cn('flex items-start justify-between gap-4', paddingClasses[padding], 'pb-0')}>
          <div className="flex-1 min-w-0">
            {title && <h2 className="font-semibold text-base leading-none">{title}</h2>}
            {description && <p className="text-muted-foreground text-sm mt-2">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children && <div className={cn(hasHeader && paddingClasses[padding], hasHeader && 'pt-0')}>{children}</div>}
    </div>
  );
}

interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  divider?: boolean;
}

export function CardSection({ divider = false, className, ...props }: CardSectionProps) {
  return (
    <div
      className={cn(
        divider && 'border-t border-border pt-4 mt-4',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4', className)} {...props} />;
}

export function CardBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('space-y-3', className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex items-center justify-between pt-4 border-t border-border', className)} {...props} />;
}
