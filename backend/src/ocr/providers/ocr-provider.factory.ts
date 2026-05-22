import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Type } from '@nestjs/common';

import { AppConfig } from '../../config/configuration';
import { OCRProvider } from './ocr-provider.interface';
import { MistralOcrProvider } from './mistral.provider';
import { MockOcrProvider } from './mock.provider';
import { TextractOcrProvider } from './textract.provider';
import { VisionOcrProvider } from './vision.provider';
import { AzureOcrProvider } from './azure.provider';

type ProviderId = 'mistral' | 'textract' | 'vision' | 'azure' | 'mock';

/**
 * Maps env-driven provider id → concrete class. Adding a new provider is a
 * two-step change: implement OCRProvider and register the class here. The
 * factory resolves the active provider once at startup; downstream code
 * pulls it via `getActive()`.
 */
const REGISTRY: Record<ProviderId, Type<OCRProvider>> = {
  mistral: MistralOcrProvider,
  textract: TextractOcrProvider,
  vision: VisionOcrProvider,
  azure: AzureOcrProvider,
  mock: MockOcrProvider,
};

@Injectable()
export class OCRProviderFactory implements OnModuleInit {
  private readonly logger = new Logger(OCRProviderFactory.name);
  private active!: OCRProvider;

  constructor(private readonly cfg: AppConfig, private readonly moduleRef: ModuleRef) {}

  async onModuleInit(): Promise<void> {
    const id = this.cfg.ocr.provider as ProviderId;
    const cls = REGISTRY[id];
    if (!cls) {
      this.logger.warn(`Unknown OCR provider "${id}" — falling back to mock`);
      this.active = await this.resolve(MockOcrProvider);
      return;
    }
    this.active = await this.resolve(cls);
    try {
      await this.active.ensureReady();
      this.logger.log(`OCR provider ready: ${this.active.name}`);
    } catch (err) {
      this.logger.error(
        `OCR provider "${this.active.name}" failed readiness check — falling back to mock`,
        err as Error,
      );
      this.active = await this.resolve(MockOcrProvider);
    }
  }

  private resolve<T>(cls: Type<T>): Promise<T> {
    return this.moduleRef.create(cls);
  }

  getActive(): OCRProvider {
    if (!this.active) {
      throw new Error('OCRProviderFactory accessed before onModuleInit completed');
    }
    return this.active;
  }

  /** Useful for tests / one-off invocations against a specific provider. */
  async getByName(id: ProviderId): Promise<OCRProvider> {
    const cls = REGISTRY[id];
    if (!cls) throw new Error(`Unknown OCR provider: ${id}`);
    const inst = await this.resolve(cls);
    await inst.ensureReady();
    return inst;
  }
}
