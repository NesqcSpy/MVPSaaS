import { Injectable } from '@nestjs/common';
import { DocumentKind } from '@prisma/client';

import { ExtractedField, ExtractionTemplate, TemplateExtraction } from './template.interface';
import { computeScore } from './invoice.template';
import { parseAmount, parseCurrency, parseDate, tidyString } from '../field-normalizer';

/**
 * Fallback template for any document where the kind is unknown or no
 * specialized template matched. Pulls the obvious primitives (a date, an
 * amount, a currency, an email) so downstream code always has something
 * structured to work with.
 */
@Injectable()
export class GenericTemplate implements ExtractionTemplate {
  readonly name = 'generic';
  readonly kind = DocumentKind.GENERIC;

  readonly requiredFields = [] as const;
  readonly optionalFields = ['date', 'totalAmount', 'currency', 'email'] as const;

  extract(rawText: string): TemplateExtraction {
    const text = rawText.replace(/ /g, ' ');

    // Take the largest amount as the candidate total — usually correct
    // for receipts/invoices that don't include explicit labels.
    const amounts = Array.from(text.matchAll(/([0-9][0-9,.\s]{2,})/g))
      .map((m) => parseAmount(m[1]))
      .filter((v): v is number => v != null && v > 0);
    const total = amounts.length ? Math.max(...amounts) : null;

    const dateRaw =
      text.match(/\b\d{4}-\d{2}-\d{2}\b/)?.[0] ??
      text.match(/\b(\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4})\b/)?.[1] ??
      null;
    const currencyRaw =
      text.match(/\b(USD|EUR|GBP|MXN|JPY|BRL|CAD|AUD)\b/)?.[1] ??
      text.match(/([$€£¥])/)?.[1] ??
      null;
    const emailRaw = text.match(/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/)?.[0] ?? null;
    const title = tidyString(text.split('\n').find((line) => line.trim().length > 4) ?? null);

    const fields: Record<string, ExtractedField> = {
      title: f(title, title, title ? 0.5 : 0),
      date: f(parseDate(dateRaw), dateRaw, dateRaw ? 0.6 : 0),
      totalAmount: f(total, total, total != null ? 0.5 : 0),
      currency: f(parseCurrency(currencyRaw), currencyRaw, currencyRaw ? 0.5 : 0),
      email: f(emailRaw, emailRaw, emailRaw ? 0.9 : 0),
    };

    const data = {
      title: fields.title.value,
      date: fields.date.value,
      total_amount: fields.totalAmount.value,
      currency: fields.currency.value,
      email: fields.email.value,
    };

    return {
      template: this.name,
      data,
      fields,
      overallScore: computeScore(fields, this.requiredFields, this.optionalFields),
    };
  }
}

function f<T>(value: T | null, source: unknown, baseConfidence: number): ExtractedField<T> {
  return {
    value,
    confidence: value == null ? 0 : baseConfidence,
    source: source == null ? undefined : String(source).slice(0, 200),
  };
}
