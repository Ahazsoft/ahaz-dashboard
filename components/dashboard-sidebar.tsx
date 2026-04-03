'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Briefcase, Plus, LayoutDashboard, Group, Users, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import Image from 'next/image';

export interface SidebarItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const sidebarItems: SidebarItem[] = [
  {
    href: '/admin/dashboard',
    label: 'Dashboard',
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    href: '/admin/jobs',
    label: 'Manage Jobs',
    icon: <Briefcase className="w-5 h-5" />,
  },
  {
    href: '/admin/applicants',
    label: 'Applicants',
    icon: <Users className="w-5 h-5" />,
  },
];

export function DashboardSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowMobileSidebar(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setShowMobileSidebar(!showMobileSidebar);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const isActive = (href: string) => {
    if (href === '/admin/dashboard') {
      return pathname === '/admin/dashboard';
    }
    return pathname === href || pathname.startsWith(href + '/');
  };

  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await fetch('http://localhost:3001/api/auth/logout', { method: 'POST' });
      // redirect to login
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleSidebar}
          className="bg-white border-gray-200"
        >
          {showMobileSidebar ? (
            <X className="w-5 h-5" />
          ) : (
            <Menu className="w-5 h-5" />
          )}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isMobile && showMobileSidebar && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'bg-white border-r border-gray-200 transition-all duration-300 ease-in-out',
          isMobile
            ? 'fixed top-0 left-0 h-screen z-30 w-64'
            : 'relative h-screen',
          isMobile && !showMobileSidebar && '-translate-x-full'
        )}
        style={
          !isMobile
            ? {
                width: isOpen ? '16rem' : '5rem',
              }
            : undefined
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          {(isOpen || isMobile) && (
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8">
                <Image
                  src="/logo.png"
                  alt="Ahaz Solutions"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="font-bold text-gray-900 text-sm">Ahaz Solutions</span>
            </div>
          )}
          {!isMobile && isOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="ml-auto"
            >
              <X className="w-4 h-4" />
            </Button>
          )}

          {!isMobile && !isOpen && (
            <div className="w-full flex justify-center">
              <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <Menu className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-2 py-4 space-y-2">
          <TooltipProvider>
            {sidebarItems.map((item) => (
              <Tooltip key={item.href} delayDuration={300}>
                <TooltipTrigger asChild>
                  <Link href={item.href} onClick={() => isMobile && setShowMobileSidebar(false)}>
                    <div
                      className={cn(
                        'flex items-center py-2 rounded-lg transition-colors',
                        !isOpen && !isMobile ? 'justify-center px-0' : 'gap-3 px-3',
                        isActive(item.href)
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <div className="shrink-0">{item.icon}</div>
                      {(isOpen || isMobile) && (
                        <span className="text-sm font-medium">{item.label}</span>
                      )}
                    </div>
                  </Link>
                </TooltipTrigger>
                {!isOpen && !isMobile && (
                  <TooltipContent side="right">{item.label}</TooltipContent>
                )}
              </Tooltip>
            ))}
          </TooltipProvider>
        </nav>

        {/* Footer / Logout */}
        <div className="mt-auto border-t border-gray-100 p-4 fixed bottom-0">
          <button
            onClick={() => { handleLogout(); if (isMobile) setShowMobileSidebar(false); }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            aria-disabled={loggingOut}
          >
            <LogOut className="w-5 h-5" />
            {(isOpen || isMobile) && (
              <span>{loggingOut ? 'Logging out...' : 'Log out'}</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
