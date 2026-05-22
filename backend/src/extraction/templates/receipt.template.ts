import { Injectable } from '@nestjs/common';
import { DocumentKind } from '@prisma/client';

import { ExtractedField, ExtractionTemplate, TemplateExtraction } from './template.interface';
import { computeScore } from './invoice.template';
import { parseAmount, parseCurrency, parseDate, pickFirst, tidyString } from '../field-normalizer';

const RE = {
  receiptNumber: /(?:receipt|recibo|ticket|folio)\s*(?:no\.?|number|#)?[\s:]*([A-Z0-9][A-Z0-9\-_/]{2,})/i,
  date: /(?:date|fecha)[\s:]*([0-9]{1,4}[-/.\s][0-9A-Za-z]{1,9}[-/.\s][0-9]{2,4})/i,
  isoDate: /\b(\d{4}-\d{2}-\d{2})\b/,
  merchant: /^([A-Z][A-Z0-9 ,.&'-]{2,60})\s*$/m,
  total: /(?:total|amount\s*paid|importe\s*total)[\s:$]*([0-9][0-9.,\s]*)/i,
  paymentMethod: /(?:paid\s*by|payment\s*method|m[eé]todo\s*de\s*pago)[\s:]*([A-Za-z ]{3,40})/i,
  currency: /\b(USD|EUR|GBP|MXN|JPY|BRL|CAD|AUD|MX\$|US\$)\b|([$€£¥])/,
};

@Injectable()
export class ReceiptTemplate implements ExtractionTemplate {
  readonly name = 'receipt';
  readonly kind = DocumentKind.RECEIPT;

  readonly requiredFields = ['date', 'totalAmount', 'currency'] as const;
  readonly optionalFields = ['receiptNumber', 'merchant', 'paymentMethod'] as const;

  extract(rawText: string): TemplateExtraction {
    const text = rawText.replace(/ /g, ' ');

    const receiptNumberRaw = pickFirst(RE.receiptNumber, text);
    const dateRaw = pickFirst(RE.date, text) ?? pickFirst(RE.isoDate, text);
    const merchantRaw = pickFirst(RE.merchant, text);
    const totalRaw = pickFirst(RE.total, text);
    const paymentRaw = pickFirst(RE.paymentMethod, text);
    const currencyRaw = pickFirst(RE.currency, text, 1) ?? pickFirst(RE.currency, text, 2);

    const receiptNumber = f(tidyString(receiptNumberRaw), receiptNumberRaw, 0.85);
    const date = f(parseDate(dateRaw), dateRaw, 0.9);
    const merchant = f(tidyString(merchantRaw), merchantRaw, 0.6);
    const totalAmount = f(parseAmount(totalRaw), totalRaw, 0.9);
    const paymentMethod = f(tidyString(paymentRaw), paymentRaw, 0.7);
    const currency = f(parseCurrency(currencyRaw), currencyRaw, 0.8);

    const fields: Record<string, ExtractedField> = {
      receiptNumber,
      date,
      merchant,
      totalAmount,
      paymentMethod,
      currency,
    };

    const data = {
      receipt_number: receiptNumber.value,
      date: date.value,
      merchant: merchant.value,
      total_amount: totalAmount.value,
      payment_method: paymentMethod.value,
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

function f<T>(value: T | null, source: unknown, baseConfidence: number): ExtractedField<T> {
  return {
    value,
    confidence: value == null ? 0 : baseConfidence,
    source: source == null ? undefined : String(source).slice(0, 200),
  };
}
