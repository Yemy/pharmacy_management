"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { 
  Menu, 
  X, 
  Home, 
  ShoppingBag, 
  Info, 
  Phone, 
  User, 
  Settings, 
  Package, 
  LogOut,
  ShoppingCart,
  Palette
} from "lucide-react";
import { useCart } from "./CartProvider";
import { ThemeToggle } from "./ThemeToggle";

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session } = useSession();
  const { items } = useCart();

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Close mobile nav when route changes
  useEffect(() => {
    const handleRouteChange = () => setIsOpen(false);
    // Close on any navigation
    return () => handleRouteChange();
  }, []);

  // Prevent body scroll when mobile nav is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' });
    setIsOpen(false);
  };

  const getUserDashboardLink = () => {
    if (!session?.user) return '/login';
    const role = (session.user as any).role;
    
    switch (role) {
      case 'ADMIN':
      case 'PHARMACIST':
      case 'STAFF':
        return '/admin/dashboard';
      default:
        return '/dashboard';
    }
  };

  const closeNav = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Menu Button - Only visible on mobile */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Open mobile menu"
      >
        <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Navigation Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <Link 
            href="/" 
            className="text-xl font-bold text-blue-600 dark:text-blue-400"
            onClick={closeNav}
          >
            MediCare Pharmacy
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close mobile menu"
          >
            <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Navigation Content */}
        <div className="flex flex-col h-full">
          {/* Main Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <Link
              href="/"
              onClick={closeNav}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </Link>

            <Link
              href="/shop/catalog"
              onClick={closeNav}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Shop Medicines</span>
            </Link>

            <Link
              href="/shop/cart"
              onClick={closeNav}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              <div className="flex items-center space-x-2">
                <span>Cart</span>
                {cartItemCount > 0 && (
                  <span className="bg-blue-600 dark:bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </div>
            </Link>

            <Link
              href="/about"
              onClick={closeNav}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Info className="w-5 h-5" />
              <span>About Us</span>
            </Link>

            <Link
              href="/contact"
              onClick={closeNav}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Phone className="w-5 h-5" />
              <span>Contact</span>
            </Link>

            {/* User Section */}
            {session?.user ? (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="px-4 py-2 mb-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {session.user.name || session.user.email}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {(session.user as any).role || 'Customer'}
                  </p>
                </div>

                <Link
                  href={getUserDashboardLink()}
                  onClick={closeNav}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  <span>Dashboard</span>
                </Link>

                <Link
                  href="/shop/orders"
                  onClick={closeNav}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Package className="w-5 h-5" />
                  <span>My Orders</span>
                </Link>

                <Link
                  href="/prescriptions"
                  onClick={closeNav}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Prescriptions</span>
                </Link>

                <Link
                  href="/profile"
                  onClick={closeNav}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </Link>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <Link
                  href="/login"
                  onClick={closeNav}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <User className="w-5 h-5" />
                  <span>Login</span>
                </Link>

                <Link
                  href="/register"
                  onClick={closeNav}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-blue-600 dark:bg-blue-500 text-white hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors mx-4"
                >
                  <User className="w-5 h-5" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </nav>

          {/* Bottom Section */}
          <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
            {/* Theme Toggle */}
            <div className="mb-4">
              <div className="flex items-center space-x-2 mb-3">
                <Palette className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">Theme</span>
              </div>
              <ThemeToggle />
            </div>

            {/* Sign Out Button */}
            {session?.user && (
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}