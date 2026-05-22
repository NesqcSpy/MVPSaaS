import * as React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-lg bg-bg-deep/60 border border-border px-3 text-sm text-ink-high placeholder:text-ink-low',
        'focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary/60 transition',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
