/**
 * Alert Components
 *
 * Semantic alert and error message components
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'error' | 'success' | 'warning' | 'info';
  title?: string;
  children: React.ReactNode;
}

const variantStyles = {
  error: {
    container: 'bg-destructive/10 border-destructive/30 text-destructive',
    icon: 'text-destructive',
  },
  success: {
    container: 'bg-success/10 border-success/30 text-success',
    icon: 'text-success',
  },
  warning: {
    container: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-700 dark:text-yellow-400',
    icon: 'text-yellow-600 dark:text-yellow-500',
  },
  info: {
    container: 'bg-accent/10 border-accent/30 text-accent',
    icon: 'text-accent',
  },
};

const iconMap = {
  error: AlertCircle,
  success: CheckCircle2,
  warning: AlertTriangle,
  info: Info,
};

export function Alert({
  variant = 'info',
  title,
  children,
  className,
  ...props
}: AlertProps) {
  const Icon = iconMap[variant];
  const styles = variantStyles[variant];

  return (
    <div
      className={cn(
        'flex gap-3 rounded-md border px-4 py-3 text-sm',
        styles.container,
        className
      )}
      {...props}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', styles.icon)} />
      <div className="flex-1">
        {title && <div className="font-medium">{title}</div>}
        <div className={title ? 'text-sm opacity-90 mt-1' : ''}>{children}</div>
      </div>
    </div>
  );
}

export function ErrorMessage({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Alert variant="error" className={className} {...props}>
      {children}
    </Alert>
  );
}

export function SuccessMessage({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Alert variant="success" className={className} {...props}>
      {children}
    </Alert>
  );
}

export function WarningMessage({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Alert variant="warning" className={className} {...props}>
      {children}
    </Alert>
  );
}

export function InfoMessage({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Alert variant="info" className={className} {...props}>
      {children}
    </Alert>
  );
}
