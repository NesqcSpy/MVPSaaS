import { Injectable } from '@nestjs/common';
import { DocumentStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.DocumentUncheckedCreateInput) {
    return this.prisma.document.create({ data });
  }

  findById(id: string, workspaceId: string) {
    return this.prisma.document.findFirst({
      where: { id, workspaceId, deletedAt: null },
      include: { ocrResult: true, extractionResult: true, validationResult: true },
    });
  }

  list(workspaceId: string, opts: { limit: number; offset: number; status?: DocumentStatus; search?: string }) {
    const where: Prisma.DocumentWhereInput = {
      workspaceId,
      deletedAt: null,
      ...(opts.status ? { status: opts.status } : {}),
      ...(opts.search
        ? { filename: { contains: opts.search, mode: Prisma.QueryMode.insensitive } }
        : {}),
    };
    return Promise.all([
      this.prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: opts.limit,
        skip: opts.offset,
        include: { extractionResult: { select: { overallScore: true } }, validationResult: { select: { status: true } } },
      }),
      this.prisma.document.count({ where }),
    ]);
  }

  updateStatus(id: string, status: DocumentStatus, error?: string | null) {
    return this.prisma.document.update({
      where: { id },
      data: { status, error: error ?? null },
    });
  }

  softDelete(id: string) {
    return this.prisma.document.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
