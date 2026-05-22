import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function AnnouncementBar() {
  return (
    <div className="border-b border-border bg-bg-deep/40">
      <div className="container h-9 flex items-center justify-center text-xs text-ink-mid">
        <span className="hidden sm:inline-flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-brand-primary/15 text-brand-primary border border-brand-primary/30 text-[10px] uppercase tracking-wider font-medium">
            New
          </span>
          UNION ALL transformation — one canonical schema across every template.
        </span>
        <Link
          href="/changelog"
          className="ml-3 inline-flex items-center gap-1 text-brand-primary hover:underline"
        >
          Read changelog <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
