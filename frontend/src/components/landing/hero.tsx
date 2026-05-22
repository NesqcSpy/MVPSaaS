'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Activity, ShieldCheck, GitBranch } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 ring-grid opacity-60 pointer-events-none" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] bg-brand-primary/20 blur-3xl rounded-full pointer-events-none" />

      <div className="container relative py-24 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-ink-mid mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-state-success animate-pulse-dot" />
            Operational data automation, in production
          </div>

          <h1 className="text-4xl md:text-6xl font-semibold leading-[1.05] tracking-tight">
            <span className="text-grad">Structured data.</span>{' '}
            <span className="text-brand-grad">Automated operations.</span>
          </h1>

          <p className="mt-6 text-lg text-ink-mid max-w-2xl">
            DataClean turns invoices, receipts, purchase orders, and any
            unstructured document into validated, routed, observable data —
            without manual entry, broken spreadsheets, or fragile glue code.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/register">
                Start automating <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <a href="#how">See how it works</a>
            </Button>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
            <Stat icon={<Activity className="h-4 w-4" />} k="Throughput" v="10k+ docs/hr per worker" />
            <Stat icon={<GitBranch className="h-4 w-4" />} k="Pipelines" v="ETL · Webhooks · DBs" />
            <Stat icon={<ShieldCheck className="h-4 w-4" />} k="Validation" v="Schema · rules · audit" />
          </div>
        </motion.div>

        <PipelinePreview />
      </div>
    </section>
  );
}

function Stat({ icon, k, v }: { icon: React.ReactNode; k: string; v: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface/40 p-3">
      <div className="flex items-center gap-2 text-ink-low text-xs uppercase tracking-wide">
        {icon} {k}
      </div>
      <div className="mt-1 text-ink-high text-sm font-medium">{v}</div>
    </div>
  );
}

function PipelinePreview() {
  const stages = [
    { name: 'Ingest', sub: 'PDF · PNG · JPG' },
    { name: 'OCR', sub: 'Mistral · Textract' },
    { name: 'Extract', sub: 'Template engine' },
    { name: 'Validate', sub: 'Rules · audit' },
    { name: 'Route', sub: 'ETL · DB · API' },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="mt-16 card-surface p-4 md:p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs text-ink-low uppercase tracking-wide">Live pipeline</div>
        <div className="flex items-center gap-2 text-xs text-state-success">
          <span className="h-1.5 w-1.5 rounded-full bg-state-success animate-pulse-dot" />
          Healthy · 4 workers · 0 failures (24h)
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stages.map((s, i) => (
          <div
            key={s.name}
            className="rounded-lg border border-border bg-bg-deep/50 p-4 relative"
          >
            <div className="text-xs text-ink-low">{`0${i + 1}`}</div>
            <div className="text-ink-high font-medium mt-1">{s.name}</div>
            <div className="text-xs text-ink-low mt-0.5">{s.sub}</div>
            {i < stages.length - 1 && (
              <div className="hidden md:block absolute right-[-10px] top-1/2 -translate-y-1/2 text-ink-low">
                →
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
