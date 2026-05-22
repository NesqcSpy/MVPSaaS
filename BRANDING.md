# DataClean — Brand Guide

**Version 1.0 · Last updated 2026-05-21**

This is the operating manual for the DataClean brand. Anyone writing copy, designing screens, recording demos, or shipping a marketing surface should read it before they ship.

---

## 1. Brand positioning

### One-line definition

> **DataClean is the operational data automation platform for teams that move documents into systems.**

### Why it exists

Mid-market operations teams lose 30–60 hours per analyst per month to:

- Manual data entry from PDFs, scans, photos, and email attachments.
- Spreadsheets that drift between people.
- Brittle scripts written by an engineer who left two years ago.
- Generic OCR tools that hand you raw text and walk away.

DataClean replaces that work with a single operational pipeline: **ingest → OCR → extract → validate → route → observe**. The pipeline is modular, observable, and yours to run.

### What we are not

- We are not "AI for documents." We use AI where it helps and engineering everywhere else.
- We are not a generic OCR API. OCR is one step inside a longer pipeline.
- We are not a no-code automation playground. We are infrastructure.
- We are not a closed black box. The pipeline is inspectable end to end.

### Strategic position

| Axis | Where DataClean sits |
|---|---|
| Buyer | Head of Operations · Finance Director · Data Platform Lead |
| Deployment | Cloud-hosted, self-hostable, VPC-deployable |
| Surface | Real product UI · REST API · webhooks |
| Pricing | Usage-based on documents processed, not seats |
| Defensibility | Provider abstraction, observability, schema unification |

---

## 2. Brand personality

DataClean is the **infrastructure-grade peer** in the room. Think Stripe's calm precision, Datadog's operational depth, Linear's craft, Vercel's polish.

| Trait | Means | Doesn't mean |
|---|---|---|
| **Operational** | We talk in throughput, latency, retries | Cold or robotic |
| **Technical** | We respect the reader's expertise | Jargon for its own sake |
| **Confident** | We make claims and back them with numbers | Arrogant or dismissive |
| **Reliable** | We ship boring, well-tested foundations | Risk-averse or slow |
| **Curious** | We explain the trade-offs, including ours | Wishy-washy or hedged |

**Brand archetype:** *The Engineer.* Calm, precise, has shipped this before, is happy to show you the wiring.

---

## 3. Voice & tone

### Voice principles

1. **Operator-to-operator.** The reader is a peer who already knows the problem. Skip the setup; get to the substance.
2. **Specific, not generic.** "Reduces invoice processing from 14 minutes to 22 seconds" — not "saves time."
3. **Verbs before adjectives.** "Routes," "validates," "retries." Adjectives are seasoning, not the meal.
4. **One claim per sentence.** Compress the message in revision, not in drafting.
5. **Numbers over superlatives.** "99.2% extraction accuracy across 12k invoices" — not "incredibly accurate."

### Tone by surface

| Surface | Tone |
|---|---|
| Landing page | Confident, declarative. Short sentences. |
| Product UI | Direct, minimal. Tooltips over paragraphs. |
| Error messages | Honest, actionable, no blame. |
| Docs | Precise, exhaustive, technical. |
| Email (transactional) | Brief, scannable, single CTA. |
| Email (marketing) | Operator newsletter — useful first, promotional second. |
| Social (X/LinkedIn) | Substance over hype. Numbers, charts, screenshots. |
| Sales conversation | Diagnostic, not pitch-driven. Ask before you tell. |

### Things we say

- "Operational data automation."
- "From documents to structured operations."
- "Eliminate operational friction."
- "Structured data. Automated operations."
- "Modular monolith — not a black box."
- "Observability is a first-class citizen."
- "Provider-abstracted OCR."
- "Survives audit."

### Things we never say

| Don't say | Why | Say instead |
|---|---|---|
| "Revolutionary AI…" | Hype | "Mistral OCR + template extraction" |
| "Magical experience" | Vague | "Predictable pipeline" |
| "Game-changer" | Cliché | The specific outcome |
| "Synergy" / "leverage" | Empty | "Use" / "combine" |
| "Best-in-class" | Unverifiable | "Benchmarked at X" |
| "Disrupting…" | Reductive | "Replaces manual entry" |
| "Powered by AI" | Lazy | What kind. Which model. What for. |
| "Easy" | Insulting to a real ops team | "Composable" / "incremental" |
| "Enterprise-ready" | Marketing tell | List the controls: SSO, audit, SLA |

### Sentence-level rules

- **Active voice always.** "We retry the job," not "the job is retried."
- **No exclamation marks.** Confidence doesn't shout.
- **Em dashes are fine, em dashes everywhere are noise.** Use one per paragraph max.
- **Numbers as numerals from 10 up.** "9 connectors, 12 templates."
- **Oxford comma.**
- **No "you'll" in product copy.** "You will" or "Click X" — pick one and commit.
- **Spell "OCR" capitalized. "ETL" capitalized. "API" capitalized.**

---

## 4. Naming

### Product

- The product is **DataClean** — one word, two capitals.
- Not "Data Clean," not "dataclean," not "data-clean."
- The wordmark may render as `dataclean` lowercase in monospace contexts.

### Concepts

| Capitalize | Lowercase |
|---|---|
| Workspace · Workspaces (when proper noun) | document, invoice, receipt |
| Pipeline · Integration (UI labels) | extraction, validation, OCR |
| Mistral OCR · AWS Textract | template, connector, transformation |

### Feature naming heuristic

- Two words max.
- Concrete verb-noun pairs win: *Document Ingestion, Template Extraction, Schema Unification, Queue Health*.
- If the name needs a tagline to explain it, it's the wrong name.

---

## 5. Visual identity

### Logo

- **Wordmark:** "DataClean" in Inter Semibold (600), tracking -0.01em.
- **Mark:** a stylized "D" inside a gradient-filled rounded square (8px radius at 32px size). The "D" reads as a database disc viewed at angle — operational, structural, not decorative.
- **Lockup:** mark + 8px gap + wordmark. Vertically optical-aligned (the mark is 0.875× the wordmark cap height).

### Clearspace

- Minimum clearspace around the lockup = height of the mark.
- Minimum mark size: **20 px** on screen, **6 mm** in print.

### Logo color rules

| Background | Logo treatment |
|---|---|
| `#0B1020` (brand dark) | Full color gradient mark, white wordmark |
| White / light | Brand-primary `#3B82F6` mark, ink-high wordmark |
| Photography | White lockup with subtle drop-shadow only when contrast < 4.5:1 |
| Single-color print | Solid ink-high or pure black |

**Never:**
- Stretch, skew, rotate, or recolor the mark outside the listed palette.
- Add drop shadows, glows, or 3D effects to the lockup.
- Place the wordmark over busy imagery without a solid backplate.

---

## 6. Color system

### Primary palette

```
Background    base       #0B1020
Background    deep       #0F172A
Background    surface    #111827

Surface       default    #1E293B
Surface       muted      #1F2937

Brand         primary    #3B82F6   (operational blue)
Brand         secondary  #06B6D4   (signal cyan)
Brand         accent     #8B5CF6   (depth violet)

State         success    #10B981
State         warning    #F59E0B
State         error      #EF4444
State         info       #06B6D4

Ink           high       #F8FAFC
Ink           mid        #CBD5E1
Ink           low        #94A3B8
```

### Color logic

- **Backgrounds** form a depth scale, not aesthetic variations. Surface elevation goes `base → deep → surface → surface-default → surface-muted`.
- **Brand** colors carry interactive affordances. Reserve `primary` for primary actions and product chrome. Reserve `accent` for emphasis moments, not surfaces.
- **State** colors are exclusively for state communication. Never use `state-success` for decorative borders.
- **Ink** colors are content hierarchy: `high` for headings and critical values, `mid` for body, `low` for metadata.

### Contrast requirements

- All text ≥ WCAG AA (4.5:1 against background).
- Interactive elements ≥ 3:1 contrast with adjacent surface.
- The gradient lockup must include a flat fallback for contexts where gradients render poorly (favicon at 16×16, status dots, channel avatars).

### Gradient

Use one gradient. **One.**

```
linear-gradient(135deg, #3B82F6 0%, #06B6D4 50%, #8B5CF6 100%)
```

Never invert the stops. Never replace a stop. Never use a different angle. This is the brand.

---

## 7. Typography

### Type stack

```
Display + Body:   Inter (400, 500, 600, 700)
Monospace + UI:   JetBrains Mono (400, 500)
```

Inter ships across every surface that renders text. JetBrains Mono is reserved for code, identifiers (correlation IDs, document IDs), and numeric runs where alignment matters.

### Type scale

| Token | Size / Line | Use |
|---|---|---|
| display-2xl | 60 / 1.05 | Hero headline only |
| display-xl  | 48 / 1.1  | Section headline |
| display-lg  | 36 / 1.15 | Page heading |
| heading-md  | 24 / 1.2  | Subsections |
| heading-sm  | 18 / 1.3  | Card titles |
| body-md     | 16 / 1.6  | Default copy |
| body-sm     | 14 / 1.5  | Secondary copy |
| caption     | 12 / 1.4  | Labels, metadata |
| mono-sm     | 12 / 1.4  | IDs, code |

### Type rules

- **Headings** use ink-high. Body uses ink-mid. Captions use ink-low.
- **Tracking** is tight on display sizes (-0.02em on display-2xl) and zero on body.
- **Numbers always render with tabular-nums** in tables, metrics, and currency columns.
- **No more than one display size per viewport-height.**

---

## 8. Iconography & illustration

### Icon system

- Library: **Lucide** (`lucide-react`). Stroke-based, 1.5px, 24px artboard, rendered at 16/20/24.
- Match icon weight to surrounding text weight.
- Never mix icon families on the same surface.

### Illustration philosophy

DataClean does not use mascots, characters, or cartoon illustration.

Permitted illustration types:

1. **Architecture diagrams** — clean SVG, brand palette, axis-aligned nodes.
2. **Pipeline diagrams** — directional flow, labeled stages, no decorative arrows.
3. **Screenshots** — real product UI, real data shapes (anonymized).
4. **Charts** — minimal axes, brand-primary as default series, state colors only for state signals.

Forbidden:

- 3D isometric "abstract data" art.
- Floating cubes, clouds with faces, robot mascots.
- Lifestyle photography of people pointing at laptops.
- Anything that wouldn't fit on a Datadog or Stripe site.

---

## 9. Motion

- Default easing: `cubic-bezier(0.4, 0, 0.2, 1)` (Tailwind's `ease-in-out`).
- Default duration: **200ms** for interactive feedback, **400ms** for layout transitions, **600ms** maximum for entrance.
- One motion principle: **purposeful**. Motion either communicates state change or reveals hierarchy. Decorative motion is removed.
- Respect `prefers-reduced-motion`. Always.

---

## 10. UI principles

1. **Dark-first.** The product runs in environments operators stare at for hours.
2. **Density over whitespace.** Operators want information; they will accept compact layouts in exchange for fewer clicks.
3. **State is always visible.** Job status, queue depth, validation results — never hidden behind a click.
4. **Predictable destruction.** Destructive actions require confirmation; soft-delete by default.
5. **Numbers are first-class.** Counts, durations, throughput rates render in tabular mono on dark surfaces.
6. **Every list has a search.** No exceptions.

---

## 11. Writing patterns

### Hero formula

> [Concrete capability]. [Concrete capability].
> [What it lets the reader do, plainly stated, ≤ 25 words]

✅ "Structured data. Automated operations. DataClean turns documents into validated records and routes them through pipelines you can observe."

❌ "Revolutionizing operational efficiency through cutting-edge AI."

### Feature description formula

> **[Capability]** — [One precise verb-led sentence describing the mechanism]. [Optional second sentence with the operational consequence.]

✅ "**Provider-abstracted OCR** — Mistral by default; Textract, Vision, Azure interchangeable via one env var. Swap providers without touching extraction or validation."

### Error messages

| Don't | Do |
|---|---|
| "Something went wrong." | "Mistral OCR 503: provider unavailable. Retrying in 12s." |
| "Invalid input." | "`total_amount` must be a number — got `\"fifteen thousand\"`." |
| "Try again later." | "Queue saturated (depth > 5,000). New jobs deferred 30s." |

### CTA verbs

Use these. In this order of preference:

1. **Start automating** (primary)
2. **Open dashboard** (returning users)
3. **Talk to us** (enterprise)
4. **See how it works** (curiosity)

Forbidden: "Get started" (too generic), "Learn more" (lazy), "Click here" (broken).

---

## 12. Do / Don't reference card

| ✅ Do | ❌ Don't |
|---|---|
| "10,000 documents/hour per worker." | "Lightning fast." |
| Real product screenshots. | Stock isometric illustrations. |
| Numbers in tabular mono. | Numbers in proportional fonts. |
| One gradient — the brand gradient. | Random gradient palettes per page. |
| Dark surfaces with high contrast. | Light surfaces "for variety." |
| Specific provider names. | "AI-powered." |
| Operator language. | Buzzwords. |
| Plain HTML emails with one CTA. | Multi-column promotional emails. |

---

## 13. Brand stewardship

- The brand owner is the founding team until a head of design is hired.
- Any change to color tokens, type scale, or logo lockup requires a written rationale, a side-by-side comparison, and one week of internal review before shipping.
- This document is the source of truth. Tailwind tokens and Figma library mirror it.
- When in doubt, read the brand archetype again: *The Engineer.* Calm, precise, has shipped this before, is happy to show you the wiring.
