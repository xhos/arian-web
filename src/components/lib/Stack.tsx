/**
 * Stack Components
 *
 * Flexible layout primitives for spacing and alignment
 * These replace raw Tailwind spacing classes with semantic, reusable components
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  spacing?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'between' | 'around' | 'end';
  divider?: boolean;
}

const spacingClasses = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-3',
  lg: 'gap-4',
  xl: 'gap-6',
  '2xl': 'gap-8',
  '3xl': 'gap-12',
};

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  between: 'justify-between',
  around: 'justify-around',
  end: 'justify-end',
};

export function VStack({
  spacing = 'md',
  align = 'stretch',
  justify = 'start',
  divider = false,
  className,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(
        'flex flex-col',
        spacingClasses[spacing],
        alignClasses[align],
        justifyClasses[justify],
        divider && 'divide-y divide-border',
        className
      )}
      {...props}
    />
  );
}

export function HStack({
  spacing = 'md',
  align = 'center',
  justify = 'start',
  divider = false,
  className,
  ...props
}: StackProps) {
  return (
    <div
      className={cn(
        'flex flex-row',
        spacingClasses[spacing],
        alignClasses[align],
        justifyClasses[justify],
        divider && 'divide-x divide-border',
        className
      )}
      {...props}
    />
  );
}

export function Box({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}
