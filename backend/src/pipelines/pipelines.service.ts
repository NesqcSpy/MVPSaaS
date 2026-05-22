import { Injectable, NotFoundException } from '@nestjs/common';
import { PipelineStatus, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CreatePipelineDto, UpdatePipelineDto } from './dto/pipeline.dto';

@Injectable()
export class PipelinesService {
  constructor(private readonly prisma: PrismaService) {}

  list(workspaceId: string) {
    return this.prisma.pipeline.findMany({
      where: { workspaceId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { jobs: true } },
      },
    });
  }

  async get(workspaceId: string, id: string) {
    const pipeline = await this.prisma.pipeline.findFirst({
      where: { id, workspaceId, deletedAt: null },
      include: {
        jobs: {
          orderBy: { createdAt: 'desc' },
          take: 25,
          select: {
            id: true,
            type: true,
            status: true,
            attempts: true,
            createdAt: true,
            finishedAt: true,
            error: true,
          },
        },
      },
    });
    if (!pipeline) throw new NotFoundException('Pipeline not found');
    return pipeline;
  }

  create(workspaceId: string, dto: CreatePipelineDto) {
    return this.prisma.pipeline.create({
      data: {
        workspaceId,
        name: dto.name,
        description: dto.description,
        status: PipelineStatus.ACTIVE,
        definition: dto.definition as unknown as Prisma.InputJsonValue,
        schedule: dto.schedule,
      },
    });
  }

  async update(workspaceId: string, id: string, dto: UpdatePipelineDto) {
    await this.get(workspaceId, id);
    return this.prisma.pipeline.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        definition: dto.definition as unknown as Prisma.InputJsonValue | undefined,
        schedule: dto.schedule,
        status: dto.status,
      },
    });
  }

  async remove(workspaceId: string, id: string) {
    await this.get(workspaceId, id);
    await this.prisma.pipeline.update({
      where: { id },
      data: { deletedAt: new Date(), status: PipelineStatus.ARCHIVED },
    });
    return { ok: true };
  }
}
