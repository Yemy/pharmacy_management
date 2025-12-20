import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../shared/providers/auth_provider.dart';
import '../../shared/providers/cart_provider.dart';
import '../../core/router/app_router.dart';

class MainNavigation extends ConsumerWidget {
  final Widget child;
  
  const MainNavigation({
    Key? key,
    required this.child,
  }) : super(key: key);
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final currentLocation = GoRouterState.of(context).location;
    final cartItemCount = ref.watch(cartItemCountProvider);
    
    if (user == null) {
      return child;
    }
    
    // Get navigation items based on user role
    final navItems = _getNavigationItems(user);
    
    // Find current index
    int currentIndex = 0;
    for (int i = 0; i < navItems.length; i++) {
      if (currentLocation.startsWith(navItems[i].route)) {
        currentIndex = i;
        break;
      }
    }
    
    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: currentIndex,
        onTap: (index) {
          if (index != currentIndex) {
            context.go(navItems[index].route);
          }
        },
        items: navItems.map((item) {
          Widget icon = Icon(item.icon);
          Widget activeIcon = Icon(item.activeIcon ?? item.icon);
          
          // Add badge for cart
          if (item.route == AppRoutes.cart && cartItemCount > 0) {
            icon = _buildBadgedIcon(Icon(item.icon), cartItemCount);
            activeIcon = _buildBadgedIcon(Icon(item.activeIcon ?? item.icon), cartItemCount);
          }
          
          return BottomNavigationBarItem(
            icon: icon,
            activeIcon: activeIcon,
            label: item.label,
          );
        }).toList(),
      ),
    );
  }
  
  Widget _buildBadgedIcon(Widget icon, int count) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        icon,
        if (count > 0)
          Positioned(
            right: -6,
            top: -6,
            child: Container(
              padding: const EdgeInsets.all(2),
              decoration: BoxDecoration(
                color: Colors.red,
                borderRadius: BorderRadius.circular(10),
              ),
              constraints: const BoxConstraints(
                minWidth: 16,
                minHeight: 16,
              ),
              child: Text(
                count > 99 ? '99+' : count.toString(),
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                ),
                textAlign: TextAlign.center,
              ),
            ),
          ),
      ],
    );
  }
  
  List<NavigationItem> _getNavigationItems(user) {
    if (user.isCustomer) {
      return [
        NavigationItem(
          icon: Icons.home_outlined,
          activeIcon: Icons.home,
          label: 'Home',
          route: AppRoutes.home,
        ),
        NavigationItem(
          icon: Icons.medical_services_outlined,
          activeIcon: Icons.medical_services,
          label: 'Catalog',
          route: AppRoutes.catalog,
        ),
        NavigationItem(
          icon: Icons.shopping_cart_outlined,
          activeIcon: Icons.shopping_cart,
          label: 'Cart',
          route: AppRoutes.cart,
        ),
        NavigationItem(
          icon: Icons.receipt_long_outlined,
          activeIcon: Icons.receipt_long,
          label: 'Orders',
          route: AppRoutes.orders,
        ),
        NavigationItem(
          icon: Icons.person_outlined,
          activeIcon: Icons.person,
          label: 'Profile',
          route: AppRoutes.profile,
        ),
      ];
    } else if (user.canViewReports) {
      // Admin/Pharmacist navigation
      return [
        NavigationItem(
          icon: Icons.dashboard_outlined,
          activeIcon: Icons.dashboard,
          label: 'Dashboard',
          route: AppRoutes.dashboard,
        ),
        NavigationItem(
          icon: Icons.inventory_outlined,
          activeIcon: Icons.inventory,
          label: 'Inventory',
          route: AppRoutes.inventory,
        ),
        NavigationItem(
          icon: Icons.receipt_long_outlined,
          activeIcon: Icons.receipt_long,
          label: 'Orders',
          route: AppRoutes.orders,
        ),
        if (user.canManageUsers)
          NavigationItem(
            icon: Icons.admin_panel_settings_outlined,
            activeIcon: Icons.admin_panel_settings,
            label: 'Admin',
            route: AppRoutes.admin,
          ),
        NavigationItem(
          icon: Icons.person_outlined,
          activeIcon: Icons.person,
          label: 'Profile',
          route: AppRoutes.profile,
        ),
      ];
    } else {
      // Staff navigation
      return [
        NavigationItem(
          icon: Icons.home_outlined,
          activeIcon: Icons.home,
          label: 'Home',
          route: AppRoutes.home,
        ),
        NavigationItem(
          icon: Icons.inventory_outlined,
          activeIcon: Icons.inventory,
          label: 'Inventory',
          route: AppRoutes.inventory,
        ),
        NavigationItem(
          icon: Icons.receipt_long_outlined,
          activeIcon: Icons.receipt_long,
          label: 'Orders',
          route: AppRoutes.orders,
        ),
        NavigationItem(
          icon: Icons.person_outlined,
          activeIcon: Icons.person,
          label: 'Profile',
          route: AppRoutes.profile,
        ),
      ];
    }
  }
}

class NavigationItem {
  final IconData icon;
  final IconData? activeIcon;
  final String label;
  final String route;
  
  const NavigationItem({
    required this.icon,
    this.activeIcon,
    required this.label,
    required this.route,
  });
}