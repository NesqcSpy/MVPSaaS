import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { CredentialsCryptoService } from '../etl/security/credentials.service';
import { CreateIntegrationDto, UpdateIntegrationDto } from './dto/integration.dto';

@Injectable()
export class IntegrationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CredentialsCryptoService,
  ) {}

  list(workspaceId: string) {
    return this.prisma.integration.findMany({
      where: { workspaceId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        kind: true,
        enabled: true,
        config: true,
        lastTestedAt: true,
        lastTestStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async get(workspaceId: string, id: string) {
    const integration = await this.prisma.integration.findFirst({
      where: { id, workspaceId, deletedAt: null },
      select: {
        id: true,
        name: true,
        kind: true,
        enabled: true,
        config: true,
        lastTestedAt: true,
        lastTestStatus: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!integration) throw new NotFoundException('Integration not found');
    return integration;
  }

  create(workspaceId: string, dto: CreateIntegrationDto) {
    const credentialsEnc = dto.credentials ? this.crypto.encrypt(dto.credentials) : null;
    return this.prisma.integration.create({
      data: {
        workspaceId,
        name: dto.name,
        kind: dto.kind,
        enabled: dto.enabled ?? true,
        config: dto.config as object,
        credentialsEnc,
      },
      select: { id: true, name: true, kind: true, enabled: true },
    });
  }

  async update(workspaceId: string, id: string, dto: UpdateIntegrationDto) {
    await this.get(workspaceId, id);
    const credentialsEnc = dto.credentials ? this.crypto.encrypt(dto.credentials) : undefined;
    return this.prisma.integration.update({
      where: { id },
      data: {
        name: dto.name,
        config: dto.config as object | undefined,
        enabled: dto.enabled,
        credentialsEnc,
      },
      select: { id: true, name: true, kind: true, enabled: true },
    });
  }

  async remove(workspaceId: string, id: string) {
    await this.get(workspaceId, id);
    await this.prisma.integration.update({
      where: { id },
      data: { deletedAt: new Date(), enabled: false },
    });
    return { ok: true };
  }
}
