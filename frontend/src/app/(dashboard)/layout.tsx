import { Sidebar } from '@/components/dashboard/sidebar';
import { AuthGuard } from '@/components/dashboard/guard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </AuthGuard>
  );
}
