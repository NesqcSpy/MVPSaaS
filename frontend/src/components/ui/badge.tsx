import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const variants = cva(
  'inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium border',
  {
    variants: {
      tone: {
        neutral: 'bg-surface text-ink-mid border-border',
        success: 'bg-state-success/10 text-state-success border-state-success/30',
        warning: 'bg-state-warning/10 text-state-warning border-state-warning/30',
        error: 'bg-state-error/10 text-state-error border-state-error/30',
        info: 'bg-state-info/10 text-state-info border-state-info/30',
        brand: 'bg-brand-primary/10 text-brand-primary border-brand-primary/30',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof variants> {}

export function Badge({ className, tone, ...p }: BadgeProps) {
  return <span className={cn(variants({ tone }), className)} {...p} />;
}
