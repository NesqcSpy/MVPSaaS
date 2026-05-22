import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

export function CTA() {
  return (
    <section className="border-b border-border">
      <div className="container py-24">
        <div className="card-surface relative overflow-hidden p-10 md:p-16">
          <div className="absolute -top-32 -right-32 h-80 w-80 bg-brand-accent/30 blur-3xl rounded-full" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 bg-brand-secondary/20 blur-3xl rounded-full" />
          <div className="relative max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-grad">
              Eliminate operational friction. Today.
            </h2>
            <p className="mt-4 text-ink-mid">
              Stop pasting numbers between systems. Wire DataClean into your
              stack and ship operational automation that survives audit.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/register">Start automating <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
