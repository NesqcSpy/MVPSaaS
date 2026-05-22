'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-bg-base transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-gradient-brand text-white shadow-glow hover:opacity-90 active:opacity-100',
        secondary:
          'bg-surface text-ink-high border border-border hover:border-border-strong hover:bg-surface-muted',
        outline:
          'border border-border-strong text-ink-mid hover:text-ink-high hover:border-brand-primary/60',
        ghost: 'text-ink-mid hover:text-ink-high hover:bg-surface/60',
        danger:
          'bg-state-error/15 text-state-error border border-state-error/30 hover:bg-state-error/25',
      },
      size: {
        sm: 'h-8 px-3',
        md: 'h-10 px-4',
        lg: 'h-11 px-6 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';
