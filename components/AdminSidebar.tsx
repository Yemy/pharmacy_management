"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings,
  Pill,
  FileText,
  CreditCard,
  Truck,
  Shield,
  DollarSign,
  Menu,
  X
} from 'lucide-react';

interface AdminSidebarProps {
  userRole: string;
}

export default function AdminSidebar({ userRole }: AdminSidebarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'PHARMACIST', 'STAFF'],
    },
    {
      name: 'Point of Sale',
      href: '/admin/pos',
      icon: CreditCard,
      roles: ['ADMIN', 'PHARMACIST', 'STAFF'],
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: ShoppingCart,
      roles: ['ADMIN', 'PHARMACIST', 'STAFF'],
    },
    {
      name: 'Medicines',
      href: '/admin/medicines',
      icon: Pill,
      roles: ['ADMIN', 'PHARMACIST'],
    },
    {
      name: 'Inventory',
      href: '/admin/inventory',
      icon: Package,
      roles: ['ADMIN', 'PHARMACIST', 'STAFF'],
    },
    {
      name: 'Prescriptions',
      href: '/admin/prescriptions',
      icon: FileText,
      roles: ['ADMIN', 'PHARMACIST'],
    },
    {
      name: 'Purchase Orders',
      href: '/admin/purchase-orders',
      icon: Truck,
      roles: ['ADMIN', 'PHARMACIST'],
    },
    {
      name: 'Insurance Claims',
      href: '/admin/insurance-claims',
      icon: Shield,
      roles: ['ADMIN', 'PHARMACIST'],
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      roles: ['ADMIN', 'PHARMACIST'],
    },
    {
      name: 'Financial Reports',
      href: '/admin/financial-reports',
      icon: DollarSign,
      roles: ['ADMIN', 'PHARMACIST'],
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      roles: ['ADMIN'],
    },
    {
      name: 'Reports',
      href: '/admin/reports',
      icon: BarChart3,
      roles: ['ADMIN', 'PHARMACIST'],
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      roles: ['ADMIN'],
    },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(userRole)
  );

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="/admin/dashboard" className="text-xl font-bold text-blue-600 dark:text-blue-400">
            Admin Panel
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-white lg:dark:bg-gray-800 lg:shadow-lg">
        <div className="flex flex-col h-full w-full">
          {/* Desktop Header */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <Link href="/admin/dashboard" className="text-xl font-bold text-blue-600 dark:text-blue-400">
              Admin Panel
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Quick Stats */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Role:</span>
                <span className="font-medium text-gray-900 dark:text-white">{userRole}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <Link 
              href="/admin/dashboard" 
              className="text-xl font-bold text-blue-600 dark:text-blue-400"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Admin Panel
            </Link>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Quick Stats */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Role:</span>
                <span className="font-medium text-gray-900 dark:text-white">{userRole}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}