import { DashboardSidebar } from '@/components/dashboard-sidebar';

export const metadata = {
  title: 'Profile - Admin - Ahaz Solutions',
  description: 'User profile and settings',
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto p-4 md:p-8">{children}</main>
    </div>
  );
}
