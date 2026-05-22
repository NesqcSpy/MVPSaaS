import { Module } from '@nestjs/common';

import { OcrService } from './ocr.service';
import { OcrController } from './ocr.controller';
import { OcrProcessor } from './ocr.processor';
import { OCRProviderFactory } from './providers/ocr-provider.factory';
import { MistralOcrProvider } from './providers/mistral.provider';
import { MockOcrProvider } from './providers/mock.provider';
import { TextractOcrProvider } from './providers/textract.provider';
import { VisionOcrProvider } from './providers/vision.provider';
import { AzureOcrProvider } from './providers/azure.provider';
import { DocumentsModule } from '../documents/documents.module';
import { WorkspacesModule } from '../workspaces/workspaces.module';
import { AppConfig } from '../config/configuration';

@Module({
  imports: [DocumentsModule, WorkspacesModule],
  controllers: [OcrController],
  providers: [
    AppConfig,
    OcrService,
    OcrProcessor,
    OCRProviderFactory,
    // Concrete providers — factory creates them on demand via ModuleRef, so
    // listing them here just makes them resolvable by the DI container.
    MistralOcrProvider,
    MockOcrProvider,
    TextractOcrProvider,
    VisionOcrProvider,
    AzureOcrProvider,
  ],
  exports: [OcrService, OCRProviderFactory],
})
export class OcrModule {}
