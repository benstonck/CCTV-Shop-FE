'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, Package, ReceiptText, FileText, Settings,
  Camera, LogOut, Menu, X, ChevronRight, Bell
} from 'lucide-react';
import { isAuthenticated, getUser, clearAuth } from '@/lib/auth';
import toast from 'react-hot-toast';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/billing', label: 'New Bill', icon: ReceiptText },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = getUser();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace('/login');
    }
  }, [router]);

  const handleLogout = () => {
    clearAuth();
    toast.success('Logged out successfully');
    router.replace('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-blue-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm leading-tight">CCTV Shop Manager</h1>
            <p className="text-blue-400 text-xs">Billing System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
                ${active
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" size={18} />
              <span>{label}</span>
              {active && <ChevronRight className="ml-auto w-4 h-4 opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="px-3 pb-4 border-t border-blue-800 pt-4 space-y-1">
        <div className="px-3 py-2 rounded-lg bg-blue-800 mb-2">
          <p className="text-white text-sm font-semibold truncate">{user?.name || 'Admin'}</p>
          <p className="text-blue-300 text-xs truncate">{user?.email || ''}</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200
            hover:bg-red-600 hover:text-white transition-all duration-150 w-full"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-56 bg-primary-900 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-primary-900 flex flex-col shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center gap-4 flex-shrink-0 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 capitalize">
              {navItems.find(n => pathname.startsWith(n.href) && n.href !== '/dashboard')?.label ||
               (pathname === '/dashboard' ? 'Dashboard' : '')}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 relative">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
