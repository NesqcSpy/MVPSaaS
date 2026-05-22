import * as React from 'react';
import { cn } from '@/lib/utils';

interface LogoMarkProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  /** When true, renders the solid (flat) fallback used for tiny sizes / single-color contexts. */
  flat?: boolean;
}

/**
 * Brand mark — the stylized "D" inside a rounded square.
 *
 * The D doubles as a database disc viewed at angle. Two horizontal cuts hint
 * at the storage stripe (operational, structural) without ever being literal.
 * The mark is square, vector, and ships in two variants: gradient (default)
 * and flat (favicons, badges, status dots).
 */
export function LogoMark({ size = 32, flat = false, className, ...rest }: LogoMarkProps) {
  const id = React.useId();
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      role="img"
      aria-label="DataClean"
      className={cn('shrink-0', className)}
      {...rest}
    >
      <defs>
        <linearGradient id={`g-${id}`} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3B82F6" />
          <stop offset="0.5" stopColor="#06B6D4" />
          <stop offset="1" stopColor="#8B5CF6" />
        </linearGradient>
      </defs>

      <rect width="32" height="32" rx="8" fill={flat ? '#3B82F6' : `url(#g-${id})`} />

      {/* The D, rendered as a path so it scales sub-pixel cleanly. */}
      <path
        d="M9 8.5h7.4c4.7 0 7.6 3 7.6 7.5s-2.9 7.5-7.6 7.5H9V8.5Zm3.4 3v8h3.8c2.6 0 4.3-1.6 4.3-4s-1.7-4-4.3-4h-3.8Z"
        fill="#F8FAFC"
      />

      {/* Storage stripes — two thin marks that read as DB tracks at a glance. */}
      <rect x="9" y="13" width="3.4" height="0.9" fill="#0B1020" opacity="0.45" />
      <rect x="9" y="18" width="3.4" height="0.9" fill="#0B1020" opacity="0.45" />
    </svg>
  );
}

interface LogoProps {
  size?: number;
  variant?: 'lockup' | 'mark' | 'wordmark';
  flat?: boolean;
  className?: string;
}

/**
 * Composite lockup — mark + wordmark. Optical alignment puts the wordmark
 * cap height at ~0.875× the mark height. Spacing is half the mark height.
 */
export function Logo({ size = 28, variant = 'lockup', flat = false, className }: LogoProps) {
  if (variant === 'mark') return <LogoMark size={size} flat={flat} className={className} />;

  return (
    <span className={cn('inline-flex items-center', className)}>
      {variant === 'lockup' && (
        <LogoMark size={size} flat={flat} style={{ marginRight: size * 0.32 }} />
      )}
      <span
        className="font-semibold tracking-tight text-ink-high"
        style={{ fontSize: size * 0.72, letterSpacing: '-0.01em' }}
      >
        DataClean
      </span>
    </span>
  );
}
