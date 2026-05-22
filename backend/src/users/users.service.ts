import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { id, deletedAt: null } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findFirst({ where: { email: email.toLowerCase(), deletedAt: null } });
  }

  async listInOrg(organizationId: string) {
    return this.prisma.user.findMany({
      where: { memberships: { some: { organizationId } }, deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        memberships: { where: { organizationId }, select: { role: true } },
      },
    });
  }
}
