/**
 * Data Display Components
 *
 * Specialized components for displaying financial and transactional data
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface AmountProps {
  value: number;
  currency?: string;
  variant?: 'neutral' | 'positive' | 'negative';
  className?: string;
  compact?: boolean;
}

export function Amount({
  value,
  currency = 'USD',
  variant = 'neutral',
  className,
  compact = false,
}: AmountProps) {
  const formatted = compact
    ? value > 1000
      ? (value / 1000).toFixed(1) + 'k'
      : value.toFixed(0)
    : value.toLocaleString('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

  const variantClasses = {
    neutral: 'text-foreground',
    positive: 'text-success',
    negative: 'text-destructive',
  };

  return (
    <span className={cn('font-mono font-semibold', variantClasses[variant], className)}>
      {variant === 'positive' && value > 0 && '+'}
      {formatted}
    </span>
  );
}

interface StatusBadgeProps {
  status: 'pending' | 'completed' | 'failed' | 'processing';
  className?: string;
}

const statusStyles = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium',
        statusStyles[status],
        className
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

interface MetaRowProps {
  label: string;
  value: React.ReactNode;
  variant?: 'default' | 'highlight';
}

export function MetaRow({ label, value, variant = 'default' }: MetaRowProps) {
  return (
    <div className={cn('flex items-center justify-between text-sm', variant === 'highlight' && 'font-medium')}>
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

interface InfoGridProps {
  items: Array<{ label: string; value: React.ReactNode }>;
  columns?: 1 | 2 | 3 | 4;
}

const columnClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
};

export function InfoGrid({ items, columns = 2 }: InfoGridProps) {
  return (
    <div className={cn('grid gap-4', columnClasses[columns])}>
      {items.map((item, idx) => (
        <div key={idx} className="flex flex-col gap-1">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {item.label}
          </span>
          <span className="text-base font-semibold text-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-4 text-4xl opacity-50">{icon}</div>}
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
}

interface LoadingSkeletonProps {
  lines?: number;
  className?: string;
}

export function LoadingSkeleton({ lines = 3, className }: LoadingSkeletonProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-4 bg-muted rounded-sm animate-pulse" />
      ))}
    </div>
  );
}

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  margin?: 'sm' | 'md' | 'lg';
}

const marginClasses = {
  sm: { horizontal: 'my-2', vertical: 'mx-2' },
  md: { horizontal: 'my-4', vertical: 'mx-4' },
  lg: { horizontal: 'my-6', vertical: 'mx-6' },
};

export function Divider({ orientation = 'horizontal', margin = 'md' }: DividerProps) {
  return orientation === 'horizontal' ? (
    <div className={cn('border-t border-border', marginClasses[margin].horizontal)} />
  ) : (
    <div className={cn('border-l border-border', marginClasses[margin].vertical)} />
  );
}
