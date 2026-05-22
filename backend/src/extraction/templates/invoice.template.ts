import { Injectable } from '@nestjs/common';
import { DocumentKind } from '@prisma/client';

import {
  ExtractedField,
  ExtractionTemplate,
  TemplateExtraction,
} from './template.interface';
import {
  parseAmount,
  parseCurrency,
  parseDate,
  pickFirst,
  tidyString,
} from '../field-normalizer';

const RE = {
  invoiceNumber:
    /(?:invoice\s*(?:no\.?|number|#)|factura\s*(?:no\.?|n[uú]mero|#))[\s:]*([A-Z0-9][A-Z0-9\-_/]{2,})/i,
  invoiceNumberFallback: /\b(INV[-_/][A-Z0-9\-_/]+)\b/i,

  date:
    /(?:invoice\s*date|fecha(?:\s*de\s*emisi[oó]n)?|date)[\s:]*([0-9]{1,4}[-/.\s][0-9A-Za-z]{1,9}[-/.\s][0-9]{2,4})/i,
  isoDate: /\b(\d{4}-\d{2}-\d{2})\b/,

  dueDate:
    /(?:due\s*date|fecha\s*(?:de\s*)?(?:vencimiento|l[ií]mite))[\s:]*([0-9]{1,4}[-/.\s][0-9A-Za-z]{1,9}[-/.\s][0-9]{2,4})/i,

  customer:
    /(?:bill\s*to|sold\s*to|customer|cliente|factura(?:r|do)\s*a)[\s:]*([^\n\r]{2,80})/i,

  vendor: /(?:from|vendor|proveedor|emisor)[\s:]*([^\n\r]{2,80})/i,

  subtotal: /(?:subtotal)[\s:$]*([0-9][0-9.,\s]*)/i,
  tax:
    /(?:tax|iva|vat|impuesto(?:s)?)(?:\s*\([^)]+\))?[\s:$]*([0-9][0-9.,\s]*)/i,
  total:
    /(?:total\s*(?:due|amount|a\s*pagar)?|grand\s*total|importe\s*total)[\s:$]*([0-9][0-9.,\s]*)/i,

  currency: /\b(USD|EUR|GBP|MXN|JPY|BRL|CAD|AUD|MX\$|US\$)\b|([$€£¥])/,
};

@Injectable()
export class InvoiceTemplate implements ExtractionTemplate {
  readonly name = 'invoice';
  readonly kind = DocumentKind.INVOICE;

  readonly requiredFields = [
    'invoiceNumber',
    'date',
    'totalAmount',
    'currency',
  ] as const;
  readonly optionalFields = [
    'dueDate',
    'customerName',
    'vendorName',
    'subtotal',
    'tax',
  ] as const;

  extract(rawText: string): TemplateExtraction {
    const text = rawText.replace(/ /g, ' ');

    const invoiceNumberRaw =
      pickFirst(RE.invoiceNumber, text) ?? pickFirst(RE.invoiceNumberFallback, text);
    const dateRaw = pickFirst(RE.date, text) ?? pickFirst(RE.isoDate, text);
    const dueDateRaw = pickFirst(RE.dueDate, text);
    const customerRaw = pickFirst(RE.customer, text);
    const vendorRaw = pickFirst(RE.vendor, text);
    const subtotalRaw = pickFirst(RE.subtotal, text);
    const taxRaw = pickFirst(RE.tax, text);
    const totalRaw = pickFirst(RE.total, text);
    const currencyRaw =
      pickFirst(RE.currency, text, 1) ?? pickFirst(RE.currency, text, 2);

    const invoiceNumber = field(tidyString(invoiceNumberRaw), invoiceNumberRaw, 0.9);
    const date = field(parseDate(dateRaw), dateRaw, 0.9);
    const dueDate = field(parseDate(dueDateRaw), dueDateRaw, 0.85);
    const customerName = field(tidyString(customerRaw), customerRaw, 0.7);
    const vendorName = field(tidyString(vendorRaw), vendorRaw, 0.7);
    const subtotal = field(parseAmount(subtotalRaw), subtotalRaw, 0.85);
    const tax = field(parseAmount(taxRaw), taxRaw, 0.85);
    const totalAmount = field(parseAmount(totalRaw), totalRaw, 0.9);
    const currency = field(parseCurrency(currencyRaw), currencyRaw, 0.8);

    const fields: Record<string, ExtractedField> = {
      invoiceNumber,
      date,
      dueDate,
      customerName,
      vendorName,
      subtotal,
      tax,
      totalAmount,
      currency,
    };

    const data = {
      invoice_number: invoiceNumber.value,
      date: date.value,
      due_date: dueDate.value,
      customer_name: customerName.value,
      vendor_name: vendorName.value,
      subtotal: subtotal.value,
      tax: tax.value,
      total_amount: totalAmount.value,
      currency: currency.value,
    };

    return {
      template: this.name,
      data,
      fields,
      overallScore: computeScore(fields, this.requiredFields, this.optionalFields),
    };
  }
}

function field<T>(value: T | null, source: unknown, baseConfidence: number): ExtractedField<T> {
  return {
    value,
    confidence: value == null ? 0 : baseConfidence,
    source: source == null ? undefined : String(source).slice(0, 200),
  };
}

export function computeScore(
  fields: Record<string, ExtractedField>,
  required: readonly string[],
  optional: readonly string[],
): number {
  const weighted: number[] = [];
  for (const f of required) weighted.push((fields[f]?.confidence ?? 0) * 2);
  for (const f of optional) weighted.push(fields[f]?.confidence ?? 0);
  const maxWeight = required.length * 2 + optional.length;
  if (maxWeight === 0) return 0;
  const sum = weighted.reduce((a, b) => a + b, 0);
  return Math.max(0, Math.min(1, sum / maxWeight));
}
