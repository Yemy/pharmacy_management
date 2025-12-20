import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../shared/providers/auth_provider.dart';
import '../../features/splash/presentation/simple_splash_screen.dart';
import '../../features/auth/presentation/simple_login_screen.dart';
import '../../features/home/presentation/simple_home_screen.dart';
import '../../features/catalog/presentation/catalog_screen.dart';
import '../../features/admin/presentation/comprehensive_admin_dashboard.dart';
import '../../features/pos/presentation/comprehensive_pos_system.dart';
import '../../features/medicines/presentation/medicine_management_screen.dart';
import '../../features/inventory/presentation/inventory_management_screen.dart';
import '../../features/orders/presentation/order_management_screen.dart';
import '../../features/reports/presentation/reports_analytics_screen.dart';
import '../../shared/widgets/simple_main_navigation.dart';

// Route names
class AppRoutes {
  static const String splash = '/';
  static const String onboarding = '/onboarding';
  static const String login = '/login';
  static const String register = '/register';
  static const String home = '/home';
  static const String catalog = '/catalog';
  static const String medicineDetail = '/catalog/medicine/:slug';
  static const String cart = '/cart';
  static const String orders = '/orders';
  static const String orderDetail = '/orders/:id';
  static const String prescriptions = '/prescriptions';
  static const String uploadPrescription = '/prescriptions/upload';
  static const String profile = '/profile';
  static const String editProfile = '/profile/edit';
  static const String dashboard = '/dashboard';
  static const String inventory = '/inventory';
  static const String addInventory = '/inventory/add';
  static const String admin = '/admin';
  static const String adminDashboard = '/admin/dashboard';
  static const String pos = '/admin/pos';
  static const String manageMedicines = '/admin/medicines';
  static const String addMedicine = '/admin/medicines/add';
  static const String editMedicine = '/admin/medicines/edit/:id';
  static const String manageInventory = '/admin/inventory';
  static const String manageOrders = '/admin/orders';
  static const String managePrescriptions = '/admin/prescriptions';
  static const String manageUsers = '/admin/users';
  static const String reports = '/admin/reports';
}

final routerProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authProvider);
  
  return GoRouter(
    initialLocation: AppRoutes.splash,
    redirect: (context, state) {
      final isAuthenticated = authState.isAuthenticated;
      final isLoading = authState.isLoading;
      final user = authState.user;
      
      // Show splash while loading
      if (isLoading) {
        return AppRoutes.splash;
      }
      
      // Redirect to login if not authenticated
      if (!isAuthenticated) {
        if (state.matchedLocation != AppRoutes.login && 
            state.matchedLocation != AppRoutes.register &&
            state.matchedLocation != AppRoutes.onboarding) {
          return AppRoutes.login;
        }
        return null;
      }
      
      // Redirect authenticated users away from auth screens
      if (state.matchedLocation == AppRoutes.login || 
          state.matchedLocation == AppRoutes.register ||
          state.matchedLocation == AppRoutes.splash) {
        // Redirect based on user role
        if (user?.isCustomer == true) {
          return AppRoutes.home;
        } else if (user?.canViewReports == true) {
          return AppRoutes.adminDashboard;
        } else {
          return AppRoutes.home;
        }
      }
      
      // Role-based access control
      if (user != null) {
        // Admin routes
        if (state.matchedLocation.startsWith('/admin') && !user.canManageUsers) {
          return AppRoutes.home;
        }
        
        // Dashboard routes
        if (state.matchedLocation.startsWith('/dashboard') && !user.canViewReports) {
          return AppRoutes.home;
        }
        
        // Inventory routes
        if (state.matchedLocation.startsWith('/inventory') && !user.canManageInventory) {
          return AppRoutes.home;
        }
        
        // Reports routes
        if (state.matchedLocation.startsWith('/reports') && !user.canViewReports) {
          return AppRoutes.home;
        }
      }
      
      return null;
    },
    routes: [
      // Splash Screen
      GoRoute(
        path: AppRoutes.splash,
        builder: (context, state) => const SplashScreen(),
      ),
      
      // Onboarding Screen (removed for now)
      
      // Auth Routes
      GoRoute(
        path: AppRoutes.login,
        builder: (context, state) => const LoginScreen(),
      ),
      
      // Main Navigation Shell
      ShellRoute(
        builder: (context, state, child) {
          return MainNavigation(child: child);
        },
        routes: [
          // Customer Routes
          GoRoute(
            path: AppRoutes.home,
            builder: (context, state) => const HomeScreen(),
          ),
          GoRoute(
            path: AppRoutes.catalog,
            builder: (context, state) => const CatalogScreen(),
          ),
          GoRoute(
            path: AppRoutes.cart,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Cart Screen - Coming Soon')),
            ),
          ),
          GoRoute(
            path: AppRoutes.orders,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Orders Screen - Coming Soon')),
            ),
          ),
          GoRoute(
            path: AppRoutes.profile,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Profile Screen - Coming Soon')),
            ),
          ),
          
          // Staff/Admin Routes
          GoRoute(
            path: AppRoutes.adminDashboard,
            builder: (context, state) => const ComprehensiveAdminDashboard(),
          ),
          GoRoute(
            path: AppRoutes.pos,
            builder: (context, state) => const ComprehensivePOSSystem(),
          ),
          GoRoute(
            path: AppRoutes.manageMedicines,
            builder: (context, state) => const MedicineManagementScreen(),
          ),
          GoRoute(
            path: AppRoutes.manageInventory,
            builder: (context, state) => const InventoryManagementScreen(),
          ),
          GoRoute(
            path: AppRoutes.manageOrders,
            builder: (context, state) => const OrderManagementScreen(),
          ),
          GoRoute(
            path: AppRoutes.managePrescriptions,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('Prescription Management - Coming Soon')),
            ),
          ),
          GoRoute(
            path: AppRoutes.manageUsers,
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('User Management - Coming Soon')),
            ),
          ),
          GoRoute(
            path: AppRoutes.reports,
            builder: (context, state) => const ReportsAnalyticsScreen(),
          ),
        ],
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 64,
              color: Colors.red,
            ),
            const SizedBox(height: 16),
            Text(
              'Page Not Found',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 8),
            Text(
              'The page you are looking for does not exist.',
              style: Theme.of(context).textTheme.bodyMedium,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => context.go(AppRoutes.home),
              child: const Text('Go Home'),
            ),
          ],
        ),
      ),
    ),
  );
});