'use client';

import { useAuthStore } from '@/stores/auth.store';
import { Topbar } from '@/components/dashboard/topbar';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  return (
    <div>
      <Topbar title="Settings" subtitle="Account, workspace, security" />
      <div className="p-6 space-y-4 max-w-3xl">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Account</CardTitle>
              <CardDescription>The user this session is bound to</CardDescription>
            </div>
            {user?.role && <Badge tone="brand">{user.role.toLowerCase()}</Badge>}
          </CardHeader>
          <div className="space-y-3 max-w-sm">
            <div>
              <Label>Name</Label>
              <Input className="mt-1.5" value={user?.name ?? ''} readOnly />
            </div>
            <div>
              <Label>Email</Label>
              <Input className="mt-1.5" value={user?.email ?? ''} readOnly />
            </div>
            <div>
              <Label>Organization id</Label>
              <Input className="mt-1.5 font-mono text-xs" value={user?.organizationId ?? ''} readOnly />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>Security</CardTitle>
              <CardDescription>Token rotation and audit</CardDescription>
            </div>
          </CardHeader>
          <ul className="text-sm text-ink-mid space-y-2">
            <li>• Access tokens rotate every 15 minutes by default.</li>
            <li>• Refresh tokens are sha256-hashed at rest and revoked on use.</li>
            <li>• Every state-changing action is recorded in the audit log.</li>
            <li>• Integration credentials are AES-256-GCM encrypted at rest.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
