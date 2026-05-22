import { cn } from '@/lib/utils';

interface Props {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'error';
  icon?: React.ReactNode;
  className?: string;
}

export function MetricCard({ label, value, sub, tone = 'neutral', icon, className }: Props) {
  const toneClasses =
    tone === 'brand'   ? 'border-brand-primary/30'
  : tone === 'success' ? 'border-state-success/30'
  : tone === 'warning' ? 'border-state-warning/30'
  : tone === 'error'   ? 'border-state-error/30'
  : '';
  return (
    <div className={cn('card-surface p-5', toneClasses, className)}>
      <div className="flex items-center justify-between text-ink-low text-xs uppercase tracking-wide">
        {label}
        {icon}
      </div>
      <div className="mt-2 text-2xl font-semibold text-ink-high tabular-nums">{value}</div>
      {sub && <div className="mt-1 text-xs text-ink-low">{sub}</div>}
    </div>
  );
}
