import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns the workspace iff the user belongs to its parent org.
   * Throws ForbiddenException otherwise — call this from any module
   * that needs to scope queries to a workspace.
   */
  async assertAccess(workspaceId: string, userId: string) {
    const ws = await this.prisma.workspace.findFirst({
      where: { id: workspaceId, deletedAt: null },
      include: { organization: { include: { memberships: { where: { userId } } } } },
    });
    if (!ws) throw new NotFoundException('Workspace not found');
    if (ws.organization.memberships.length === 0) {
      throw new ForbiddenException('No access to this workspace');
    }
    return ws;
  }

  listForOrg(organizationId: string) {
    return this.prisma.workspace.findMany({
      where: { organizationId, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });
  }

  async firstForUser(userId: string) {
    const ws = await this.prisma.workspace.findFirst({
      where: {
        deletedAt: null,
        organization: { memberships: { some: { userId } } },
      },
      orderBy: { createdAt: 'asc' },
    });
    if (!ws) throw new NotFoundException('No workspace available');
    return ws;
  }
}
