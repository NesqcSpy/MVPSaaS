import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(id: string) {
    const org = await this.prisma.organization.findFirst({
      where: { id, deletedAt: null },
      include: { workspaces: { where: { deletedAt: null } } },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  listForUser(userId: string) {
    return this.prisma.organization.findMany({
      where: { deletedAt: null, memberships: { some: { userId } } },
      include: { workspaces: { where: { deletedAt: null } } },
    });
  }
}
