/**
 * Unified Card System
 *
 * Replaces inconsistent card padding/styling with a single source of truth
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'outline' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
}

const variantClasses = {
  default: 'bg-card border border-border rounded-md',
  subtle: 'bg-muted/30 border-0 rounded-md',
  outline: 'bg-background border border-border rounded-md',
  elevated: 'bg-card border border-border rounded-md shadow-sm',
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
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        variantClasses[variant],
        paddingClasses[padding],
        interactive && 'transition-colors hover:bg-accent/5 cursor-pointer',
        className
      )}
      {...props}
    />
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
