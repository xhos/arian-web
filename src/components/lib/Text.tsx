/**
 * Typography Components
 *
 * Semantic text components that replace raw Tailwind typography classes
 * All styles are defined here, not scattered throughout the codebase
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface TextProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'body' | 'caption' | 'meta' | 'mono';
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  color?: 'foreground' | 'muted' | 'accent' | 'destructive' | 'success';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
}

const variantClasses = {
  body: 'font-sans',
  caption: 'text-xs font-medium text-muted-foreground',
  meta: 'text-sm text-muted-foreground',
  mono: 'font-mono',
};

const sizeClasses = {
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

const colorClasses = {
  foreground: 'text-foreground',
  muted: 'text-muted-foreground',
  accent: 'text-accent',
  destructive: 'text-destructive',
  success: 'text-success',
};

const weightClasses = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

export function Text({
  variant = 'body',
  size = 'base',
  color = 'foreground',
  weight = 'normal',
  className,
  ...props
}: TextProps) {
  return (
    <span
      className={cn(
        variantClasses[variant],
        sizeClasses[size],
        colorClasses[color],
        weightClasses[weight],
        className
      )}
      {...props}
    />
  );
}

interface HeadingProps extends Omit<React.HTMLAttributes<HTMLHeadingElement>, 'as'> {
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  color?: 'foreground' | 'muted' | 'accent' | 'destructive' | 'success';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

export function Heading({
  as = 'h2',
  size = 'lg',
  color = 'foreground',
  weight = 'semibold',
  className,
  children,
  ...props
}: HeadingProps) {
  const HeadingElement = as;
  return React.createElement(
    HeadingElement,
    {
      className: cn(
        'font-serif',
        sizeClasses[size],
        colorClasses[color],
        weightClasses[weight],
        className
      ),
      ...props,
    },
    children
  );
}

export function Caption({ className, ...props }: TextProps) {
  return <Text variant="caption" size="xs" weight="medium" className={className} {...props} />;
}

export function Mono({ className, ...props }: TextProps) {
  return <Text variant="mono" size="sm" className={className} {...props} />;
}

export function Muted({ size = 'sm', color = 'muted', className, ...props }: TextProps) {
  return <Text size={size} color={color} className={className} {...props} />;
}

export function PageTitle({ className, ...props }: TextProps) {
  return <Heading as="h1" size="xl" className={cn('mb-2', className)} {...props} />;
}

export function SectionTitle({ className, ...props }: TextProps) {
  return <Heading as="h2" size="lg" className={cn('mb-4', className)} {...props} />;
}

export function CardTitle({ className, ...props }: TextProps) {
  return <Heading as="h3" size="base" className={cn('', className)} {...props} />;
}
