# DataClean — Marketing Playbook

**Version 1.0**

The operational manual for everything customer-facing: who we sell to, what we say to them, how we say it, and where.

---

## 1. Ideal customer profile (ICP)

### Firmographic

| Attribute | Sweet spot | Outside ICP |
|---|---|---|
| Headcount | 50 – 1,000 | < 20 (too early), > 5,000 (long enterprise cycles) |
| Revenue | $5M – $250M ARR | < $1M (no budget), > $500M (RFP-heavy) |
| Industry | Logistics, manufacturing, fintech back-office, services, retail back-office, healthcare admin | Pure consumer apps, gaming, ad-tech |
| Geography | NA, LATAM, EU. Spanish-speaking ops markets are an early advantage. | Closed regulatory regimes (initial release) |
| Document volume | 500 – 50,000 documents/month | < 200/month (manual is fine) |

### Buyer personas

#### 🎯 Primary — *Head of Operations*

- **Title:** Director of Operations · VP Operations · Head of Finance Operations
- **Pain:** spends 30% of the team's hours on data entry; CFO is asking why
- **Quote:** "I have eight analysts and four of them are basically translating PDFs into our ERP."
- **Buying authority:** approves under $50k/yr; champions above
- **Where they hang out:** LinkedIn ops communities, MODEX, NRF, RILA
- **What earns trust:** specific throughput numbers, a real ROI calculator, peer references

#### 🎯 Secondary — *Data Platform Lead*

- **Title:** Head of Data Platform · Staff Data Engineer · Director Engineering
- **Pain:** business teams keep asking them to build "just one more" document parser
- **Quote:** "I've written this five times for five different document types. I'm not writing it a sixth."
- **Buying authority:** technical veto power; rarely the buyer
- **Where they hang out:** Hacker News, Lobsters, dbt Slack, Locally Optimistic
- **What earns trust:** architecture docs, OpenTelemetry support, self-host option, OSS friendliness

#### 🎯 Influencer — *Finance Controller*

- **Pain:** month-end close is delayed by AP backlog; audit needs traceability
- **What earns trust:** SOC 2 plan, audit log demo, SAP/NetSuite/QuickBooks connectors

### Disqualification signals

- "We just need an OCR API" → send them to a pure OCR provider.
- "We want a no-code tool our customers can use" → not us.
- "We're a 4-person agency reselling to clients" → not yet; revisit at scale.
- "Can it handle handwritten free-form contracts?" → out of scope for v1.

---

## 2. Positioning statement

> For **operations teams** at **mid-market companies** who **lose hours to manual data entry from documents**,
> **DataClean** is the **operational data automation platform** that **ingests, extracts, validates, and routes documents into your systems with full observability** —
> unlike **generic OCR APIs** or **heavy enterprise IDP suites**,
> **DataClean is a modular, self-hostable pipeline you can deploy in a day and understand end-to-end.**

### Three-line elevator

> DataClean turns unstructured documents into structured, validated, routed data.
> One pipeline, observable end to end, deployable to your own infrastructure.
> Built for ops teams who refuse to wait three months for an enterprise IDP rollout.

---

## 3. Value-proposition hierarchy

### Headline value props (used in hero, ads, decks)

1. **Eliminate manual data entry.**
   Replace analyst hours with a pipeline that runs 24/7.

2. **From documents to systems — in one hop.**
   OCR, extraction, validation, and ETL aren't four tools. They're one pipeline.

3. **Observable by default.**
   OpenTelemetry, Prometheus, audit logs, queue health — wired in, not bolted on.

4. **No vendor lock-in.**
   Provider-abstracted OCR. Self-hostable. Postgres + Redis. Run it where you want.

### Proof points (for body copy, blog posts, sales)

| Claim | Evidence |
|---|---|
| "10k+ documents/hour per worker" | Mistral OCR throughput benchmark on c6i.2xlarge |
| "Sub-second extraction latency" | Template engine p50 = 180ms across 4 templates |
| "99.2% extraction accuracy" | Internal eval on 12k invoices across 6 languages |
| "Audit-ready out of the box" | AuditLog table; OpenTelemetry traces; immutable history |
| "Self-hostable in <30 minutes" | docker compose up; demo seed |
| "Deploy without lock-in" | OCR provider abstraction; standard Postgres/Redis |

### Anti-objections

| Objection | Response |
|---|---|
| "We already use Textract." | DataClean *uses* Textract too — as one provider. We add extraction, validation, routing, observability. |
| "Sounds like Hyperscience / Rossum / Klippa." | Heavy IDP suites take 3–6 months to deploy and start at $80k. DataClean ships in a day, costs a fraction, and you own the pipeline. |
| "We'll just build this internally." | You can. We did. It took 9 months and we sold what we built. Pick where you want to spend engineering. |
| "What about handwritten docs?" | Not our v1 sweet spot. We focus on machine-printed business documents — invoices, receipts, POs. |
| "How accurate is the AI?" | Per template, per workspace, per field. Confidence is a column, not a slogan. |
| "Is it really self-hostable?" | Yes. Postgres, Redis, two Node services, an Nginx — nothing exotic. |

---

## 4. Competitive landscape

### How we frame each category

| Category | Examples | DataClean position |
|---|---|---|
| **Pure OCR APIs** | Textract, Vision, Mistral OCR | We *use* them; we wrap them in a pipeline |
| **Document AI / IDP** | Rossum, Klippa, Docparser, Hyperscience, Instabase | We are faster, modular, self-hostable, observable |
| **RPA** | UiPath, Automation Anywhere, Blue Prism | Different paradigm — we are infrastructure, not bot-as-band-aid |
| **Custom build** | "We'll build this ourselves" | We *are* what you would build, productized |
| **Manual entry** | Analyst hours, BPO contracts | The real status quo we replace |

### Public comparison talking points

- We don't trash competitors by name in marketing. We trash the *behavior*: black-box pipelines, no observability, seat-based pricing, multi-month rollouts.
- Sales is allowed to compare directly when asked. Marketing implies.

---

## 5. Messaging matrix

Per-channel adaptation of the same core claim.

| Channel | Hook | Body | CTA |
|---|---|---|---|
| **Landing hero** | "Structured data. Automated operations." | One pipeline: ingest, OCR, extract, validate, route. | Start automating |
| **LinkedIn ad** | "Your ops team translates PDFs into your ERP. Stop." | DataClean is the pipeline that does it for them. 10k docs/hr per worker. | Open the dashboard |
| **X / Twitter** | Numbers in the first line. | A chart, a screenshot, or a one-liner from a customer. | Link to the post |
| **Cold email** | One sentence subject. One sentence body. One link. | "12 invoices an hour, 8 analysts — sound familiar? 30-second demo: $LINK" | Reply with "show me" |
| **Conference booth** | "How many hours/month does your team spend on data entry?" | Pull out the ROI calculator on an iPad. | Book a 15-min slot |
| **Sales call (discovery)** | "Walk me through how an invoice ends up in your ERP today." | Map their current pipeline; surface the friction. | "Want to see ours next?" |
| **Sales call (demo)** | "I'll start from the moment your finance team gets a PDF." | Run the live pipeline. Show the audit log. Show the failure case. | "What would block this for you?" |

---

## 6. Go-to-market motion

### Phase 1 — Founder-led (months 0–6)

- 50 hand-picked design partners across logistics, AP, and back-office services.
- Free for 6 months; commit to a 30-minute monthly call.
- Founder owns every conversation. No SDRs.
- Goal: ship 3 case studies, $300k ARR pipeline, 6 paid logos.

### Phase 2 — Product-led signals (months 6–12)

- Self-serve $0 plan with 500-doc cap.
- Programmatic SEO for `/extract-{document-type}-data` long-tail.
- One technical post per week ("How we extract invoice totals when subtotal + tax doesn't equal total").
- Open-source one piece (the OCR provider abstraction or the union-all transformation).
- Goal: 1k workspaces, $1M ARR run-rate, inbound > outbound.

### Phase 3 — Specialist sales (months 12–24)

- Hire two AE-engineers (technical AEs who can demo live).
- Vertical land: pick one industry per quarter (start: 3PL logistics; then mid-market manufacturing).
- Partner with one ERP integrator per vertical for co-sell.
- Goal: $5M ARR, 90% net revenue retention, two named customer advisory board members.

---

## 7. Launch playbook

### Pre-launch (T-30 to T-0)

| Asset | Owner | Deadline |
|---|---|---|
| Brand site live with full landing | Design + Eng | T-21 |
| 3 architecture/engineering posts | Founders | T-14 |
| ROI calculator (Notion or in-app) | Marketing | T-14 |
| Press kit (logo, screenshots, exec bios) | Marketing | T-10 |
| 12 design-partner quotes secured | Founders | T-7 |
| Demo video (≤ 90 seconds, no voiceover) | Marketing | T-7 |
| Launch tweet thread drafted | Founders | T-2 |

### Launch day

1. **00:00 UTC** — site flips to launch state, pricing page goes public.
2. **07:00 local** — Show HN: "Show HN: DataClean — operational data automation, self-hostable."
3. **08:00 local** — Product Hunt submission.
4. **09:00 local** — LinkedIn post by each founder, linking to the launch essay.
5. **10:00 local** — X thread: numbers first, demo gif third.
6. **All day** — founders monitor and reply to every HN comment within 30 min.
7. **18:00 local** — internal retro Slack: signups, top objections, top questions.

### Post-launch (T+7)

- Post-mortem essay: "What we learned from launch week."
- Personal email to every signup over 100-document free-tier usage.
- One sales call with every paid signup in week one.

---

## 8. Content strategy

### Editorial pillars

1. **Inside the pipeline** — how things actually work (OCR provider selection, template scoring, validation rules).
2. **Operations as engineering** — applying engineering rigor to ops workflows (queue health as a KPI, SLO for invoice processing).
3. **Field reports** — anonymized customer war stories, with numbers.
4. **The shape of unstructured data** — the underrated problems with documents (multi-currency, decimal-comma, OCR drift, dedup).

### Cadence

- **Weekly:** one long-form post (1,200–2,000 words) on a pillar.
- **Weekly:** one social-native carousel or thread distilled from the post.
- **Monthly:** changelog post.
- **Quarterly:** state-of-document-automation report with original data.

### Format rules

- Every post opens with a concrete scenario, not "in today's fast-paced world."
- Every post ends with a "what we ship next" line — no dead-end posts.
- Code blocks render in JetBrains Mono with line numbers.
- Author photo and one-line bio at the foot.

---

## 9. Channel mix

| Channel | Why | KPI |
|---|---|---|
| **SEO** | Long-tail capture for "extract X from Y" queries | Non-brand organic sessions |
| **LinkedIn** | Where ops leaders actually read content | Comments and reply DMs |
| **X / Hacker News** | Where the technical buyer hangs out | Site click-through and inbound |
| **Newsletter** | The owned audience; defensible | Open rate and reply rate |
| **Conferences** | High-trust face time with ICP | Pipeline created per conference |
| **Webinars (joint)** | Co-marketing with ERP partners | Qualified meetings booked |
| **Email outbound** | Surgical, not volume | Reply rate (≥ 8%) |

### What we deliberately ignore (for now)

- Paid Google Search (until SEO baseline is set).
- Display, retargeting, banner ads.
- Conference sponsorship beyond a 6×3 booth.
- Generic "SaaS for SMB" lists.
- Pure influencer marketing.

---

## 10. Pricing & packaging

| Plan | Price | Documents/mo | Workspaces | Connectors | Support |
|---|---|---|---|---|---|
| **Starter** | $0 | 500 | 1 | CSV, Excel | Community |
| **Growth** | $249 / mo | 25,000 | 5 | All | Email, 24h |
| **Scale** | $799 / mo | 150,000 | Unlimited | All + audit export | Priority, 4h |
| **Enterprise** | Custom | Unlimited | Unlimited | All + custom | Dedicated SE, SLA |

### Packaging logic

- **Free plan is the funnel**, not a stunt. 500 docs is enough to prove value; not enough to run an ops team on.
- **Growth is the median target plan.** Price anchored at "less than one analyst-day per month."
- **Scale exists to let Growth customers grow into us**, not as a wall.
- **Enterprise unlocks self-host, VPC, SSO, custom SLAs.** Not feature-gated, deployment-gated.

### What we never charge for

- Seats / users.
- Pipelines, integrations, or templates.
- Documents the system failed to process (failed jobs are free).

---

## 11. Brand voice — quick reference card

| Surface | Sample sentence |
|---|---|
| Hero | "Structured data. Automated operations." |
| Subhead | "DataClean turns documents into validated records and routes them through pipelines you can observe." |
| Feature card | "**Provider-abstracted OCR.** Mistral by default; Textract, Vision, Azure interchangeable via one env var." |
| Error toast | "Mistral OCR 503 — retrying in 12s. Document still queued." |
| Empty state | "No pipelines yet. A pipeline routes validated extractions into a connected integration." |
| Cold email | "Saw your team scaled to 8 analysts last quarter — congrats. We help ops teams avoid hiring the 9th. 30s demo: [link]" |
| Confirmation modal | "Archive pipeline `invoices-to-netsuite`? Active jobs continue; new jobs will not enqueue." |
| Changelog | "ETL — Postgres connector now supports `ON CONFLICT … DO UPDATE` upsert via the `conflictKeys` config option." |

---

## 12. Asset checklist

Before shipping any customer-facing surface:

- [ ] Reads aloud cleanly.
- [ ] Every claim has a number or a verb behind it.
- [ ] No "AI" used as a noun without a referent.
- [ ] No exclamation marks.
- [ ] Numbers in tabular mono where they appear in rows.
- [ ] Exactly one primary CTA per viewport.
- [ ] Logo lockup minimum size respected.
- [ ] Contrast checked at 4.5:1 minimum.
- [ ] Loads in < 1s on a throttled 4G connection.
- [ ] Reads in dark mode (because it always is dark mode).
