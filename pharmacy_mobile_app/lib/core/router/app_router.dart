import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../shared/providers/auth_provider.dart';
import '../../features/splash/presentation/splash_screen.dart';
import '../../features/onboarding/presentation/onboarding_screen.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/register_screen.dart';
import '../../features/home/presentation/home_screen.dart';
import '../../features/catalog/presentation/catalog_screen.dart';
import '../../features/catalog/presentation/medicine_detail_screen.dart';
import '../../features/cart/presentation/cart_screen.dart';
import '../../features/orders/presentation/orders_screen.dart';
import '../../features/orders/presentation/order_detail_screen.dart';
import '../../features/prescriptions/presentation/prescriptions_screen.dart';
import '../../features/prescriptions/presentation/upload_prescription_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/profile/presentation/edit_profile_screen.dart';
import '../../features/dashboard/presentation/dashboard_screen.dart';
import '../../features/inventory/presentation/inventory_screen.dart';
import '../../features/inventory/presentation/add_inventory_screen.dart';
import '../../features/admin/presentation/admin_screen.dart';
import '../../features/admin/presentation/manage_users_screen.dart';
import '../../features/admin/presentation/manage_medicines_screen.dart';
import '../../features/admin/presentation/add_medicine_screen.dart';
import '../../features/reports/presentation/reports_screen.dart';
import '../../shared/widgets/main_navigation.dart';

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
  static const String manageUsers = '/admin/users';
  static const String manageMedicines = '/admin/medicines';
  static const String addMedicine = '/admin/medicines/add';
  static const String reports = '/reports';
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
        if (state.location != AppRoutes.login && 
            state.location != AppRoutes.register &&
            state.location != AppRoutes.onboarding) {
          return AppRoutes.login;
        }
        return null;
      }
      
      // Redirect authenticated users away from auth screens
      if (state.location == AppRoutes.login || 
          state.location == AppRoutes.register ||
          state.location == AppRoutes.splash) {
        // Redirect based on user role
        if (user?.isCustomer == true) {
          return AppRoutes.home;
        } else if (user?.canViewReports == true) {
          return AppRoutes.dashboard;
        } else {
          return AppRoutes.home;
        }
      }
      
      // Role-based access control
      if (user != null) {
        // Admin routes
        if (state.location.startsWith('/admin') && !user.canManageUsers) {
          return AppRoutes.home;
        }
        
        // Dashboard routes
        if (state.location.startsWith('/dashboard') && !user.canViewReports) {
          return AppRoutes.home;
        }
        
        // Inventory routes
        if (state.location.startsWith('/inventory') && !user.canManageInventory) {
          return AppRoutes.home;
        }
        
        // Reports routes
        if (state.location.startsWith('/reports') && !user.canViewReports) {
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
      
      // Onboarding Screen
      GoRoute(
        path: AppRoutes.onboarding,
        builder: (context, state) => const OnboardingScreen(),
      ),
      
      // Auth Routes
      GoRoute(
        path: AppRoutes.login,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: AppRoutes.register,
        builder: (context, state) => const RegisterScreen(),
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
            path: AppRoutes.medicineDetail,
            builder: (context, state) {
              final slug = state.pathParameters['slug']!;
              return MedicineDetailScreen(slug: slug);
            },
          ),
          GoRoute(
            path: AppRoutes.cart,
            builder: (context, state) => const CartScreen(),
          ),
          GoRoute(
            path: AppRoutes.orders,
            builder: (context, state) => const OrdersScreen(),
          ),
          GoRoute(
            path: AppRoutes.orderDetail,
            builder: (context, state) {
              final id = int.parse(state.pathParameters['id']!);
              return OrderDetailScreen(orderId: id);
            },
          ),
          GoRoute(
            path: AppRoutes.prescriptions,
            builder: (context, state) => const PrescriptionsScreen(),
          ),
          GoRoute(
            path: AppRoutes.uploadPrescription,
            builder: (context, state) => const UploadPrescriptionScreen(),
          ),
          GoRoute(
            path: AppRoutes.profile,
            builder: (context, state) => const ProfileScreen(),
          ),
          GoRoute(
            path: AppRoutes.editProfile,
            builder: (context, state) => const EditProfileScreen(),
          ),
          
          // Staff/Admin Routes
          GoRoute(
            path: AppRoutes.dashboard,
            builder: (context, state) => const DashboardScreen(),
          ),
          GoRoute(
            path: AppRoutes.inventory,
            builder: (context, state) => const InventoryScreen(),
          ),
          GoRoute(
            path: AppRoutes.addInventory,
            builder: (context, state) => const AddInventoryScreen(),
          ),
          GoRoute(
            path: AppRoutes.admin,
            builder: (context, state) => const AdminScreen(),
          ),
          GoRoute(
            path: AppRoutes.manageUsers,
            builder: (context, state) => const ManageUsersScreen(),
          ),
          GoRoute(
            path: AppRoutes.manageMedicines,
            builder: (context, state) => const ManageMedicinesScreen(),
          ),
          GoRoute(
            path: AppRoutes.addMedicine,
            builder: (context, state) => const AddMedicineScreen(),
          ),
          GoRoute(
            path: AppRoutes.reports,
            builder: (context, state) => const ReportsScreen(),
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